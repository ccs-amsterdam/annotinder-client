import { useState, useEffect } from "react";
import { VariableValueMap, Variable, VariableMap } from "../../../types";

export default function useVariableMap(
  variables: Variable[],
  selectedVariable: string,
  importedCodes: VariableValueMap
): [VariableMap, boolean] {
  const [fullVariableMap, setFullVariableMap] = useState<VariableMap>(null);
  const [variableMap, setVariableMap] = useState<VariableMap>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // creates fullVariableMap
    if (!variables || variables.length === 0) {
      setFullVariableMap(null);
      return null;
    }

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

    setFullVariableMap(vm);
  }, [variables, setFullVariableMap]);

  useEffect(() => {
    // creates the actually used variableMap from the fullVariableMap
    // this lets us select specific variables without recreating full map
    // Here we also add imported variables
    if (fullVariableMap === null) {
      setVariableMap(null);
      return;
    }

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

    setVariableMap(vmap);
    setEditMode(vmap?.[selectedVariable]?.editMode || selectedVariable === "EDIT ALL");
  }, [importedCodes, fullVariableMap, selectedVariable, setVariableMap, setEditMode]);

  if (!selectedVariable) return [null, editMode];
  return [variableMap, editMode];
}
