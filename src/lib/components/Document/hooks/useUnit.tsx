import { useState, useEffect, useMemo } from "react";
import { Doc, Annotation, Token, Unit, AnnotationLibrary } from "../../../types";
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
  onChangeAnnotations: (value: Annotation[]) => void
): [Doc, AnnotationLibrary, AnnotationManager] => {
  const [annotationLib, setAnnotationLib] = useState<AnnotationLibrary>({
    annotations: {},
    byToken: {},
    codeHistory: {},
  });

  const [annotationManager] = useState<AnnotationManager>(new AnnotationManager(setAnnotationLib));
  const [safetyCheck, setSafetyCheck] = useState<Token[]>(null);

  const doc = unit.unit;

  if (useWatchChange([unit, annotations])) {
    setAnnotationLib(createAnnotationLibrary(unit));
    setTimeout(() => setSafetyCheck(doc.tokens), 0);

    // if (spanAnnotations && Object.keys(spanAnnotations).length > 0) {
    //   const index = Object.keys(spanAnnotations)[0];
    //   const token = doc.tokens[index];
    //   if (token?.containerRef && token?.ref)
    //     scrollToMiddle(token.containerRef.current, token.ref.current, 1 / 3);
    // }
  }

  useEffect(() => {
    // side effect to pass annotations back to the parent
    if (!onChangeAnnotations) return;
    // check if same unit to prevent annotations from spilling over due to race conditions
    if (safetyCheck !== doc.tokens) return;

    const annotations = Object.values(annotationLib.annotations);

    onChangeAnnotations(annotations);
  }, [doc.tokens, annotationLib, onChangeAnnotations, safetyCheck]);

  return [doc, annotationLib, annotationManager];
};

// not a bad idea, but breaks interaction with annotation list
// function standardizeAnnotationIds(annotations: Annotation[]): Annotation[] {
//   const idMap: Record<string, string> = {};
//   for (let i = 0; i < annotations.length; i++) {
//     const id = String(i);
//     idMap[annotations[i].id] = id;
//     annotations[i] = { ...annotations[i], id };
//   }

//   for (let annotation of annotations) {
//     if (annotation.fromId != null) annotation.fromId = idMap[annotation.fromId];
//     if (annotation.toId != null) annotation.toId = idMap[annotation.toId];
//   }

//   return annotations;
// }

export default useUnit;
