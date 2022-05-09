import React, { useState, useEffect } from "react";
import { Button, Ref, Icon, Label } from "semantic-ui-react";

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
        }
        if (event.key === "ArrowDown") {
          if (selectedItem < nitems - 1) setSelectedItem(selectedItem + 1);
        }
        return;
      }

      // space or enter
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        setAnswers((answers) => {
          const newanswers = [...answers];
          newanswers[selectedItem] = selectedButton + 1;
          return newanswers;
        });
      }
    },
    [selectedButton, selectedItem, setAnswers, options, items]
  );

  useEffect(() => {
    setSelectedButton(null);
    setSelectedItem(0);
    if (currentAnswer && Array.isArray(currentAnswer) && currentAnswer.length === items.length) {
      setAnswers(currentAnswer);
    } else {
      setAnswers(new Array(items.length).fill(null));
    }
    //setConfirmMsg(false);
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
  const nAnswered = answers.filter((a) => a !== null).length;
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
  return (
    <div style={{ overflow: "auto" }}>
      {items.map((item, itemIndex) => {
        return (
          <div>
            <div>
              <div style={{ color: "black", width: "100%", textAlign: "center" }}>
                <b>{item}</b>
              </div>
              <div style={{ color: "black", width: "100%", textAlign: "center" }}>
                <i>{answers[itemIndex] ? options[answers[itemIndex] - 1].code : "..."}</i>
              </div>
            </div>
            <div
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
    const isCurrent = buttonIndex + 1 === answers[itemIndex];
    const isSelected = buttonIndex === selectedButton && itemIndex === selectedItem;
    if (isCurrent || isSelected) bordercolor = "#1B1C1D";

    const colorint = 255 - buttonIndex * colorstep;
    const bgcolor = `rgb(${colorint},${colorint},${colorint})`;
    const color = colorint < 100 ? "white" : "black";

    return (
      <Ref key={option.code} innerRef={option.ref}>
        <Button
          fluid
          circle
          className="ripplebutton"
          style={{
            flex: "1 1 0px",
            backgroundColor: option.color || bgcolor,
            //padding: "10px 0px",
            fontWeight: "bold",
            fontSize: "1em",
            textShadow: "0px 0px 5px #ffffff77",
            borderRadius: "10px",
            color: option.color ? "#1B1C1D" : color,
            border: `5px solid ${bordercolor}`,
          }}
          key={option.code}
          value={buttonIndex + 1}
          compact
          onClick={(e, d) => {
            setSelectedButton(buttonIndex);
            setSelectedItem(itemIndex);
            setAnswers((answers) => {
              const newanswers = [...answers];
              newanswers[itemIndex] = d.value;
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
