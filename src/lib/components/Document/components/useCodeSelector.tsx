import React, { useState, useEffect, ReactElement } from "react";
import { Popup, Portal, Segment } from "semantic-ui-react";

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
  TokenAnnotations,
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
  const [tokenAnnotations, setTokenAnnotations] = useState<TokenAnnotations>({});

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

//const transition = { transition: "browse", duration: 1000 };
interface CodeSelectorPopupProps {
  children: ReactElement;
  fullScreenNode: any;
  open: boolean;
  setOpen: SetState<boolean>;
  positionRef: any;
}

const CodeSelectorPopup = React.memo(
  ({ children, fullScreenNode, open, setOpen, positionRef }: CodeSelectorPopupProps) => {
    const popupMargin = "5px";
    let position = "top left";
    let maxHeight = "100vh";

    if (positionRef?.current) {
      // determine popup position and maxHeight/maxWidth
      const bc = positionRef.current.getBoundingClientRect();
      const topSpace = bc.top / window.innerHeight;
      const bottomSpace = (window.innerHeight - bc.bottom) / window.innerHeight;

      if (topSpace > bottomSpace) {
        position = "top";
        maxHeight = `calc(${topSpace * 100}vh - ${popupMargin})`;
      } else {
        position = "bottom";
        maxHeight = `calc(${bottomSpace * 100}vh - ${popupMargin})`;
      }
      const leftSpace = bc.left / window.innerWidth;
      const rightSpace = (window.innerWidth - bc.right) / window.innerWidth;
      position = rightSpace > leftSpace ? position + " left" : position + " right";
    }

    // somehow onclose trigger when first opening popup. this hack enables closing it
    // when clicking outside of the popup
    let canIClose = false;

    // if this is a small screen, use a portal instead of a popup
    const smallscreen = window.innerWidth < 768;

    if (smallscreen) {
      return (
        // A transitionableportal would look cool, but for some reason a mouseclick to trigger the popup/portal
        // propagates to immediately close it (hence the silly canIClose check).
        <Portal
          mountNode={fullScreenNode || undefined}
          open={open}
          onClose={(e, d) => {
            if (canIClose) setOpen(false);
            canIClose = true;
          }}
          style={{
            margin: popupMargin,
            padding: "0px",
            minWidth: "15em",
            maxHeight,
            overflow: "visible",
          }}
        >
          {/* TODO: this used to be a segment, but somehow ts doesn't like those either. But maybe this broke the portal */}
          <Segment
            style={{
              bottom: "0",
              position: "fixed",
              width: "100%",
              zIndex: 1000,
              background: "#dfeffb",
              border: "1px solid #136bae",
            }}
          >
            {children}
          </Segment>
        </Portal>
      );
    }

    return (
      <Popup
        mountNode={fullScreenNode || undefined}
        context={positionRef}
        basic
        wide="very"
        position={position as "top left" | "top right" | "bottom left" | "bottom right"}
        hoverable
        open={open}
        mouseLeaveDelay={10000000} // just don't use mouse leave
        onClose={(e, d) => {
          if (canIClose) setOpen(false);
          canIClose = true;
        }}
        style={{
          margin: popupMargin,
          padding: "0px",
          background: "#dfeffb",
          border: "1px solid #136bae",
          //backdropFilter: "blur(3px)",
          minWidth: "15em",
          maxHeight,
          overflow: "visible",
        }}
      >
        <div style={{ margin: "5px", border: "0px", position: "relative" }}>{children}</div>
      </Popup>
    );
  }
);

export default useCodeSelector;
