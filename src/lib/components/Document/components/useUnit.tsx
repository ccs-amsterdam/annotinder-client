import { useState, useEffect, useMemo } from "react";
import { getDoc, getAnnotations } from "../functions/prepareDocumentContent";
import {
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
import { exportFieldAnnotations, exportSpanAnnotations } from "../functions/annotations";
import { scrollToMiddle } from "../../../functions/scroll";

/**
 * This dude prepares a bunch of states for the Unit, including the current annotations.
 * It also uses the returnTokens and onChangeAnnotation callback functions to give the
 * parent of Document access to the tokens and (new) annotations.
 * @param unit
 * @param returnTokens
 * @param onChangeAnnotations
 * @returns
 */
const useUnit = (
  unit: Unit,
  annotations: Annotation[],
  returnTokens: (value: Token[]) => void,
  onChangeAnnotations: (value: Annotation[]) => void
): UnitStates => {
  // Create a bunch of states
  //const [doc, setDoc] = useState<Doc>({});
  const [codeHistory, setCodeHistory] = useState<CodeHistory>({});
  const [spanAnnotations, setSpanAnnotations] = useState<SpanAnnotations | null>(null);
  const [fieldAnnotations, setFieldAnnotations] = useState<FieldAnnotations | null>(null);
  const [safetyCheck, setSafetyCheck] = useState<Token[]>(null);

  const doc = useMemo(() => getDoc(unit), [unit]);

  if (useWatchChange([unit, annotations])) {
    const unitAnnotations = annotations || unit.annotations || [];
    unit = { ...unit, annotations: [...unitAnnotations] };
    const [spanAnnotations, fieldAnnotations] = getAnnotations(doc, unit.annotations);
    initializeCodeHistory(unit.annotations, setCodeHistory);
    setSpanAnnotations(spanAnnotations);
    setFieldAnnotations(fieldAnnotations);
    setSafetyCheck(doc.tokens);

    if (spanAnnotations && Object.keys(spanAnnotations).length > 0) {
      // the select function is only available if the input annotations have
      // changed but the doc is the same.
      const index = Object.keys(spanAnnotations)[0];
      const token = doc.tokens[index];
      if (token?.containerRef && token?.ref)
        scrollToMiddle(token.containerRef.current, token.ref.current, 1 / 3);
      //keepInView(token.containerRef.current, token.ref.current);
    }
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
    if (safetyCheck !== doc.tokens) return;
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
