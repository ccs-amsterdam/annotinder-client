import React, { useEffect } from "react";
import { Button, Ref, Icon } from "semantic-ui-react";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const Annotinder = React.memo(({ swipeOptions, currentAnswer, onSelect, swipe, blockEvents }) => {
  // const left = options.find(option => option.swipe === "left");
  // const up = options.find(option => option.swipe === "up");
  // const right = options.find(option => option.swipe === "right");

  useEffect(() => {
    if (swipe) {
      if (swipe === "right") onSelect(swipeOptions.right);
      if (swipe === "up") onSelect(swipeOptions.up);
      if (swipe === "left") onSelect(swipeOptions.left);
    }
  }, [swipe, onSelect, swipeOptions]);

  const onKeydown = React.useCallback(
    (event) => {
      // any arrowkey
      if (arrowKeys.includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        let option;
        if (event.key === "ArrowRight") option = swipeOptions.right;
        if (event.key === "ArrowUp") option = swipeOptions.up;
        if (event.key === "ArrowLeft") option = swipeOptions.left;
        onSelect(option);
        const el = option.ref.current;
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 5);
      }
    },

    [onSelect, swipeOptions]
  );

  useEffect(() => {
    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown, blockEvents]);

  return (
    <Button.Group
      fluid
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <Ref key={swipeOptions.left?.code} innerRef={swipeOptions.left?.ref}>
        <Button
          className="ripplebutton"
          disabled={swipeOptions.left == null}
          onClick={(e, d) => onSelect(swipeOptions.left)}
          style={{
            margin: "0",
            borderRadius: "10px",
            border: `4px solid ${currentAnswer === swipeOptions.left?.code ? "#0c4f83" : "white"}`,
            background: swipeOptions.left?.color || "white",
          }}
        >
          <div style={{ color: "black", fontWeight: "bold", fontSize: "1em" }}>
            <Icon name={swipeOptions.left?.code ? "arrow left" : null} />
            <span>{swipeOptions.left?.code || ""}</span>
          </div>
        </Button>
      </Ref>

      {swipeOptions.up == null ? null : (
        <Ref key={swipeOptions.up?.code} innerRef={swipeOptions.up?.ref}>
          <Button
            className="ripplebutton"
            disabled={swipeOptions.up == null}
            onClick={(e, d) => onSelect(swipeOptions.up)}
            style={{
              margin: "0",
              paddin: "0",
              borderRadius: "10px",
              border: `4px solid ${currentAnswer === swipeOptions.up?.code ? "#0c4f83" : "white"}`,
              background: swipeOptions.up?.color || "white",
            }}
          >
            <div style={{ color: "black", fontWeight: "bold", fontSize: "1em" }}>
              <Icon name={swipeOptions.up?.code ? "arrow up" : null} />
              <span>{swipeOptions.up?.code || ""}</span>
            </div>
          </Button>
        </Ref>
      )}
      <Ref key={swipeOptions.right?.code} innerRef={swipeOptions.right?.ref}>
        <Button
          className="ripplebutton"
          disabled={swipeOptions.right == null}
          onClick={(e, d) => onSelect(swipeOptions.right)}
          style={{
            margin: "0",
            borderRadius: "10px",
            border: `4px solid ${currentAnswer === swipeOptions.right?.code ? "#0c4f83" : "white"}`,
            background: swipeOptions.right?.color || "white",
          }}
        >
          <div style={{ color: "black", fontWeight: "bold", fontSize: "1em" }}>
            <span>{swipeOptions.right?.code || ""}</span>
            <Icon name={swipeOptions.right?.code ? "arrow right" : null} />
          </div>
        </Button>
      </Ref>
    </Button.Group>
  );
});

export default Annotinder;
