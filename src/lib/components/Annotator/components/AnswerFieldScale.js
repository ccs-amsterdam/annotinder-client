import React, { useState, useEffect, useRef, createRef } from "react";
import { Button, Ref, Icon, Label } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const Scale = React.memo(({ items, options, currentAnswer, callback, blockEvents }) => {
  // render buttons for options (an array of objects with keys 'label' and 'color')
  // On selection perform callback function with the button label as input
  // if canDelete is TRUE, also contains a delete button, which passes null to callback
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
        if (event.key === "ArrowUp") {
          if (selectedItem > 0) setSelectedItem(selectedItem - 1);
          if (selectedItem === 0) setSelectedItem(-1);
        }
        if (event.key === "ArrowDown") {
          if (selectedItem < nitems - 1) setSelectedItem(selectedItem + 1);
          if (selectedItem === nitems - 1) setSelectedItem(-1);
        }
        return;
      }

      // space or enter
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        if (selectedItem === -1) {
          if (!answers.some((a) => a.value === null)) callback({ code: answers });
        } else {
          setAnswers((answers) => {
            const newanswers = [...answers];
            newanswers[selectedItem].value = options[selectedButton].code;
            return newanswers;
          });
        }
      }
    },
    [selectedButton, selectedItem, answers, setAnswers, callback, options, items]
  );

  useEffect(() => {
    setSelectedButton(null);
    setSelectedItem(0);
    if (currentAnswer) {
      console.log(currentAnswer);
      setAnswers(currentAnswer);
    } else {
      const answers = items.map((item) => ({ item: item?.name || item, value: null }));
      setAnswers(answers);
    }
  }, [currentAnswer, items, callback, setSelectedButton, setSelectedItem]);

  useEffect(() => {
    if (answers !== null) callback({ code: answers }, true); // uses onlySave to only write to DB
  }, [answers, callback]);

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
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "3px",
          marginBottom: "8px",
        }}
      >
        <Label
          size="large"
          style={{
            flex: "1 1 0px",
            maxWidth: "40%",
            color: "black",
            background: left.color || "rgb(205,205,205)",
          }}
        >
          <Icon name="arrow left" />
          {left.code}
        </Label>
        <Button
          primary
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
            callback({ code: answers });
          }}
        />

        <Label
          size="large"
          style={{
            flex: "1 1 0px",
            maxWidth: "40%",
            textAlign: "right",
            color: right.color ? "black" : "white",
            background: right.color || "rgb(50,50,50)",
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
      />
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
}) => {
  const containerRef = useRef(null);
  const rowRefs = useRef([]);

  if (!rowRefs.current.length === items.length)
    rowRefs.current = new Array(items.length).fill(null);
  scrollToMiddle(containerRef?.current, rowRefs?.current?.[selectedItem]?.current, 0.5);

  return (
    <div ref={containerRef} style={{ overflow: "auto" }}>
      {items.map((item, itemIndex) => {
        const ref = createRef();
        rowRefs.current[itemIndex] = ref;
        return (
          <div>
            <div>
              <div style={{ color: "black", width: "100%", textAlign: "center" }}>
                <b>{item}</b>
              </div>
              <div style={{ width: "100%", textAlign: "center", color: "#1678c2" }}>
                <i>{answers?.[itemIndex]?.value ? answers[itemIndex].value : "..."}</i>
              </div>
            </div>
            <div
              ref={ref}
              style={{
                display: "flex",
                maxWidth: "100%",
                padding: "0px 15px",
                marginBottom: "10px",
              }}
            >
              <Item
                answers={answers}
                setAnswers={setAnswers}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                itemIndex={itemIndex}
                options={options}
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
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
  setSelectedItem,
  itemIndex,
  options,
  selectedButton,
  setSelectedButton,
}) => {
  const colorstep = 200 / options.length;
  return options.map((option, buttonIndex) => {
    let bordercolor = "#ece9e9";
    const isCurrent = options[buttonIndex].code === answers[itemIndex].value;
    const isSelected = buttonIndex === selectedButton && itemIndex === selectedItem;
    if (isCurrent) bordercolor = "#2185d0";
    if (isSelected) bordercolor = "#1B1C1D";

    const colorint = 255 - buttonIndex * colorstep;
    const bgcolor = `rgb(${colorint},${colorint},${colorint})`;
    const color = colorint < 100 ? "white" : "black";

    return (
      <Ref key={option.code} innerRef={option.ref}>
        <Button
          fluid
          primary
          className="ripplebutton"
          style={{
            flex: "1 1 0px",
            padding: "5px 0",

            backgroundColor: isCurrent ? null : option.color || bgcolor,
            //padding: "10px 0px",
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
            setSelectedButton(buttonIndex);
            setSelectedItem(itemIndex);
            setAnswers((answers) => {
              const newanswers = [...answers];
              newanswers[itemIndex].value = d.value;
              return newanswers;
            });
          }}
        >
          {buttonIndex + 1}
        </Button>
      </Ref>
    );
  });
};

export default Scale;
