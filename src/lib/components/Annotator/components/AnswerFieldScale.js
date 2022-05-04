import React, { useState, useEffect } from "react";
import { Button, Ref, Icon, Label, Header } from "semantic-ui-react";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const Scale = React.memo(({ options, currentAnswer, callback, blockEvents }) => {
  // render buttons for options (an array of objects with keys 'label' and 'color')
  // On selection perform callback function with the button label as input
  // if canDelete is TRUE, also contains a delete button, which passes null to callback
  const [selected, setSelected] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState(false);

  const onKeydown = React.useCallback(
    (event) => {
      const nbuttons = options.length;
      if (selected === null) {
        setSelected(0);
        return null;
      }

      // any arrowkey
      if (arrowKeys.includes(event.key)) {
        event.preventDefault();
        if (event.key === "ArrowRight") {
          if (selected < nbuttons - 1) setSelected(selected + 1);
        }
        if (event.key === "ArrowLeft") {
          if (selected > 0) setSelected(selected - 1);
        }
        return;
      }

      // space or enter
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();

        // simulate active pseudoclass for transition effect
        const el = options[selected].ref.current;
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 5);

        callback(options[selected]);
      }
    },
    [selected, callback, options]
  );

  useEffect(() => {
    setSelected(null);
    setConfirmMsg(false);
  }, [callback, setSelected, setConfirmMsg]);

  useEffect(() => {
    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown, blockEvents]);

  const mapButtons = () => {
    const colorstep = 200 / options.length;
    return options.map((option, i) => {
      let bordercolor = "#ece9e9";
      const isCurrent = option.code === currentAnswer;
      if (isCurrent) bordercolor = "green";
      if (i === selected) bordercolor = "#1B1C1D";
      if (isCurrent && i === selected) bordercolor = "#004200";

      const colorint = 255 - (i * colorstep + 55);
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
            value={option}
            compact
            onClick={(e, d) => {
              if (selected === null || options[selected].code !== d.value.code) {
                // this should only happen on touch devices, where users need to tab
                // the answer twice (first time to see the code)
                setConfirmMsg(true);
                setSelected(i);
              } else {
                callback(d.value);
              }
            }}
            onMouseOver={(e) => {
              // a touch event serves simultaneously as both onMouseOver
              // and onClick. This delays the setSelected till after the onClick
              setTimeout(() => setSelected(i), 10);
            }}
          >
            {option.scale ?? i + 1}
          </Button>
        </Ref>
      );
    });
  };

  const left = options[0];
  const right = options[options.length - 1];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Label
          size="large"
          style={{
            flex: "1 1 0px",
            color: "black",
            background: left.color || "rgb(205,205,205)",
          }}
        >
          <Icon name="arrow left" />
          {left.code}
        </Label>
        <Label
          size="large"
          style={{
            flex: "1 1 0px",
            textAlign: "right",
            color: right.color ? "black" : "white",
            background: right.color || "rgb(0,0,0)",
          }}
        >
          {right.code}
          <Icon name="arrow right" style={{ marginLeft: "5px" }} />
        </Label>
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: "100%",
          padding: "0px 15px",
          marginTop: "10px",
        }}
      >
        {mapButtons()}
      </div>
      <div style={{ color: "black", width: "100%", textAlign: "center" }}>
        {confirmMsg ? "Tap again to confirm" : null}
      </div>

      <div>
        <Header textAlign="center" style={{ marginTop: "15px", color: "black" }}>
          {options?.[selected]?.code}
        </Header>
      </div>
    </div>
  );
});

export default Scale;
