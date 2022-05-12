import React, { useEffect } from "react";
import { Button } from "semantic-ui-react";

const Confirm = ({ onSelect, button, swipe, blockEvents }) => {
  // there's only one option here and it's glorious

  const onKeydown = React.useCallback(
    (event) => {
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        onSelect({ code: "continue", color: "#2185d0" });
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
      if (swipe === "right") onSelect({ code: "continue", color: "#2185d0" });
      if (swipe === "up") onSelect({ code: "continue", color: "#2185d0" });
      if (swipe === "left") onSelect({ code: "continue", color: "#2185d0" });
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
        onClick={() => onSelect({ code: "continue", color: "blue" })}
      />
    </div>
  );
};

export default Confirm;
