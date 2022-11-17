import React, { useState, useEffect, useRef, RefObject } from "react";
import { Ref } from "semantic-ui-react";
import { moveUp, moveDown } from "../../../functions/refNavigation";
import { scrollToMiddle } from "../../../functions/scroll";
import { AnswerOption, OnSelectParams } from "../../../types";
import useSpeedBump from "../../../hooks/useSpeedBump";
import { StyledButton } from "../../../styled/StyledSemantic";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

interface SelectCodeProps {
  /** The options the user can choose from */
  options: AnswerOption[];
  /** An array of answer values. If multiple is false, should have length 1 */
  values: (string | number)[];
  /** If true, multiple options can be chosen */
  multiple: boolean;
  /** If true, all buttons are put in a single column */
  vertical: boolean;
  /** If true, all buttons are kept mostly the same size (can deviate if some options have more characters) */
  sameSize: boolean;
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

const SelectCode = React.memo(
  ({
    options,
    values,
    multiple,
    vertical,
    sameSize,
    onSelect,
    onFinish,
    blockEvents,
    questionIndex,
    scrollRef,
  }: SelectCodeProps) => {
    // render buttons for options (an array of objects with keys 'label' and 'color')
    // On selection perform onSelect function with the button label as input
    // if canDelete is TRUE, also contains a delete button, which passes null to onSelect
    const [selected, setSelected] = useState<number>(null);
    const container = useRef<HTMLDivElement>();
    const finishbutton = useRef<HTMLElement>();
    const speedbump = useSpeedBump(values);

    const onKeydown = React.useCallback(
      (event: KeyboardEvent) => {
        // the finishbutton is just added to the buttons array, so that navigation still works nicely
        const buttons = multiple ? [...options, { ref: finishbutton }] : options;
        const nbuttons = buttons.length;

        if (selected === null || selected < 0 || selected > nbuttons) {
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
            setSelected(moveDown(buttons, selected));

            scrollToMiddle(
              scrollRef?.current,
              buttons?.[selected]?.ref?.current.parentElement,
              0.5
            );
          }

          if (event.key === "ArrowLeft") {
            if (selected > 0) setSelected(selected - 1);
          }

          if (event.key === "ArrowUp") {
            setSelected(moveUp(buttons, selected));
            scrollToMiddle(
              container?.current,
              buttons?.[selected]?.ref?.current.parentElement,
              0.5
            );
          }

          return;
        }

        // space or enter
        if (event.keyCode === 32 || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          if (speedbump) return;

          if (selected === options.length) {
            // this would be the finish button
            onFinish();
          } else {
            if (options?.[selected])
              onSelect({
                value: options[selected].code,
                itemIndex: 0,
                multiple,
                finish: !multiple,
                transition: { color: options[selected]?.color },
              }); // !multiple tells not to finish unit if multiple is true
          }
        }
      },
      [selected, onSelect, multiple, options, onFinish, speedbump, scrollRef]
    );

    useEffect(() => {
      // the first time using keyboard nav, there is not yet a selected (null)
      // if it has been used once, reset setSelected to 0 so the user always sees the cursor
      setSelected((selected) => (selected === null ? null : 0));
    }, [questionIndex, setSelected]);

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
      const minWidthStr = vertical ? "100%" : minWidth + "px";

      return options.map((option, i) => {
        let bordercolor = "var(--background-inversed-fixed)";
        const isCurrent = values.includes(option.code);
        if (isCurrent) bordercolor = "var(--background-fixed)";
        if (i === selected) bordercolor = "var(--background-fixed)";

        return (
          <div
            key={option.code}
            style={{
              flex: `${Math.max(1 / perRow, 1 / options.length)} 1 0px`,
              //flex: "1 1 auto",
              minWidth: minWidthStr,
              width: sameSize ? minWidthStr : null,
              textAlign: "center",
            }}
          >
            <Ref key={option.code} innerRef={option.ref}>
              <StyledButton
                fluid
                loading={speedbump}
                style={{
                  backgroundColor: option.color,
                  overflowWrap: "break-word",
                  padding: "15px 5px",
                  transition: "padding 0.2s",
                  fontWeight: "bold",
                  textShadow: "0px 0px 5px var(--background-inversed-fixed)",
                  color: "var(--text-inversed-fixed)",
                  borderRadius: "13.5px",
                  fontSize: "inherit",
                  position: "relative",
                  height: "100%",
                  border: `3px solid ${bordercolor}`,
                }}
                key={option.code}
                value={option.code}
                compact
                //onMouseOver={() => setSelected(i)}
                onClick={(e, d) => {
                  if (speedbump) return;

                  onSelect({
                    value: d.value,
                    itemIndex: 0,
                    multiple: multiple,
                    finish: !multiple,
                    transition: { color: option.color },
                  }); // !multiple tells not to finish unit if multiple is true
                }}
              >
                {option.code}
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    height: "100%",
                    width: "100%",
                    borderStyle: "solid",
                    borderRadius: "10px",
                    backgroundColor: i === selected ? "#ffffff33" : "transparent",
                    borderColor: isCurrent
                      ? "var(--background-fixed)"
                      : "var(--background-inversed-fixed)",
                    borderWidth: isCurrent ? "3px" : "3px",
                  }}
                ></div>
              </StyledButton>
            </Ref>
          </div>
        );
      });
    };

    return (
      <div style={{ height: "100%", width: "100%", display: "flex" }}>
        <div
          ref={container}
          style={{
            display: "flex",
            flex: "1 1 auto",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "stretch",
            maxWidth: "100%",
            height: "100%",
            //overflow: "auto",
          }}
        >
          {mapButtons()}
        </div>
        {multiple ? (
          <div style={{ width: "60px", height: "100%" }}>
            <Ref key={"finishbutton"} innerRef={finishbutton}>
              <StyledButton
                primary
                icon="play"
                fluid
                size="mini"
                style={{
                  height: "100%",
                  border: `5px solid ${
                    selected === options.length
                      ? "var(--background-fixed)"
                      : "var(--background-inversed-fixed)"
                  }`,
                }}
                onClick={() => {
                  if (speedbump) return;

                  onSelect({ value: values, itemIndex: 0, finish: true });
                }}
              />
            </Ref>
          </div>
        ) : null}
      </div>
    );
  }
);

export default SelectCode;
