import React, { useCallback, useState, ReactElement, useMemo, useRef } from "react";
import AnnotationPortal from "../components/AnnotationPortal";
import { getColor, getColorGradient } from "../../../functions/tokenDesign";
import ButtonSelection from "../components/ButtonSelection";
import {
  SetState,
  Span,
  Token,
  TriggerSelector,
  Variable,
  TriggerSelectorParams,
  AnnotationLibrary,
  Doc,
  Annotation,
  CodeSelectorOption,
  CodeSelectorValue,
} from "../../../types";
import useWatchChange from "../../../hooks/useWatchChange";
import AnnotationManager from "../functions/AnnotationManager";
import standardizeColor from "../../../functions/standardizeColor";

/**
 * This hook is an absolute monster, as it takes care of a lot of moving parts.
 * Basically, everything surrounding the popups for selecting and editing codes, and updating the annotations
 * Please don't touch it untill I get around to refactoring it, and then still don't touch it unless strictly needed
 *
 * The weirdest (but nice) part is that it returns a popup component, as well as a 'trigger' function.
 * The trigger function can then be used to trigger a popup for starting a selection or edit for a given token index (position of popup)
 * and selection (which span to create/edit)
 *
 * @param {*} tokens
 * @param {*} variableMap
 * @param {*} editMode
 * @param {*} variables
 * @param {*} annotations
 * @param {*} setAnnotations
 * @param {*} codeHistory
 * @param {*} setCodeHistory
 * @returns
 */
const useSpanSelector = (
  doc: Doc,
  annotationLib: AnnotationLibrary,
  annotationManager: AnnotationManager,
  variable: Variable
): [ReactElement, TriggerSelector, boolean] => {
  const [open, setOpen] = useState(false);
  const positionRef = useRef<HTMLSpanElement>(null);
  const [span, setSpan] = useState<Span>(null);
  const [annotationOptions, setAnnotationOptions] = useState<CodeSelectorOption[]>([]);
  const tokens = doc.tokens;

  const triggerFunction = React.useCallback(
    // this function can be called to open the code selector.
    (selection: TriggerSelectorParams) => {
      if (!variable) return;
      if (selection?.index == null || selection?.from == null || selection?.to == null) return;
      if (selection.from > selection.to)
        [selection.from, selection.to] = [selection.to, selection.from];

      if (variable.editMode) {
        const options = getAnnotationOptions(annotationLib, selection.index, variable, tokens);
        if (options?.length === 0) {
          setOpen(false);
        } else if (options?.length === 1) {
          setSpan(options[0].value.span);
        } else {
          setSpan(null);
          setAnnotationOptions(options);
        }
      } else {
        setAnnotationOptions([]);
        setSpan([selection.from, selection.to]);
      }

      positionRef.current = tokens?.[selection.index]?.ref.current;
      setOpen(true);
    },
    [tokens, variable, annotationLib]
  );

  if (useWatchChange([tokens, variable])) setOpen(false);

  if (!variable) return [null, null, true];

  let popup = (
    <AnnotationPortal open={open} setOpen={setOpen} positionRef={positionRef} minY={30}>
      {span === null ? (
        <SelectAnnotationPage options={annotationOptions} setSpan={setSpan} setOpen={setOpen} />
      ) : (
        <NewCodePage // if current is known, select what the new code should be (or delete, or ignore)
          tokens={tokens}
          variable={variable}
          annotationLib={annotationLib}
          annotationManager={annotationManager}
          span={span}
          editMode={variable.editMode}
          setOpen={setOpen}
        />
      )}
    </AnnotationPortal>
  );

  if (!variable || !tokens) popup = null;

  return [popup, triggerFunction, open];
};

interface SelectAnnotationPageProps {
  options: CodeSelectorOption[];
  setSpan: SetState<Span>;
  setOpen: SetState<boolean>;
}

const SelectAnnotationPage = ({ options, setSpan, setOpen }: SelectAnnotationPageProps) => {
  const onButtonSelection = React.useCallback(
    (value: CodeSelectorValue, ctrlKey: boolean) => {
      if (value.cancel) {
        setOpen(false);
        return;
      }
      setSpan(value.span);
    },
    [setSpan, setOpen]
  );
  if (options === null || options.length === 0) return null;

  return (
    <div>
      <h5 style={{ textAlign: "center" }}>Select annotation</h5>
      <ButtonSelection
        id={"currentCodePageButtons"}
        options={options}
        onSelect={onButtonSelection}
      />
    </div>
  );
};

