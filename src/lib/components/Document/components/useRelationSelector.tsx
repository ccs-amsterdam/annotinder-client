import { useState, useCallback, ReactElement, useMemo } from "react";
import useWatchChange from "../../../hooks/useWatchChange";
import {
  UnitStates,
  Span,
  TriggerSelectionPopup,
  Variable,
  VariableType,
  Code,
} from "../../../types";
import AnnotationPortal from "./AnnotationPortal";

const useRelationSelector = (
  unitStates: UnitStates,
  variableType: VariableType,
  variable: Variable
): [ReactElement, TriggerSelectionPopup, boolean] => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(null);
  const [span, setSpan] = useState<Span>(null);
  const tokens = unitStates.doc.tokens;
  const annotations = unitStates.spanAnnotations;

  // create maps to lookup valid codes for combinations of
  // from and to annotations
  const [validFrom, validTo] = useMemo(() => {
    if (variableType !== "relation") return [null, null];
    const validFrom: Record<string, Code[]> = {};
    const validTo: Record<string, Code[]> = {};
    for (let code of variable.codes) {
      for (let value of code.from.values) {
        const key = code.from.variable + "|" + value;
        if (!validFrom[key]) validFrom[key] = [];
        validFrom[key].push(code);
      }
      for (let value of code.to.values) {
        const key = code.to.variable + "|" + value;
        if (!validTo[key]) validTo[key] = [];
        validTo[key].push(code);
      }
    }
    return [validFrom, validTo];
  }, [variable, annotations, tokens]);

  const triggerFunction = useCallback(
    (index: number, span: Span) => {
      const [from, to] = [annotations[span[0]], annotations[span[1]]];
      const fromOptions: Set<Code> = new Set();
      const toOptions: Set<Code> = new Set();
      for (let fromAnnotation of Object.keys(from)) {
        if (!validFrom[fromAnnotation]) continue;
        for (let code of validFrom[fromAnnotation]) fromOptions.add(code);
      }
      for (let toAnnotation of Object.keys(to)) {
        if (!validTo[toAnnotation]) continue;
        for (let code of validTo[toAnnotation]) toOptions.add(code);
      }
      setSpan(span);
      setIndex(index);
      setOpen(true);
    },
    [tokens, annotations, setIndex]
  );

  if (useWatchChange([tokens, variable])) setOpen(false);

  const popup = (
    <AnnotationPortal open={open} setOpen={setOpen} positionRef={tokens?.[span?.[1]]?.ref}>
      <p>{span?.[0] + "-" + span?.[1]}</p>
    </AnnotationPortal>
  );

  return [popup, triggerFunction, open];
};

export default useRelationSelector;
