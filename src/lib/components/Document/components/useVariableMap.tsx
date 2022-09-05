import { useMemo } from "react";
import { VariableValueMap, Variable, VariableMap } from "../../../types";

export default function useVariableMap(
  variables: Variable[],
  selectedVariable: string,
  importedCodes: VariableValueMap
): [VariableMap, boolean] {
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

  const variableMap: VariableMap = useMemo(() => {
    // creates the actually used variableMap from the fullVariableMap
    // this lets us select specific variables without recreating full map
    // Here we also add imported variables
    if (fullVariableMap === null) return null;

    let vmap: VariableMap;
    if (selectedVariable === null || selectedVariable === "EDIT ALL") {
      vmap = fullVariableMap;
    } else {
      vmap = { [selectedVariable]: fullVariableMap[selectedVariable] };
    }

    // if there are importedCodes, add them to variablemap

    // !! be carefull when changing to not break copying (otherwise fullVariableMap gets affected)
    vmap = { ...vmap };
    for (let variable of Object.keys(vmap)) {
      vmap[variable] = { ...vmap[variable] };
      if (vmap[variable]?.onlyImported) {
        vmap[variable].codeMap = Object.keys(vmap[variable].codeMap).reduce(
          (imported: any, code) => {
            if (importedCodes?.[variable]?.[code])
              imported[code] = { ...vmap[variable].codeMap[code] };
            return imported;
          },
          {}
        );
      }
    }

    return vmap;
  }, [importedCodes, fullVariableMap, selectedVariable]);

  const editMode: boolean = useMemo(() => {
    return variableMap?.[selectedVariable]?.editMode || selectedVariable === "EDIT ALL";
  }, [variableMap, selectedVariable]);

  if (!selectedVariable) return [null, editMode];
  return [variableMap, editMode];
}
