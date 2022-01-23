import React from "react";
import { Popup } from "semantic-ui-react";
import { getColor, getColorGradient } from "../../../functions/tokenDesign";
import ButtonSelection from "./ButtonSelection";

export default function SelectAnnotationPage({
  tokens,
  variable,
  setVariable,
  annotations,
  span,
  setSpan,
  setOpen,
  variableMap,
}) {
  const onButtonSelection = (value, ctrlKey) => {
    if (value === "CANCEL") {
      setOpen(false);
      return;
    }
    setSpan(value.span);
    setVariable(value.variable);
    //setExisting(value.annotations);
  };

  const getAnnotationOptions = () => {
    // create an array of spans, where key is the text, and
    const variableSpans = {};

    for (let i = span[0]; i <= span[1]; i++) {
      if (!annotations[i]) continue;
      for (let id of Object.keys(annotations[i])) {
        const annotation = annotations[i][id];
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
      return { ...variableSpans[key], color: getColorGradient(variableSpans[key].colors) };
    });
  };

  if (variable || !span) return null;

  const options = getAnnotationOptions();
  if (options.length === 0) setOpen(false);
  if (options.length === 1) {
    onButtonSelection(options[0].value);
  }

  return (
    <div>
      <Popup.Header style={{ textAlign: "center" }}>Select annotation</Popup.Header>
      <ButtonSelection
        id={"currentCodePageButtons"}
        active={true}
        options={options}
        setOpen={setOpen}
        onSelect={onButtonSelection}
      />
    </div>
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
