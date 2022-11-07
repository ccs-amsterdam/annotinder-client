import { memo, ReactElement, RefObject, useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface Props {
  trigger?: ReactElement;
  triggerRef?: RefObject<HTMLElement>;
  children: ReactElement;

  offsetY?: number;
  offsetX?: number;
}

const Wrapper = styled.div`
  position: relative;
  z-index: 999;
`;
const PopupWindow = styled.div<{ open: boolean }>`
  display: ${(props) => (props.open ? "" : "none")};
  position: absolute;
  max-width: min(400px, 80vw);
  background: var(--background-inversed);
  color: var(--text-inversed);
  z-index: 1000;
  border-radius: 5px;
  padding: 0.5rem;
`;

const MenuPopup = ({
  trigger,
  triggerRef,
  children,

  offsetX = 0,
  offsetY = 5,
}: Props) => {
  const [open, setOpen] = useState(false);
  const triggerElementRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const triggerEl = triggerRef?.current || triggerElementRef?.current?.firstChild;
    const popupEl = popupRef?.current;
    if (triggerEl && popupEl) {
      const triggerBc = triggerEl.getBoundingClientRect();
      popupEl.style.top = Math.max(0, triggerBc.y + triggerBc.height + offsetY) + "px";
      popupEl.style.right = -offsetX + "px";
    }
  }, [open, offsetY, offsetX, triggerRef, popupRef]);

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

export default memo(MenuPopup);
