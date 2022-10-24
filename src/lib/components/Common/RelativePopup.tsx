import { memo, ReactElement, RefObject, useEffect, useRef, useState } from "react";
import styled from "styled-components";

/**
 * This was supposed to be a popup using absolute position relative to the trigger.
 * However, this somehow works in some cases but not others, and really can't tell why.
 */
interface Props {
  trigger?: ReactElement;
  triggerRef?: RefObject<HTMLElement>;
  children: ReactElement;
}

const Wrapper = styled.div`
  position: relative;
  z-index: 999;
`;
const PopupWindow = styled.div<{ open: boolean }>`
  display: ${(props) => (props.open ? "" : "none")};
  left: 0px;
  position: fixed;
  max-width: min(400px, 80vw);
  background: #dfeffbaa;
  backdrop-filter: blur(2px);
  z-index: 1000;
  border: 1px solid #136bae;
  border-radius: 5px;
  padding: 1rem;
`;

const RelativePopup = ({ trigger, triggerRef, children }: Props) => {
  const [open, setOpen] = useState(false);
  const triggerElementRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const tRef = triggerRef || triggerElementRef;
    if (tRef.current && popupRef.current) {
      const triggerBc = tRef.current.getBoundingClientRect();
      const windowBc = popupRef.current.getBoundingClientRect();
      popupRef.current.style.top = triggerBc.y - windowBc.height - 10 + "px";
      popupRef.current.style.left = triggerBc.x + 5 + "px";
    }
  }, [open, triggerRef]);

  useEffect(() => {
    const onClick = (e: any) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [setOpen, popupRef]);

  return (
    <Wrapper>
      <div
        ref={triggerElementRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {trigger}
      </div>
      <PopupWindow open={open} ref={popupRef}>
        <div>{children}</div>
      </PopupWindow>
    </Wrapper>
  );
};

export default memo(RelativePopup);
