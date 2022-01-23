import React, { useState, useEffect, useRef } from "react";
import { Dropdown, Ref } from "semantic-ui-react";
import { toggleSpanAnnotation } from "../../../functions/annotations";
import { getColor } from "../../../functions/tokenDesign";
import ButtonSelection from "./ButtonSelection";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

export default function NewCodePage({
  tokens,
  variable,
  variableMap,
  codeHistory,
  settings,
  annotations,
  tokenAnnotations,
  setAnnotations,
  editMode,
  span,
  setOpen,
  setCodeHistory,
}) {
  const textInputRef = useRef(null);
  const [focusOnButtons, setFocusOnButtons] = useState(true);

  const onKeydown = React.useCallback(
    (event) => {
      if (settings && !settings.searchBox && !settings.buttonMode === "recent") return null;
      const focusOnTextInput = textInputRef?.current?.children[0] === document.activeElement;
      if (!focusOnTextInput) setFocusOnButtons(true);
      if (event.keyCode === 27) setOpen(false);
      if (arrowKeys.includes(event.key)) return null;
      if (event.keyCode <= 46 || event.keyCode >= 106) return null;
      if (textInputRef.current) textInputRef.current.click();
      setFocusOnButtons(false);
    },
    [textInputRef, setOpen, settings]
  );

  const getExistingAnnotations = (variable) => {
    const annMap = {};

    for (let i = span[0]; i <= span[1]; i++) {
      if (annotations?.[i]) {
        for (let id of Object.keys(annotations[i])) {
          const a = annotations[i][id];
          if (a.variable !== variable) continue;
          const annId = a.span[0] + "_" + id;
          annMap[annId] = { id, ...annotations[i][id] };
        }
      }
    }

    return Object.keys(annMap).length > 0 ? Object.values(annMap) : [];
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  });

  const onSelect = (annotation, ctrlKey) => {
    if (annotation === "CANCEL") {
      setOpen(false);
      return;
    }
    updateAnnotations(tokens, annotation, setAnnotations, setCodeHistory, editMode);

    if (!variableMap?.[variable]?.multiple && !ctrlKey) setOpen(false);
  };

  const autoCode = (codeMap, existing) => {
    const codes = Object.keys(codeMap);
    if (codes.length !== 1) return null;

    const value = codes[0];
    const nonEmpty = existing.filter((e) => e.value !== "EMPTY");
    if (nonEmpty.length === 0) {
      // If there is only one option (which only happens if there is only 1 possible value and nothing that can be deleted), select it automatically
      setTimeout(() => onSelect({ variable, span, value, delete: false }), 0);
      setOpen(false);
    }
    if (editMode && nonEmpty.length === 1 && value === nonEmpty[0].value) {
      setTimeout(() => onSelect({ variable, span, value, delete: true }), 0);
      setOpen(false);
    }
  };

  const getOptions = () => {
    const existing = getExistingAnnotations(variable);
    const buttonOptions = [];
    const dropdownOptions = [];
    const codeMap = variableMap?.[variable]?.codeMap;
    autoCode(codeMap, existing);

    for (let code of Object.keys(codeMap)) {
      if (tokenAnnotations[variable + "|" + code]) {
        const existingSpan = tokenAnnotations[variable + "|" + code].span;
        if (existingSpan[0] === span?.[0] && existingSpan[1] === span?.[1]) continue;
      }

      if (settings && settings.buttonMode === "all")
        buttonOptions.push({
          key: code,
          label: code,
          value: { variable, value: code, span, delete: false },
          color: getColor(code, codeMap),
        });

      let tree = codeMap[code].tree.join(" - ");

      dropdownOptions.push({
        key: code,
        value: { variable, value: code, span, delete: false },
        text: code + " test" + tree,
        content: (
          <>
            {code}
            <br />
            <span style={{ color: "grey" }}>{tree}</span>
          </>
        ),
      });
    }

    // use 'recent' mode if specified, or if settings are missing
    if (!settings || settings.buttonMode === "recent") {
      let nRecent = 9;
      for (let code of codeHistory) {
        if (nRecent < 0) break;
        if (!codeMap[code]) continue;
        buttonOptions.push({
          key: code,
          label: code,
          value: { variable, value: code, span, delete: false },
          color: getColor(code, codeMap),
        });
        nRecent--;
      }
    }

    if (existing && existing.length > 0) {
      for (let o of existing) {
        if (!codeMap[o.value]) continue;

        // check if more than one annotation of same value in this span.
        const multiple = existing.find((e) => e.id !== o.id && e.value === o.value);

        if (multiple) {
          // if multiple, add text snippet as label (and move code to tag) to disambiguate
          buttonOptions.push({
            tag: o.value,
            label: '"' + getTextSnippet(tokens, o.span) + '"',
            color: getColor(o.value, codeMap),
            value: { ...o, delete: true },
            textColor: "darkred",
          });
        } else {
          buttonOptions.push({
            label: o.value,
            color: getColor(o.value, codeMap),
            value: { ...o, delete: true },
            textColor: "darkred",
          });
        }
      }
    }

    return [buttonOptions, dropdownOptions];
  };

  const asButtonSelection = (options) => {
    return (
      <>
        {settings.buttonMode === "recent" && codeHistory.length > 0 ? <b>Recent codes</b> : null}
        <ButtonSelection
          id={"newCodePageButtons"}
          active={focusOnButtons}
          setAnnotations={setAnnotations}
          options={options}
          setOpen={setOpen}
          onSelect={onSelect}
        />
      </>
    );
  };

  const asDropdownSelection = (options) => {
    if (options.length === 0) return null;

    // use searchBox if specified OR if settings are missing
    // also, if buttonmode is 'recent', always show search box
    if (settings && !settings.searchBox && settings.buttonMode !== "recent")
      return <div style={{ height: "25px" }} />;

    return (
      <Ref innerRef={textInputRef}>
        <Dropdown
          fluid
          placeholder={"<type to search>"}
          style={{
            textAlign: "center",
            color: "black",
            width: "100%",
            height: "20px",
            marginBottom: "5px",
            overflow: "visible",
            position: "relative",
          }}
          options={options}
          open={!focusOnButtons}
          search
          selectOnNavigation={false}
          minCharacters={0}
          autoComplete={"on"}
          onClick={() => setFocusOnButtons(false)}
          onSearchChange={(e, d) => {
            console.log(d.value);
            if (d.searchQuery === "") setFocusOnButtons(true);
          }}
          onClose={(e, d) => {
            setFocusOnButtons(true);
          }}
          selectOnBlur={false}
          onChange={(e, d) => {
            onSelect(d.value, e.ctrlKey);
          }}
        />
      </Ref>
    );
  };

  if (!variableMap?.[variable]) return null;

  const [buttonOptions, dropdownOptions] = getOptions();

  return (
    <>
      {asDropdownSelection(dropdownOptions)}
      {asButtonSelection(buttonOptions)}
    </>
  );
}

const getTextSnippet = (tokens, span, maxlength = 8) => {
  let text = tokens.slice(span[0], span[1] + 1).map((t) => t.pre + t.text + t.post);
  if (text.length > maxlength)
    text = [
      text.slice(0, Math.floor(maxlength / 2)).join(""),
      " ... ",
      text.slice(-Math.floor(maxlength / 2)).join(""),
    ];
  return text.join("");
};

const updateAnnotations = (tokens, annotation, setAnnotations, setCodeHistory, editMode) => {
  const [from, to] = annotation.span;
  annotation.index = tokens[from].index;
  annotation.length = tokens[to].length + tokens[to].offset - tokens[from].offset;
  annotation.span = [tokens[from].index, tokens[to].index];
  annotation.field = tokens[from].field;
  annotation.offset = tokens[from].offset;

  setAnnotations((state) =>
    toggleSpanAnnotation({ ...state }, annotation, annotation.delete, editMode)
  );

  setCodeHistory((state) => {
    if (!state?.[annotation.variable]) state[annotation.variable] = [];
    return {
      ...state,
      [annotation.variable]: [
        annotation.value,
        ...state[annotation.variable].filter((v) => v !== annotation.value),
      ],
    };
  });
};
