import { useEffect, useState } from "react";
import {
  Variable,
  TokenSelection,
  SpanAnnotations,
  Token,
  TriggerSelectionPopup,
  VariableMap,
} from "../../../types";
import styled from "styled-components";
import RelationArrows from "./RelationArrows";
import Arrow from "./Arrow";

const StyledSvg = styled.svg`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
  width: 100%;
  z-index: 1000;
  pointer-events: none;
`;

interface DrawArrowsProps {
  variable: Variable;
  tokens: Token[];
  annotations: SpanAnnotations;
  showValues: VariableMap;
  triggerSelectionPopup: TriggerSelectionPopup;
  tokenSelection: TokenSelection;
}

const DrawArrows = ({
  variable,
  tokens,
  annotations,
  showValues,
  triggerSelectionPopup,
  tokenSelection,
}: DrawArrowsProps) => {
  const [, setRefresh] = useState(0);

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

  if (variable?.type !== "relation") return null;

  // if there is a token selection, check if it departs from a valid annotation
  // let validArrow = false;
  // let from = tokenSelection?.[0] && tokenSelection?.[1] && annotations[tokenSelection[0]];
  // if (from) {
  //   for (const f of Object.values(from)) {
  //     const fromCodes =
  //       variable?.validFrom?.[f.variable]?.["*"] ||
  //       variable?.validFrom?.[f.variable]?.[f.value] ||
  //       null;
  //     if (fromCodes) {
  //       validArrow = true;
  //       break;
  //     }
  //   }
  // }

  return (
    <StyledSvg>
      <RelationArrows
        tokens={tokens}
        annotations={annotations}
        showValues={showValues}
        triggerSelectionPopup={triggerSelectionPopup}
      />

      <Arrow
        id={"create relation"}
        tokens={tokens}
        tokenSelection={tokenSelection}
        edgeColor={"var(--primary)"}
      />
    </StyledSvg>
  );
};

export default DrawArrows;
