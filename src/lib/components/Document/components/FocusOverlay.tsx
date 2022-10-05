import { useEffect } from "react";
import styled from "styled-components";
import { keepInView } from "../../../functions/scroll";
import { FieldRefs } from "../../../types";

const Overlay = styled.div`
  background: linear-gradient(135deg, #aaa8 25%, #ddd9 50%, #bbb7 75%, #ccc8 100%);
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
    //if (!focus || focus.length === 0) return;

    for (const field of Object.keys(fieldRefs)) {
      if (!fieldRefs[field].current) continue;
      let nomatch = true;
      const cl = fieldRefs[field].current.classList;
      for (let f of focus || []) {
        const fieldWithoutNr = field.replace(/[.][0-9]+$/, "");
        if (f === field || f === fieldWithoutNr) {
          nomatch = false;
          cl.add("focus");
          if (first) {
            containerRef.current.style.scrollBehavior = "smooth";
            setTimeout(() => keepInView(containerRef.current, fieldRefs[field].current), 0);
            first = false;
          }
        }
      }
      if (nomatch) cl.remove("focus");
    }
  });
  if (!focus || focus.length === 0) return null;
  return <Overlay key="overlay" />;
};

export default FocusOverlay;
