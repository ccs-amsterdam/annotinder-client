import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from "react";
import { CodeButton } from "../../../styled/StyledSemantic";
import { moveDown, moveUp } from "../../../functions/refNavigation";
import { CodeSelectorOption, CodeSelectorValue, SetState } from "../../../types";
import { FaWindowClose } from "react-icons/fa";
import styled from "styled-components";
import { RiDeleteBin2Line } from "react-icons/ri";
import standardizeColor from "../../../functions/standardizeColor";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const StyledDiv = styled.div<{ showSearch?: boolean }>`
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

  .SelectButtonsContainer {
    position: relative;

    .SelectButtons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      max-height: 15rem;
      padding: 0.5rem;
      overflow-y: auto;
    }
    .SearchInput {
      ${(p) => {
        if (p.showSearch)
          return `
          padding: 0.1rem 0.5rem;
          max-height: 3rem; 
          `;
        return `
          border: none;
          padding: 0rem;
          max-height: 0rem;
        `;
      }}
      transition: max-height 0.2s ease-in-out;
      position: absolute;
      bottom: 0.5rem;
      left: 50%;
      font-size: 1.5rem;
      transform: translateX(-50%);
      border-radius: 5px;

      &:focus {
        display: "block";
      }
    }
  }

  .DeleteButtonsContainer {
    padding: 0.5rem 0rem 0.5rem 0rem;

    .DeleteIcon {
      display: flex;
      align-items: center;
    }
  }
`;

interface ButtonSelectionProps {
  id: string;
  options: CodeSelectorOption[];
  onSelect: (value: CodeSelectorValue, ctrlKey: boolean) => void;
}

const ButtonSelection = ({ id, options, onSelect }: ButtonSelectionProps) => {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef("");
  searchRef.current = search;

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
    setSelected(0);
    if (!deferredSearch) return allOptions;
    const query = deferredSearch.toLowerCase();
    return allOptions.filter(
      (o) => o.queryText.includes(query) && !o.value.delete && !o.value.cancel
    );
  }, [allOptions, deferredSearch]);

  const onKeydown = React.useCallback(
    (event: KeyboardEvent) => {
      const nbuttons = filteredOptions.length;
      // if key is a number that indexes an option, select it
      if (Number.isFinite(event.key) && Number(event.key) <= nbuttons) {
        event.preventDefault();
        let value = filteredOptions[Number(event.key)].value;
        onSelect(value, event.ctrlKey || event.altKey);
      }

      // any arrowkey
      if (arrowKeys.includes(event.key)) {
        event.preventDefault();
        function setSelectedAndScroll(i: number) {
          setSelected(i);
          let el = filteredOptions[i].ref.current;
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        if (event.key === "ArrowRight") {
          if (selected < nbuttons - 1) setSelectedAndScroll(selected + 1);
        }

        if (event.key === "ArrowDown") {
          setSelectedAndScroll(moveDown(filteredOptions, selected));
        }

        if (event.key === "ArrowLeft") {
          if (selected > 0) setSelectedAndScroll(selected - 1);
        }

        if (event.key === "ArrowUp") {
          setSelectedAndScroll(moveUp(filteredOptions, selected));
        }

        return;
      }

      // space or enter
      if (event.key === "Enter" || (event.key === " " && searchRef.current === "")) {
        event.preventDefault();
        event.stopPropagation();

        let value = filteredOptions[selected].value;
        onSelect(value, event.ctrlKey || event.altKey);
        return;
      }

      searchInputRef.current.focus();
    },
    [selected, searchRef, searchInputRef, filteredOptions, onSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown]);

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
      else if (option.value.delete)
        deleteButtons.push(button(option, i, true, onSelect, selected, setSelected));
      else {
        selectButtons.push(button(option, i, false, onSelect, selected, setSelected));
      }
      i++;
    }

    return [cancelButton, selectButtons, deleteButtons];
  }, [filteredOptions, selected, onSelect]);

  return (
    <StyledDiv key={id} showSearch={search !== ""}>
      <div className="Buttons" key={id + "_buttons"} style={{ textAlign: "center" }}>
        <div className="SelectButtonsContainer">
          <div className="SelectButtons" key={id + "_1"}>
            {cancelButton}
            {selectButtons}
            {search && <div style={{ height: "3rem", width: "100%" }}></div>}
          </div>

          <input
            ref={searchInputRef}
            className="SearchInput"
            type="text"
            value={search}
            placeholder="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="DeleteButtonsContainer">
          {deleteButtons.length > 0 ? (
            <>
              <div style={{ height: "10px", borderTop: "1px solid var(--primary-text)" }} />
              <div className="deleteIcon">
                <RiDeleteBin2Line size="2rem" />
              </div>
            </>
          ) : null}
          <div
            key={id + "_2"}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
          >
            {deleteButtons}
          </div>
        </div>
      </div>
    </StyledDiv>
  );
};

const button = (
  option: CodeSelectorOption,
  i: number,
  rm: boolean,
  onSelect: (value: CodeSelectorValue, ctrlKey: boolean) => void,
  selected: number,
  setSelected: SetState<number>
) => {
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
    </CodeButton>
  );
};

export default ButtonSelection;
