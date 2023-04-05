import React, { useState, ReactElement } from "react";

import SelectVariablePage from "../components/SelectVariablePage";
import SelectAnnotationPage from "../components/SelectAnnotationPage";
import NewCodePage from "../components/NewCodePage";
import AnnotationPortal from "../components/AnnotationPortal";
import {
  SetState,
  Span,
  Token,
  TriggerSelector,
  Variable,
  VariableMap,
  TriggerSelectorParams,
  AnnotationLibrary,
  Doc,
} from "../../../types";
import useWatchChange from "../../../hooks/useWatchChange";
import AnnotationManager from "../functions/AnnotationManager";

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
const useSpanSelector = (
  doc: Doc,
  annotationLib: AnnotationLibrary,
  annotationManager: AnnotationManager,
  variableMap: VariableMap,
  editMode: boolean,
  variables: Variable[]
): [ReactElement, TriggerSelector, boolean] => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(null);
  const [span, setSpan] = useState<Span>(null);
  const [variable, setVariable] = useState(null);
  const tokens = doc.tokens;

  const triggerFunction = React.useCallback(
    // this function can be called to open the code selector.
    (selection: TriggerSelectorParams) => {
      if (selection?.index == null || selection?.from == null || selection?.to == null) return;
      if (selection.from > selection.to)
        [selection.from, selection.to] = [selection.to, selection.from];
      setSpan([selection.from, selection.to]);
      setIndex(selection.index);
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
    <AnnotationPortal open={open} setOpen={setOpen} positionRef={tokens?.[index]?.ref} minY={30}>
      <>
        {open && (
          <SelectPage
            editMode={editMode}
            tokens={tokens}
            variable={variable}
            setVariable={setVariable}
            variableMap={variableMap}
            annotationLib={annotationLib}
            span={span}
            setSpan={setSpan}
            setOpen={setOpen}
          />
        )}
        <NewCodePage // if current is known, select what the new code should be (or delete, or ignore)
          tokens={tokens}
          variable={variable}
          variableMap={variableMap}
          annotationLib={annotationLib}
          annotationManager={annotationManager}
          span={span}
          editMode={editMode}
          setOpen={setOpen}
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
  annotationLib: AnnotationLibrary;
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
    annotationLib,
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
          annotationLib={annotationLib}
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
          annotationLib={annotationLib}
          span={span}
          setOpen={setOpen}
        />
      );
    }
  }
);

export default useSpanSelector;
