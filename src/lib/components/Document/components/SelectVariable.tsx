import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { Variable, SetState } from "../../../types";

interface SelectVariableProps {
  variables: Variable[];
  variable: string;
  setVariable: SetState<string>;
  editAll: boolean;
}

const TaskDescription = styled.div`
  border: 1px solid var(--background-inversed);
  padding: 10px 5px 3px 5px;
  background: var(--primary);
  color: var(--text-inversed-fixed);
  z-index: 1;
`;

const VariableButtons = styled.div`
  display: flex;
  margin-bottom: -2px;
  z-index: 2;
  word-wrap: break-word;
  font-size: 1.2em;
  font-weight: bold;
  width: 100%;

  & div {
    padding: 0.4em 1em 0.2em 1em;
    border: 1px solid var(--background-inversed);
    border-left: 0px;
    width: 100%;
  }
  &:first-child {
    border-left: 1px solid var(--background-inversed);
  }
  & .selected {
    background: var(--primary);
    color: var(--text-inversed-fixed);
    border-bottom: 0px;
  }
`;

const SelectVariable = ({ variables, variable, setVariable, editAll }: SelectVariableProps) => {
  const variableNames: string[] = useMemo(() => {
    let variableNames: string[] = [];
    if (variables != null && variables?.length > 0) {
      variableNames = variables.map((v) => v.name);
      if (editAll) variableNames.push("EDIT ALL");
    }
    return variableNames;
  }, [variables, editAll]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      let move = 0;
      if (e.keyCode === 9) {
        e.preventDefault();
        if (e.shiftKey) {
          if (!e.repeat) {
            move = -1;
          }
        } else {
          if (!e.repeat) {
            move = 1;
          }
        }
      }

      const currentIndex = variableNames.findIndex((name) => name === variable);
      let newIndex = currentIndex + move;
      if (newIndex > variableNames.length - 1) newIndex = 0;
      if (newIndex < 0) newIndex = variableNames.length - 1;
      setVariable(variableNames[newIndex]);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [setVariable, variable, variableNames]);

  useEffect(() => {
    if (variable === null) setVariable(variableNames[0]);
    if (!variables || variables.length === 0) setVariable(null);
  }, [variable, variables, setVariable, variableNames]);

  if (!variables) return null;
  let helpText = null;
  if (variables) {
    const variableObj = variables.find((v) => v.name === variable);
    helpText = variableObj?.instruction;
  }
  if (variable === "EDIT ALL") helpText = "Show and edit all variables";

  return (
    <div
      style={{
        //background: "#1277c469",
        textAlign: "center",
        width: "100%",
      }}
    >
      <VariableMenu
        variable={variable}
        setVariable={setVariable}
        variables={variables}
        variableNames={variableNames}
      />
      <TaskDescription>{helpText} </TaskDescription>
    </div>
  );
};

interface VariableMenuProps {
  variable: string;
  setVariable: SetState<string>;
  variables: Variable[];
  variableNames: string[];
}

const VariableMenu = ({ variable, setVariable, variables, variableNames }: VariableMenuProps) => {
  useEffect(() => {
    if (!variables) return;
    if (variable && variables.length === 1) {
      setVariable(variables[0].name);
      return;
    }
    if (!variableNames.includes(variable)) setVariable(variableNames[0]);
  }, [variables, setVariable, variableNames, variable]);

  if (variableNames?.length === 1) return null;
  return (
    <VariableButtons style={{}}>
      {variableNames.map((name) => {
        return (
          <div
            key={name}
            className={name === variable ? "selected" : ""}
            onClick={() => setVariable(name)}
          >
            <span style={{ textAlign: "center", width: "100%" }}>{name}</span>
          </div>
        );
      })}
    </VariableButtons>
  );
};

export default React.memo(SelectVariable);
