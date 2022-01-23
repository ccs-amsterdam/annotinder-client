import React, { useEffect } from "react";
import { Popup } from "semantic-ui-react";
import { getColor, getColorGradient } from "../../../functions/tokenDesign";
import ButtonSelection from "./ButtonSelection";

export default function SelectVariablePage({
  variable,
  setVariable,
  annotations,
  span,
  setOpen,
  variableMap,
}) {
  const getOptions = () => {
    let variables = Object.keys(variableMap);
    const variableColors = {};
    for (let v of variables) {
      const colors = {};
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
      color: variableColors[variable],
      label: variable,
      value: variable,
    }));
  };

  const options = getOptions();
  useEffect(() => {
    if (options.length === 1) setVariable(options[0].value);
  }, [options, setVariable]);

  if (variable || !span) return null;

  return (
    <div>
      <Popup.Header style={{ textAlign: "center" }}>Select variable</Popup.Header>
      <ButtonSelection
        id={"currentCodePageButtons"}
        active={true}
        options={options}
        setOpen={setOpen}
        onSelect={(value, ctrlKey) => {
          if (value === "CANCEL") {
            setOpen(false);
            return;
          }
          setVariable(value);
        }}
      />
    </div>
  );
}
