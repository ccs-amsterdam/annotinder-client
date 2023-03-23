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
      const relationIds =
        variable?.validFrom?.[a.variable]?.["*"] ||
        variable?.validFrom?.[a.variable]?.[a.value] ||
        null;
      if (!relationIds) continue;
      if (!valid[i]) valid[i] = {};

      const fromKey = a.variable + "|" + a.value;
      if (!valid[i][fromKey]) valid[i][fromKey] = {};

      for (let relationId of Object.keys(relationIds)) {
        const to = variable.relations?.[relationId]?.to;
        for (let value of to?.values || []) {
          valid[i][fromKey][to?.variable + "|" + value] = true;
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
        if (!validIds[fromKey][toKey]) continue; // skip if there are no destinations for this variable/value
        if (da.variable === sa.variable && da.value === sa.value && da.offset === sa.offset)
          continue;
        valid[i] = true;
      }
    }
  }

  return valid;
};
