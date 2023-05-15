import React, { useState, useEffect, useRef, RefObject } from "react";
import { OnSelectParams, AnswerOption, AnswerItem, QuestionItem } from "../../../types";
import { Button } from "../../../styled/StyledSemantic";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import styled from "styled-components";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

interface ScaleProps {
  /** The item array of the current question. Contains al settings for items */
  items: QuestionItem[];
  /** An array of answer items (matching the items array in length and order)  */
  answerItems: AnswerItem[];
  /** The options the user can choose from */
  options: AnswerOption[];
  /** The function used to update the values */
  onSelect: (params: OnSelectParams) => void;
  /** Like onSelect, but for finishing the question/unit with the current values */
  onFinish: () => void;
  /** If true, all eventlisteners are stopped */
  blockEvents: boolean;
  /** The index of the question.  */
  questionIndex: number;
}

const StyledDiv = styled.div`
  height: 100%;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
  background: var(--background);
  color: var(--text);
  display: flex;
  flex-direction: column;

  .ScaleLabel {
    font-size: 1.4rem;
    svg {
      font-size: 2rem;
      transform: translateY(0.4rem);
    }
  }
`;

const Scale = React.memo(
  ({ items, answerItems, options, onSelect, onFinish, blockEvents, questionIndex }: ScaleProps) => {
    // render buttons for options (an array of objects with keys 'label' and 'color')
    // On selection perform onSelect function with the button label as input
    // if canDelete is TRUE, also contains a delete button, which passes null to onSelect
    const [selectedItem, setSelectedItem] = useState(0);
    const [selectedButton, setSelectedButton] = useState(null);
    const continueButtonRef = useRef();

    const onKeydown = React.useCallback(
      (event: KeyboardEvent) => {
        const nbuttons = options.length;
        const nitems = items.length;
        if (selectedButton === null) {
          setSelectedButton(0);
          return null;
        }

        // any arrowkey
        if (arrowKeys.includes(event.key)) {
          event.preventDefault();
          if (event.key === "ArrowRight") {
            if (selectedButton < nbuttons - 1) setSelectedButton(selectedButton + 1);
          }
          if (event.key === "ArrowLeft") {
            if (selectedButton > 0) setSelectedButton(selectedButton - 1);
          }

          let newitem = null;
          if (event.key === "ArrowUp") {
            if (selectedItem > 0) newitem = selectedItem - 1;
            if (selectedItem < 0) newitem = nitems - 1;
          }
          if (event.key === "ArrowDown") {
            if (selectedItem >= 0) {
              if (selectedItem < nitems - 1) newitem = selectedItem + 1;
              if (selectedItem === nitems - 1) newitem = -1;
            }
          }
          if (newitem !== null) {
            items?.[newitem]?.ref?.current?.scrollIntoView();
            setSelectedItem(newitem);
          }
          return;
        }

        // space or enter
        if (event.keyCode === 32 || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          if (selectedItem === -1) {
            if (!answerItems.some((a) => a.values?.[0] == null)) onFinish();
          } else {
            onSelect({ value: options[selectedButton].code, itemIndex: selectedItem });
          }
        }
      },
      [selectedButton, selectedItem, answerItems, onSelect, onFinish, options, items]
    );

    useEffect(() => {
      setSelectedButton(null);
      setSelectedItem(0);
    }, [questionIndex, setSelectedButton, setSelectedItem]);

    useEffect(() => {
      if (!blockEvents) {
        window.addEventListener("keydown", onKeydown);
      } else window.removeEventListener("keydown", onKeydown);

      return () => {
        window.removeEventListener("keydown", onKeydown);
      };
    }, [onKeydown, blockEvents]);

    const left = options[0];
    const right = options[options.length - 1];
    if (answerItems == null) return null;
    const nAnswered = answerItems.filter((iv) => iv.values?.[0] != null).length;
    const done = nAnswered === answerItems.length;

    return (
      <StyledDiv>
        <div
          style={{
            flex: "1 1 auto",
            display: "flex",
            padding: "5px",
            justifyContent: "space-between",
            color: "var(--primary-text)",
          }}
        >
          <div className="ScaleLabel ">
            <FaAngleLeft />
            {left.code}
          </div>

          <div className="ScaleLabel ">
            {right.code}
            <FaAngleRight />
          </div>
        </div>

        <Items
          answerItems={answerItems}
          selectedItem={selectedItem}
          items={items}
          options={options}
          selectedButton={selectedButton}
          onSelect={onSelect}
          continueButtonRef={continueButtonRef}
        />

        <Button
          ref={continueButtonRef}
          className={selectedItem === -1 ? "selected" : ""}
          fluid
          primary
          disabled={!done}
          onClick={() => {
            onFinish();
          }}
        >
          {done ? "Continue" : `${nAnswered} / ${answerItems.length}`}
        </Button>
      </StyledDiv>
    );
  }
);

