import React, { useState, useEffect, useRef } from "react";
import { Button, Ref } from "semantic-ui-react";
import { moveUp, moveDown } from "../../../functions/refNavigation";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const SelectCode = React.memo(
  ({ options, currentAnswer, singleRow, sameSize, onSelect, blockEvents }) => {
    // render buttons for options (an array of objects with keys 'label' and 'color')
    // On selection perform onSelect function with the button label as input
    // if canDelete is TRUE, also contains a delete button, which passes null to onSelect
    const [selected, setSelected] = useState(null);
    const container = useRef();

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

          if (event.key === "ArrowDown") {
            setSelected(moveDown(options, selected));
          }

          if (event.key === "ArrowLeft") {
            if (selected > 0) setSelected(selected - 1);
          }

          if (event.key === "ArrowUp") {
            setSelected(moveUp(options, selected));
          }

          return;
        }

        // space or enter
        if (event.keyCode === 32 || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();

          onSelect(options[selected]);
          // simulate active pseudoclass for transition effect
          const el = options[selected].ref.current;
          el.classList.add("active");
          setTimeout(() => el.classList.remove("active"), 5);
        }
      },
      [selected, onSelect, options]
    );

    useEffect(() => {
      setSelected(null);
    }, [onSelect, setSelected]);

    useEffect(() => {
      if (!blockEvents) {
        window.addEventListener("keydown", onKeydown);
      } else window.removeEventListener("keydown", onKeydown);

      return () => {
        window.removeEventListener("keydown", onKeydown);
      };
    }, [onKeydown, blockEvents]);

    const mapButtons = () => {
      let perRow = 4;
      let minWidth = 100;
      if (container?.current?.clientWidth) {
        // make it scale with fontsize
        const px_per_em = parseFloat(getComputedStyle(container.current).fontSize);
        minWidth = px_per_em * 6;
        perRow = Math.floor(container.current.clientWidth / minWidth);
      }

      return options.map((option, i) => {
        let bordercolor = "#ece9e9";
        const isCurrent = option.code === currentAnswer;
        if (isCurrent) bordercolor = "#0c4f83";
        if (i === selected) bordercolor = "#1B1C1D";
        if (isCurrent && i === selected) bordercolor = "#004200";

        return (
          <div
            style={{
              flex: true
                ? `${Math.max(1 / perRow, 1 / options.length)} 1 0px`
                : `${Math.max(1 / perRow, 1 / options.length)}  1 auto`,
              minWidth: minWidth + "px",
              width: sameSize ? minWidth + "px" : null,
              textAlign: "center",
            }}
          >
            <Ref key={option.code} innerRef={option.ref}>
              <Button
                fluid
                className="ripplebutton"
                style={{
                  overflowWrap: "break-word",
                  backgroundColor: option.color,
                  padding: "5px",
                  height: "100%",
                  fontWeight: "bold",
                  textShadow: "0px 0px 5px #ffffff77",
                  borderRadius: "10px",
                  color: "#1B1C1D",
                  fontSize: "inherit",
                  border: `5px solid ${bordercolor}`,
                }}
                key={option.code}
                value={option}
                compact
                onMouseOver={() => setSelected(i)}
                onClick={(e, d) => {
                  onSelect(d.value);
                }}
              >
                {option.code}
              </Button>
            </Ref>
          </div>
        );
      });
    };

    return (
      <div
        ref={container}
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: singleRow ? null : "wrap",
          //alignItems: stretch ? "stretch" : "center",
          maxWidth: "100%",
          height: "100%",
        }}
      >
        {mapButtons()}
      </div>
    );
  }
);

export default SelectCode;
