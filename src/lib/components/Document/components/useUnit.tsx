import { useState, useEffect, useMemo } from "react";
import { getDocAndAnnotations } from "../functions/prepareDocumentContent";
import {
  Doc,
  CodeHistory,
  SetState,
  Annotation,
  Token,
  Unit,
  SpanAnnotations,
  FieldAnnotations,
  VariableValueMap,
  UnitStates,
} from "../../../types";
import useWatchChange from "../../../hooks/useWatchChange";
import { exportFieldAnnotations, exportSpanAnnotations } from "../../../functions/annotations";

/**
 * This dude prepares a bunch of states for the Unit, including the current annotations.
 * It also uses the returnTokens and onChangeAnnotation callback functions to give the
 * parent of Document access to the tokens and (new) annotations.
 * @param unit
 * @param safetyCheck
 * @param returnTokens
 * @param onChangeAnnotations
 * @returns
 */
const useUnit = (
  unit: Unit,
  safetyCheck: any,
  returnTokens: (value: Token[]) => void,
  onChangeAnnotations: (value: Annotation[]) => void
): UnitStates => {
  // Create a bunch of states
  const [doc, setDoc] = useState<Doc>({});
  const [importedCodes, setImportedCodes] = useState<VariableValueMap>({});
  const [codeHistory, setCodeHistory] = useState<CodeHistory>({});
  const [spanAnnotations, setSpanAnnotations] = useState<SpanAnnotations | null>(null);
  const [fieldAnnotations, setFieldAnnotations] = useState<FieldAnnotations | null>(null);

  // Set all the states when the unit changes
  if (useWatchChange([unit])) {
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

    const [document, spanAnnotations, fieldAnnotations] = getDocAndAnnotations(unit);

    safetyCheck.current = { tokens: document.tokens };

    setDoc(document);
    setSpanAnnotations(spanAnnotations);
    setFieldAnnotations(fieldAnnotations);
  }

  useEffect(() => {
    if (returnTokens) returnTokens(doc.tokens);
  }, [doc, returnTokens]);

  // If annotations change, prepare memoised version in standard annotation
  // array format. Then when one of these changes, a side effect performs onChangeAnnotations.
  const exportedSpanAnnotations: Annotation[] = useMemo(() => {
    return exportSpanAnnotations(spanAnnotations, doc.tokens, true);
  }, [spanAnnotations, doc]);

  const exportedFieldAnnotations: Annotation[] = useMemo(() => {
    return exportFieldAnnotations(fieldAnnotations);
  }, [fieldAnnotations]);

  useEffect(() => {
    // side effect to pass annotations back to the parent
    if (!onChangeAnnotations) return;
    // check if same unit, to prevent annotations from spilling over due to race conditions
    if (safetyCheck.current.tokens !== doc.tokens) return;
    onChangeAnnotations([...exportedSpanAnnotations, ...exportedFieldAnnotations]);
  }, [
    doc.tokens,
    exportedSpanAnnotations,
    exportedFieldAnnotations,
    onChangeAnnotations,
    safetyCheck,
  ]);

  return {
    doc,
    importedCodes,
    spanAnnotations,
    setSpanAnnotations,
    fieldAnnotations,
    setFieldAnnotations,
    codeHistory,
    setCodeHistory,
  };
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
