import React, { useEffect } from "react";
import { Button } from "semantic-ui-react";

const Confirm = ({ onSelect, button, swipe, blockEvents }) => {
  // there's only one option here and it's glorious

  const onKeydown = React.useCallback(
    (event) => {
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        onSelect({ values: "continue", finish: true });
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
      onSelect({ values: "continue", finish: true });
    }
  }, [swipe, onSelect]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Button
        fluid
        primary
        content={button || "Continue"}
        size="huge"
        style={{ height: "100%" }}
        onClick={() => onSelect({ values: "continue", finish: true })}
      />
    </div>
  );
};

export default Confirm;
