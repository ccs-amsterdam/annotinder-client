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
  TriggerCodePopup,
  FullScreenNode,
} from "../../../types";

interface AnnotateNavigationProps {
  tokens: Token[];
  variableMap: VariableMap;
  annotations: SpanAnnotations;
  disableAnnotations: boolean;
  editMode: boolean;
  triggerCodeSelector: TriggerCodePopup;
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
  variableMap,
  annotations,
  disableAnnotations,
  editMode,
  triggerCodeSelector,
  showAll,
  eventsBlocked,
  fullScreenNode,
}: AnnotateNavigationProps) => {
  const [currentToken, setCurrentToken] = useState({ i: null });
  const [tokenSelection, setTokenSelection] = useState<TokenSelection>([]);

  useEffect(() => {
    highlightAnnotations(tokens, annotations, variableMap, editMode, showAll);
  }, [tokens, annotations, variableMap, editMode, showAll]);

  useEffect(() => {
    setSelectionAsCSSClass(tokens, tokenSelection);
  }, [tokens, tokenSelection, editMode]);

  useEffect(() => {
    setTokenSelection([]);
  }, [annotations]);

  useEffect(() => {
    setCurrentToken({ i: null });
    setTokenSelection([]);
  }, [tokens]);

  return (
    <>
      <AnnotationPopup
        tokens={tokens}
        currentToken={currentToken}
        setCurrentToken={setCurrentToken}
        annotations={annotations}
        variableMap={variableMap}
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
          triggerCodePopup={triggerCodeSelector}
          editMode={editMode}
          eventsBlocked={eventsBlocked}
        />
      )}
    </>
  );
};

const highlightAnnotations = (
  tokens: Token[],
  annotations: SpanAnnotations,
  variableMap: VariableMap,
  editMode: boolean,
  showAll: boolean
) => {
  // loop over tokens. Do some styling. Then get the (allowed) annotations for this token,
  // and apply styling to annotated tokens
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token.ref?.current) continue;

    if (editMode) {
      if (token.ref.current.style.cursor !== "default") token.ref.current.style.cursor = null;
    } else {
      if (token.ref.current.style.cursor !== "text") token.ref.current.style.cursor = "text";
    }

    let tokenAnnotations = allowedAnnotations(annotations?.[token.index], variableMap, showAll);
    if (!tokenAnnotations || Object.keys(tokenAnnotations).length === 0) {
      if (token.ref.current.classList.contains("annotated")) {
        token.ref.current.classList.remove("annotated");
        setTokenColor(token, null, null, null);
      }
      continue;
    }

    setAnnotationAsCSSClass(token, tokenAnnotations, variableMap);

    if (editMode) {
      // in edit mode, make annotations look clickable
      token.ref.current.style.cursor = "pointer";
    }
  }
};

const allowedAnnotations = (
  annotations: AnnotationMap,
  variableMap: VariableMap,
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

      if (!variableMap?.[a.variable]) {
        delete annotations[id];
        continue;
      }
      const codeMap = variableMap[a.variable].codeMap;
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
  variableMap: VariableMap
) => {
  // Set specific classes for nice css to show the start/end of codes
  let nLeft = 0;
  let nRight = 0;
  const colors: any = { pre: [], text: [], post: [] };
  let tokenlabel: string[] = [];
  let nAnnotations = Object.keys(annotations).length;

  for (let id of Object.keys(annotations)) {
    const annotation = annotations[id];
    const codeMap = variableMap?.[annotation.variable]?.codeMap || {};
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

const setSelectionAsCSSClass = (tokens: Token[], selection: TokenSelection) => {
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
    let selected = token.arrayIndex >= from && token.arrayIndex <= to;
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
  variableMap: VariableMap;
  fullScreenNode: any;
}

const AnnotationPopup = React.memo(
  ({
    tokens,
    currentToken,
    setCurrentToken,
    annotations,
    variableMap,
    fullScreenNode,
  }: AnnotationPopupProps) => {
    const [content, setContent] = useState(null);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
      if (!tokens?.[currentToken.i]?.ref || !annotations?.[tokens[currentToken.i].index]) {
        setContent(null);
        setRefresh(0);
        return;
      }

      const tokenAnnotations = annotations[tokens[currentToken.i].index];
      const ids = Object.keys(tokenAnnotations);
      const list = ids.reduce((arr, id, i) => {
        const variable = tokenAnnotations[id].variable;
        const value = tokenAnnotations[id].value;
        const codeMap = variableMap?.[variable]?.codeMap || {};
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
            <b>{variable}</b>
            {": " + value}
          </List.Item>
        );
        return arr;
      }, []);

      setContent(<List>{list}</List>);
      setRefresh(0);
    }, [tokens, currentToken, setCurrentToken, annotations, variableMap, setRefresh]);

    useEffect(() => {
      // ugly hack, but popup won't scroll along, so refresh position at intervalls if content is not null
      if (!content) return;
      const timer = setTimeout(() => {
        setRefresh(refresh + 1);
      }, 200);
      return () => clearTimeout(timer);
    }, [refresh, content]);

    return (
      <Popup
        mountNode={fullScreenNode || undefined}
        context={tokens?.[currentToken.i]?.ref}
        basic
        hoverable={false}
        position="top left"
        open={true}
        style={{
          margin: "0",
          padding: "0",
          border: "1px solid",
          zIndex: 100,
          background: "var(--background)",
          color: "var(--text)",
        }}
      >
        {content}
      </Popup>
    );
  }
);

export default AnnotateNavigation;
