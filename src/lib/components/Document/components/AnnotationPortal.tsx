import React, { useEffect, ReactElement, useRef } from "react";
import { SetState } from "../../../types";

interface Props {
  children: ReactElement;
  open: boolean;
  setOpen: SetState<boolean>;
  positionRef: any;
}

const AnnotationPortal = React.memo(({ children, open, setOpen, positionRef }: Props) => {
  const portalref = useRef(null);

  useEffect(() => {
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
    setTimeout(() => fitPortalOnScreen(portalref.current, positionRef.current), 10);

    // replace this with the implementation in MiddleCat, which uses
    // scrollheight/width to calculate size without requiring loop
    let portalWidth = portalref.current.clientWidth;
    let portalHeight = portalref.current.clientHeight;
    const interval = setInterval(() => {
      const sameHeight = portalref.current.clientHeight === portalHeight;
      const sameWidth = portalref.current.clientWidth === portalWidth;
      if (sameHeight && sameWidth) return;
      fitPortalOnScreen(portalref.current, positionRef.current);
      portalWidth = portalref.current.clientWidth;
    }, 100);
    return () => clearInterval(interval);
  }, [open, positionRef]);

  const smallscreen = window.innerWidth < 500;

  if (!open) return null;
  return (
    <div
      ref={portalref}
      style={{
        left: 0,
        top: 0,
        position: "fixed",
        minWidth: smallscreen ? "100%" : "300px",
        maxWidth: "min(100%, 600px)",
        zIndex: 100000,
        background: "var(--background)",
        color: "var(--text)",
        padding: "10px",
        marginTop: "14px",
        borderRadius: "5px",
        border: "2px solid var(--primary)",
        opacity: "0",
        transition: "opacity 250ms, width 250ms, padding 100ms, left 50ms",
      }}
    >
      {children}
    </div>
  );
});

const fitPortalOnScreen = (portalEl: HTMLElement, positionEl: HTMLElement) => {
  // move portal up if it doesn't fit on screen
  if (!portalEl || !positionEl) return;
  const portal = portalEl.getBoundingClientRect();
  const position = positionEl.getBoundingClientRect();
  const windowHeight = document.documentElement.clientHeight;
  const windowWidth = document.documentElement.clientWidth;

  let up = position.y + 30;
  if (up < 0) {
    up = 0;
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
