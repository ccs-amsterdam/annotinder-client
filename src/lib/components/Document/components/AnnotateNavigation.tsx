import React, { useEffect, useMemo, useRef, useState } from "react";
import useAnnotationEvents from "../hooks/useAnnotationEvents";
import { List } from "semantic-ui-react";
import { getColorGradient } from "../../../functions/tokenDesign";
import standardizeColor from "../../../functions/standardizeColor";
import { getValidTokenRelations, getValidTokenDestinations } from "../functions/relations";
import Popup from "../../Common/Popup";

import {
  Variable,
  VariableMap,
  Token,
  Annotation,
  TokenSelection,
  TriggerSelector,
  VariableType,
  ValidTokenRelations,
  ValidTokenDestinations,
  AnnotationLibrary,
} from "../../../types";
import DrawArrows from "./DrawArrows";

interface AnnotateNavigationProps {
  tokens: Token[];
  annotationLib: AnnotationLibrary;
  variable: Variable;
  variableType: VariableType;
  showValues: VariableMap;
  disableAnnotations: boolean;
  editMode: boolean;
  triggerSelector: TriggerSelector;
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
  annotationLib,
  variable,
  variableType,
  showValues,
  disableAnnotations,
  editMode,
  triggerSelector,
  showAll,
  eventsBlocked,
}: AnnotateNavigationProps) => {
  const [forceRerender, setForceRerender] = useState(0);
  const { currentToken, tokenSelection } = useAnnotationEvents(
    tokens,
    annotationLib,
    triggerSelector,
    editMode,
    eventsBlocked || disableAnnotations
  );

  const validRelations: ValidTokenRelations = useMemo(
    () => getValidTokenRelations(annotationLib, variable),
    [annotationLib, variable]
  );
  const validDestinations: ValidTokenDestinations = useMemo(
    () => getValidTokenDestinations(annotationLib, validRelations, tokenSelection),
    [annotationLib, validRelations, tokenSelection]
  );

  useEffect(() => {
    setTimeout(() => {
      if (tokens && tokens.length > 0 && !tokens[0].ref?.current) {
        // this side effect directly changes the token style in the DOM,
        // but sometimes the token refs are not yet set. If so, we retry after a short timeout
        setTimeout(() => setForceRerender(forceRerender + 1), 10);
        return;
      }

      highlightAnnotations(
        tokens,
        validDestinations || validRelations,
        annotationLib,
        showValues,
        showAll,
        variableType
      );
    }, 0);
  }, [
    tokens,
    forceRerender,
    setForceRerender,
    validRelations,
    validDestinations,
    annotationLib,
    showValues,
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
        annotationLib={annotationLib}
        showValues={showValues}
      />
      <DrawArrows
        variable={variable}
        tokens={tokens}
        annotationLib={annotationLib}
        showValues={showValues}
        triggerSelector={triggerSelector}
        tokenSelection={tokenSelection}
      />
    </>
  );
};

const highlightAnnotations = (
  tokens: Token[],
  validTokens: ValidTokenRelations | ValidTokenDestinations,
  annotationLib: AnnotationLibrary,
  showValues: VariableMap,
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
      if (canSelect) {
        token.ref.current.classList.add("can-select");
      } else {
        token.ref.current.classList.remove("can-select");
      }
    }

    let tokenAnnotations = allowedAnnotations(annotationLib, token.index, showValues, showAll);
    if (tokenAnnotations.length === 0) {
      if (token.ref.current.classList.contains("annotated")) {
        token.ref.current.classList.remove("annotated");
        setTokenColor(token, null, null, null, null, null, null);
      }
      continue;
    }

    setAnnotationAsCSSClass(token, tokenAnnotations);
  }
};

const allowedAnnotations = (
  annotationLib: AnnotationLibrary,
  tokenIndex: number,
  showValues: VariableMap,
  showAll: boolean
) => {
  // get all annotations that are currently 'allowed', meaning that the variable is selected
  // and the codes are valid and active codes in the codebook
  const annotationIdsOnIndex = annotationLib?.byToken?.[tokenIndex] || [];

  let annotations: Annotation[] = [];
  for (let id of annotationIdsOnIndex) {
    const a = annotationLib.annotations[id];

    if (!showAll) {
      if (!showValues?.[a.variable]) continue;
      const codeMap = showValues[a.variable].codeMap;
      const code = a.value;
      if (!codeMap[a.value] && code !== "EMPTY") continue;
    }

    annotations.push(a);
  }
  return annotations;
};

