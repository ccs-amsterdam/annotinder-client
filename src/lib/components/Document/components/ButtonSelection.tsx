import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { CodeButton } from "../../../styled/StyledSemantic";
import { moveDown, moveUp } from "../../../functions/refNavigation";
import { CodeSelectorOption, CodeSelectorValue } from "../../../types";
import { FaWindowClose } from "react-icons/fa";
import styled from "styled-components";
import { RiDeleteBin2Line } from "react-icons/ri";
import standardizeColor from "../../../functions/standardizeColor";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const StyledDiv = styled.div`
  .closeIcon {
    cursor: pointer;
    height: 3.5rem;
    margin: 0rem 0.4rem;
    border: 2px solid transparent;

    svg {
      :hover {
        fill: var(--text);
      }
    }
  }

  .ButtonContent {
    .Tag {
      font-size: 1.2rem;
      font-weight: bold;
    }
  }

  .DeleteIcon {
    position: absolute;
    right: 3;
    top: 0;
    font-size: 2rem;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .SelectButtonsContainer {
    position: relative;
    .SelectButtons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 10px;
      max-height: 15rem;
      overflow-y: auto;
    }
    .SearchInput {
      position: absolute;
      bottom: 0rem;
      left: 0rem;
    }
  }
`;

interface ButtonSelectionProps {
  id: string;
  active: boolean;
  options: CodeSelectorOption[];
  onSelect: (value: CodeSelectorValue, ctrlKey: boolean) => void;
}

const ButtonSelection = ({ id, active, options, onSelect }: ButtonSelectionProps) => {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [showN, setShowN] = useState(5);
  const useSearch = false;

  const allOptions: CodeSelectorOption[] = useMemo(() => {
    // add cancel button and (most importantly) add refs used for navigation
    const cancelOption: CodeSelectorOption = {
      label: "CLOSE",
      color: "var(--text-light)",
      value: { cancel: true },
      textColor: "var(--text-inversed)",
    };

    let allOptions: CodeSelectorOption[] = [cancelOption, ...options];
    for (let option of allOptions) {
      option.queryText =
        String(option.label).toLowerCase() + " " + String(option.tag || "").toLowerCase();
      option.color = standardizeColor(option.color);
      option.ref = React.createRef();
    }
    setSelected(0);
    return allOptions;
  }, [options]);

  const filteredOptions = useMemo(() => {
    const query = deferredSearch.toLowerCase();
    return allOptions.filter((o) => o.queryText.includes(query) || o.value.delete);
  }, [allOptions, deferredSearch]);

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
        function setSelectedAndScroll(i: number) {
          setSelected(i);
          let el = allOptions[i].ref.current;
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        if (event.key === "ArrowRight") {
          if (selected < nbuttons - 1) setSelectedAndScroll(selected + 1);
        }

        if (event.key === "ArrowDown") {
          setSelectedAndScroll(moveDown(allOptions, selected));
        }

        if (event.key === "ArrowLeft") {
          if (selected > 0) setSelectedAndScroll(selected - 1);
        }

        if (event.key === "ArrowUp") {
          setSelectedAndScroll(moveUp(allOptions, selected));
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

  const button = (option: CodeSelectorOption, i: number, rm: boolean) => {
    return (
      <CodeButton
        ref={option.ref as React.RefObject<HTMLButtonElement>}
        key={option.label + "_" + i}
        selected={i === selected}
        background={option.color}
        //className="buttonBackground"
        compact
        style={{
          paddingRight: rm ? "3rem" : "",
        }}
        onMouseOver={() => setSelected(i)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect(option.value, e.ctrlKey || e.altKey);
        }}
      >
        <span className="ButtonContent">
          {option.tag ? <span className="Tag">{option.tag}: </span> : null}
          {option.label}
        </span>
        {rm && (
          <div className="deleteIcon">
            <RiDeleteBin2Line />
          </div>
        )}
      </CodeButton>
    );
  };

  const [cancelButton, selectButtons, deleteButtons] = useMemo(() => {
    let i = 0;
    let cancelButton;
    const selectButtons = [];
    const deleteButtons = [];
    for (let option of filteredOptions) {
      if (option.value.cancel)
        cancelButton = (
          <div
            key={option.label + "_" + i}
            className={`closeIcon`}
            ref={option.ref as React.RefObject<HTMLDivElement>}
          >
            <FaWindowClose
              size="100%"
              color={selected === 0 ? "var(--text)" : "var(--primary-light)"}
              onClick={(e) => onSelect(option.value, e.ctrlKey || e.altKey)}
              onMouseOver={() => setSelected(0)}
            />
          </div>
        );
      else if (option.value.delete) deleteButtons.push(button(option, i, true));
      else selectButtons.push(button(option, i, false));

      i++;
    }

    return [cancelButton, selectButtons, deleteButtons];
  }, [filteredOptions, selected]);

  return (
    <StyledDiv key={id}>
      <div className="Buttons" key={id + "_buttons"} style={{ textAlign: "center" }}>
        <div className="SelectButtonsContainer">
          <div className="SelectButtons" key={id + "_1"}>
            {cancelButton}
            {selectButtons}
            {useSearch && <div style={{ height: "3rem", width: "100%" }}></div>}
          </div>
          {useSearch && (
            <input
              className="SearchInput"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search"
            />
          )}
        </div>

        {deleteButtons.length > 0 ? (
          <>
            <div style={{ height: "5px", borderTop: "1px solid var(--primary-text)" }} />
            <i>delete annotations</i>
          </>
        ) : null}
        <div
          key={id + "_2"}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
        >
          {deleteButtons}
        </div>
      </div>
    </StyledDiv>
  );
};

export default ButtonSelection;
