"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.json.stringify.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

var _AnnotateTable = _interopRequireDefault(require("./AnnotateTable"));

var _Document = _interopRequireDefault(require("../../Document/Document"));

var _reactCookie = require("react-cookie");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const AnnotateTask = _ref => {
  let {
    unit,
    codebook,
    setUnitIndex,
    blockEvents,
    fullScreenNode
  } = _ref;
  const [annotations, setAnnotations] = useAnnotations(unit);
  const [variableMap, setVariableMap] = (0, _react.useState)(null);
  const [cookies, setCookie] = (0, _reactCookie.useCookies)(["annotateTaskSettings"]);
  const [settings, setSettings] = (0, _react.useState)(cookies.annotateTaskSettings || {
    textSize: 1
  });
  const [tokens, setTokens] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    setCookie("annotateTaskSettings", JSON.stringify(settings), {
      path: "/"
    });
  }, [settings, setCookie]);
  if (!unit || (codebook === null || codebook === void 0 ? void 0 : codebook.variables) === null) return null;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid, {
    centered: true,
    stackable: true,
    style: {
      height: "100%",
      width: "100%",
      paddingTop: "0"
    },
    verticalAlign: "top",
    columns: 2
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, {
    width: 10,
    style: {
      paddingRight: "0em",
      paddingTop: "0",
      height: "100%"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button.Group, {
    fluid: true,
    style: {
      padding: "0",
      height: "40px"
    }
  }, /*#__PURE__*/_react.default.createElement(SettingsPopup, {
    settings: settings,
    setSettings: setSettings,
    fullScreenNode: fullScreenNode
  }), /*#__PURE__*/_react.default.createElement(UserManual, {
    fullScreenNode: fullScreenNode
  }), /*#__PURE__*/_react.default.createElement(NextUnitButton, {
    unit: unit,
    annotations: annotations,
    setUnitIndex: setUnitIndex
  })), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      height: "calc(100% - 20px",
      fontSize: "".concat(settings.textSize, "em")
    }
  }, /*#__PURE__*/_react.default.createElement(_Document.default, {
    unit: unit,
    settings: codebook === null || codebook === void 0 ? void 0 : codebook.settings,
    variables: codebook === null || codebook === void 0 ? void 0 : codebook.variables,
    onChangeAnnotations: setAnnotations,
    returnTokens: setTokens,
    returnVariableMap: setVariableMap,
    blockEvents: blockEvents,
    fullScreenNode: fullScreenNode
  }))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, {
    width: 6,
    style: {
      paddingRight: "0em",
      padding: "0",
      height: "100%",
      paddingLeft: "10px"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      borderBottom: "1px solid",
      height: "calc(100%)",
      overflow: "auto"
    }
  }, /*#__PURE__*/_react.default.createElement(_AnnotateTable.default, {
    tokens: tokens,
    variableMap: variableMap,
    annotations: annotations
  }))));
};

const useAnnotations = unit => {
  // simple hook for onChangeAnnotations that posts to server and returns state
  const [annotations, setAnnotations] = (0, _react.useState)([]);
  const safeWrite = (0, _react.useRef)(null); //const hasChanged = useRef(false);

  (0, _react.useEffect)(() => {
    if (!unit) {
      setAnnotations([]);
      return;
    }

    safeWrite.current = unit.unitId; //hasChanged.current = false;

    setAnnotations(unit.annotations || []); // if (!unit.annotations || unit.annotations.length === 0)
    //   unit.jobServer.postAnnotations(unit.unitId, [], "IN_PROGRESS");
  }, [unit, setAnnotations]);

  const onChangeAnnotations = _react.default.useCallback(newAnnotations => {
    if (unit.unitId !== safeWrite.current) return;
    setAnnotations(newAnnotations);
    const cleanAnnotations = getCleanAnnotations(newAnnotations);
    if (!annotationsHaveChanged(unit.annotations, cleanAnnotations)) return;
    unit.jobServer.postAnnotations(unit.unitId, cleanAnnotations, "IN_PROGRESS");
  }, [unit]);

  return [annotations, onChangeAnnotations];
};

const annotationsHaveChanged = (old, current) => {
  if (old.length !== current.length) return true;
  const compareOn = ["variable", "value", "section", "offset", "length"];

  for (let i = 0; i < old.length; i++) {
    for (let field of compareOn) {
      var _old$i, _current$i;

      if (((_old$i = old[i]) === null || _old$i === void 0 ? void 0 : _old$i[field]) !== ((_current$i = current[i]) === null || _current$i === void 0 ? void 0 : _current$i[field])) return true;
    }
  }

  return false;
};

const getCleanAnnotations = annotations => {
  return annotations.map(na => {
    return {
      variable: na.variable,
      value: na.value,
      section: na.section,
      offset: na.offset,
      length: na.length
    };
  });
};

