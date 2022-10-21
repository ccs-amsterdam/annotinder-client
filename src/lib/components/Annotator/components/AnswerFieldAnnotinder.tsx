import useSpeedBump from "../../../hooks/useSpeedBump";
import React, { useEffect } from "react";
import { Button, Ref, Icon, SemanticICONS } from "semantic-ui-react";
import { SwipeOptions, Swipes, AnswerItem, OnSelectParams, AnswerOption } from "../../../types";

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
    const speedbump = useSpeedBump(answerItems);
    // const left = options.find(option => option.swipe === "left");
    // const up = options.find(option => option.swipe === "up");
    // const right = options.find(option => option.swipe === "right");

    useEffect(() => {
      if (swipe) {
        const option = swipeOptions[swipe];
        onSelect({
          value: option.code,
          finish: true,
          transition: { direction: swipe, color: option.color },
        });
      }
    }, [swipe, onSelect, swipeOptions]);

    const onKeydown = React.useCallback(
      (event: KeyboardEvent) => {
        if (speedbump) return;
        // any arrowkey
        if (arrowKeys.includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          let dir: "left" | "right" | "up" = "up";
          if (event.key === "ArrowRight") dir = "right";
          if (event.key === "ArrowLeft") dir = "left";
          const option = swipeOptions[dir];
          onSelect({
            value: option.code,
            finish: true,
            transition: { direction: dir, color: option.color },
          });
        }
      },

      [onSelect, swipeOptions, speedbump]
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
        {["left", "up", "right"].map((direction: "left" | "right" | "up") => {
          return (
            <AnnotinderButton
              key={direction}
              swipeOptions={swipeOptions}
              direction={direction}
              value={value}
              onSelect={onSelect}
              speedbump={speedbump}
            />
          );
        })}
      </Button.Group>
    );
  }
);

interface AnnotinderButtonProps {
  swipeOptions: SwipeOptions;
  direction: "left" | "right" | "up";
  value: string | number;
  onSelect: (params: OnSelectParams) => void;
  speedbump: boolean;
}

const AnnotinderButton = ({
  swipeOptions,
  direction,
  value,
  onSelect,
  speedbump,
}: AnnotinderButtonProps) => {
  let icon: SemanticICONS = "arrow left";
  let option: AnswerOption = swipeOptions.left;
  if (direction === "up") {
    icon = "arrow up";
    option = swipeOptions.up;
  }
  if (direction === "right") {
    icon = "arrow right";
    option = swipeOptions.right;
  }
  if (!option) return null;

  return (
    <Ref key={option.code} innerRef={option.ref}>
      <Button
        disabled={option == null}
        loading={speedbump}
        onClick={(e, d) => {
          if (speedbump) return;

          onSelect({
            value: option?.code,
            finish: true,
            transition: { direction, color: option.color },
          });
        }}
        size="mini"
        style={{
          height: "100%",
          fontSize: "inherit",
          borderRadius: "10px",
          border: `4px solid ${
            value === option?.code ? "var(--text-inversed-fixed)" : "var(--text-fixed)"
          }`,
          background: option?.color || "var(--text-inversed-fixed)",
        }}
      >
        <div style={{ fontWeight: "bold", color: "var(--text-inversed-fixed)" }}>
          <Icon name={option?.code ? (icon as SemanticICONS) : null} />
          <br />
          <span>{option?.code || ""}</span>
        </div>
      </Button>
    </Ref>
  );
};

export default Annotinder;
