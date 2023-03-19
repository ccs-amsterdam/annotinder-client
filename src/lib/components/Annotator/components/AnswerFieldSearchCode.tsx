import React, { useState, useEffect, useRef } from "react";
import { Dropdown, Ref } from "semantic-ui-react";
import { OnSelectParams, AnswerOption } from "../../../types";
import { StyledButton } from "../../../styled/StyledSemantic";

interface SearchCodeProps {
  /** The options the user can choose from */
  options: AnswerOption[];
  /** An array of answer values. If multiple is false, should have length 1 */
  values: (string | number)[];
  /** If true, multiple options can be chosen */
  multiple: boolean;
  /** The function used to update the values */
  onSelect: (params: OnSelectParams) => void;
  /** Like onSelect, but for finishing the question/unit with the current values */
  onFinish: () => void;
  /** If true, all eventlisteners are stopped */
  blockEvents: boolean;
}

const SearchCode = React.memo(
  ({ options, values, multiple, onSelect, onFinish, blockEvents = false }: SearchCodeProps) => {
    const ref = useRef<HTMLInputElement>();
    const changed = useRef(false);
    const [focuson, setFocuson] = useState("dropdown");

    useEffect(() => {
      setFocuson("dropdown");
    }, [onSelect]);

    useEffect(() => {
      const onKeydown = (e: KeyboardEvent) => {
        if (e.keyCode === 9) {
          // tab key
          e.preventDefault();
          e.stopPropagation();
          setFocuson((focuson) => {
            if (focuson === "button") {
              ref?.current?.click();
              return "dropdown";
            }
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            return "button";
          });
        }
        if ((e.keyCode === 32 || e.keyCode === 13) && focuson === "button") {
          onSelect({ value: values, finish: true });
        }
      };

      window.addEventListener("keydown", onKeydown);
      return () => {
        window.removeEventListener("keydown", onKeydown);
      };
    }, [focuson, setFocuson, onSelect, values]);

    changed.current = false;
    return (
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flex: "1 1 auto", minHeight: "185px", padding: "10px" }}>
          <Ref innerRef={ref}>
            <Dropdown
              fluid
              scrolling
              multiple={multiple}
              upward={false}
              placeholder={"<type to search>"}
              searchInput={{ autoFocus: !blockEvents }}
              style={{ minWidth: "12em" }}
              value={multiple ? values : values?.[0] || null}
              options={options.map((option) => {
                return {
                  key: option.code,
                  value: option.code,
                  text: option.code + (option.tree ? " (" + option.tree + ")" : ""),
                  content: (
                    <>
                      {option.code}
                      <br />
                      <span style={{ color: "var(--text-light)" }}>{option.tree}</span>
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
                changed.current = true;
                // code can only be number or string, and multiple determines whether array or scalar
                const value = d.value as number | string | (number | string)[];
                onSelect({ value, itemIndex: 0, multiple, finish: !multiple });
              }}
              onClose={(e, d) => {
                // stupid hack, since onChange doesn't fire if same value is chosen again
                if (multiple) return;
                // if multiple is false, d must be scalar. And option code can only be string or number, so it's safe to cast
                const value = [d.value as string | number];
                if (!changed.current) onSelect({ value, finish: true });
              }}
            />
          </Ref>
        </div>
        {multiple ? (
          <div style={{ minWidth: "100px", height: "100%" }}>
            <StyledButton
              primary
              fluid
              style={{
                height: "100%",
                border: `5px solid ${focuson === "button" ? "black" : "rgb(211, 223, 233)"}`,
              }}
              onClick={() => {
                onFinish();
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
);

export default SearchCode;
