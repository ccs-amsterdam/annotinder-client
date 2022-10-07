import React, { useState, useEffect, useRef, createRef, RefObject } from "react";
import { Button, Ref, Icon, Label } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";
import { OnSelectParams, AnswerOption, AnswerItem, QuestionItem } from "../../../types";

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
  scrollRef: RefObject<HTMLDivElement>;
}

const Scale = React.memo(
  ({
    items,
    answerItems,
    options,
    onSelect,
    onFinish,
    blockEvents,
    questionIndex,
    scrollRef,
  }: ScaleProps) => {
    // render buttons for options (an array of objects with keys 'label' and 'color')
    // On selection perform onSelect function with the button label as input
    // if canDelete is TRUE, also contains a delete button, which passes null to onSelect
    const [selectedItem, setSelectedItem] = useState(0);
    const [selectedButton, setSelectedButton] = useState(null);

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
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            flex: "1 1 auto",
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid black",
            background: "#7fb9eb",
          }}
        >
          <Label
            size="large"
            style={{
              //position: "absolute",
              width: "50%",
              background: "transparent",
              color: "black",
            }}
          >
            <Icon name="arrow left" />
            {left.code}
          </Label>

          <Label
            size="large"
            style={{
              //position: "absolute",
              width: "50%",
              textAlign: "right",
              background: "#0c293f",
              color: "white",
            }}
          >
            {right.code}
            <Icon name="arrow right" style={{ marginLeft: "5px" }} />
          </Label>
        </div>

        <Items
          answerItems={answerItems}
          selectedItem={selectedItem}
          items={items}
          options={options}
          selectedButton={selectedButton}
          onSelect={onSelect}
          scrollRef={scrollRef}
        />

        <div>
          <Button
            primary
            fluid
            size="mini"
            disabled={!done}
            icon={done ? "play" : null}
            content={done ? "Continue" : `${nAnswered} / ${answerItems.length}`}
            style={{
              flex: "1 1 0px",
              textAlign: "center",
              color: done ? null : "black",
              margin: "0",
              background: done ? null : "white",
              border: `5px solid ${selectedItem < 0 ? "black" : "#ece9e9"}`,
            }}
            onClick={() => {
              onFinish();
            }}
          />
        </div>
      </div>
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
  scrollRef: RefObject<HTMLDivElement>;
}

const Items = ({
  answerItems,
  selectedItem,
  items,
  options,
  selectedButton,
  onSelect,
  scrollRef,
}: ItemsProps) => {
  const rowRefs = useRef([]);

  useEffect(() => {
    rowRefs.current = items.map(() => createRef());
  }, [items, rowRefs]);

  useEffect(() => {
    if (selectedItem < 0) return;
    scrollToMiddle(scrollRef?.current, rowRefs?.current?.[selectedItem]?.current, 0.5);
  }, [selectedItem, items, rowRefs, scrollRef]);

  return (
    <div
      style={{
        flex: "1 1 auto",
        //overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {items.map((itemObj, itemIndex: number) => {
        const itemlabel = itemObj.label || itemObj.name;
        let margin = "10px";
        if (itemIndex === 0) margin = "auto 10px 10px 10px";
        if (itemIndex === items.length - 1) margin = "10px 10px auto 10px";
        return (
          <div key={itemIndex} style={{ paddingTop: "0px", margin }}>
            <div>
              <div
                style={{
                  color: "black",
                  width: "100%",
                  textAlign: "center",
                  padding: "0px 5px 5px 5px",
                }}
              >
                <b>{itemlabel}</b>
              </div>
            </div>
            <div
              ref={rowRefs?.current?.[itemIndex]}
              style={{
                display: "flex",
                maxWidth: "100%",
                padding: "0px 5px",
                paddingBottom: "5px",
              }}
            >
              <Item
                answerItems={answerItems}
                selectedItem={selectedItem}
                itemIndex={itemIndex}
                options={options}
                selectedButton={selectedButton}
                onSelect={onSelect}
              />
            </div>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: "0.8em",
                color: "var(--primary)",
              }}
            >
              <i>
                {answerItems?.[itemIndex]?.values?.[0] ? answerItems[itemIndex].values?.[0] : "..."}
              </i>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface ItemProps {
  answerItems: AnswerItem[];
  selectedItem: number;
  itemIndex: number;
  options: AnswerOption[];
  selectedButton: number;
  onSelect: (params: OnSelectParams) => void;
}

const Item = ({
  answerItems,
  selectedItem,
  itemIndex,
  options,
  selectedButton,
  onSelect,
}: ItemProps) => {
  const colorstep = 200 / options.length;
  return (
    <>
      {options.map((option, buttonIndex: number) => {
        let bordercolor = "#ece9e9";
        const isCurrent = options[buttonIndex].code === answerItems?.[itemIndex]?.values[0];
        const isSelected = buttonIndex === selectedButton && itemIndex === selectedItem;
        if (isCurrent) bordercolor = "#2185d0";
        if (isSelected) bordercolor = "#1B1C1D";

        const colorint = 255 - buttonIndex * colorstep;
        const bgcolor = `rgb(${colorint / 1.6},${colorint / 1.2},${colorint})`;
        const color = colorint < 150 ? "white" : "black";

        return (
          <div key={option.code} style={{ margin: "auto", flex: "1 1 0px" }}>
            <Ref key={option.code} innerRef={option.ref}>
              <Button
                fluid
                style={{
                  padding: "5px 0",
                  backgroundColor: isCurrent ? "var(--secondary)" : option.color || bgcolor,
                  fontWeight: "bold",
                  fontSize: "1em",
                  textShadow: "0px 0px 5px #ffffff77",
                  borderRadius: "10px",
                  color: isCurrent ? "white" : option.color ? "#1B1C1D" : color,
                  border: `3px solid ${bordercolor}`,
                }}
                key={option.code}
                value={option.code}
                compact
                onClick={(e, d) => {
                  onSelect({ value: options[buttonIndex].code, itemIndex });
                }}
              >
                {buttonIndex + 1}
              </Button>
            </Ref>
          </div>
        );
      })}
    </>
  );
};

export default Scale;
