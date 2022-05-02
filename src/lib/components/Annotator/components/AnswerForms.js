import React, { useState, useEffect, useRef } from "react";
import { Button, Dropdown, Ref, Icon } from "semantic-ui-react";
import buttonGridPositions from "../../../functions/buttonGridPositions";
import { moveUp, moveDown } from "../../../functions/refNavigation";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

export const SearchBoxDropdown = React.memo(({ options, callback, blockEvents }) => {
  const ref = useRef();

  return (
    <Ref innerRef={ref}>
      <Dropdown
        fluid
        scrolling
        upward={false}
        placeholder={"<type to search>"}
        searchInput={{ autoFocus: !blockEvents }}
        style={{ minWidth: "12em" }}
        options={options.map((option) => {
          return {
            key: option.code,
            value: option,
            text: option.code + (option.tree ? " (" + option.tree + ")" : ""),
            content: (
              <>
                {option.code}
                <br />
                <span style={{ color: "grey" }}>{option.tree}</span>
              </>
            ),
          };
        })}
        search
        selection
        compact
        selectOnNavigation={false}
        minCharacters={0}
        autoComplete={"on"}
        onChange={(e, d) => {
          callback(d.value);
        }}
      />
    </Ref>
  );
});

export const ButtonSelection = React.memo(({ options, callback, blockEvents }) => {
  // render buttons for options (an array of objects with keys 'label' and 'color')
  // On selection perform callback function with the button label as input
  // if canDelete is TRUE, also contains a delete button, which passes null to callback
  const [selected, setSelected] = useState(0);
  const [gridSettings, setGridSettings] = useState(null);

  const onKeydown = React.useCallback(
    (event) => {
      const nbuttons = options.length;

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

      // delete
      if (event.keyCode === 46) {
        callback(null);
        setSelected(0);
      }

      // space or enter
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();

        if (selected === options.length) {
          callback(null); // this means delete button was selected
        } else {
          callback(options[selected]);
        }
        setSelected(0);
      }
    },
    [selected, callback, options]
  );

  useEffect(() => {
    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown, blockEvents]);

  useEffect(() => {
    const gridsettings = buttonGridPositions(options.length, 5);
    setGridSettings(gridsettings);
  }, [options.length, setGridSettings]);

  const mapButtons = (boxStyleArray) => {
    return options.map((option, i) => {
      return (
        <Ref key={option.code} innerRef={option.ref}>
          <Button
            fluid
            style={{
              ...boxStyleArray[i],
              backgroundColor: option.color,
              padding: "1em",
              margin: "0.2em",
              height: "100%",
              fontWeight: "bold",
              fontSize: "1em",
              color: "black",
              borderRadius: "10px",
              border: i === selected ? "3px solid black" : "3px solid #ece9e9",
            }}
            key={option.code}
            value={option}
            compact
            onMouseOver={() => setSelected(i)}
            onClick={(e, d) => {
              callback(d.value);
              setSelected(0);
            }}
          >
            {option.code}
          </Button>
        </Ref>
      );
    });
  };

  if (!gridSettings) return null;
  return (
    <div
      style={{
        ...gridSettings.containerStyle,
        display: "grid",
        flexDirection: "row",
        alignItems: "center",
        justifyItems: "center",
        maxWidth: "100%",
        height: "100%",
      }}
    >
      {mapButtons(gridSettings.boxStyleArray)}
    </div>
  );
});

export const Annotinder = React.memo(({ swipeOptions, callback, swipe, blockEvents }) => {
  // const left = options.find(option => option.swipe === "left");
  // const up = options.find(option => option.swipe === "up");
  // const right = options.find(option => option.swipe === "right");

  useEffect(() => {
    if (swipe) {
      if (swipe === "right") callback(swipeOptions.right);
      if (swipe === "up") callback(swipeOptions.up);
      if (swipe === "left") callback(swipeOptions.left);
    }
  }, [swipe, callback, swipeOptions]);

  const onKeydown = React.useCallback(
    (event) => {
      // any arrowkey
      if (arrowKeys.includes(event.key)) {
        event.preventDefault();

        if (event.key === "ArrowRight") callback(swipeOptions.right);
        if (event.key === "ArrowUp") callback(swipeOptions.up);
        if (event.key === "ArrowLeft") callback(swipeOptions.left);
      }
    },

    [callback, swipeOptions]
  );

  useEffect(() => {
    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown, blockEvents]);

  return (
    <Button.Group
      fluid
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignContent: "stretch",
        height: "100%",
        minHeight: "30px",
      }}
    >
      <Button
        disabled={swipeOptions.left == null}
        onClick={(e, d) => callback(swipeOptions.left)}
        style={{
          margin: "0",
          padding: "0",
          borderRadius: "0",
          border: "1px solid",
          background: swipeOptions.left?.color || "white",
        }}
      >
        <div style={{ color: "black", fontWeight: "bold", fontSize: "1em" }}>
          <Icon name={swipeOptions.left?.code ? "arrow left" : null} />
          <span>{swipeOptions.left?.code || ""}</span>
        </div>
      </Button>
      {swipeOptions.up == null ? null : (
        <Button
          disabled={swipeOptions.up == null}
          onClick={(e, d) => callback(swipeOptions.up)}
          style={{
            margin: "0",
            padding: "0",
            borderRadius: "0",
            border: "1px solid",
            background: swipeOptions.up?.color || "white",
          }}
        >
          <div style={{ color: "black", fontWeight: "bold", fontSize: "1em" }}>
            <Icon name={swipeOptions.up?.code ? "arrow up" : null} />
            <span>{swipeOptions.up?.code || ""}</span>
          </div>
        </Button>
      )}
      <Button
        disabled={swipeOptions.right == null}
        onClick={(e, d) => callback(swipeOptions.right)}
        style={{
          padding: "0",
          margin: "0",
          borderRadius: "0",
          border: "1px solid",
          background: swipeOptions.right?.color || "white",
        }}
      >
        <div style={{ color: "black", fontWeight: "bold", fontSize: "1em" }}>
          <span>{swipeOptions.right?.code || ""}</span>
          <Icon name={swipeOptions.right?.code ? "arrow right" : null} />
        </div>
      </Button>
    </Button.Group>
  );
});
