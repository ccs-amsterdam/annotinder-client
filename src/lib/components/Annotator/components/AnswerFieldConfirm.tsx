import React, { useEffect } from "react";
import { Button } from "semantic-ui-react";
import { OnSelectParams, Swipes } from "../../../types";

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

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Button
        fluid
        primary
        content={button || "Continue"}
        size="huge"
        style={{ height: "100%", border: "2px solid var(--background-fixed)" }}
        onClick={() => onSelect({ value: "confirmed", finish: true })}
      />
    </div>
  );
};

export default Confirm;
