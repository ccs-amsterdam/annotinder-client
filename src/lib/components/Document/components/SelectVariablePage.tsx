import React, { useEffect } from "react";
import { Popup } from "semantic-ui-react";
import { getColor, getColorGradient } from "../../../functions/tokenDesign";
import { CodeSelectorOption, SetState, Span, SpanAnnotations, VariableMap } from "../../../types";
import ButtonSelection from "./ButtonSelection";

interface SelectVariablePageProps {
  variable: string;
  setVariable: SetState<string>;
  annotations: SpanAnnotations;
  span: Span;
  setOpen: SetState<boolean>;
  variableMap: VariableMap;
}

export default function SelectVariablePage({
  variable,
  setVariable,
  annotations,
  span,
  setOpen,
  variableMap,
}: SelectVariablePageProps) {
  const getOptions = (): CodeSelectorOption[] => {
    if (!span) return [];
    let variables = Object.keys(variableMap);
    const variableColors: Record<string, string> = {};
    for (let v of variables) {
      const colors: Record<string | number, string> = {};
      for (let i = span[0]; i <= span[1]; i++) {
        if (!annotations[i]) continue;
        for (let id of Object.keys(annotations[i])) {
          const a = annotations[i][id];
          if (a.variable !== v) continue;
          colors[a.value] = getColor(a.value, variableMap?.[v]?.codeMap);
        }
      }
      variableColors[v] = getColorGradient(Object.values(colors));
    }

    return variables.map((variable) => ({
      key: variable,
      color: variableColors[variable],
      label: variable,
      value: { variable },
    }));
  };

  const options = getOptions();
  useEffect(() => {
    if (options.length === 1) setVariable(options[0].value.variable);
  }, [options, setVariable]);

  if (variable || !span) return null;

  return (
    <div>
      <Popup.Header style={{ textAlign: "center" }}>Select variable</Popup.Header>
      <ButtonSelection
        id={"currentCodePageButtons"}
        active={true}
        options={options}
        onSelect={(value, ctrlKey) => {
          if (value.cancel) {
            setOpen(false);
            return;
          }
          setVariable(value.variable);
        }}
      />
    </div>
  );
}
