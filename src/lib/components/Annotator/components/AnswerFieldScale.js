import React, { useState, useEffect, useRef, createRef } from "react";
import { Button, Ref, Icon, Label } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const Scale = React.memo(({ items, options, currentAnswer, onSelect, blockEvents }) => {
  // render buttons for options (an array of objects with keys 'label' and 'color')
  // On selection perform onSelect function with the button label as input
  // if canDelete is TRUE, also contains a delete button, which passes null to onSelect
  const [selectedItem, setSelectedItem] = useState(0);
  const [selectedButton, setSelectedButton] = useState(null);
  const [answers, setAnswers] = useState(null);
  //const [confirmMsg, setConfirmMsg] = useState(false);

  const onKeydown = React.useCallback(
    (event) => {
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
          if (!answers.some((a) => a.value === null)) onSelect({ code: answers });
        } else {
          const newanswers = [...answers];
          newanswers[selectedItem].value = options[selectedButton].code;
          onSelect({ code: newanswers }, true);
          setAnswers(newanswers);
        }
      }
    },
    [selectedButton, selectedItem, answers, setAnswers, onSelect, options, items]
  );

  useEffect(() => {
    setSelectedButton(null);
    setSelectedItem(0);
    if (currentAnswer && Array.isArray(currentAnswer) && currentAnswer.length === items.length) {
      setAnswers(currentAnswer);
    } else {
      const answers = items.map((item) => ({ item: item?.name || item, value: null }));
      setAnswers(answers);
    }
  }, [currentAnswer, items, onSelect, setSelectedButton, setSelectedItem]);

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
  if (answers === null) return null;
  const nAnswered = answers.filter((a) => a.value !== null).length;
  const done = nAnswered === answers.length;

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
          //zIndex: 1,
          //position: "relative",
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
            maxWidth: "40%",
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
            maxWidth: "40%",
            textAlign: "right",
            background: "transparent",
            color: "black",
          }}
        >
          {right.code}
          <Icon name="arrow right" style={{ marginLeft: "5px" }} />
        </Label>
      </div>

      <Items
        answers={answers}
        setAnswers={setAnswers}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        items={items}
        options={options}
        selectedButton={selectedButton}
        setSelectedButton={setSelectedButton}
        currentAnswer={currentAnswer}
        onSelect={onSelect}
      />

      <div>
        <Button
          primary
          fluid
          disabled={!done}
          icon={done ? "play" : null}
          content={done ? "Continue" : `${nAnswered} / ${answers.length}`}
          style={{
            flex: "1 1 0px",
            textAlign: "center",
            color: done ? null : "black",
            margin: "0",
            background: done ? null : "white",
            border: `5px solid ${selectedItem < 0 ? "black" : "#ece9e9"}`,
          }}
          onClick={() => {
            // this is a bit of an odd one out. We didn't anticipate having multiple answers,
            // so some of the previous logic doesn't hold
            onSelect({ code: answers });
          }}
        />
      </div>
    </div>
  );
});

const Items = ({
  answers,
  setAnswers,
  selectedItem,
  setSelectedItem,
  items,
  options,
  selectedButton,
  setSelectedButton,
  onSelect,
}) => {
  const containerRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    rowRefs.current = items.map(() => createRef());
  }, [items, rowRefs]);

  useEffect(() => {
    if (selectedItem < 0) return;
    scrollToMiddle(containerRef?.current, rowRefs?.current?.[selectedItem]?.current, 0.5);
  }, [selectedItem, items, rowRefs]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: "1 1 auto",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {items.map((itemObj, itemIndex) => {
        const itemlabel = itemObj.label || itemObj.name || itemObj;
        return (
          <div key={itemIndex} style={{ paddingTop: "10px", margin: "auto 10px" }}>
            <div>
              <div style={{ color: "black", width: "100%", textAlign: "center", padding: "0 5px" }}>
                <b>{itemlabel}</b>
              </div>
              <div style={{ width: "100%", textAlign: "center", color: "#1678c2" }}>
                <i>{answers?.[itemIndex]?.value ? answers[itemIndex].value : "..."}</i>
              </div>
            </div>
            <div
              ref={rowRefs?.current?.[itemIndex]}
              style={{
                display: "flex",
                maxWidth: "100%",
                padding: "0px 15px",
                paddingBottom: "10px",
              }}
            >
              <Item
                answers={answers}
                setAnswers={setAnswers}
                selectedItem={selectedItem}
                itemIndex={itemIndex}
                options={options}
                selectedButton={selectedButton}
                onSelect={onSelect}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Item = ({
  answers,
  setAnswers,
  selectedItem,
  itemIndex,
  options,
  selectedButton,
  onSelect,
}) => {
  const colorstep = 200 / options.length;
  return options.map((option, buttonIndex) => {
    let bordercolor = "#ece9e9";
    const isCurrent = options[buttonIndex].code === answers?.[itemIndex]?.value;
    const isSelected = buttonIndex === selectedButton && itemIndex === selectedItem;
    if (isCurrent) bordercolor = "#2185d0";
    if (isSelected) bordercolor = "#1B1C1D";

    const colorint = 255 - buttonIndex * colorstep;
    const bgcolor = `rgb(${colorint},${colorint},${colorint})`;
    const color = colorint < 100 ? "white" : "black";

    return (
      <div key={option.code} style={{ flex: "1 1 0px" }}>
        <Ref key={option.code} innerRef={option.ref}>
          <Button
            fluid
            primary
            className="ripplebutton"
            style={{
              padding: "5px 0",
              backgroundColor: isCurrent ? null : option.color || bgcolor,
              fontWeight: "bold",
              fontSize: "1em",
              textShadow: "0px 0px 5px #ffffff77",
              borderRadius: "10px",
              color: isCurrent ? null : option.color ? "#1B1C1D" : color,
              border: `3px solid ${bordercolor}`,
            }}
            key={option.code}
            value={option.code}
            compact
            onClick={(e, d) => {
              const newanswers = [...answers];
              newanswers[itemIndex].value = options[buttonIndex].code;
              onSelect({ code: newanswers }, true);
              setAnswers(newanswers);
            }}
          >
            {buttonIndex + 1}
          </Button>
        </Ref>
      </div>
    );
  });
};

export default Scale;
