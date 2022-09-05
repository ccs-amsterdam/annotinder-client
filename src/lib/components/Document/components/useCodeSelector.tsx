import React, { useState, useEffect, ReactElement, useRef, RefObject } from "react";
import { TransitionablePortal } from "semantic-ui-react";

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
    <CodeSelectorPopup
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
    </CodeSelectorPopup>
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

const transition = { transition: "zoom", duration: 100 };
interface CodeSelectorPopupProps {
  children: ReactElement;
  fullScreenNode: any;
  open: boolean;
  setOpen: SetState<boolean>;
  positionRef: any;
}

const CodeSelectorPopup = React.memo(
  ({ children, fullScreenNode, open, setOpen, positionRef }: CodeSelectorPopupProps) => {
    const portalref = useRef(null);

    useEffect(() => {
      // When creating an annotation by mouse, the mouseup event immediately triggers the closeOnDocumentClick
      // of the portal. So we disable that listener and do it here manually. We then use the canIClose
      // boolean to ignore the first mouseup event
      let canIClose = false;
      const closePortal = () => (canIClose ? setOpen(false) : null);
      canIClose = true;
      document.addEventListener("mouseup", closePortal);
      return () => {
        document.removeEventListener("mouseup", closePortal);
      };
    }, [positionRef, open, setOpen]);

    // useEffect(() => {
    //   // When the portal opens, we run a function to make it position nicely.
    //   // The setTimeout makes sure this happens after rendering, when the size of the
    //   // portal is known
    //   if (!open) return;
    //   const timer = setTimeout(() => fitPortalOnScreen(portalref, positionRef), 0);
    //   return () => clearTimeout(timer);
    // }, [open, positionRef]);

    // if this is a small screen, use a portal instead of a popup
    const smallscreen = window.innerWidth < 500;

    return (
      // A transitionableportal would look cool, but a mouseclick to trigger the popup/portal
      // propagates to the document and immediately closes it and I somehow can't stopt it (hence the silly canIClose check).
      <TransitionablePortal
        transition={transition}
        mountNode={fullScreenNode || undefined}
        mountOnShow={false}
        open={open}
        closeOnDocumentClick={false}
        onOpen={() => {
          setTimeout(() => fitPortalOnScreen(portalref, positionRef), 0);
        }}
        onClose={(e, d) => {
          setOpen(false);
        }}
      >
        <div
          ref={portalref}
          style={{
            bottom: 0,
            right: 0,
            position: "fixed",
            minWidth: smallscreen ? "100%" : "200px",
            maxWidth: "max(100%, 500px)",
            zIndex: 1000,
            background: "#dfeffb",
            padding: "10px",
            marginTop: "14px",
            borderRadius: "5px",
            border: "1px solid #136bae",
            transition: "transform 0ms",
          }}
        >
          {children}
        </div>
      </TransitionablePortal>
    );
  }
);

const fitPortalOnScreen = (
  portalref: RefObject<HTMLElement>,
  positionRef: RefObject<HTMLElement>
) => {
  // move portal up if it doesn't fit on screen
  if (!portalref.current || !positionRef.current) return;
  const portal = portalref.current.getBoundingClientRect();
  // const bottom = portal.top + portal.height;
  // const offsetY = Math.max(0, bottom - window.innerHeight);

  // if theres space, move portal left until it centers on the selected word
  const position = positionRef.current.getBoundingClientRect();
  const y = position.y + 30;
  const diffY = Math.max(0, portal.y - y);
  let offsetY = 0;
  const maxmoveY = portal.y;
  offsetY = Math.min(diffY, maxmoveY);

  // if theres space, move portal left until it centers on the selected word
  const x = position.x + position.width / 2 - portal.width / 2;
  const diffX = Math.max(0, portal.x - x);
  let offsetX = 0;
  const maxmoveX = portal.x;
  offsetX = Math.min(diffX, maxmoveX);

  portalref.current.style.transform = `translateY(-${offsetY}px) translateX(-${offsetX}px)`;
};

export default useCodeSelector;
