import React, { useState, useEffect } from "react";
import { AnnotationEvents } from "./AnnotationEvents";
import { Popup, List } from "semantic-ui-react";
import { getColor, getColorGradient } from "../../../functions/tokenDesign";
import standardizeColor from "../../../functions/standardizeColor";
import {
  VariableMap,
  SetState,
  Token,
  SpanAnnotations,
  AnnotationMap,
  TokenSelection,
  TriggerSelectionPopup,
  FullScreenNode,
  VariableType,
} from "../../../types";
import Arrow from "./Arrow";
import RelationArrows from "./RelationArrows";

interface AnnotateNavigationProps {
  tokens: Token[];
  variableType: VariableType;
  showValues: VariableMap;
  annotations: SpanAnnotations;
  disableAnnotations: boolean;
  editMode: boolean;
  triggerSelectionPopup: TriggerSelectionPopup;
  eventsBlocked: boolean;
  showAll: boolean;
  fullScreenNode: FullScreenNode;
}

/**
 * The NavigationEvents component handles all eventlisteners
 * AnnotateNavigation furthermore takes the position and selection information
 * from the navigation to highlight the tokens and show popups
 */
const AnnotateNavigation = ({
  tokens,
  variableType,
  showValues,
  annotations,
  disableAnnotations,
  editMode,
  triggerSelectionPopup,
  showAll,
  eventsBlocked,
  fullScreenNode,
}: AnnotateNavigationProps) => {
  const [currentToken, setCurrentToken] = useState({ i: null });
  const [tokenSelection, setTokenSelection] = useState<TokenSelection>([]);
  const [, setRefresh] = useState(0);

  useEffect(() => {
    highlightAnnotations(tokens, annotations, showValues, editMode, showAll, variableType);
  }, [tokens, annotations, showValues, editMode, showAll, variableType]);

  useEffect(() => {
    setSelectionAsCSSClass(tokens, variableType, tokenSelection);
  }, [tokens, variableType, tokenSelection, editMode]);

  useEffect(() => {
    setTokenSelection([]);
  }, [annotations]);

  useEffect(() => {
    setCurrentToken({ i: null });
    setTokenSelection([]);
  }, [tokens]);

  useEffect(() => {
    // ugly hack, but ensures that popup and arrows are redrawn
    // when positions change and on body scroll
    setRefresh(0);
    const refreshNow = () => setRefresh((refresh) => refresh + 1);
    const interval = setInterval(refreshNow, 500);

    // seems nicer, but we need to interval anyway because we can't
    // watch for changes in the bodycontainer
    const bodycontainer = document.getElementById("bodycontainer");
    if (bodycontainer) bodycontainer.addEventListener("scroll", refreshNow);

    return () => {
      if (bodycontainer) bodycontainer.removeEventListener("scroll", refreshNow);
      clearInterval(interval);
    };
  }, [tokens]);

  const validArrow =
    tokenSelection?.[0] &&
    annotations[tokenSelection[0]] &&
    tokenSelection?.[1] &&
    annotations[tokenSelection[1]];

  return (
    <>
      <AnnotationPopup
        tokens={tokens}
        currentToken={currentToken}
        setCurrentToken={setCurrentToken}
        annotations={annotations}
        showValues={showValues}
        fullScreenNode={fullScreenNode}
      />
      {disableAnnotations ? null : (
        <AnnotationEvents
          tokens={tokens}
          annotations={annotations}
          currentToken={currentToken}
          setCurrentToken={setCurrentToken}
          tokenSelection={tokenSelection}
          setTokenSelection={setTokenSelection}
          triggerSelectionPopup={triggerSelectionPopup}
          editMode={editMode}
          eventsBlocked={eventsBlocked}
        />
      )}

      {/* this is where the relation arrows are drawn */}
      {variableType === "relation" && (
        <svg
          style={{
            position: "absolute",
            marginTop: "-40px", // need to correct for menu bar
            top: 0,
            left: 0,
            height: "calc(100% + 40px)",
            overflow: "hidden",
            //height: window.innerHeight,
            width: "100%",
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          <Arrow
            id={"create relation"}
            tokens={tokens}
            tokenSelection={tokenSelection}
            edgeColor={validArrow ? "var(--primary)" : "var(--text-light)"}
          />

          <RelationArrows
            tokens={tokens}
            annotations={annotations}
            showValues={showValues}
            triggerSelectionPopup={triggerSelectionPopup}
          />
        </svg>
      )}
    </>
  );
};

const highlightAnnotations = (
  tokens: Token[],
  annotations: SpanAnnotations,
  showValues: VariableMap,
  editMode: boolean,
  showAll: boolean,
  variableType: string
) => {
  // loop over tokens. Do some styling. Then get the (allowed) annotations for this token,
  // and apply styling to annotated tokens
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token.ref?.current) continue;

    if (editMode) {
      token.ref.current.style.cursor = null;
    } else if (variableType === "relation") {
      token.ref.current.style.cursor = "crosshair";
    } else {
      token.ref.current.style.cursor = "text";
    }

    let tokenAnnotations = allowedAnnotations(annotations?.[token.index], showValues, showAll);
    if (!tokenAnnotations || Object.keys(tokenAnnotations).length === 0) {
      if (token.ref.current.classList.contains("annotated")) {
        token.ref.current.classList.remove("annotated");
        setTokenColor(token, null, null, null);
      }
      continue;
    }

    setAnnotationAsCSSClass(token, tokenAnnotations, showValues);

    if (editMode) {
      token.ref.current.style.cursor = "pointer";
    }
    if (variableType === "relation") {
      token.ref.current.style.cursor = "crosshair";
    }
  }
};

