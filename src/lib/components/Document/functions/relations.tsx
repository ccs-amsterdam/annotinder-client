import {
  SpanAnnotations,
  Variable,
  TokenSelection,
  ValidTokenRelations,
  ValidTokenDestinations,
} from "../../../types";

export const getValidTokenRelations = (
  annotations: SpanAnnotations,
  variable: Variable
): ValidTokenRelations => {
  if (!variable?.relations) return null;
  const valid: ValidTokenRelations = {};

  for (let i of Object.keys(annotations)) {
    for (let v of Object.values(annotations[i])) {
      const relationIds =
        variable?.validFrom?.[v.variable]?.["*"] ||
        variable?.validFrom?.[v.variable]?.[v.value] ||
        null;
      if (!relationIds) continue;
      if (!valid[i]) valid[i] = {};

      const fromKey = v.variable + "|" + v.value;
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
  annotations: SpanAnnotations,
  validRelations: ValidTokenRelations,
  tokenSelection: TokenSelection
): ValidTokenDestinations => {
  if (!tokenSelection?.[0] || !tokenSelection?.[1] || !validRelations?.[tokenSelection[0]])
    return null;

  const valid: ValidTokenDestinations = {};
  const validIds = validRelations?.[tokenSelection[0]];
  if (!validIds) return valid;

  const startAnnotations = annotations[tokenSelection[0]];

  for (let fromKey of Object.keys(startAnnotations)) {
    if (!validIds[fromKey]) continue; // skip if there are no destinations at all
    const sa = startAnnotations[fromKey];
    for (let i of Object.keys(annotations)) {
      for (let toKey of Object.keys(annotations[i])) {
        if (!validIds[fromKey][toKey]) continue;

        // destination cannot be starting annotation
        const a = annotations[i][toKey];
        if (a.variable === sa.variable && a.value === sa.value && a.offset === sa.offset) continue;

        valid[i] = true;
      }
    }
  }

  return valid;
};
