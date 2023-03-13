import React, { useState, ReactElement } from "react";

import SelectVariablePage from "../components/SelectVariablePage";
import SelectAnnotationPage from "../components/SelectAnnotationPage";
import NewCodePage from "../components/NewCodePage";
import AnnotationPortal from "../components/AnnotationPortal";
import {
  SetState,
  Span,
  SpanAnnotations,
  Token,
  TriggerSelectionPopup,
  Variable,
  VariableMap,
  UnitStates,
} from "../../../types";
import useWatchChange from "../../../hooks/useWatchChange";

/**
 * This hook is an absolute monster, as it takes care of a lot of moving parts.
 * Basically, everything surrounding the popups for selecting and editing codes, and updating the annotations
 * Please don't touch it untill I get around to refactoring it, and then still don't touch it unless strictly needed
 *
 * The weirdest (but nice) part is that it returns a popup component, as well as a 'trigger' function.
 * The trigger function can then be used to trigger a popup for starting a selection or edit for a given token index (position of popup)
 * and selection (which span to create/edit)
 *
 * @param {*} tokens
 * @param {*} variableMap
 * @param {*} editMode
 * @param {*} variables
 * @param {*} annotations
 * @param {*} setAnnotations
 * @param {*} codeHistory
 * @param {*} setCodeHistory
 * @returns
 */
const useCodeSelector = (
  unitStates: UnitStates,
  variableMap: VariableMap,
  editMode: boolean,
  variables: Variable[]
): [ReactElement, TriggerSelectionPopup, boolean] => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(null);
  const [span, setSpan] = useState<Span>(null);
  const [variable, setVariable] = useState(null);
  const tokens = unitStates.doc.tokens;

  const triggerFunction = React.useCallback(
    // this function can be called to open the code selector.
    (index: number, span: Span) => {
      let [from, to] = span;
      if (from > to) [from, to] = [to, from];
      setSpan([from, to]);
      setIndex(index);
      setOpen(true);
    },
    [setIndex]
  );

  if (useWatchChange([tokens])) setOpen(false);
  if (useWatchChange([variableMap])) {
    setVariable(null);
    setOpen(false);
  }
  if (useWatchChange([open])) setVariable(null);

  if (!variables) return [null, null, true];

  let popup = (
    <AnnotationPortal open={open} setOpen={setOpen} positionRef={tokens?.[index]?.ref}>
      <>
        <SelectPage
          editMode={editMode}
          tokens={tokens}
          variable={variable}
          setVariable={setVariable}
          variableMap={variableMap}
          annotations={unitStates.spanAnnotations}
          span={span}
          setSpan={setSpan}
          setOpen={setOpen}
        />
        <NewCodePage // if current is known, select what the new code should be (or delete, or ignore)
          tokens={tokens}
          variable={variable}
          variableMap={variableMap}
          annotations={unitStates.spanAnnotations}
          setAnnotations={unitStates.setSpanAnnotations}
          span={span}
          editMode={editMode}
          setOpen={setOpen}
          codeHistory={unitStates.codeHistory}
          setCodeHistory={unitStates.setCodeHistory}
        />
      </>
    </AnnotationPortal>
  );

  if (!variableMap || !tokens) popup = null;

  return [popup, triggerFunction, open];
};

interface SelectPageProps {
  editMode: boolean;
  tokens: Token[];
  variable: string;
  setVariable: SetState<string>;
  variableMap: any;
  annotations: SpanAnnotations;
  span: Span;
  setSpan: SetState<Span>;
  setOpen: SetState<boolean>;
}

const SelectPage = React.memo(
  ({
    editMode,
    tokens,
    variable,
    setVariable,
    variableMap,
    annotations,
    span,
    setSpan,
    setOpen,
  }: SelectPageProps) => {
    if (editMode) {
      return (
        <SelectAnnotationPage
          tokens={tokens}
          variable={variable}
          setVariable={setVariable}
          variableMap={variableMap}
          annotations={annotations}
          span={span}
          setSpan={setSpan}
          setOpen={setOpen}
        />
      );
    } else {
      return (
        <SelectVariablePage
          variable={variable}
          setVariable={setVariable}
          variableMap={variableMap}
          annotations={annotations}
          span={span}
          setOpen={setOpen}
        />
      );
    }
  }
);

export default useCodeSelector;
