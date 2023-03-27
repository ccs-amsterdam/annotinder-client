import { useState, useEffect } from "react";
import { Doc, Annotation, Unit, AnnotationLibrary, VariableMap } from "../../../types";
import useWatchChange from "../../../hooks/useWatchChange";

import AnnotationManager, { createAnnotationLibrary } from "../functions/AnnotationManager";

/**
 * This dude prepares a bunch of states for the Unit, including the current annotations.
 * It also uses the returnTokens and onChangeAnnotation callback functions to give the
 * parent of Document access to the tokens and (new) annotations.
 * @param unit
 * @param onChangeAnnotations
 * @returns
 */
const useUnit = (
  unit: Unit,
  annotations: Annotation[],
  fullVariableMap: VariableMap,
  onChangeAnnotations: (unitId: string, value: Annotation[]) => void
): [Doc, AnnotationLibrary, AnnotationManager] => {
  const [annotationLib, setAnnotationLib] = useState<AnnotationLibrary>({
    annotations: {},
    byToken: {},
    codeHistory: {},
    unitId: "",
  });

  const [annotationManager] = useState<AnnotationManager>(new AnnotationManager(setAnnotationLib));

  const doc = unit.unit;

  if (useWatchChange([unit, annotations, fullVariableMap])) {
    setAnnotationLib(createAnnotationLibrary(unit, annotations, fullVariableMap));
  }

  useEffect(() => {
    // side effect to pass annotations back to the parent
    if (!onChangeAnnotations) return;
    // check if same unit to prevent annotations from spilling over due to race conditions
    if (annotationLib.unitId !== unit.unitId) return;
    onChangeAnnotations(annotationLib.unitId, Object.values(annotationLib.annotations));
  }, [unit, annotationLib, onChangeAnnotations]);

  return [doc, annotationLib, annotationManager];
};

export default useUnit;
