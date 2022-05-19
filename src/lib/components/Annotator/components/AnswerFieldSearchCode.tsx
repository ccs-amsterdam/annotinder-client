import React, { useState, useEffect, useRef } from "react";
import { Button, Dropdown, Ref } from "semantic-ui-react";

const SearchCode = React.memo(({ options, values, multiple, onSelect, onFinish, blockEvents }) => {
  const ref = useRef();
  const changed = useRef(false);
  const [focuson, setFocuson] = useState("dropdown");

  useEffect(() => {
    setFocuson("dropdown");
  }, [onSelect]);

  useEffect(() => {
    const onKeydown = (e) => {
      if (e.keyCode === 9) {
        // tab key
        e.preventDefault();
        e.stopPropagation();
        setFocuson((focuson) => {
          if (focuson === "button") {
            ref?.current?.click();
            return "dropdown";
          }
          document.activeElement.blur();
          return "button";
        });
      }
      if ((e.keyCode === 32 || e.keyCode === 13) && focuson === "button") {
        onSelect(values, 0, true);
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
              changed.current = true;
              onSelect({ value: d.value, itemIndex: 0, multiple, finish: !multiple });
            }}
            onClose={(e, d) => {
              // stupid hack, since onChange doesn't fire if same value is chosen again
              if (multiple) return;
              if (!changed.current) onSelect([d.value], 0, true);
            }}
          />
        </Ref>
      </div>
      {multiple ? (
        <div style={{ minWidth: "100px", height: "100%" }}>
          <Button
            primary
            icon="play"
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
});

export default SearchCode;
