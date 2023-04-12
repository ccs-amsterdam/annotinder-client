import { useEffect, useState } from "react";
import {
  Variable,
  TokenSelection,
  Token,
  TriggerSelector,
  AnnotationLibrary,
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
  active: boolean;
  tokens: Token[];
  annotationLib: AnnotationLibrary;
  triggerSelector: TriggerSelector;
  tokenSelection: TokenSelection;
}

const DrawArrows = ({
  active,
  tokens,
  annotationLib,
  triggerSelector,
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

  if (!active) return null;

  return (
    <StyledSvg>
      <RelationArrows
        tokens={tokens}
        annotationLib={annotationLib}
        triggerSelector={triggerSelector}
      />

      <Arrow
        id={"create relation"}
        tokens={tokens}
        tokenSelection={tokenSelection}
        edgeColor={"var(--primary)"}
        yoffset={-5}
      />
    </StyledSvg>
  );
};

export default DrawArrows;
