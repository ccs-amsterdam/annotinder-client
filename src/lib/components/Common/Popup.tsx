import { CSSProperties, memo, ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
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
  }
  button {
    border-color: var(--secondary);
  }
  .cancel {
    margin-top: 0.5rem;
  }
`;

interface Props {
  triggerRef: any;
  children: ReactNode;
  style?: CSSProperties;
  controlledOpen?: boolean;
}

function Popup({ triggerRef, children, style, controlledOpen }: Props) {
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

        const offset = 10;
        let top = y - popup.scrollHeight - offset;
        let left = x;

        // Ensure popup doesn't go off screen
        top = Math.max(0, Math.min(top, window.innerHeight - popup.scrollHeight));
        const overY = top + popup.scrollHeight - y;
        if (overY > 0) top = y + height + offset;
        left = Math.max(0, Math.min(left, window.innerWidth - popup.clientWidth));

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
    if (!open) return;
    function onClick(e: any) {
      const trigger = triggerRef.current;
      const popup = popupRef.current;
      if (popup && trigger && !popup.contains(e.target) && !trigger.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [triggerRef, popupRef, open]);

  return (
    <StyledDiv>
      <div ref={popupRef} className="Popup">
        {children}
      </div>
    </StyledDiv>
  );
}

export default memo(Popup);
