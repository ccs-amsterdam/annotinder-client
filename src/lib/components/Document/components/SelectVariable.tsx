import React, { useEffect, useMemo } from "react";
import { Menu, Segment } from "semantic-ui-react";
import { Variable, SetState } from "../../../types";

interface SelectVariableProps {
  variables: Variable[];
  variable: string;
  setVariable: SetState<string>;
  editAll: boolean;
}

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
      <Segment
        attached="bottom"
        style={{
          background: "var(--primary)",
          margin: "0",
          padding: "3px",
          color: "var(--text-inversed)",
        }}
      >
        {helpText}
      </Segment>
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
  const mapVariables = () => {
    return variableNames.map((name) => {
      return (
        <Menu.Item
          key={name}
          active={name === variable}
          style={{
            flex: "1 1 auto",
            padding: "0 3px",
            wordWrap: "break-word",
            fontSize: "1.2em",
            fontWeight: "bold",
            background: name === variable ? "#var(--primary)" : "var(--primary-light)",
            color: name === variable ? "var(--text-inversed)" : "var(--text)",
          }}
          onClick={() => setVariable(name)}
        >
          <span style={{ textAlign: "center", width: "100%" }}>{name}</span>
        </Menu.Item>
      );
    });
  };

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
    <Menu
      attached="top"
      tabular
      compact
      size="mini"
      style={{ width: "100%", display: "flex", justifyContent: "space-between" }}
    >
      {mapVariables()}
    </Menu>
  );
};

export default React.memo(SelectVariable);
