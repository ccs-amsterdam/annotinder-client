import React, { useEffect } from "react";
import { Button, Ref, Icon } from "semantic-ui-react";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const Annotinder = React.memo(({ swipeOptions, callback, swipe, blockEvents }) => {
  // const left = options.find(option => option.swipe === "left");
  // const up = options.find(option => option.swipe === "up");
  // const right = options.find(option => option.swipe === "right");

  useEffect(() => {
    if (swipe) {
      if (swipe === "right") callback(swipeOptions.right);
      if (swipe === "up") callback(swipeOptions.up);
      if (swipe === "left") callback(swipeOptions.left);
    }
  }, [swipe, callback, swipeOptions]);

  const onKeydown = React.useCallback(
    (event) => {
      // any arrowkey
      if (arrowKeys.includes(event.key)) {
        event.preventDefault();
        let option;
        if (event.key === "ArrowRight") option = swipeOptions.right;
        if (event.key === "ArrowUp") option = swipeOptions.up;
        if (event.key === "ArrowLeft") option = swipeOptions.left;
        callback(option);
        const el = option.ref.current;
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 5);
      }
    },

    [callback, swipeOptions]
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
        flexWrap: "wrap",
        alignContent: "stretch",
        height: "100%",
        minHeight: "30px",
      }}
    >
      <Ref key={swipeOptions.left?.code} innerRef={swipeOptions.left?.ref}>
        <Button
          className="ripplebutton"
          disabled={swipeOptions.left == null}
          onClick={(e, d) => callback(swipeOptions.left)}
          style={{
            margin: "0",
            padding: "0",
            borderRadius: "0",
            border: "1px solid",
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
            onClick={(e, d) => callback(swipeOptions.up)}
            style={{
              margin: "0",
              padding: "0",
              borderRadius: "0",
              border: "1px solid",
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
          onClick={(e, d) => callback(swipeOptions.right)}
          style={{
            padding: "0",
            margin: "0",
            borderRadius: "0",
            border: "1px solid",
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
