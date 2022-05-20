import { useState, useEffect } from "react";
import { getDocAndAnnotations } from "../functions/prepareUnit";
import { SetState, Token, Unit, SpanAnnotations } from "../../../types";
import { Doc, CodeHistory, ImportedCodes } from "../documentTypes";

const useUnit = (
  unit: Unit,
  safetyCheck: any,
  returnTokens: (value: Token[]) => void,
  setCodeHistory: (value: CodeHistory) => void
): [Doc, SpanAnnotations, SetState<SpanAnnotations>, ImportedCodes] => {
  const [doc, setDoc] = useState<Doc>(null);
  const [annotations, setAnnotations] = useState<SpanAnnotations | null>(null);
  const [importedCodes, setImportedCodes] = useState<ImportedCodes>({});

  useEffect(() => {
    if (!unit.annotations) unit.annotations = [];
    if (unit.importedAnnotations) {
      if (unit.annotations.length === 0 && unit.status !== "DONE") {
        unit.annotations = unit.importedAnnotations;
      }
      const importedCodes = {};
      for (let a of unit.importedAnnotations) {
        if (!importedCodes[a.variable]) importedCodes[a.variable] = {};
        if (!importedCodes[a.variable][a.value]) importedCodes[a.variable][a.value] = true;
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

const initializeCodeHistory = (annotations, setCodeHistory) => {
  const ch = {};

  for (let annotation of annotations) {
    if (!ch[annotation.variable]) ch[annotation.variable] = new Set();
    ch[annotation.variable].add(annotation.value);
  }

  for (let key of Object.keys(ch)) {
    ch[key] = [...ch[key]];
  }
  setCodeHistory(ch);
};

export default useUnit;
