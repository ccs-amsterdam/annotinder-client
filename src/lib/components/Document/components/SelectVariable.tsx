import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { Variable, SetState } from "../../../types";

interface SelectVariableProps {
  variables: Variable[];
  variable: string;
  setVariable: SetState<string>;
  editAll: boolean;
}

const StyledDiv = styled.div<{ description: boolean }>`
  //border-bottom: 1px solid var(--primary);
  border-radius: 3px;
  position: relative;
  flex: 1 1 auto;
  background: var(--primary);

  &::after {
    content: "";
    position: absolute;
    bottom: 10;
    width: calc(100% - 1rem); // 1rem for the scrollbar
    height: 1rem;
    background: linear-gradient(var(--background), transparent 70%);
    //backdrop-filter: blur(5px);
    z-index: 1000;
  }

  .Description {
    //margin: auto;
    //background: var(--secondary);
    color: white;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    font-size: 1.4rem;
    text-align: center;
    padding: 0rem 1rem 0.5rem 1rem;

    .Text {
      max-height: ${(p) => (p.description ? "5rem" : "0rem")};
      overflow: auto;

      transition: max-height 0.4s;
    }

    .ShowDescription {
      //margin: auto;
      cursor: pointer;
    }
  }

  .VariableButtons {
    display: flex;
    //border-top: 1px solid var(--background-fixed);
    //border-bottom: 1px solid var(--background-fixed);
    //border-radius: 2px;

    //background: var(--primary-dark);
    color: var(--text-inversed-fixed);
    position: relative;
    z-index: 10000;
    display: flex;
    word-wrap: break-word;
    font-size: 1.6rem;
    justify-content: center;
    padding: 0.5rem 1rem;
    gap: 1rem;

    button {
      flex: 0 1 auto;
      padding: 0.4rem 0.7rem;
      background: var(--primary);
      border-radius: 4px;
      border: 1px solid var(--primary-light);
      color: var(--primary-light);

      cursor: pointer;

      &:hover,
      &.active {
        border: 2px solid white !important;
        color: white;
      }
    }
  }
`;

const SelectVariable = ({ variables, variable, setVariable, editAll }: SelectVariableProps) => {
  //const [showDescription, setShowDescription] = React.useState(true);
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
      if (move === 0) return;

      const currentIndex = variableNames.findIndex((name) => name === variable);
      let newIndex = currentIndex + move;
      if (newIndex > variableNames.length - 1) newIndex = 0;
      if (newIndex < 0) newIndex = variableNames.length - 1;
      setVariable(variableNames[newIndex]);
    };

    // const onMouseDown = (e: MouseEvent) => {
    //   console.log(e);
    //   let move = 0;
    //   if (e.button === 2) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     move = e.shiftKey ? -1 : 1;
    //   }
    //   if (move === 0) return;

    //   const currentIndex = variableNames.findIndex((name) => name === variable);
    //   let newIndex = currentIndex + move;
    //   if (newIndex > variableNames.length - 1) newIndex = 0;
    //   if (newIndex < 0) newIndex = variableNames.length - 1;
    //   setVariable(variableNames[newIndex]);
    // };

    window.addEventListener("keydown", onKeyDown);
    //window.addEventListener("contextmenu", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      //window.removeEventListener("contextmenu", onMouseDown);
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
    <StyledDiv description={true}>
      <VariableMenu
        variable={variable}
        setVariable={setVariable}
        variables={variables}
        variableNames={variableNames}
      />
      <div className="Description">
        <div className="Text">{helpText}</div>
        {/* <div className="ShowDescription" onClick={() => setShowDescription(!showDescription)}>
          {showDescription ? "hide task" : "show task"}
        </div> */}
      </div>
    </StyledDiv>
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
    <div className="VariableButtons">
      {variableNames.map((name) => {
        return (
          <button
            key={name}
            className={name === variable ? "active" : ""}
            onClick={() => setVariable(name)}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(SelectVariable);
