import React, { useRef } from "react";
import { Dropdown, Ref } from "semantic-ui-react";

const SearchCode = React.memo(({ options, onSelect, blockEvents }) => {
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
          onSelect(d.value);
        }}
      />
    </Ref>
  );
});

export default SearchCode;
