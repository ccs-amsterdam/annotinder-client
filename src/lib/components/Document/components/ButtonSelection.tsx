import React, { useState, useEffect } from "react";
import { Divider, Icon, Ref } from "semantic-ui-react";
import { CustomButton, StyledButton } from "../../../styled/StyledSemantic";
import { moveDown, moveUp } from "../../../functions/refNavigation";
import { CodeSelectorOption, CodeSelectorValue } from "../../../types";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

interface ButtonSelectionProps {
  id: string;
  active: boolean;
  options: CodeSelectorOption[];
  onSelect: (value: CodeSelectorValue, ctrlKey: boolean) => void;
}

const ButtonSelection = ({ id, active, options, onSelect }: ButtonSelectionProps) => {
  const [selected, setSelected] = useState(1);
  const [allOptions, setAllOptions] = useState<CodeSelectorOption[]>([]);

  useEffect(() => {
    // add cancel button and (most importantly) add refs used for navigation
    const cancelOption: CodeSelectorOption = {
      label: "CLOSE",
      color: "var(--text-light)",
      value: { cancel: true },
      textColor: "var(--text-inversed)",
    };

    let allOptions = [cancelOption, ...options];
    for (let option of allOptions) option.ref = React.createRef();
    setAllOptions(allOptions);
    setSelected(1);
  }, [options, setAllOptions]);

  const onKeydown = React.useCallback(
    (event: KeyboardEvent) => {
      const nbuttons = allOptions.length;
      // if key is a number that indexes an option, select it
      if (Number.isFinite(event.key) && Number(event.key) <= nbuttons) {
        event.preventDefault();
        let value = allOptions[Number(event.key)].value;
        onSelect(value, event.ctrlKey || event.altKey);
      }

      // any arrowkey
      if (arrowKeys.includes(event.key)) {
        event.preventDefault();

        if (event.key === "ArrowRight") {
          if (selected < nbuttons - 1) setSelected(selected + 1);
        }

        if (event.key === "ArrowDown") {
          setSelected(moveDown(allOptions, selected));
        }

        if (event.key === "ArrowLeft") {
          if (selected > 0) setSelected(selected - 1);
        }

        if (event.key === "ArrowUp") {
          setSelected(moveUp(allOptions, selected));
        }

        return;
      }

      // space or enter
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();

        let value = allOptions[selected].value;
        onSelect(value, event.ctrlKey || event.altKey);
      }
    },
    [selected, allOptions, onSelect]
  );

  useEffect(() => {
    if (active) {
      window.addEventListener("keydown", onKeydown);
    } else {
      window.removeEventListener("keydown", onKeydown);
    }
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [active, onKeydown]);

  const button = (option: CodeSelectorOption, i: number) => {
    const textColor = option.value.delete ? "var(--red)" : "var(--text)";
    const tagColor = option.value.delete ? option.color : "var(--text-inversed)";
    const tagBorderColor = option.color.slice(0, 7);
    const borderColor = option.value.delete ? "var(--red)" : "var(--text)";
    const bgColor = option.color;

    return (
      <Ref key={option.label + "_" + i} innerRef={option.ref}>
        <CustomButton
          style={{
            position: "relative",
            flex: `0.2 1 auto`,
            padding: "5px",
            background: bgColor,
            color: textColor,
            border: "3px solid",
            borderColor: i === selected ? borderColor : "var(--text-inversed)",
            margin: "1px",
          }}
          key={option.label + "_" + i}
          onMouseOver={() => setSelected(i)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(option.value, e.ctrlKey || e.altKey);
          }}
        >
          {option.tag ? (
            <span
              style={{
                display: "inline-block",
                float: "left",
                background: tagColor,
                color: "black",
                borderRadius: "0px",
                border: `2px solid ${tagBorderColor}`,
                padding: "2px",
                margin: "-4px 4px -4px -2px",
              }}
            >{`${option.tag} `}</span>
          ) : null}
          <span>{option.label}</span>
        </CustomButton>
      </Ref>
    );
  };

  const mapButtons = () => {
    let i = 0;
    let cancelButton;
    const selectButtons = [];
    const deleteButtons = [];
    for (let option of allOptions) {
      if (option.value.cancel)
        cancelButton = (
          <Ref key={option.label + "_" + i} innerRef={option.ref}>
            <CloseButton
              selected={i === selected}
              onClick={(e, d) => onSelect(option.value, e.ctrlKey || e.altKey)}
            />
          </Ref>
        );
      else if (option.value.delete) deleteButtons.push(button(option, i));
      else selectButtons.push(button(option, i));

      i++;
    }

    return (
      <div key={id + "_buttons"} style={{ textAlign: "center" }}>
        <div
          key={id + "_1"}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          {selectButtons}
        </div>
        {deleteButtons.length > 0 ? (
          <b>
            <Divider style={{ margin: "5px" }} />
            <Icon name="trash alternate" /> Delete codes
          </b>
        ) : null}
        <div
          key={id + "_2"}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
        >
          {deleteButtons}
        </div>

        {cancelButton}
      </div>
    );
  };

  return <div key={id}>{mapButtons()}</div>;
};

interface CloseButtonProps {
  selected: boolean;
  onClick: (e: any, d: Object) => void;
}

const CloseButton = ({ selected, onClick }: CloseButtonProps) => {
  return (
    <StyledButton
      icon="window close"
      style={{
        padding: "0px",
        background: selected ? "var(--text-light)" : "var(--text-inversed)",
        color: selected ? "var(--text-inversed)" : "var(--text-light)",
        position: "absolute",
        left: "calc(50% - 15px)",
        top: "-15px",
        transform: "scale(180%)",
      }}
      onClick={onClick}
    />
  );
};

export default ButtonSelection;
