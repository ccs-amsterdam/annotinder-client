import { useMemo } from "react";
import {
  VariableValueMap,
  Variable,
  CodeRelation,
  VariableType,
  VariableMap,
  ValidRelation,
  Code,
} from "../../../types";

export default function useVariableMap(
  variables: Variable[],
  selectedVariable: string
): [VariableMap, VariableMap, VariableMap, VariableType, boolean] {
  const fullVariableMap: VariableMap = useMemo(() => {
    // creates fullVariableMap
    if (!variables || variables.length === 0) return null;

    const vm: any = {};
    for (let variable of variables) {
      let cm = variable.codeMap;
      cm = Object.keys(cm).reduce((obj: any, key) => {
        if (!cm[key].active || !cm[key].activeParent) return obj;
        obj[key] = cm[key];
        return obj;
      }, {});
      const [validFrom, validTo] = getValidRelationCodes(variable.relations, variable.codeMap);

      vm[variable.name] = { ...variable, codeMap: cm, validFrom, validTo };
    }

    return vm;
  }, [variables]);

  const [variableMap, showValues, variableType]: [VariableMap, VariableMap, VariableType] =
    useMemo(() => {
      // creates the actually used variableMap from the fullVariableMap
      // this lets us select specific variables without recreating full map
      // Here we also add imported variables
      if (fullVariableMap === null) return [null, null, null];

      let vmap: VariableMap;
      if (selectedVariable === null || selectedVariable === "EDIT ALL") {
        vmap = fullVariableMap;
      } else {
        vmap = { [selectedVariable]: fullVariableMap[selectedVariable] };
      }

      // !! be carefull when changing to not break copying (otherwise fullVariableMap gets affected)
      vmap = { ...vmap };
      for (let variable of Object.keys(vmap)) {
        vmap[variable] = { ...vmap[variable] };
      }

      // we use a separate variableMap called showValues that tells Document what annotations
      // to show. These are the same for "span" variables, but for "relation"
      // variables we want to only show the annotations
      // that are valid options for the relation codes
      let showValues: VariableMap;
      let variableType: VariableType = "span";
      if (fullVariableMap?.[selectedVariable]?.relations) {
        variableType = "relation";
        showValues = getRelationShowValues(vmap, fullVariableMap, selectedVariable);
      } else {
        showValues = vmap;
      }

      return [vmap, showValues, variableType];
    }, [fullVariableMap, selectedVariable]);

  const editMode: boolean = useMemo(() => {
    return (
      variableMap?.[selectedVariable]?.editMode || selectedVariable === "EDIT ALL"
      //|| variableMap?.[selectedVariable].type === "relation"
    );
  }, [variableMap, selectedVariable]);

  if (!selectedVariable) return [fullVariableMap, null, null, variableType, editMode];
  return [fullVariableMap, variableMap, showValues, variableType, editMode];
}

const getRelationShowValues = (
  vmap: VariableMap,
  fullVariableMap: VariableMap,
  selectedVariable: string
) => {
  let showValues: VariableMap = { [selectedVariable]: vmap[selectedVariable] };
  let valuemap: VariableValueMap | null = {};

  for (let relation of fullVariableMap[selectedVariable].relations || []) {
    if (!relation.from || !relation.to) {
      // if any relation doesn't specify from or to, we need to show everything
      showValues = fullVariableMap;
      valuemap = null;
      break;
    }

    const relations: CodeRelation[] = [];
    if (relation.from) relations.push(relation.from);
    if (relation.to) relations.push(relation.to);

    for (let cr of relations) {
      if (!valuemap[cr.variable]) valuemap[cr.variable] = {};
      const values = cr.values || Object.keys(fullVariableMap[cr.variable].codeMap);
      for (let v of values) valuemap[cr.variable][v] = true;
    }

    for (let relationValue of relation.codes) {
      if (!valuemap[selectedVariable]) valuemap[selectedVariable] = {};
      valuemap[selectedVariable][relationValue] = true;
    }
  }

  if (valuemap) {
    for (let variable of Object.keys(valuemap)) {
      showValues[variable] = { ...fullVariableMap[variable], codeMap: {} };
      for (let value of Object.keys(valuemap[variable])) {
        showValues[variable].codeMap[value] = fullVariableMap[variable]?.codeMap[value];
      }
    }
  }

  return showValues;
};

/**
 * If variable of type relation, prepare efficient lookup for
 * valid from/to annotations
 */
function getValidRelationCodes(relations, codeMap) {
  if (!relations) return [null, null];
  const validFrom: ValidRelation = {};
  const validTo: ValidRelation = {};

  function addValidRelation(valid: ValidRelation, relationId, variable, values, codes) {
    console.log(variable, values);

    if (!variable) {
      if (!valid["*"]) valid["*"] = { "*": {} };
      valid["*"]["*"][relationId] = codes;
      return;
    }
    if (!valid[variable]) valid[variable] = {};
    // if we include a code_id, which is just the relation index, we can use that
    // to connect the from/to values

    if (values) {
      for (let value of values) {
        if (!valid[variable][value]) valid[variable][value] = {};
        valid[variable][value][relationId] = codes;
      }
    } else {
      if (!valid[variable]["*"]) valid[variable]["*"] = {};
      valid[variable]["*"][relationId] = codes;
    }
  }

  for (let i = 0; i < relations.length; i++) {
    const relation = relations[i];
    if (!relation.codes) relation.codes = Object.keys(codeMap);
    const codes: Code[] = [];
    for (let code of relation.codes) if (codeMap[code]) codes.push(codeMap[code]);
    console.log(relation);
    addValidRelation(validFrom, i, relation?.from?.variable, relation?.from?.values, codes);
    addValidRelation(validTo, i, relation?.to?.variable, relation?.to?.values, codes);
  }

  return [validFrom, validTo];
}
