import React, { useEffect, useMemo } from "react";
import { Button } from "semantic-ui-react";

const SelectVariable = ({ variables, variable, setVariable, editAll }) => {
  const variableNames = useMemo(() => {
    let variableNames = [];
    if (variables != null && variables?.length > 0) {
      variableNames = variables.map((v) => v.name);
      if (editAll) variableNames.push("EDIT ALL");
    }
    return variableNames;
  }, [variables, editAll]);

  const onKeyDown = (e) => {
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

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  useEffect(() => {
    if (variable === null) setVariable(variableNames[0]);
    if (!variables || variables.length === 0) {
      setVariable(null);
      return null;
    }
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
        background: "#1277c469",
        //borderBottomLeftRadius: "10px",
        //borderBottomRightRadius: "10px",
        border: "2px solid black",
        fontSize: "1.2em",
        textAlign: "center",
      }}
    >
      <VariableButtons
        variable={variable}
        setVariable={setVariable}
        variables={variables}
        variableNames={variableNames}
      />
      <p
        style={{
          margin: "0",
          padding: "2px",
          minHeight: "24px",
        }}
      >
        {helpText}
      </p>
    </div>
  );
};

const VariableButtons = ({ variable, setVariable, variables, variableNames }) => {
  const mapVariables = () => {
    return variableNames.map((name) => {
      return (
        <Button
          key={name}
          primary
          active={name === variable}
          style={{
            padding: "5px",
            border: "1px solid",
            color: name === variable ? "black" : "white",
          }}
          onClick={() => setVariable(name)}
        >
          {name}
        </Button>
      );
    });
  };

  useEffect(() => {
    if (!variables) return null;
    if (variables.length === 1) {
      setVariable(variables[0].name);
      return null;
    }
    if (!variableNames.includes(variable)) setVariable(variableNames[0]);
  }, [variables, setVariable, variableNames, variable]);

  if (variableNames?.length === 1) return null;
  return (
    <>
      <Button.Group attached="bottom" fluid>
        {mapVariables()}
      </Button.Group>
    </>
  );
};

export default React.memo(SelectVariable);
