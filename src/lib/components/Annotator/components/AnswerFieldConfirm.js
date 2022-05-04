import React, { useEffect } from "react";
import { Button } from "semantic-ui-react";

const Confirm = ({ callback, swipe, blockEvents }) => {
  // there's only one option here and it's glorious

  const onKeydown = React.useCallback(
    (event) => {
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        callback({ code: "continue", color: "#2185d0" });
      }
    },
    [callback]
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
      if (swipe === "right") callback({ code: "continue", color: "#2185d0" });
      if (swipe === "up") callback({ code: "continue", color: "#2185d0" });
      if (swipe === "left") callback({ code: "continue", color: "#2185d0" });
    }
  }, [swipe, callback]);

  return (
    <div style={{ width: "100%" }}>
      <Button
        fluid
        primary
        icon="play"
        content="Continue"
        size="huge"
        onClick={() => callback({ code: "continue", color: "blue" })}
      />
    </div>
  );
};

export default Confirm;
