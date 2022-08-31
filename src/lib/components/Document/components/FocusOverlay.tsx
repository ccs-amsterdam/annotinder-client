import { useEffect } from "react";
import styled from "styled-components";
import { FieldRefs } from "../../../types";

const Overlay = styled.div`
  background: #00000066;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(0.8px);
  z-index: 10;
`;

interface FocusOverlayProps {
  fieldRefs: FieldRefs;
  focus: string[];
}

const FocusOverlay = ({ fieldRefs, focus }: FocusOverlayProps) => {
  useEffect(() => {
    let first = true;
    if (!focus || focus.length === 0) return;
    for (const key of Object.keys(fieldRefs)) {
      if (!fieldRefs[key].current) continue;
      const cl = fieldRefs[key].current.classList;
      if (focus.includes(key)) {
        cl.add("focus");
        if (first) fieldRefs[key].current.scrollIntoView();
        first = false;
      } else {
        cl.remove("focus");
      }
    }
  });
  if (!focus || focus.length === 0) return null;
  return <Overlay />;
};

export default FocusOverlay;
