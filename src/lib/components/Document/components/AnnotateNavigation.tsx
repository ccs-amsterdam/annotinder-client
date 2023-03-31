import React, { useEffect, useMemo, useRef } from "react";
import useAnnotationEvents from "../hooks/useAnnotationEvents";
import { List } from "semantic-ui-react";
import { getColorGradient } from "../../../functions/tokenDesign";
import standardizeColor from "../../../functions/standardizeColor";
import { getValidTokenRelations, getValidTokenDestinations } from "../functions/relations";
import Popup from "../../Common/components/Popup";

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
  currentUnitReady: boolean;
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
  currentUnitReady,
}: AnnotateNavigationProps) => {
  const hasSelection = useRef(false);
  const tokenSelection = useAnnotationEvents(
    tokens,
    annotationLib,
    triggerSelector,
    editMode,
    variableType === "span",
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
    if (!currentUnitReady) return;
    highlightAnnotations(
      tokens,
      validDestinations || validRelations,
      annotationLib,
      showValues,
      showAll,
      variableType
    );
  }, [
    tokens,
    validRelations,
    validDestinations,
    annotationLib,
    showValues,
    showAll,
    variableType,
    currentUnitReady,
  ]);

  useEffect(() => {
    setSelectionAsCSSClass(tokens, variableType, tokenSelection, hasSelection);
  }, [tokens, variableType, tokenSelection, editMode, hasSelection]);

  return (
    <>
      <AnnotationPopup
        tokens={tokens}
        tokenIndex={tokenSelection?.[1] ?? tokenSelection?.[0]}
        annotationLib={annotationLib}
        showValues={showValues}
      />
      <DrawArrows
        variable={variable}
        tokens={tokens}
        annotationLib={annotationLib}
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
      //const codeMap = showValues[a.variable].codeMap;
      //const code = a.value;
      //if (!codeMap[a.value] && code !== "EMPTY") continue;
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
      const color = standardizeColor(annotation.color, "90");
      tokenlabel.push(String(annotation.value));

      relationColors.text.push(color);
      if (annotation.positions.has(token.index)) relationColors.pre.push(color);
      if (annotation.positions.has(token.index + 1)) relationColors.post.push(color);
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
  if (nRelationAnnotations > 0) cl.add("hasRelation");

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
  selection: TokenSelection,
  hasSelection: any
) => {
  let [from, to] = selection || [null, null];
  if (to !== null && from > to) [to, from] = [from, to];

  if (from === null || to === null) {
    // if the current tokenSelecction would only remove the selection,
    // and there is no current selection, we can skip the whole process
    if (!hasSelection.current) return;
    if (variableType === "relation") return;
  }
  hasSelection.current = false;
  for (let token of tokens) {
    if (!token.ref?.current) continue;
    token.ref.current.classList.remove("tapped");
    if (from === null || to === null || variableType === "relation") {
      token.ref.current.classList.remove("selected");
      continue;
    }

    let selected = token.arrayIndex >= from && token.arrayIndex <= to;

    const cl = token.ref.current.classList;
    if (selected && token.codingUnit) {
      const left = from === token.arrayIndex;
      const right = to === token.arrayIndex;
      cl.add("selected");
      left ? cl.add("start") : cl.remove("start");
      right ? cl.add("end") : cl.remove("end");
      hasSelection.current = true;
    } else {
      cl.remove("selected");
    }
  }
};

interface AnnotationPopupProps {
  tokens: Token[];
  tokenIndex: number;
  annotationLib: AnnotationLibrary;
  showValues: VariableMap;
}

const AnnotationPopup = React.memo(
  ({ tokens, tokenIndex, annotationLib, showValues }: AnnotationPopupProps) => {
    const ref = useRef<HTMLDivElement>();

    const content = useMemo(() => {
      if (!tokens?.[tokenIndex]?.ref) return null;
      const annotationIds = annotationLib.byToken[tokens[tokenIndex].index];
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
    }, [tokens, tokenIndex, annotationLib, showValues]);

    useEffect(() => {
      const tokenRef = tokens?.[tokenIndex]?.ref;
      if (!tokenRef) return;
    }, [ref, tokens, tokenIndex]);

    if (!content) return null;
    const tokenRef = tokens?.[tokenIndex]?.ref;

    return (
      <Popup controlledOpen={true} triggerRef={tokenRef} noPointerEvents>
        {content}
      </Popup>
    );
  }
);

export default AnnotateNavigation;
