import React, { useEffect, useState } from "react";
import { OnSelectParams, Swipes } from "../../../types";
import { StyledButton } from "../../../styled/StyledSemantic";

interface ConfirmProps {
  /** The function used to update the values */
  onSelect: (params: OnSelectParams) => void;
  /** The text shown on the confirm button */
  button: string;
  /** A string telling what direction was swiped */
  swipe: Swipes;
  /** If true, all eventlisteners are stopped */
  blockEvents: boolean;
}

const Confirm = ({ onSelect, button, swipe, blockEvents }: ConfirmProps) => {
  const [pressed, setPressed] = useState(false);
  // there's only one option here and it's glorious

  const onKeydown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        onSelect({ value: "confirmed", finish: true });
      }
    },
    [onSelect]
  );

  useEffect(() => {
    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown, blockEvents]);

  useEffect(() => {
    if (swipe) {
      onSelect({
        value: "confirmed",
        finish: true,
        transition: { direction: "up", color: "var(--primary)" },
      });
    }
  }, [swipe, onSelect]);

  const borderColor = pressed ? "var(--background-inversed-fixed)" : "var(--background-fixed";
  const textColor = pressed ? "black" : "white";
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <StyledButton
        fluid
        primary
        style={{ height: "100%", border: `2px solid ${borderColor}`, color: textColor }}
        onClick={() => {
          setPressed(true);
          setTimeout(() => setPressed(false), 400);
          onSelect({ value: "confirmed", finish: true });
        }}
      >
        {button || "Continue"}
      </StyledButton>
    </div>
  );
};

export default Confirm;
