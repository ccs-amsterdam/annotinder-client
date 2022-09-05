import React, { useState, useEffect, ReactElement, useRef } from "react";

import SelectVariablePage from "./SelectVariablePage";
import SelectAnnotationPage from "./SelectAnnotationPage";
import NewCodePage from "./NewCodePage";
import {
  CodeHistory,
  FullScreenNode,
  SetState,
  Span,
  SpanAnnotations,
  Token,
  AnnotationMap,
  TriggerCodePopup,
  Variable,
  VariableMap,
} from "../../../types";

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
 * @param {*} fullScreenNode
 * @returns
 */
const useCodeSelector = (
  tokens: Token[],
  variableMap: VariableMap,
  editMode: boolean,
  variables: Variable[],
  annotations: SpanAnnotations,
  setAnnotations: SetState<SpanAnnotations>,
  codeHistory: CodeHistory,
  setCodeHistory: SetState<CodeHistory>,
  fullScreenNode: FullScreenNode
): [ReactElement, TriggerCodePopup, boolean] => {
  const [open, setOpen] = useState(false);
  const [span, setSpan] = useState<Span>(null);
  const [variable, setVariable] = useState(null);
  const [tokenRef, setTokenRef] = useState(null);
  const [tokenAnnotations, setTokenAnnotations] = useState<AnnotationMap>({});

  const triggerFunction = React.useCallback(
    // this function can be called to open the code selector.
    (index: number, span: Span) => {
      if (!tokens[index].ref) return;
      setTokenRef(tokens[index].ref);
      setTokenAnnotations(annotations[index] || {});
      setSpan(span || [index, index]);
      setOpen(true);
    },
    [annotations, tokens]
  );

  useEffect(() => {
    setVariable(null);
  }, [variableMap]);

  useEffect(() => {
    setOpen(false);
  }, [tokens]);

  useEffect(() => {
    if (!open) setVariable(null);
  }, [open]);

  if (!variables) return [null, null, true];

  let popup = (
    <CodeSelectorPortal
      fullScreenNode={fullScreenNode}
      open={open}
      setOpen={setOpen}
      positionRef={tokenRef}
    >
      <>
        <SelectPage
          editMode={editMode}
          tokens={tokens}
          variable={variable}
          setVariable={setVariable}
          variableMap={variableMap}
          annotations={annotations}
          span={span}
          setSpan={setSpan}
          setOpen={setOpen}
        />
        <NewCodePage // if current is known, select what the new code should be (or delete, or ignore)
          tokens={tokens}
          variable={variable}
          variableMap={variableMap}
          annotations={annotations}
          tokenAnnotations={tokenAnnotations}
          setAnnotations={setAnnotations}
          span={span}
          editMode={editMode}
          setOpen={setOpen}
          codeHistory={codeHistory}
          setCodeHistory={setCodeHistory}
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
  fullScreenNode: any;
  open: boolean;
  setOpen: SetState<boolean>;
  positionRef: any;
}

const CodeSelectorPortal = React.memo(
  ({ children, fullScreenNode, open, setOpen, positionRef }: CodeSelectorPortalProps) => {
    const portalref = useRef(null);

    useEffect(() => {
      // close popup on document click
      const closePortal = (e: any) => {
        if (portalref.current && !portalref.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mouseup", closePortal);
      return () => {
        document.removeEventListener("mouseup", closePortal);
      };
    }, [positionRef, open, setOpen]);

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
      }, 50);
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
          minWidth: smallscreen ? "100%" : "200px",
          maxWidth: "min(100%, 500px)",
          zIndex: 1000,
          background: "#dfeffb",
          padding: "10px",
          marginTop: "14px",
          borderRadius: "5px",
          border: "1px solid #136bae",
          opacity: "0",
          transition: "opacity 250ms",
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

  console.log(portal.height);
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
