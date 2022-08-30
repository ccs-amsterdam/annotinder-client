import { useState, useEffect } from "react";
import { getDocAndAnnotations } from "../functions/prepareDocumentContent";
import {
  Doc,
  CodeHistory,
  SetState,
  Annotation,
  Token,
  Unit,
  SpanAnnotations,
  VariableValueMap,
} from "../../../types";

const useUnit = (
  unit: Unit,
  safetyCheck: any,
  returnTokens: (value: Token[]) => void,
  setCodeHistory: (value: CodeHistory) => void
): [Doc, SpanAnnotations, SetState<SpanAnnotations>, VariableValueMap] => {
  const [doc, setDoc] = useState<Doc>({});
  const [annotations, setAnnotations] = useState<SpanAnnotations | null>(null);
  const [importedCodes, setImportedCodes] = useState<VariableValueMap>({});

  useEffect(() => {
    if (!unit.annotations) unit.annotations = [];
    if (unit.importedAnnotations) {
      if (unit.annotations.length === 0 && unit.status !== "DONE") {
        unit.annotations = unit.importedAnnotations;
      }

      const importedCodes: VariableValueMap = {};
      for (let a of unit.importedAnnotations) {
        if (!importedCodes[a.variable]) {
          importedCodes[a.variable] = { [a.value]: true };
        } else {
          importedCodes[a.variable][a.value] = true;
        }
      }
      setImportedCodes(importedCodes);
    }

    initializeCodeHistory(unit.annotations, setCodeHistory);

    const [document, annotations] = getDocAndAnnotations(unit);

    safetyCheck.current = { tokens: document.tokens };

    setDoc(document);
    setAnnotations(annotations);
    if (returnTokens) returnTokens(document.tokens);
  }, [unit, returnTokens, safetyCheck, setCodeHistory, setImportedCodes]);

  // if returnAnnotations is falsy (so not passed to Document), make setAnnotations
  // falsy as well. This is used further down as a sign that annotations are disabled
  return [doc, annotations, setAnnotations, importedCodes];
};

const initializeCodeHistory = (
  annotations: Annotation[],
  setCodeHistory: SetState<CodeHistory>
): void => {
  const vvh: VariableValueMap = {};

  for (let annotation of annotations) {
    if (!vvh[annotation.variable]) {
      vvh[annotation.variable] = { [annotation.value]: true };
    } else {
      vvh[annotation.variable][annotation.value] = true;
    }
  }

  const codeHistory: CodeHistory = {};
  for (let variable of Object.keys(vvh)) {
    codeHistory[variable] = Object.keys(vvh[variable]);
  }
  setCodeHistory(codeHistory);
};

export default useUnit;