interface ItemsProps {
  answerItems: AnswerItem[];
  selectedItem: number;
  items: QuestionItem[];
  options: AnswerOption[];
  selectedButton: number;
  onSelect: (params: OnSelectParams) => void;
  continueButtonRef: RefObject<HTMLDivElement>;
}

const Items = ({
  answerItems,
  selectedItem,
  items,
  options,
  selectedButton,
  onSelect,
  continueButtonRef,
}: ItemsProps) => {
  useEffect(() => {
    if (selectedItem < 0) continueButtonRef?.current?.scrollIntoView();
  }, [selectedItem, items, continueButtonRef]);

  return (
    <div
      style={{
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {items.map((itemObj, itemIndex: number) => {
        return (
          <Item
            key={itemObj.label + itemIndex}
            itemObj={itemObj}
            answerItems={answerItems}
            selectedItem={selectedItem}
            itemIndex={itemIndex}
            options={options}
            selectedButton={selectedButton}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
};

interface ItemProps {
  itemObj: QuestionItem;
  answerItems: AnswerItem[];
  selectedItem: number;
  itemIndex: number;
  options: AnswerOption[];
  selectedButton: number;
  onSelect: (params: OnSelectParams) => void;
}

const ItemButton = styled.div<{
  selected?: boolean;
  current?: boolean;
  customColor?: string;
  color?: string;
}>`
  flex: 1 1 auto;
  height: 2.5rem;
  border-radius: 4px;
  background: ${(p) => (p.customColor ? "white" : "var(--primary)")};
  border: 2px solid ${(p) => {
    if (p.selected) return "var(--text)";
    if (p.current) return "var(--secondary)";
    return p.customColor ? "grey" : "var(--primary)";
  }};
  
  button {
    width: 100%;
    height: 100%;
    padding: 4px 0 2px 0;
    background-color: ${(p) => (p.current ? "var(--secondary)" : p.color)};
    font-weight: bold;
    font-size: 0.8em;
    text-shadow: 0px 0px 5px #ffffff77,
    border-radius: 10px;
    border-color: transparent;
    color: ${(p) => (p.customColor || p.current ? "black" : "white")};
    cursor: pointer;
    position: relative;
    z-index: 10;

    ::after {
    content: ${(p) => (p.selected ? '""' : `none`)};
    position: absolute;
    top: -0.5rem;
    left: -0.5rem;
    height: calc(100% + 1rem);
    width: calc(100% + 1rem);
    z-index: 9;
    border: 0.4rem solid var(--text);
    border-radius: 4px;
  }
  }

  
`;

const Item = ({
  itemObj,
  answerItems,
  selectedItem,
  itemIndex,
  options,
  selectedButton,
  onSelect,
}: ItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const colorstep = 90 / options.length;
  const itemlabel = itemObj.label || itemObj.name;
  //const background = itemIndex % 2 !== 0 ? "#6666660b" : "#6666661b";
  const padding = "0px 0px 10px 0px";

  useEffect(() => {
    itemObj.ref = ref;
  }, [itemObj, ref]);

  return (
    <div key={itemIndex} style={{ padding, borderRadius: "5px" }}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            fontSize: "1.6rem",
            padding: "0.2rem",
          }}
        >
          <div
            style={{
              padding: "0.3rem",
              borderRadius: "5px",
              color: "var(--text)",
            }}
          >
            {itemlabel}
          </div>
        </div>
      </div>
      <div
        ref={ref}
        style={{
          display: "flex",
          scrollMargin: "100px",
          gap: "0.5rem",
          margin: "auto",
          maxWidth: "min(500px, 100%)",
          padding: "0px 5px",
          paddingBottom: "2px",
        }}
      >
        {options.map((option, buttonIndex: number) => {
          const isCurrent = options[buttonIndex].code === answerItems?.[itemIndex]?.values[0];
          const isSelected = buttonIndex === selectedButton && itemIndex === selectedItem;

          // if option doesn't have color, we use primary color as background and
          // use opacity of buttoncolor to show a gradient

          let color = option.color;
          if (!color) {
            const opacity = buttonIndex * colorstep;
            color = `rgb(0,0,0, ${opacity}%)`;
          }

          return (
            <ItemButton
              key={option.code}
              selected={isSelected}
              current={isCurrent}
              customColor={option.color}
              color={color}
            >
              <button
                ref={option.ref as React.RefObject<HTMLButtonElement>}
                onClick={() => {
                  onSelect({ value: options[buttonIndex].code, itemIndex });
                }}
              >
                {isCurrent ? option.code : buttonIndex + 1}
              </button>
            </ItemButton>
          );
        })}
      </div>
    </div>
  );
};

export default Scale;