const allowedAnnotations = (
  annotations: AnnotationMap,
  showValues: VariableMap,
  showAll: boolean
) => {
  // get all annotations that are currently 'allowed', meaning that the variable is selected
  // and the codes are valid and active codes in the codebook
  if (!annotations) return null;
  if (showAll) return annotations;
  if (annotations) {
    annotations = { ...annotations };
    for (let id of Object.keys(annotations)) {
      const a = annotations[id];

      if (!showValues?.[a.variable]) {
        delete annotations[id];
        continue;
      }
      const codeMap = showValues[a.variable].codeMap;
      const code = annotations[id].value;
      if (!codeMap[code] || !codeMap[code].active || !codeMap[code].activeParent)
        if (code !== "EMPTY") delete annotations[id];
    }
  }
  return annotations;
};

const setAnnotationAsCSSClass = (
  token: Token,
  annotations: AnnotationMap,
  showValues: VariableMap
) => {
  // Set specific classes for nice css to show the start/end of codes
  let nLeft = 0;
  let nRight = 0;
  const colors: any = { pre: [], text: [], post: [] };
  let tokenlabel: string[] = [];
  let nAnnotations = Object.keys(annotations).length;

  for (let id of Object.keys(annotations)) {
    const annotation = annotations[id];
    const codeMap = showValues?.[annotation.variable]?.codeMap || {};
    const color = standardizeColor(annotation.color, "50") || getColor(annotation.value, codeMap);
    tokenlabel.push(String(annotation.value));

    colors.text.push(color);
    if (annotation.span[0] === annotation.index) {
      nLeft++;
      //colors.pre.push("#ffffff50");
    } else colors.pre.push(color);
    if (annotation.span[1] === annotation.index) {
      nRight++;
      //valueColors.post.push("#ffffff50");
    } else colors.post.push(color);
  }

  const allLeft = nLeft === nAnnotations;
  const allRight = nRight === nAnnotations;
  const anyLeft = nLeft > 0;
  const anyRight = nRight > 0;

  const cl = token.ref.current.classList;
  cl.add("annotated");
  allLeft ? cl.add("allLeft") : cl.remove("allLeft");
  anyLeft && !allLeft ? cl.add("anyLeft") : cl.remove("anyLeft");
  allRight ? cl.add("allRight") : cl.remove("allRight");
  anyRight && !allRight ? cl.add("anyRight") : cl.remove("anyRight");

  const textColor = getColorGradient(colors.text);
  const preColor = allLeft ? "var(--background)" : getColorGradient(colors.pre);
  const postColor = allRight ? "var(--background)" : getColorGradient(colors.post);

  setTokenColor(token, preColor, textColor, postColor);
  //setTokenLabels(token, ["test", "this"]);
};

