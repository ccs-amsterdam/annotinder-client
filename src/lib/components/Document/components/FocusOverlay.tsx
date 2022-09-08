import { useEffect } from "react";
import styled from "styled-components";
import { keepInView } from "../../../functions/scroll";
import { FieldRefs } from "../../../types";

const Overlay = styled.div`
  background: linear-gradient(
    135deg,
    rgba(39, 133, 203, 0.5046393557422969) 25%,
    rgba(17, 177, 228, 0.5046393557422969) 50%,
    rgba(39, 133, 203, 0.4962359943977591) 75%,
    rgba(16, 145, 171, 0.4990371148459384) 100%
  );
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(0.8px);
  border: 1px solid black;
  z-index: 10;
`;

interface FocusOverlayProps {
  fieldRefs: FieldRefs;
  focus: string[];
  containerRef: any;
}

const FocusOverlay = ({ fieldRefs, focus, containerRef }: FocusOverlayProps) => {
  useEffect(() => {
    let first = true;
    if (!focus || focus.length === 0) return;
    for (const key of Object.keys(fieldRefs)) {
      if (!fieldRefs[key].current) continue;
      const cl = fieldRefs[key].current.classList;
      if (focus.includes(key)) {
        cl.add("focus");
        if (first) {
          containerRef.current.style.scrollBehavior = "smooth";
          setTimeout(() => keepInView(containerRef.current, fieldRefs[key].current), 0);
          first = false;
        }
      } else {
        cl.remove("focus");
      }
    }
  });
  if (!focus || focus.length === 0) return null;
  return <Overlay key="overlay" />;
};

export default FocusOverlay;
