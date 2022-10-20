import React, { useState, useEffect, ReactElement, useRef } from "react";

import SelectVariablePage from "./SelectVariablePage";
import SelectAnnotationPage from "./SelectAnnotationPage";
import NewCodePage from "./NewCodePage";
import {
  SetState,
  Span,
  SpanAnnotations,
  Token,
  AnnotationMap,
  TriggerCodePopup,
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
): [ReactElement, TriggerCodePopup, boolean] => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(null);
  const [span, setSpan] = useState<Span>(null);
  const [variable, setVariable] = useState(null);
  const tokens = unitStates.doc.tokens;

  const triggerFunction = React.useCallback(
    // this function can be called to open the code selector.
    (index: number, span: Span) => {
      setSpan(span || [index, index]);
      setIndex(index);
      setOpen(true);
    },
    [setIndex]
  );

  if (useWatchChange([tokens])) setOpen(false);
  if (useWatchChange([variableMap])) setVariable(null);
  if (useWatchChange([open])) setVariable(null);
  const tokenAnnotations: AnnotationMap = unitStates?.spanAnnotations?.[index] || {};

  if (!variables) return [null, null, true];

  let popup = (
    <CodeSelectorPortal open={open} setOpen={setOpen} positionRef={tokens?.[index]?.ref}>
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
          tokenAnnotations={tokenAnnotations}
          span={span}
          editMode={editMode}
          setOpen={setOpen}
          codeHistory={unitStates.codeHistory}
          setCodeHistory={unitStates.setCodeHistory}
        />
      </>
    </CodeSelectorPortal>
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

interface CodeSelectorPortalProps {
  children: ReactElement;
  open: boolean;
  setOpen: SetState<boolean>;
  positionRef: any;
}

const CodeSelectorPortal = React.memo(
  ({ children, open, setOpen, positionRef }: CodeSelectorPortalProps) => {
    const portalref = useRef(null);

    useEffect(() => {
      // close popup on document click
      const closePortal = (e: any) => {
        if (portalref.current && !portalref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mouseup", closePortal);
      return () => {
        document.removeEventListener("mouseup", closePortal);
      };
    }, [positionRef, setOpen]);

    useEffect(() => {
      if (!open || !portalref.current) return;
      setTimeout(() => fitPortalOnScreen(portalref.current, positionRef.current), 10);

      // this isn't pretty, but we can't know when the portal reaches its full size.
      // Supposedly this should also be possible with the resizeObserver API, but not
      // sure that's sufficiently supported yet (especially considering RStudio)
      let portalWidth = portalref.current.clientWidth;
      const interval = setInterval(() => {
        if (portalref.current.clientWidth === portalWidth) return;
        fitPortalOnScreen(portalref.current, positionRef.current);
        portalWidth = portalref.current.clientWidth;
      }, 100);
      return () => clearInterval(interval);
    }, [open, positionRef]);

    // if this is a small screen, use a portal instead of a popup
    const smallscreen = window.innerWidth < 500;

    if (!open) return null;
    return (
      <div
        ref={portalref}
        style={{
          left: 0,
          top: 0,
          position: "fixed",
          minWidth: smallscreen ? "100%" : "300px",
          maxWidth: "min(100%, 600px)",
          zIndex: 1000,
          background: "var(--background)",
          color: "var(--text)",
          padding: "10px",
          marginTop: "14px",
          borderRadius: "5px",
          border: "1px solid var(--primary)",
          opacity: "0",
          transition: "opacity 250ms, width 250ms, padding 100ms, left 50ms",
        }}
      >
        {children}
      </div>
    );
  }
);

const fitPortalOnScreen = (portalEl: HTMLElement, positionEl: HTMLElement) => {
  // move portal up if it doesn't fit on screen
  if (!portalEl || !positionEl) return;
  const portal = portalEl.getBoundingClientRect();
  const position = positionEl.getBoundingClientRect();
  const windowHeight = document.documentElement.clientHeight;
  const windowWidth = document.documentElement.clientWidth;

  let up = position.y + 30;
  if (up < 0) {
    up = 0;
  } else {
    const bottom = up + 30 + portal.height;
    const offscreen = bottom - windowHeight;
    if (offscreen > 0) up -= offscreen;
  }

  let left = position.x + position.width / 2 - portal.width / 2;
  if (left < 0) {
    left = 0;
  } else {
    const right = left + portal.width;
    const offscreen = right - windowWidth;
    if (offscreen > 0) left -= offscreen;
  }

  portalEl.style.opacity = "1";
  portalEl.style.left = `${left}px`;
  portalEl.style.top = `${up}px`;
};

export default useCodeSelector;
