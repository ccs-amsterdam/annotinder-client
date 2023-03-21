import { CSSProperties, memo, ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const StyledDiv = styled.div<{ noPointerEvents?: boolean }>`
  .Popup {
    transition: opacity 0.5s;
    overflow: auto;
    color: black;
    position: fixed;
    z-index: 10000;
    border: 0px solid black;
    max-height: 0px;
    max-width: 80vw;
    border-radius: 5px;
    background: white;
    opacity: 0;
    font-size: 0.7em;
    pointer-events: ${(p) => (p.noPointerEvents ? `none` : ``)};
  }
`;

interface Props {
  triggerRef: any;
  children: ReactNode;
  style?: CSSProperties;
  controlledOpen?: boolean;
  noPointerEvents?: boolean;
}

function Popup({ triggerRef, children, style, controlledOpen, noPointerEvents }: Props) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [openState, setOpen] = useState(false);
  const open = controlledOpen ?? openState;

  useEffect(() => {
    function calcPosition() {
      const popup = popupRef.current as any;
      const trigger = triggerRef.current as any;
      if (!popup || !trigger) return;

      if (open) {
        const { x, y, height } = trigger.getBoundingClientRect();

        const offsetY = 10;
        const offsetX = 10;
        let top = y - popup.scrollHeight - offsetY;
        let left = x - offsetX;

        // Ensure popup doesn't go off screen
        top = Math.max(0, Math.min(top, window.innerHeight - popup.scrollHeight));
        const overY = top + popup.scrollHeight - y;
        if (overY > 0) top = y + height + offsetY;
        left = Math.max(0, Math.min(left, window.innerWidth - popup.clientWidth - offsetX));

        popup.style["max-height"] = "95vh";
        popup.style.border = "1px solid black";
        popup.style.top = top + "px";
        popup.style.left = left + "px";
        popup.style.opacity = 1;
      } else {
        popup.style["max-height"] = "0px";
        popup.style.border = "0px solid black";
        popup.style.opacity = 0;
      }
    }

    calcPosition();
    const timer = setInterval(calcPosition, 100);
    return () => clearInterval(timer);
  }, [open, children, triggerRef]);

  useEffect(() => {
    const trigger = triggerRef.current;

    function onClick(e: any) {
      const popup = popupRef.current;
      const onTrigger = trigger.contains(e.target);
      if (onTrigger) return setOpen(!open);
      if (popup && !popup.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [triggerRef, popupRef, open]);

  return (
    <StyledDiv noPointerEvents={noPointerEvents}>
      <div ref={popupRef} className="Popup">
        {children}
      </div>
    </StyledDiv>
  );
}

export default memo(Popup);
