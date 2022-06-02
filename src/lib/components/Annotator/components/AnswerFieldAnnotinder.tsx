import React, { useEffect } from "react";
import { Button, Ref, Icon } from "semantic-ui-react";
import { SwipeOptions, Swipes, AnswerItem, OnSelectParams } from "../../../types";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

interface AnnotinderProps {
  /** An array of answer items (matching the items array in length and order)  */
  answerItems: AnswerItem[];
  /** The options the user can choose from */
  swipeOptions: SwipeOptions;
  /** The function used to update the values */
  onSelect: (params: OnSelectParams) => void;
  /** A string telling what direction was swiped */
  swipe: Swipes;
  /** If true, all eventlisteners are stopped */
  blockEvents: boolean;
}

const Annotinder = React.memo(
  ({ answerItems, swipeOptions, onSelect, swipe, blockEvents }: AnnotinderProps) => {
    // const left = options.find(option => option.swipe === "left");
    // const up = options.find(option => option.swipe === "up");
    // const right = options.find(option => option.swipe === "right");

    useEffect(() => {
      if (swipe) {
        if (swipe === "right") onSelect({ value: swipeOptions.right.code, finish: true });
        if (swipe === "up") onSelect({ value: swipeOptions.up.code, finish: true });
        if (swipe === "left") onSelect({ value: swipeOptions.left.code, finish: true });
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
          onSelect({ value: option.code, finish: true });
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

    const value = answerItems?.[0]?.values?.[0];

    return (
      <Button.Group
        fluid
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          fontSize: "inherit",
          margin: "0",
        }}
      >
        <Ref key={swipeOptions.left?.code} innerRef={swipeOptions.left?.ref}>
          <Button
            className="ripplebutton"
            disabled={swipeOptions.left == null}
            onClick={(e, d) => onSelect({ value: swipeOptions.left.code, finish: true })}
            style={{
              fontSize: "inherit",
              borderRadius: "10px",
              border: `4px solid ${value === swipeOptions.left?.code ? "#0c4f83" : "white"}`,
              background: swipeOptions.left?.color || "white",
            }}
          >
            <div style={{ color: "black", fontWeight: "bold" }}>
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
              onClick={(e, d) => onSelect({ value: swipeOptions.up.code, finish: true })}
              style={{
                fontSize: "inherit",

                borderRadius: "10px",
                border: `4px solid ${value === swipeOptions.up?.code ? "#0c4f83" : "white"}`,
                background: swipeOptions.up?.color || "white",
              }}
            >
              <div style={{ color: "black", fontWeight: "bold" }}>
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
            onClick={(e, d) => onSelect({ value: swipeOptions.right.code, finish: true })}
            style={{
              fontSize: "inherit",

              borderRadius: "10px",
              border: `4px solid ${value === swipeOptions.right?.code ? "#0c4f83" : "white"}`,
              background: swipeOptions.right?.color || "white",
            }}
          >
            <div style={{ color: "black", fontWeight: "bold" }}>
              <span>{swipeOptions.right?.code || ""}</span>
              <Icon name={swipeOptions.right?.code ? "arrow right" : null} />
            </div>
          </Button>
        </Ref>
      </Button.Group>
    );
  }
);

export default Annotinder;
