import { useEffect } from "react";
import styled from "styled-components";
import { keepInView } from "../../../functions/scroll";
import { Annotation, FieldRefs } from "../../../types";

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
  focus: (string | Annotation)[];
  containerRef: any;
}

const FocusOverlay = ({ fieldRefs, focus, containerRef }: FocusOverlayProps) => {
  useEffect(() => {
    let first = true;
    if (!focus || focus.length === 0) return;

    for (const key of Object.keys(fieldRefs)) {
      if (!fieldRefs[key].current) continue;
      const cl = fieldRefs[key].current.classList;
      let nomatch = true;
      for (let f of focus) {
        const field = typeof f === "string" ? f : f.field;
        if (field === key) {
          nomatch = false;
          cl.add("focus");
          if (first) {
            containerRef.current.style.scrollBehavior = "smooth";
            setTimeout(() => keepInView(containerRef.current, fieldRefs[key].current), 0);
            first = false;
          }
        }
      }
      if (nomatch) cl.remove("focus");

      // if (focus.includes(key)) {
      //   cl.add("focus");
      //   if (first) {
      //     containerRef.current.style.scrollBehavior = "smooth";
      //     setTimeout(() => keepInView(containerRef.current, fieldRefs[key].current), 0);
      //     first = false;
      //   }
      // } else {
      //   cl.remove("focus");
      // }
    }
  });
  if (!focus || focus.length === 0) return null;
  return <Overlay key="overlay" />;
};

export default FocusOverlay;