const setTokenColor = (token: Token, pre: string, text: string, post: string) => {
  const children = token.ref.current.children;
  children[0].style.background = pre;
  children[1].style.background = text;
  children[2].style.background = post;
};

const setSelectionAsCSSClass = (
  tokens: Token[],
  variableType: VariableType,
  selection: TokenSelection
) => {
  for (let token of tokens) {
    if (!token.ref?.current) continue;
    token.ref.current.classList.remove("tapped");
    if (selection.length === 0 || selection[0] === null || selection[1] === null) {
      token.ref.current.classList.remove("selected");
      continue;
    }

    let [from, to] = selection;
    //if (to === null) return false;
    if (from > to) [to, from] = [from, to];

    // if type is relation, only show first and last token. Otherwise,
    // (if type is "span") show all tokens in between as well
    let selected =
      variableType === "relation"
        ? token.arrayIndex === from || token.arrayIndex === to
        : token.arrayIndex >= from && token.arrayIndex <= to;

    const cl = token.ref.current.classList;
    if (selected && token.codingUnit) {
      const left = from === token.arrayIndex;
      const right = to === token.arrayIndex;
      cl.add("selected");
      left ? cl.add("start") : cl.remove("start");
      right ? cl.add("end") : cl.remove("end");
    } else cl.remove("selected");
  }
};

interface AnnotationPopupProps {
  tokens: Token[];
  currentToken: { i: number };
  setCurrentToken: SetState<{ i: number }>;
  annotations: SpanAnnotations;
  showValues: VariableMap;
  fullScreenNode: any;
}

const AnnotationPopup = React.memo(
  ({
    tokens,
    currentToken,
    setCurrentToken,
    annotations,
    showValues,
    fullScreenNode,
  }: AnnotationPopupProps) => {
    const [content, setContent] = useState(null);

    useEffect(() => {
      if (!tokens?.[currentToken.i]?.ref || !annotations?.[tokens[currentToken.i].index]) {
        setContent(null);
        //setRefresh(0);
        return;
      }

      const tokenAnnotations = annotations[tokens[currentToken.i].index];
      const ids = Object.keys(tokenAnnotations);
      const list = ids.reduce((arr, id, i) => {
        const variable = tokenAnnotations[id].variable;
        const value = tokenAnnotations[id].value;
        const codeMap = showValues?.[variable]?.codeMap || {};
        const color = tokenAnnotations[id].color || getColor(value, codeMap);

        arr.push(
          <List.Item
            key={i}
            style={{
              backgroundColor: color,
              padding: "0.3em",
            }}
            onMouseOver={() => setCurrentToken({ i: null })}
          >
            {/* <b>{variable}</b>
            {": " + value} */}
            <b>{value}</b>
          </List.Item>
        );
        return arr;
      }, []);

      setContent(<List>{list}</List>);
      //setRefresh(0);
    }, [tokens, currentToken, setCurrentToken, annotations, showValues]);

    return (
      <Popup
        mountNode={fullScreenNode || undefined}
        context={tokens?.[currentToken.i]?.ref}
        basic
        hoverable={true}
        position="top left"
        open={true}
        style={{
          margin: "0",
          padding: "0",
          border: "1px solid",
          zIndex: 100,
          background: "var(--background)",
          color: "var(--text)",
          fontSize: "1em",
        }}
      >
        {content}
      </Popup>
    );
  }
);

export default AnnotateNavigation;
