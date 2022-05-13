import { useState, useEffect } from "react";
import { codeBookEdgesToMap } from "../../../functions/codebook";

export default function useVariableMap(variables, selectedVariable, importedCodes) {
  const [editMode, setEditMode] = useState(false);
  const [fullVariableMap, setFullVariableMap] = useState(null);
  const [variableMap, setVariableMap] = useState(null);
  const [manualEditMode, setManualEditMode] = useState(false);

  useEffect(() => {
    const setManualMode = (e) => {
      setManualEditMode(e.ctrlKey || e.altKey);
    };

    ["keydown", "mousedown", "keyup"].forEach((e) => {
      window.addEventListener(e, setManualMode);
    });
    return () => {
      ["keydown", "mousedown", "keyup"].forEach((e) => {
        window.removeEventListener(e, setManualMode);
      });
    };
  }, [setManualEditMode]);

  useEffect(() => {
    // creates fullVariableMap
    if (!variables || variables.length === 0) {
      setFullVariableMap(null);
      return null;
    }

    const vm = {};
    for (let variable of variables) {
      let cm = codeBookEdgesToMap(variable.codes);
      cm = Object.keys(cm).reduce((obj, key) => {
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
    if (fullVariableMap === null) {
      setVariableMap(null);
      return;
    }

    let vmap;
    if (selectedVariable === null || selectedVariable === "EDIT ALL") {
      vmap = fullVariableMap;
    } else {
      vmap = { [selectedVariable]: fullVariableMap[selectedVariable] };
    }

    // !! be carefull when changing to not break copying (otherwise fullVariableMap gets affected)
    vmap = { ...vmap };
    for (let variable of Object.keys(vmap)) {
      vmap[variable] = { ...vmap[variable] };
      if (vmap[variable]?.onlyImported) {
        vmap[variable].codeMap = Object.keys(vmap[variable].codeMap).reduce((imported, code) => {
          if (importedCodes?.[variable]?.[code])
            imported[code] = { ...vmap[variable].codeMap[code] };
          return imported;
        }, {});
      }
    }

    setVariableMap(vmap);
    setEditMode(vmap?.[selectedVariable]?.editMode || selectedVariable === "EDIT ALL");
  }, [importedCodes, fullVariableMap, selectedVariable, setVariableMap, setEditMode]);

  if (!selectedVariable) return [null, manualEditMode || editMode];
  return [variableMap, manualEditMode || editMode];
}
