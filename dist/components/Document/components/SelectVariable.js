"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.string.includes.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const SelectVariable = _ref => {
  let {
    variables,
    variable,
    setVariable,
    minHeight,
    editAll
  } = _ref;
  const variableNames = (0, _react.useMemo)(() => {
    let variableNames = [];

    if (variables != null && (variables === null || variables === void 0 ? void 0 : variables.length) > 0) {
      variableNames = variables.map(v => v.name);
      if (editAll) variableNames.push("EDIT ALL");
    }

    return variableNames;
  }, [variables, editAll]);

  const onKeyDown = e => {
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

    const currentIndex = variableNames.findIndex(name => name === variable);
    let newIndex = currentIndex + move;
    if (newIndex > variableNames.length - 1) newIndex = 0;
    if (newIndex < 0) newIndex = variableNames.length - 1;
    setVariable(variableNames[newIndex]);
  };

  (0, _react.useEffect)(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });
  (0, _react.useEffect)(() => {
    if (variable === null) setVariable(variableNames[0]);

    if (!variables || variables.length === 0) {
      setVariable(null);
      return null;
    }
  }, [variable, variables, setVariable, variableNames]); //if (!variables) return null;

  let helpText = null;

  if (variables) {
    const variableObj = variables.find(v => v.name === variable);
    helpText = variableObj === null || variableObj === void 0 ? void 0 : variableObj.instruction;
  }

  if (variable === "EDIT ALL") helpText = "Show and edit all variables";
  return /*#__PURE__*/_react.default.createElement("div", {
    style: {
      background: "#1277c469",
      borderBottomLeftRadius: "10px",
      borderBottomRightRadius: "10px",
      borderTop: "2px solid #2185d0",
      textAlign: "center"
    }
  }, /*#__PURE__*/_react.default.createElement(VariableButtons, {
    variable: variable,
    setVariable: setVariable,
    variables: variables,
    variableNames: variableNames,
    minHeight: minHeight
  }), /*#__PURE__*/_react.default.createElement("p", {
    style: {
      margin: "0",
      padding: "2px",
      minHeight: "24px"
    }
  }, helpText));
};

const VariableButtons = _ref2 => {
  let {
    variable,
    setVariable,
    variables,
    variableNames,
    minHeight
  } = _ref2;

  const mapVariables = () => {
    return variableNames.map(name => {
      return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
        key: name,
        primary: true,
        active: name === variable,
        style: {
          padding: "0",
          border: "1px solid",
          color: name === variable ? "black" : "white"
        },
        onClick: () => setVariable(name)
      }, name);
    });
  };

  (0, _react.useEffect)(() => {
    if (!variables) return null;

    if (variables.length === 1) {
      setVariable(variables[0].name);
      return null;
    }

    if (!variableNames.includes(variable)) setVariable(variableNames[0]);
  }, [variables, setVariable, variableNames, variable]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button.Group, {
    attached: "bottom",
    fluid: true,
    style: {
      minHeight: "".concat(minHeight / 2, "px")
    }
  }, mapVariables()));
};

var _default = SelectVariable;
exports.default = _default;