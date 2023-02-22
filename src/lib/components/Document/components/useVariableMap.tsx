import { useMemo } from "react";
import { standardizeCodes } from "../../../functions/codebook";
import {
  VariableValueMap,
  Variable,
  CodeRelation,
  VariableType,
  VariableMap,
} from "../../../types";

export default function useVariableMap(
  variables: Variable[],
  selectedVariable: string,
  restrictedCodes: VariableValueMap
): [VariableMap, VariableMap, VariableType, boolean] {
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
      vm[variable.name] = { ...variable, codeMap: cm };
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

      // also add restricted codes if they are missing.
      // this way even if restricted codes are not in the codebook,
      // they can still be used
      for (let variable of Object.keys(restrictedCodes)) {
        if (!vmap[variable]) continue;
        for (let value of Object.keys(restrictedCodes[variable])) {
          if (value === "EMPTY") continue;
          if (!vmap[variable].codeMap[value])
            vmap[variable].codeMap[value] = standardizeCodes([value], true)[0];
        }
      }

      // !! be carefull when changing to not break copying (otherwise fullVariableMap gets affected)
      vmap = { ...vmap };
      for (let variable of Object.keys(vmap)) {
        vmap[variable] = { ...vmap[variable] };
        if (restrictedCodes[variable]) {
          vmap[variable].codeMap = Object.keys(vmap[variable].codeMap).reduce(
            (imported: any, code) => {
              if (restrictedCodes?.[variable]?.[code])
                imported[code] = { ...vmap[variable].codeMap[code] };
              return imported;
            },
            {}
          );
        }
      }

      // we use a separate variableMap called showValues that tells Document what annotations
      // to show. This is the same for "span" variables, but for "relation"
      // variables we want to only show the annotations
      // that are valid options for the relation codes
      let showValues: VariableMap;
      let variableType: VariableType = "span";
      if (fullVariableMap?.[selectedVariable]?.type === "relation") {
        variableType = "relation";
        showValues = getRelationShowValues(vmap, fullVariableMap, selectedVariable);
      } else {
        showValues = vmap;
      }

      return [vmap, showValues, variableType];
    }, [restrictedCodes, fullVariableMap, selectedVariable]);

  const editMode: boolean = useMemo(() => {
    return variableMap?.[selectedVariable]?.editMode || selectedVariable === "EDIT ALL";
  }, [variableMap, selectedVariable]);

  if (!selectedVariable) return [null, null, variableType, editMode];
  return [variableMap, showValues, variableType, editMode];
}

const getRelationShowValues = (
  vmap: VariableMap,
  fullVariableMap: VariableMap,
  selectedVariable: string
) => {
  let showValues: VariableMap = { [selectedVariable]: vmap[selectedVariable] };

  let valuemap: VariableValueMap | null = {};
  for (let code of fullVariableMap[selectedVariable].codes) {
    if (!code.from || !code.to) {
      // if any code doesn't specify from or to, we need to show everything
      showValues = fullVariableMap;
      valuemap = null;
      break;
    }

    const codeRelations: CodeRelation[] = [];
    if (code.from) codeRelations.push(code.from);
    if (code.to) codeRelations.push(code.to);

    for (let cr of codeRelations) {
      if (!valuemap[cr.variable]) valuemap[cr.variable] = {};
      const values = cr.values || Object.keys(fullVariableMap[cr.variable].codeMap);
      for (let v of values) valuemap[cr.variable][v] = true;
    }
  }

  if (valuemap) {
    for (let variable of Object.keys(valuemap)) {
      showValues[variable] = { ...fullVariableMap[variable], codeMap: {} };
      for (let value of Object.keys(valuemap[variable])) {
        showValues[variable].codeMap[value] = fullVariableMap[variable].codeMap[value];
      }
    }
  }

  return showValues;
};
