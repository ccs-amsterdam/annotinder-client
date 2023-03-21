import React, { useEffect, useMemo, useRef } from "react";
import useAnnotationEvents from "../hooks/useAnnotationEvents";
import { List } from "semantic-ui-react";
import { getColor, getColorGradient } from "../../../functions/tokenDesign";
import standardizeColor from "../../../functions/standardizeColor";
import { getValidTokenRelations, getValidTokenDestinations } from "../functions/relations";
import Popup from "../../Common/Popup";

import {
  Variable,
  VariableMap,
  Token,
  SpanAnnotations,
  AnnotationMap,
  TokenSelection,
  TriggerSelectionPopup,
  VariableType,
  ValidTokenRelations,
  ValidTokenDestinations,
  RelationAnnotations,
} from "../../../types";
import DrawArrows from "./DrawArrows";

interface AnnotateNavigationProps {
  tokens: Token[];
  spanAnnotations: SpanAnnotations;
  relationAnnotations: RelationAnnotations;
  variable: Variable;
  variableType: VariableType;
  showValues: VariableMap;
  disableAnnotations: boolean;
  editMode: boolean;
  triggerSelectionPopup: TriggerSelectionPopup;
  eventsBlocked: boolean;
  showAll: boolean;
}

/**
 * The NavigationEvents component handles all eventlisteners
 * AnnotateNavigation furthermore takes the position and selection information
 * from the navigation to highlight the tokens and show popups
 */
const AnnotateNavigation = ({
  tokens,
  spanAnnotations,
  relationAnnotations,
  variable,
  variableType,
  showValues,
  disableAnnotations,
  editMode,
  triggerSelectionPopup,
  showAll,
  eventsBlocked,
}: AnnotateNavigationProps) => {
  const { currentToken, tokenSelection } = useAnnotationEvents(
    tokens,
    spanAnnotations,
    relationAnnotations,
    triggerSelectionPopup,
    editMode,
    eventsBlocked || disableAnnotations
  );

  const validRelations: ValidTokenRelations = useMemo(
    () => getValidTokenRelations(spanAnnotations, variable),
    [spanAnnotations, variable]
  );
  const validDestinations: ValidTokenDestinations = useMemo(
    () => getValidTokenDestinations(spanAnnotations, validRelations, tokenSelection),
    [spanAnnotations, validRelations, tokenSelection]
  );

  useEffect(() => {
    highlightAnnotations(
      tokens,
      validDestinations || validRelations,
      spanAnnotations,
      showValues,
      editMode,
      showAll,
      variableType
    );
  }, [
    tokens,
    validRelations,
    validDestinations,
    spanAnnotations,
    showValues,
    editMode,
    showAll,
    variableType,
  ]);

  useEffect(() => {
    setSelectionAsCSSClass(tokens, variableType, tokenSelection);
  }, [tokens, variableType, tokenSelection, editMode]);

  return (
    <>
      <AnnotationPopup
        tokens={tokens}
        currentToken={currentToken}
        annotations={spanAnnotations}
        showValues={showValues}
      />
      <DrawArrows
        variable={variable}
        tokens={tokens}
        annotations={relationAnnotations}
        showValues={showValues}
        triggerSelectionPopup={triggerSelectionPopup}
        tokenSelection={tokenSelection}
      />
    </>
  );
};

const highlightAnnotations = (
  tokens: Token[],
  validTokens: ValidTokenRelations | ValidTokenDestinations,
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

    if (variableType === "relation") {
      const canSelect = !validTokens || validTokens[token.index];
      //token.ref.current.style.cursor = canSelect ? "crosshair" : "not-allowed";
      if (canSelect) {
        token.ref.current.classList.add("can-select");
      } else {
        token.ref.current.classList.remove("can-select");
      }
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
    if (selection.length === 0 || selection[0] === null) {
      token.ref.current.classList.remove("selected");
      continue;
    }

    let [from, to] = selection;
    if (to === null) to = from;
    if (from > to) [to, from] = [from, to];

    // if type is relation, only show last token. Otherwise,
    // (if type is "span") show all tokens in between as well
    let selected =
      variableType === "relation"
        ? token.arrayIndex === to
        : token.arrayIndex >= from && token.arrayIndex <= to;

    const cl = token.ref.current.classList;
    if (selected && token.codingUnit) {
      const left = from === token.arrayIndex;
      const right = to === token.arrayIndex;
      cl.add("selected");
      left ? cl.add("start") : cl.remove("start");
      right ? cl.add("end") : cl.remove("end");
    } else {
      cl.remove("selected");
    }
  }
};

interface AnnotationPopupProps {
  tokens: Token[];
  currentToken: { i: number };
  annotations: SpanAnnotations;
  showValues: VariableMap;
}

const AnnotationPopup = React.memo(
  ({ tokens, currentToken, annotations, showValues }: AnnotationPopupProps) => {
    const ref = useRef<HTMLDivElement>();

    const content = useMemo(() => {
      if (!tokens?.[currentToken.i]?.ref || !annotations?.[tokens[currentToken.i].index]) {
        return null;
      }

      const tokenAnnotations = annotations[tokens[currentToken.i].index];
      const ids = Object.keys(tokenAnnotations);
      const list = ids.reduce((arr, id, i) => {
        const variable = tokenAnnotations[id].variable;
        const value = tokenAnnotations[id].value;
        if (!showValues?.[variable]) return arr;
        const codeMap = showValues?.[variable]?.codeMap || {};
        const color = tokenAnnotations[id].color || getColor(value, codeMap);

        arr.push(
          <List.Item
            key={i}
            style={{
              backgroundColor: color,
              padding: "0.3em",
            }}
          >
            {/* <b>{variable}</b>
            {": " + value} */}
            <b>{value}</b>
          </List.Item>
        );
        return arr;
      }, []);

      if (list.length === 0) return null;
      return <List>{list}</List>;
      //setRefresh(0);
    }, [tokens, currentToken, annotations, showValues]);

    useEffect(() => {
      const tokenRef = tokens?.[currentToken.i]?.ref;
      if (!tokenRef) return;
    }, [ref, tokens, currentToken]);

    if (!content) return null;
    const tokenRef = tokens?.[currentToken.i]?.ref;

    return (
      <Popup controlledOpen={true} triggerRef={tokenRef} noPointerEvents>
        {content}
      </Popup>
    );
  }
);

export default AnnotateNavigation;