const setAnnotationAsCSSClass = (token: Token, annotations: Annotation[]) => {
  // Set specific classes for nice css to show the start/end of codes
  let nLeft = 0;
  let nRight = 0;

  const spanColors: any = {
    pre: [],
    text: [],
    post: [],
  };
  const relationColors: any = {
    pre: [],
    text: [],
    post: [],
  };

  let tokenlabel: string[] = [];

  let nSpanAnnotations = 0;
  let nRelationAnnotations = 0;
  for (let annotation of annotations) {
    if (annotation.type === "span") {
      nSpanAnnotations++;
      const color = standardizeColor(annotation.color, "50");
      tokenlabel.push(String(annotation.value));

      spanColors.text.push(color);
      if (annotation.span[0] === token.index) {
        nLeft++;
      } else spanColors.pre.push(color);
      if (annotation.span[1] === token.index) {
        nRight++;
      } else spanColors.post.push(color);
    }

    if (annotation.type === "relation") {
      nRelationAnnotations++;
      const color = standardizeColor(annotation.color, "ff");
      tokenlabel.push(String(annotation.value));

      relationColors.text.push(color);
      if (annotation.positions[token.index - 1]) relationColors.pre.push(color);
      if (annotation.positions[token.index + 1]) relationColors.post.push(color);
    }
  }

  const allLeft = nLeft === nSpanAnnotations;
  const allRight = nRight === nSpanAnnotations;
  const anyLeft = nLeft > 0;
  const anyRight = nRight > 0;

  const cl = token.ref.current.classList;
  cl.add("annotated");
  allLeft ? cl.add("allLeft") : cl.remove("allLeft");
  anyLeft && !allLeft ? cl.add("anyLeft") : cl.remove("anyLeft");
  allRight ? cl.add("allRight") : cl.remove("allRight");
  anyRight && !allRight ? cl.add("anyRight") : cl.remove("anyRight");

  const spanText = getColorGradient(spanColors.text);
  const spanPre = allLeft ? "var(--background)" : getColorGradient(spanColors.pre);
  const spanPost = allRight ? "var(--background)" : getColorGradient(spanColors.post);

  const relationText = getColorGradient(relationColors.text);
  const relationPre =
    relationColors.pre.length === 0 ? "var(--background)" : getColorGradient(relationColors.pre);
  const relationPost =
    relationColors.post.length === 0 ? "var(--background)" : getColorGradient(relationColors.post);

  setTokenColor(
    token,
    spanPre,
    spanText,
    spanPost,
    relationPre,
    relationText,
    relationPost,
    nRelationAnnotations
  );
};

const setTokenColor = (
  token: Token,
  spanPre?: string,
  spanText?: string,
  spanPost?: string,
  relationPre?: string,
  relationText?: string,
  relationPost?: string,
  nRelations?: number
) => {
  const children = token.ref.current.children;
  children[0].style.background = spanPre;
  children[1].style.background = spanText;
  children[2].style.background = spanPost;

  children[0].children[0].style.background = relationPre;
  children[1].children[0].style.background = relationText;
  children[2].children[0].style.background = relationPost;

  const height = `${Math.min(nRelations * 0.2, 0.5)}em`;
  children[0].children[0].style.height = height;
  children[1].children[0].style.height = height;
  children[2].children[0].style.height = height;
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
  annotationLib: AnnotationLibrary;
  showValues: VariableMap;
}

const AnnotationPopup = React.memo(
  ({ tokens, currentToken, annotationLib, showValues }: AnnotationPopupProps) => {
    const ref = useRef<HTMLDivElement>();

    const content = useMemo(() => {
      if (!tokens?.[currentToken.i]?.ref) return null;
      const annotationIds = annotationLib.byToken[tokens[currentToken.i].index];
      if (!annotationIds) return null;

      const tokenAnnotations = annotationIds.map((id) => annotationLib.annotations[id]);
      const ids = Object.keys(tokenAnnotations);
      const list = ids.reduce((arr, id, i) => {
        const variable = tokenAnnotations[id].variable;
        const value = tokenAnnotations[id].value;
        if (!showValues?.[variable]) return arr;

        const color = standardizeColor(tokenAnnotations[id].color);

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
    }, [tokens, currentToken, annotationLib, showValues]);

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
