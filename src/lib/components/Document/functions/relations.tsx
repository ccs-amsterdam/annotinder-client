import {
  Variable,
  TokenSelection,
  ValidTokenRelations,
  ValidTokenDestinations,
  AnnotationLibrary,
} from "../../../types";

export const getValidTokenRelations = (
  annotationLib: AnnotationLibrary,
  variable: Variable
): ValidTokenRelations => {
  if (!variable?.relations) return null;
  const valid: ValidTokenRelations = {};

  for (let i of Object.keys(annotationLib.byToken)) {
    for (let id of annotationLib.byToken[i]) {
      const a = annotationLib.annotations[id];

      const wildcard = variable?.validFrom?.[a.variable]?.["*"];
      const relationIds = wildcard || variable?.validFrom?.[a.variable]?.[a.value] || null;

      if (!relationIds) continue;
      if (!valid[i]) valid[i] = {};

      const fromKey = a.variable + "|" + a.value;
      if (!valid[i][fromKey]) valid[i][fromKey] = {};

      for (let relationId of Object.keys(relationIds)) {
        const to = variable.relations?.[relationId]?.to;
        const toKeyWildcard = to?.variable + "|*";
        if (!!wildcard) valid[i][fromKey][toKeyWildcard] = true;
        for (let value of to?.values || []) {
          const toKey = to?.variable + "|" + value;
          valid[i][fromKey][toKey] = true;
        }
      }
    }
  }

  return valid;
};

export const getValidTokenDestinations = (
  annotationLib: AnnotationLibrary,
  validRelations: ValidTokenRelations,
  tokenSelection: TokenSelection
): ValidTokenDestinations => {
  if (!tokenSelection?.[0] || !tokenSelection?.[1] || !validRelations?.[tokenSelection[0]])
    return null;

  const valid: ValidTokenDestinations = {};
  const validIds = validRelations?.[tokenSelection[0]];
  if (!validIds) return valid;

  const startAnnotationIds = annotationLib.byToken[tokenSelection[0]] || [];
  const startAnnotations = startAnnotationIds.map((id) => annotationLib.annotations[id]);

  for (let sa of startAnnotations) {
    const fromKey = sa.variable + "|" + sa.value;
    if (!validIds[fromKey]) continue; // skip if there are no destinations at all

    for (let i of Object.keys(annotationLib.byToken)) {
      const destinationAnnotationIds = annotationLib.byToken[i];
      for (let destinationId of destinationAnnotationIds) {
        const da = annotationLib.annotations[destinationId];
        const toKey = da.variable + "|" + da.value;
        const toKeyWildcard = da.variable + "|*";
        if (!validIds[fromKey][toKey] && !validIds[fromKey][toKeyWildcard]) continue; // skip if there are no destinations for this variable/value
        if (da.variable === sa.variable && da.value === sa.value && da.offset === sa.offset)
          continue;
        valid[i] = true;
      }
    }
  }

  return valid;
};