const NextUnitButton = _ref2 => {
  let {
    unit,
    annotations,
    setUnitIndex
  } = _ref2;
  const [tempDisable, setTempDisable] = (0, _react.useState)(false);

  const onNext = () => {
    if (tempDisable) return; // write DONE status

    unit.jobServer.postAnnotations(unit.unitId, getCleanAnnotations(annotations), "DONE");
    setTempDisable(true);
    setUnitIndex(state => state + 1);
    setTimeout(() => {
      setTempDisable(false);
    }, 1000);
  };

  const onKeyDown = e => {
    if (e.ctrlKey && e.keyCode === 13) {
      e.preventDefault();
      onNext();
    }
  };

  (0, _react.useEffect)(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    disabled: tempDisable,
    loading: tempDisable,
    primary: true,
    size: "tiny",
    onClick: onNext
  }, "Next Unit");
};

const UserManual = _ref3 => {
  let {
    fullScreenNode
  } = _ref3;
  const [open, setOpen] = (0, _react.useState)(false);
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Modal, {
    mountNode: fullScreenNode || undefined,
    flowing: true,
    open: open,
    onClose: () => setOpen(false),
    position: "bottom left",
    trigger: /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
      secondary: true,
      size: "tiny",
      onClick: () => setOpen(!open)
    }, "Controls")
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Modal.Header, null, "Controls"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Modal.Content, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Container, {
    style: {
      overflow: "auto",
      paddingTop: "2em",
      width: "100%",
      maxWidth: "700px"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table, {
    structured: true,
    compact: true,
    basic: "very",
    unstackable: true
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Header, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
    width: 3
  }), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, null, "Keyboard"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, null, "Mouse"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, null, "Touchpad"))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Body, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("strong", null, "Navigate")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("i", null, "Arrow keys")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null)), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("strong", null, "Select words")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("i", null, "spacebar"), /*#__PURE__*/_react.default.createElement("br", null), "Hold to select mutiple"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("i", null, "Left-click"), /*#__PURE__*/_react.default.createElement("br", null), "Hold to select multiple"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("i", null, "tab"), " twice to begin, then once to close")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("strong", null, "Edit/remove code")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
    colSpan: "3"
  }, "Select annotated words to overwrite or delete the code")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("strong", null, "Select variable", /*#__PURE__*/_react.default.createElement("br", null), "(if multiple)")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, "Next with ", /*#__PURE__*/_react.default.createElement("i", null, "tab"), ", previous with ", /*#__PURE__*/_react.default.createElement("i", null, "shift+tab")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
    colSpan: "2"
  }, "Use the buttons")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("strong", null, "Next unit")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("i", null, "ctrl+Enter")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
    colSpan: "2"
  }, "Use the next unit button"))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Footer, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, null, /*#__PURE__*/_react.default.createElement("strong", null, "Quick keys"), " ", /*#__PURE__*/_react.default.createElement("br", null), "in popup"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
    colSpan: "3"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.List, {
    as: "ul"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.ListItem, {
    as: "li"
  }, /*#__PURE__*/_react.default.createElement("i", null, "text input"), " automatically opens dropdown", " "), /*#__PURE__*/_react.default.createElement(_semanticUiReact.ListItem, {
    as: "li"
  }, "navigate buttons with ", /*#__PURE__*/_react.default.createElement("i", null, "arrow keys"), ", select with ", /*#__PURE__*/_react.default.createElement("i", null, "spacebar")), /*#__PURE__*/_react.default.createElement(_semanticUiReact.ListItem, {
    as: "li"
  }, "use ", /*#__PURE__*/_react.default.createElement("i", null, "escape"), " to close popup and ", /*#__PURE__*/_react.default.createElement("i", null, "delete"), " to remove code")))))))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Modal.Actions, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    content: "Close",
    onClick: () => setOpen(false),
    positive: true
  })));
};

const SettingsPopup = _ref4 => {
  let {
    settings,
    setSettings,
    fullScreenNode
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Popup, {
    on: "click",
    mountNode: fullScreenNode || undefined,
    trigger: /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
      secondary: true,
      width: 1,
      size: "large",
      icon: "setting",
      style: {
        color: "white",
        maxWidth: "50px"
      }
    })
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form.Group, {
    grouped: true
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form.Field, null, /*#__PURE__*/_react.default.createElement("label", null, "text size scaling ", /*#__PURE__*/_react.default.createElement("font", {
    style: {
      color: "blue"
    }
  }, "".concat(settings.textSize))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Input, {
    size: "mini",
    step: 0.025,
    min: 0.4,
    max: 1.6,
    type: "range",
    value: settings.textSize,
    onChange: (e, d) => setSettings(state => _objectSpread(_objectSpread({}, state), {}, {
      textSize: d.value
    }))
  })))));
};

var _default = /*#__PURE__*/_react.default.memo(AnnotateTask);

exports.default = _default;