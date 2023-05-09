import useSpeedBump from "../../../hooks/useSpeedBump";
import React, { useEffect } from "react";
import { SwipeOptions, Swipes, AnswerItem, OnSelectParams, AnswerOption } from "../../../types";
import { CodeButton } from "../../../styled/StyledSemantic";
import styled from "styled-components";
import { FaArrowLeft, FaArrowRight, FaArrowUp } from "react-icons/fa";

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

const CodeButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

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
      <CodeButtonGroup>
        {["left", "up", "right"].map((direction: "left" | "right" | "up", i) => {
          return (
            <AnnotinderStyledButton
              key={direction}
              swipeOptions={swipeOptions}
              direction={direction}
              value={value}
              onSelect={onSelect}
              speedbump={speedbump}
            />
          );
        })}
      </CodeButtonGroup>
    );
  }
);

interface AnnotinderStyledButtonProps {
  swipeOptions: SwipeOptions;
  direction: "left" | "right" | "up";
  value: string | number;
  onSelect: (params: OnSelectParams) => void;
  speedbump: boolean;
}

const AnnotinderStyledButton = ({
  swipeOptions,
  direction,
  value,
  onSelect,
  speedbump,
}: AnnotinderStyledButtonProps) => {
  let icon = <FaArrowLeft />;
  let option: AnswerOption = swipeOptions.left;
  if (direction === "up") {
    icon = <FaArrowUp />;
    option = swipeOptions.up;
  }
  if (direction === "right") {
    icon = <FaArrowRight />;
    option = swipeOptions.right;
  }
  if (!option) return null;

  return (
    <CodeButton
      className={`flex`}
      key={option.code}
      ref={option.ref as React.RefObject<HTMLButtonElement>}
      background={option.color}
      disabled={option == null || speedbump}
      selected={option.code === value}
      onClick={(e) => {
        onSelect({
          value: option?.code,
          finish: true,
          transition: { direction, color: option.color },
        });
      }}
    >
      {icon}

      <span>{option?.code || ""}</span>
    </CodeButton>
  );
};

export default Annotinder;
