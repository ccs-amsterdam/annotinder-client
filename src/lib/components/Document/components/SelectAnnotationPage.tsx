import React, { useEffect, useMemo } from "react";
import { Popup } from "semantic-ui-react";
import { getColor, getColorGradient } from "../../../functions/tokenDesign";
import {
  AnnotationLibrary,
  CodeSelectorOption,
  CodeSelectorValue,
  SetState,
  Span,
  Token,
  VariableMap,
} from "../../../types";
import ButtonSelection from "./ButtonSelection";

interface SelectAnnotationPageProps {
  tokens: Token[];
  variable: string;
  setVariable: SetState<string>;
  annotationLib: AnnotationLibrary;
  span: Span;
  setSpan: SetState<Span>;
  setOpen: SetState<boolean>;
  variableMap: VariableMap;
}

const SelectAnnotationPage = ({
  tokens,
  variable,
  setVariable,
  annotationLib,
  span,
  setSpan,
  setOpen,
  variableMap,
}: SelectAnnotationPageProps) => {
  const onButtonSelection = React.useCallback(
    (value: CodeSelectorValue, ctrlKey: boolean) => {
      if (value.cancel) {
        setOpen(false);
        return;
      }
      setSpan(value.span);
      setVariable(value.variable);
    },
    [setSpan, setVariable, setOpen]
  );

  const options = useMemo(() => {
    return getAnnotationOptions(annotationLib, span, variableMap, tokens);
  }, [annotationLib, span, variableMap, tokens]);

  useEffect(() => {
    if (options?.length === 0) setOpen(false);
    if (options?.length === 1) {
      onButtonSelection(options[0].value, false);
    }
  }, [options, setOpen, onButtonSelection]);

  if (variable || !span || options === null) return null;

  return (
    <div>
      <Popup.Header style={{ textAlign: "center" }}>Select annotation</Popup.Header>
      <ButtonSelection
        id={"currentCodePageButtons"}
        active={true}
        options={options}
        onSelect={onButtonSelection}
      />
    </div>
  );
};

const getTextSnippet = (tokens: Token[], span: Span, maxlength = 8) => {
  let text = tokens.slice(span[0], span[1] + 1).map((t) => t.pre + t.text + t.post);
  if (text.length > maxlength)
    text = [
      text.slice(0, Math.floor(maxlength / 2)).join(""),
      " ... ",
      text.slice(-Math.floor(maxlength / 2)).join(""),
    ];
  return text.join("");
};

const getAnnotationOptions = (
  annotationLib: AnnotationLibrary,
  span: Span,
  variableMap: VariableMap,
  tokens: Token[]
): CodeSelectorOption[] => {
  const variableSpans: any = {};

  for (let i = span[0]; i <= span[1]; i++) {
    const annotationIds = annotationLib.byToken[i] || [];
    for (let id of annotationIds) {
      const annotation = annotationLib.annotations[id];
      const codeMap = variableMap?.[annotation.variable]?.codeMap;
      if (!variableMap[annotation.variable]) continue;
      if (!codeMap?.[annotation.value] && annotation.value !== "EMPTY") continue;

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
            //annotations: [annotation],
            variable: annotation.variable,
            span: annotation.span,
          },
        };
      } else {
        variableSpans[key].colors.push(color);
        //variableSpans[key].value.annotations.push(annotation);
      }
    }
  }

  return Object.keys(variableSpans).map((key) => {
    return {
      ...variableSpans[key],
      color: getColorGradient(variableSpans[key].colors),
    };
  });
};

export default React.memo(SelectAnnotationPage);
