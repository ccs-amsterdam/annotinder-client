import React, { useEffect, ReactElement, useRef } from "react";
import styled from "styled-components";
import { SetState } from "../../../types";

const Portal = styled.div<{ smallScreen?: boolean }>`
  left: 0;
  top: 0;
  overflow: auto;
  font-size: 1.2rem;
  max-height: 70%;
  position: fixed;
  min-width: ${(p) => (p.smallScreen ? "100%" : "300px")};
  max-width: min(100%, 600px);
  z-index: 100000;
  background: var(--background);
  color: var(--text);
  padding: 10px 10px 0px 10px;
  margin-top: 14px;
  border-radius: 5px;
  border: 2px solid var(--primary);
  opacity: 0;
  transition: opacity 250ms, width 250ms, padding 100ms, left 50ms;
`;

interface Props {
  children: ReactElement;
  open: boolean;
  setOpen: SetState<boolean>;
  positionRef: any;
  minY: number;
}

const AnnotationPortal = React.memo(({ children, open, setOpen, positionRef, minY }: Props) => {
  const portalref = useRef(null);

  useEffect(() => {
    if (!positionRef?.current) return;
    // close popup on document click
    const closePortal = (e: any) => {
      if (portalref.current && !portalref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mouseup", closePortal);
    return () => {
      document.removeEventListener("mouseup", closePortal);
    };
  }, [positionRef, setOpen]);

  useEffect(() => {
    if (!open || !portalref.current) return;
    setTimeout(() => fitPortalOnScreen(portalref.current, positionRef.current, minY), 10);
    positionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    positionRef.current?.focus();

    // replace this with the implementation in MiddleCat, which uses
    // scrollheight/width to calculate size without requiring loop
    let portalWidth = portalref.current.clientWidth;
    let portalHeight = portalref.current.clientHeight;
    let portalY = portalref.current.offsetTop;
    const interval = setInterval(() => {
      const sameHeight = portalref.current.clientHeight === portalHeight;
      const sameWidth = portalref.current.clientWidth === portalWidth;
      const sameY = portalref.current.offsetTop === portalY;
      if (sameHeight && sameWidth && sameY) return;
      fitPortalOnScreen(portalref.current, positionRef.current, minY);
      portalWidth = portalref.current.clientWidth;
    }, 50);
    return () => clearInterval(interval);
  }, [open, positionRef, minY]);

  const smallscreen = window.innerWidth < 500;

  if (!open) return null;
  return (
    <Portal ref={portalref} smallScreen={smallscreen}>
      {children}
    </Portal>
  );
});

const fitPortalOnScreen = (portalEl: HTMLElement, positionEl: HTMLElement, minY = 0) => {
  // move portal up if it doesn't fit on screen
  if (!portalEl || !positionEl) return;
  const portal = portalEl.getBoundingClientRect();
  const position = positionEl.getBoundingClientRect();
  const windowHeight = document.documentElement.clientHeight;
  const windowWidth = document.documentElement.clientWidth;

  let up = position.y + 30;
  if (up < minY) {
    up = minY;
  } else {
    const bottom = up + 30 + portal.height;
    const offscreen = bottom - windowHeight;
    if (offscreen > 0) up -= offscreen;
  }

  let left = position.x + position.width / 2 - portal.width / 2;
  if (left < 0) {
    left = 0;
  } else {
    const right = left + portal.width;
    const offscreen = right - windowWidth;
    if (offscreen > 0) left -= offscreen;
  }

  portalEl.style.opacity = "1";
  portalEl.style.left = `${left}px`;
  portalEl.style.top = `${up}px`;
};

export default AnnotationPortal;
