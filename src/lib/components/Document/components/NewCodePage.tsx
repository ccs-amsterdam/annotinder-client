import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getColor } from "../../../functions/tokenDesign";
import ButtonSelection from "./ButtonSelection";
import {
  Span,
  Annotation,
  VariableMap,
  SetState,
  Token,
  CodeSelectorValue,
  CodeSelectorOption,
  AnnotationLibrary,
} from "../../../types";
import AnnotationManager from "../functions/AnnotationManager";

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

interface NewCodepageProps {
  tokens: Token[];
  variable: string;
  variableMap: VariableMap;
  annotationLib: AnnotationLibrary;
  annotationManager: AnnotationManager;
  editMode: boolean;
  span: Span;
  setOpen: SetState<boolean>;
}

const NewCodePage = ({
  tokens,
  variable,
  variableMap,
  annotationLib,
  annotationManager,
  editMode,
  span,
  setOpen,
}: NewCodepageProps) => {
  const textInputRef = useRef(null);
  const [focusOnButtons, setFocusOnButtons] = useState(true);
  const settings = variableMap[variable];

  const onSelect = useCallback(
    (value: CodeSelectorValue, ctrlKey = false) => {
      if (value.cancel) {
        setOpen(false);
      } else if (value.delete) {
        annotationManager.rmAnnotation(value.id);
      } else {
        annotationManager.createSpanAnnotation(value.code, span[0], span[1], tokens);
      }
      if (!variableMap?.[variable]?.multiple && !ctrlKey) {
        setOpen(false);
      }
    },
    [annotationManager, editMode, setOpen, tokens, span, variableMap, variable]
  );

  useEffect(() => {
    function onKeydown(event: KeyboardEvent) {
      if (settings && !settings.searchBox && settings.buttonMode === "all") return null;
      const focusOnTextInput = textInputRef?.current?.children[0] === document.activeElement;
      if (!focusOnTextInput) setFocusOnButtons(true);
      if (event.keyCode === 27) setOpen(false);
      if (arrowKeys.includes(event.key)) return null;
      if (event.keyCode <= 46 || event.keyCode >= 106) return null;
      if (textInputRef.current) textInputRef.current.click();
      setFocusOnButtons(false);
    }

    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [textInputRef, setOpen, settings]);

  const options = useMemo(() => {
    const options: CodeSelectorOption[] = [];
    const codeMap = variableMap?.[variable]?.codeMap;
    if (!codeMap) return options;

    let existing: Annotation[] = [];
    const doneId: Record<string, boolean> = {};
    for (let i = span[0]; i <= span[1]; i++) {
      const annotationIds = annotationLib.byToken[i] || [];
      for (let id of annotationIds) {
        if (doneId[id]) continue;
        doneId[id] = true;
        const a = { ...annotationLib.annotations[id] };
        if (a.variable !== variable) continue;
        if (!codeMap[a.value]) continue;
        existing.push(a);
      }
    }

    if (Object.keys(codeMap).length === 1) {
      // auto code if only one option is available
      const value = Object.values(codeMap)[0];
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
    }

    const existingValues = new Set(existing.map((e) => e.value));
    for (let code of Object.values(codeMap)) {
      if (existingValues.has(code.code)) continue;

      options.push({
        label: code.code,
        value: { code, delete: false },
        color: getColor(code.code, codeMap),
      });
    }

    if (existing && existing.length > 0) {
      for (let o of existing) {
        if (!codeMap[o.value]) continue;

        options.push({
          tag: o.value,
          label: '"' + getTextSnippet(tokens, o.span) + '"',
          color: getColor(o.value, codeMap),
          value: { id: o.id, delete: true },
          textColor: "var(--red)",
        });
      }
    }

    return options;
  }, [annotationLib, span, tokens, variable, variableMap, editMode, onSelect, setOpen]);

  if (options.length === 0) return null;

  return (
    <>
      {/* TODO: Used to be Header, but typescript doesn't seem to get along with semantic react */}
      <h5 style={{ textAlign: "center" }}>"{getTextSnippet(tokens, span)}"</h5>
      {/* {asDropdownSelection(dropdownOptions)} */}
      <ButtonSelection
        id={"newCodePageButtons"}
        active={focusOnButtons}
        options={options}
        onSelect={onSelect}
      />{" "}
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

export default React.memo(NewCodePage);
