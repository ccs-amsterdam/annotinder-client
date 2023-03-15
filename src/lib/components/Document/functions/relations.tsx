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

      for (let relationId of Object.keys(relationIds)) {
        const to = variable.relations?.[relationId]?.to;
        for (let value of to?.values || []) {
          valid[i][to?.variable + "|" + value] = true;
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

  for (let i of Object.keys(annotations)) {
    for (let id of Object.keys(validIds)) {
      if (annotations[i]?.[id]) {
        valid[i] = true;
      }
    }
  }

  return valid;
};
