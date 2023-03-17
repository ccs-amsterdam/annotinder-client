import React, { useState, useEffect, useRef } from "react";
import { Dropdown, Ref } from "semantic-ui-react";
import { createId } from "../functions/annotations";
import { getColor } from "../../../functions/tokenDesign";
import ButtonSelection from "./ButtonSelection";
import {
  CodeHistory,
  Span,
  Annotation,
  SpanAnnotations,
  VariableMap,
  SetState,
  Token,
  CodeSelectorValue,
  CodeSelectorOption,
  CodeSelectorDropdownOption,
  CodeMap,
} from "../../../types";
import AnnotationManager from "../functions/AnnotationManager";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

interface NewCodepageProps {
  tokens: Token[];
  variable: string;
  variableMap: VariableMap;
  annotations: SpanAnnotations;
  annotationManager: AnnotationManager;
  editMode: boolean;
  span: Span;
  setOpen: SetState<boolean>;
  codeHistory: CodeHistory;
}

const NewCodePage = ({
  tokens,
  variable,
  variableMap,
  annotations,
  annotationManager,
  editMode,
  span,
  setOpen,
  codeHistory,
}: NewCodepageProps) => {
  const textInputRef = useRef(null);
  const [focusOnButtons, setFocusOnButtons] = useState(true);
  const settings = variableMap[variable];

  const onKeydown = React.useCallback(
    (event: KeyboardEvent) => {
      if (settings && !settings.searchBox && settings.buttonMode === "all") return null;
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

  const getExistingAnnotations = (variable: string): Annotation[] => {
    let annMap: any = {};

    for (let i = span[0]; i <= span[1]; i++) {
      if (annotations?.[i]) {
        for (let id of Object.keys(annotations[i])) {
          const a = { ...annotations[i][id] };

          // In editmode, use the original span so that the full annotation is replaced/removed.
          // In open annotation mode, only edit the span of the current selection
          if (!editMode) a.span = span;

          if (a.variable !== variable) continue;
          const annId = a.span[0] + "_" + id;
          annMap[annId] = { id, ...a };
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

  const onSelect = (value: CodeSelectorValue, ctrlKey = false) => {
    if (value.cancel) {
      setOpen(false);
      return;
    }

    updateSpanAnnotations(tokens, value, annotationManager, editMode);
    if (!variableMap?.[variable]?.multiple && !ctrlKey) {
      setOpen(false);
    }
  };

  const autoCode = (codeMap: CodeMap, existing: Annotation[]): void => {
    const codes = Object.keys(codeMap);
    if (codes.length !== 1) return;

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

  const getOptions = (): [CodeSelectorOption[], CodeSelectorDropdownOption[]] => {
    const existing: Annotation[] = getExistingAnnotations(variable);
    const buttonOptions: CodeSelectorOption[] = [];
    const dropdownOptions: CodeSelectorDropdownOption[] = [];
    const codeMap = variableMap?.[variable]?.codeMap;
    autoCode(codeMap, existing);

    const existingValues = new Set(existing.map((e) => e.value));
    for (let code of Object.keys(codeMap)) {
      if (existingValues.has(code)) continue;

      if (settings && settings.buttonMode === "all")
        buttonOptions.push({
          label: code,
          value: { variable, value: code, span, delete: false },
          color: getColor(code, codeMap),
        });

      let tree = codeMap[code].tree.join(" - ");

      dropdownOptions.push({
        value: code,
        fullvalue: { variable, value: code, span, delete: false },
        text: code + " " + tree,
        content: (
          <>
            {code}
            <br />
            <span style={{ color: "var(--text-light)" }}>{tree}</span>
          </>
        ),
      });
    }

    // use 'recent' mode if specified, or if settings are missing
    if (!settings || settings.buttonMode === "recent") {
      let nRecent = 9;
      for (let code of codeHistory[variable] || []) {
        if (nRecent < 0) break;
        if (!codeMap[code]) continue;
        buttonOptions.push({
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

        const multiple = existing.find((e) => {
          return createId(e) !== createId(o) && e.value === o.value;
        });
        if (multiple) {
          // if multiple, add text snippet as label (and move code to tag) to disambiguate,
          buttonOptions.push({
            tag: o.value,
            label: '"' + getTextSnippet(tokens, o.span) + '"',
            color: getColor(o.value, codeMap),
            value: { ...o, delete: true },
            textColor: "var(--red)",
          });
        } else {
          buttonOptions.push({
            label: o.value,
            color: getColor(o.value, codeMap),
            value: { ...o, delete: true },
            textColor: "var(--red)",
          });
        }
      }
    }

    return [buttonOptions, dropdownOptions];
  };

  const asButtonSelection = (options: CodeSelectorOption[]) => {
    return (
      <>
        {settings?.buttonMode !== "all" &&
        codeHistory[variable] &&
        codeHistory[variable].length > 0 ? (
          <b>Recent codes</b>
        ) : null}
        <ButtonSelection
          id={"newCodePageButtons"}
          active={focusOnButtons}
          options={options}
          onSelect={onSelect}
        />
      </>
    );
  };

  const asDropdownSelection = (options: CodeSelectorDropdownOption[]) => {
    if (options.length === 0) return null;

    // use searchBox if specified OR if settings are missing
    // if buttonmode is 'recent', always show search box
    if (settings && !settings.searchBox && settings.buttonMode !== "recent") return null;

    return (
      <Ref innerRef={textInputRef}>
        <Dropdown
          fluid
          placeholder={"<type to search>"}
          style={{
            textAlign: "center",
            color: "var(--text)",
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
            if (d.searchQuery === "") setFocusOnButtons(true);
          }}
          onClose={(e, d) => {
            setFocusOnButtons(true);
          }}
          selectOnBlur={false}
          onChange={(e, d) => {
            // TODO: Typescript is again very sad. Should check whether e.ctrlKey and e.altKey really cannot exist on this event
            // of if its just some obscure type thing
            for (let o of options) {
              if (o.value !== d.value) continue;
              onSelect(o.fullvalue, false);
              break;
            }
            //onSelect(d.value, e.ctrlKey || e.altKey);
          }}
        />
      </Ref>
    );
  };

  if (!variableMap?.[variable]) return null;

  const [buttonOptions, dropdownOptions] = getOptions();

  return (
    <>
      {/* TODO: Used to be Header, but typescript doesn't seem to get along with semantic react */}
      <h5 style={{ textAlign: "center" }}>"{getTextSnippet(tokens, span)}"</h5>
      {asDropdownSelection(dropdownOptions)}
      {asButtonSelection(buttonOptions)}
    </>
  );
};

const getTextSnippet = (tokens: Token[], span: Span, maxlength = 12) => {
  let text = tokens.slice(span[0], span[1] + 1).map((t, i) => {
    if (i === 0) return t.text + t.post;
    if (i === span[1] - span[0]) return t.pre + t.text;
    return t.pre + t.text + t.post;
  });
  if (text.length > maxlength)
    text = [
      text.slice(0, Math.floor(maxlength / 2)).join(""),
      " ...... ",
      text.slice(-Math.floor(maxlength / 2)).join(""),
    ];
  return text.join("");
};

const updateSpanAnnotations = (
  tokens: Token[],
  value: CodeSelectorValue,
  annotationManager: AnnotationManager,
  editMode: boolean
) => {
  const [from, to] = value.span;
  const annotation: Annotation = {
    type: "span",
    variable: value.variable,
    value: value.value as string | number,
    span: value.span,
    index: tokens[from].index,
    offset: tokens[from].offset,
    length: tokens[to].length + tokens[to].offset - tokens[from].offset,
    field: tokens[from].field,
  };

  annotationManager.updateSpanAnnotations(annotation, value.delete, editMode);
};

export default React.memo(NewCodePage);
