import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { Variable, SetState } from "../../../types";

interface SelectVariableProps {
  variables: Variable[];
  variable: string;
  setVariable: SetState<string>;
  editAll: boolean;
}

const SelectVariableContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--background-inversed);
  padding: 5px 5px 3px 5px;
  background: var(--primary);
  color: var(--text-inversed-fixed);
  z-index: 1;

  .Description {
    margin: auto;
    padding-bottom: 0.4rem;

    .Variable {
      border: 2px solid white;
      border-radius: 5px;
      font-size: 1.2em;
      margin-right: 0.5rem;
      padding: 0.1rem 0.7rem;
    }
  }
`;

const VariableButtons = styled.div`
  display: flex;
  word-wrap: break-word;
  font-size: 1.2em;
  justify-content: center;
`;

const VariableButton = styled.button`
  margin: 0 0.2rem 0.4rem 0.2rem;
  padding: 0.1rem 0.7rem;
  background: var(--primary);
  border-radius: 5px;
  border: 2px solid inherit;
  color: var(--primary-verylight);

  cursor: pointer;

  &:hover {
    border: 2px solid white;
    background: var(--primary);
    color: white;
  }
  &.active {
    display: none;
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
    <SelectVariableContainer>
      <VariableMenu
        variable={variable}
        setVariable={setVariable}
        variables={variables}
        variableNames={variableNames}
      />
      <div className="Description">
        <span className="Variable">{variable || ""}</span> {helpText}{" "}
      </div>
    </SelectVariableContainer>
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
    <VariableButtons>
      {variableNames.map((name) => {
        return (
          <VariableButton
            key={name}
            className={name === variable ? "active" : ""}
            onClick={() => setVariable(name)}
          >
            {name}
          </VariableButton>
        );
      })}
    </VariableButtons>
  );
};

export default React.memo(SelectVariable);