interface NewCodepageProps {
  tokens: Token[];
  variable: Variable;
  annotationLib: AnnotationLibrary;
  annotationManager: AnnotationManager;
  editMode: boolean;
  span: Span;
  setOpen: SetState<boolean>;
}

const NewCodePage = ({
  tokens,
  variable,
  annotationLib,
  annotationManager,
  editMode,
  span,
  setOpen,
}: NewCodepageProps) => {
  const onSelect = useCallback(
    (value: CodeSelectorValue, ctrlKey = false) => {
      if (value.cancel) {
        setOpen(false);
      } else if (value.delete) {
        const keepEmpty = editMode;
        annotationManager.rmAnnotation(value.id, keepEmpty);
      } else {
        annotationManager.createSpanAnnotation(value.code, span[0], span[1], tokens);
      }
      if (!variable?.multiple && !ctrlKey) {
        setOpen(false);
      }
    },
    [annotationManager, setOpen, tokens, span, variable, editMode]
  );

  const options = useMemo(() => {
    const options: CodeSelectorOption[] = [];
    const codeMap = variable?.codeMap;

    if (!codeMap || !span) return options;

    let existing: Annotation[] = [];
    const doneId: Record<string, boolean> = {};
    for (let i = span[0]; i <= span[1]; i++) {
      const annotationIds = annotationLib.byToken[i] || [];
      for (let id of annotationIds) {
        if (doneId[id]) continue;
        doneId[id] = true;
        const a = { ...annotationLib.annotations[id] };
        if (a.variable !== variable.name) continue;
        if (a.value === "EMPTY") continue;
        //if (!codeMap[a.value]) continue;
        existing.push(a);
      }
    }

    if (Object.keys(codeMap).length === 1) {
      // auto code if only one option is available
      const value = Object.values(codeMap)[0];
      const nonEmpty = existing.filter((e) => e.value !== "EMPTY");
      if (nonEmpty.length === 0) {
        // If there is only one option (which only happens if there is only 1 possible value and nothing that can be deleted), select it automatically
        setTimeout(() => onSelect({ span, value, delete: false }), 0);
        setOpen(false);
      }
      if (editMode && nonEmpty.length === 1 && value === nonEmpty[0].value) {
        setTimeout(() => onSelect({ span, value, delete: true }), 0);
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
        //if (!codeMap[o.value]) continue;

        options.push({
          tag: o.value,
          label: '"' + getTextSnippet(tokens, o.span) + '"',
          color: standardizeColor(o.color),
          value: { id: o.id, delete: true },
          textColor: "var(--red)",
        });
      }
    }

    return options;
  }, [annotationLib, span, tokens, variable, editMode, onSelect, setOpen]);

  if (options.length === 0) return null;

  return (
    <>
      {/* TODO: Used to be Header, but typescript doesn't seem to get along with semantic react */}
      <h5 style={{ textAlign: "center" }}>"{getTextSnippet(tokens, span)}"</h5>
      {/* {asDropdownSelection(dropdownOptions)} */}
      <ButtonSelection id={"newCodePageButtons"} options={options} onSelect={onSelect} />{" "}
    </>
  );
};

const getAnnotationOptions = (
  annotationLib: AnnotationLibrary,
  index: number,
  variable: Variable,
  tokens: Token[]
): CodeSelectorOption[] => {
  const variableSpans: any = {};

  const annotationIds = annotationLib.byToken[index] || [];
  for (let id of annotationIds) {
    const annotation = annotationLib.annotations[id];
    const codeMap = variable?.codeMap;
    if (!codeMap) continue;

    const span = annotation.span;
    const key = annotation.variable + ":" + span[0] + "-" + span[1];
    const label = '"' + getTextSnippet(tokens, span) + '"';
    const color = getColor(annotation.value, codeMap);
    if (!variableSpans[key]) {
      variableSpans[key] = {
        tag: annotation.variable,
        label,
        colors: [color],
        value: {
          variable: annotation.variable,
          span: annotation.span,
        },
      };
    } else {
      variableSpans[key].colors.push(color);
    }
  }

  return Object.keys(variableSpans).map((key) => {
    return {
      ...variableSpans[key],
      color: getColorGradient(variableSpans[key].colors),
    };
  });
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
      " ... ",
      text.slice(-Math.floor(maxlength / 2)).join(""),
    ];
  return text.join("");
};

export default useSpanSelector;
