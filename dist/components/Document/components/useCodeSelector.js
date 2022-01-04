"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.reduce.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

var _annotations = require("../../../functions/annotations");

var _codebook = require("../../../functions/codebook");

var _tokenDesign = require("../../../functions/tokenDesign");

var _ButtonSelection = _interopRequireDefault(require("./ButtonSelection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
/**
 * This hook is an absolute beast, as it takes care of a lot of moving parts.
 * Basically, everything surrounding the popups for selecting and editing codes, and updating the annotations
 * Please don't touch it untill I get around to refactoring it, and then still don't touch it unless strictly needed
 *
 * The weirdest (but nice) part is that it returns a popup component, as well as a 'trigger' function.
 * The trigger function can then be used to trigger a popup for starting a selection or edit for a given token index (position of popup)
 * and selection (which span to create/edit)
 *
 * @param {*} tokens
 * @param {*} variables
 * @param {*} selectedVariable
 * @param {*} annotations
 * @param {*} setAnnotations
 * @param {*} codeHistory
 * @param {*} setCodeHistory
 * @param {*} fullScreenNode
 * @returns
 */

const useCodeSelector = (tokens, variables, selectedVariable, annotations, setAnnotations, codeHistory, setCodeHistory, fullScreenNode) => {
  const [open, setOpen] = (0, _react.useState)(false);
  const [span, setSpan] = (0, _react.useState)(null);
  const [variable, setVariable] = (0, _react.useState)(null);
  const [tokenRef, setTokenRef] = (0, _react.useState)(null);
  const [tokenAnnotations, setTokenAnnotations] = (0, _react.useState)({});
  const [editMode, setEditMode] = (0, _react.useState)(false);
  const [tmpCodeHistory, setTmpCodeHistory] = (0, _react.useState)(codeHistory); // to not update during selection

  const [fullVariableMap, setFullVariableMap] = (0, _react.useState)(null);
  const [variableMap, setVariableMap] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    // creates fullVariableMap
    if (!variables || variables.length === 0) {
      setFullVariableMap(null);
      return null;
    }

    const vm = {};

    for (let variable of variables) {
      let cm = (0, _codebook.codeBookEdgesToMap)(variable.codes);
      cm = Object.keys(cm).reduce((obj, key) => {
        if (!cm[key].active || !cm[key].activeParent) return obj;
        obj[key] = cm[key];
        return obj;
      }, {});
      vm[variable.name] = _objectSpread(_objectSpread({}, variable), {}, {
        codeMap: cm
      });
    }

    setFullVariableMap(vm);
  }, [variables, setFullVariableMap]);
  (0, _react.useEffect)(() => {
    var _vmap, _vmap$selectedVariabl;

    // creates the actually used variableMap from the fullVariableMap
    // this lets us select specific variables without recreating full map
    if (fullVariableMap === null) {
      setVariableMap(null);
      return;
    }

    setVariable(null);
    let vmap;

    if (selectedVariable === null || selectedVariable === "EDIT ALL") {
      vmap = fullVariableMap;
    } else {
      vmap = {
        [selectedVariable]: fullVariableMap[selectedVariable]
      };
    }

    setVariableMap(vmap);
    setEditMode(((_vmap = vmap) === null || _vmap === void 0 ? void 0 : (_vmap$selectedVariabl = _vmap[selectedVariable]) === null || _vmap$selectedVariabl === void 0 ? void 0 : _vmap$selectedVariabl.editMode) || selectedVariable === "EDIT ALL");
  }, [fullVariableMap, selectedVariable, setVariable, setVariableMap, setEditMode]);
  (0, _react.useEffect)(() => {
    if (open) return;
    setCodeHistory(tmpCodeHistory);
  }, [tmpCodeHistory, open, setCodeHistory]);

  const triggerFunction = _react.default.useCallback((index, span) => {
    if (!tokens[index].ref) return;
    setTokenRef(tokens[index].ref);
    setTokenAnnotations(annotations[index] || {});
    setSpan(span || [index, index]);
    setOpen(true);
  }, [annotations, tokens]);

  (0, _react.useEffect)(() => {
    setOpen(false);
  }, [tokens]);
  (0, _react.useEffect)(() => {
    if (!open) setVariable(null);
  }, [open]);
  if (!variables) return [null, null, null, true];
  let popupPage1;

  if (editMode) {
    popupPage1 = /*#__PURE__*/_react.default.createElement(SelectAnnotationPage, {
      tokens: tokens,
      variable: variable,
      setVariable: setVariable,
      variableMap: variableMap,
      annotations: annotations,
      span: span,
      setSpan: setSpan,
      setOpen: setOpen
    });
  } else {
    popupPage1 = /*#__PURE__*/_react.default.createElement(SelectVariablePage, {
      variable: variable,
      setVariable: setVariable,
      variableMap: variableMap,
      annotations: annotations,
      span: span,
      setOpen: setOpen
    });
  }

  let popupPage2 = /*#__PURE__*/_react.default.createElement(NewCodePage // if current is known, select what the new code should be (or delete, or ignore)
  , {
    tokens: tokens,
    variable: variable,
    variableMap: variableMap,
    settings: variableMap === null || variableMap === void 0 ? void 0 : variableMap[variable],
    codeHistory: codeHistory[variable] || [],
    annotations: annotations,
    tokenAnnotations: tokenAnnotations,
    setAnnotations: setAnnotations,
    span: span,
    editMode: editMode,
    setOpen: setOpen,
    setCodeHistory: setTmpCodeHistory
  });

  let popup = /*#__PURE__*/_react.default.createElement(CodeSelectorPopup, {
    variable: variable,
    fullScreenNode: fullScreenNode,
    open: open,
    setOpen: setOpen,
    tokenRef: tokenRef
  }, popupPage1, popupPage2);

  if (!variableMap || !tokens) popup = null;
  return [popup, triggerFunction, variableMap, open, editMode];
};

const CodeSelectorPopup = /*#__PURE__*/_react.default.memo(_ref => {
  let {
    variable,
    children,
    fullScreenNode,
    open,
    setOpen,
    tokenRef
  } = _ref;
  const popupMargin = "5px";
  let position = "top left";
  let maxHeight = "100vh";

  if (tokenRef !== null && tokenRef !== void 0 && tokenRef.current) {
    // determine popup position and maxHeight/maxWidth
    const bc = tokenRef.current.getBoundingClientRect();
    const topSpace = bc.top / window.innerHeight;
    const bottomSpace = (window.innerHeight - bc.bottom) / window.innerHeight;

    if (topSpace > bottomSpace) {
      position = "top";
      maxHeight = "calc(".concat(topSpace * 100, "vh - ").concat(popupMargin, ")");
    } else {
      position = "bottom";
      maxHeight = "calc(".concat(bottomSpace * 100, "vh - ").concat(popupMargin, ")");
    }

    const leftSpace = bc.left / window.innerWidth;
    const rightSpace = (window.innerWidth - bc.right) / window.innerWidth;
    position = rightSpace > leftSpace ? position + " left" : position + " right";
  } // somehow onclose trigger when first opening popup. this hack enables closing it
  // when clicking outside of the popup


  let canIClose = false;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Popup, {
    mountNode: fullScreenNode || undefined,
    context: tokenRef,
    basic: true,
    wide: true,
    position: position,
    hoverable: true,
    open: open,
    mouseLeaveDelay: 10000000 // just don't use mouse leave
    ,
    onClose: (e, d) => {
      if (canIClose) setOpen(false);
      canIClose = true;
    },
    style: {
      margin: popupMargin,
      padding: "0px",
      background: "#dfeffb",
      border: "1px solid #136bae",
      //backdropFilter: "blur(3px)",
      minWidth: "15em",
      maxHeight,
      overflow: "auto"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      margin: "5px",
      border: "0px"
    }
  }, children));
});

const SelectVariablePage = _ref2 => {
  let {
    variable,
    setVariable,
    annotations,
    span,
    setOpen,
    variableMap
  } = _ref2;

  const getOptions = () => {
    let variables = Object.keys(variableMap);
    const variableColors = {};

    for (let v of variables) {
      const colors = {};

      for (let i = span[0]; i <= span[1]; i++) {
        if (!annotations[i]) continue;

        for (let id of Object.keys(annotations[i])) {
          var _variableMap$v;

          const a = annotations[i][id];
          if (a.variable !== v) continue;
          colors[a.value] = (0, _tokenDesign.getColor)(a.value, variableMap === null || variableMap === void 0 ? void 0 : (_variableMap$v = variableMap[v]) === null || _variableMap$v === void 0 ? void 0 : _variableMap$v.codeMap);
        }
      }

      variableColors[v] = (0, _tokenDesign.getColorGradient)(Object.values(colors));
    }

    return variables.map(variable => ({
      color: variableColors[variable],
      label: variable,
      value: variable
    }));
  };

  const options = getOptions();
  (0, _react.useEffect)(() => {
    if (options.length === 1) setVariable(options[0].value);
  }, [options, setVariable]);
  if (variable || !span) return null;
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Popup.Header, {
    style: {
      textAlign: "center"
    }
  }, "Select variable"), /*#__PURE__*/_react.default.createElement(_ButtonSelection.default, {
    id: "currentCodePageButtons",
    active: true,
    options: options,
    setOpen: setOpen,
    onSelect: (value, ctrlKey) => {
      if (value === "CANCEL") {
        setOpen(false);
        return;
      }

      setVariable(value);
    }
  }));
};

const SelectAnnotationPage = _ref3 => {
  let {
    tokens,
    variable,
    setVariable,
    annotations,
    span,
    setSpan,
    setOpen,
    variableMap
  } = _ref3;

  const onButtonSelection = (value, ctrlKey) => {
    if (value === "CANCEL") {
      setOpen(false);
      return;
    }

    setSpan(value.span);
    setVariable(value.variable); //setExisting(value.annotations);
  };

  const getAnnotationOptions = () => {
    // create an array of spans, where key is the text, and
    const variableSpans = {};

    for (let i = span[0]; i <= span[1]; i++) {
      if (!annotations[i]) continue;

      for (let id of Object.keys(annotations[i])) {
        var _variableMap$annotati;

        const annotation = annotations[i][id];
        const codeMap = variableMap === null || variableMap === void 0 ? void 0 : (_variableMap$annotati = variableMap[annotation.variable]) === null || _variableMap$annotati === void 0 ? void 0 : _variableMap$annotati.codeMap;
        if (!variableMap[annotation.variable]) continue;
        if (!(codeMap !== null && codeMap !== void 0 && codeMap[annotation.value]) && annotation.value !== "EMPTY") continue;
        const span = annotation.span;
        const key = annotation.variable + ":" + span[0] + "-" + span[1];
        const label = '"' + getTextSnippet(tokens, span) + '"';
        const color = (0, _tokenDesign.getColor)(annotation.value, codeMap);

        if (!variableSpans[key]) {
          variableSpans[key] = {
            tag: annotation.variable,
            label,
            colors: [color],
            value: {
              //annotations: [annotation],
              variable: annotation.variable,
              span: annotation.span
            }
          };
        } else {
          variableSpans[key].colors.push(color); //variableSpans[key].value.annotations.push(annotation);
        }
      }
    }

    return Object.keys(variableSpans).map(key => {
      return _objectSpread(_objectSpread({}, variableSpans[key]), {}, {
        color: (0, _tokenDesign.getColorGradient)(variableSpans[key].colors)
      });
    });
  };

  if (variable || !span) return null;
  const options = getAnnotationOptions();
  if (options.length === 0) setOpen(false);

  if (options.length === 1) {
    onButtonSelection(options[0].value);
  }

  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Popup.Header, {
    style: {
      textAlign: "center"
    }
  }, "Select annotation"), /*#__PURE__*/_react.default.createElement(_ButtonSelection.default, {
    id: "currentCodePageButtons",
    active: true,
    options: options,
    setOpen: setOpen,
    onSelect: onButtonSelection
  }));
};

const NewCodePage = _ref4 => {
  let {
    tokens,
    variable,
    variableMap,
    codeHistory,
    settings,
    annotations,
    tokenAnnotations,
    setAnnotations,
    editMode,
    span,
    setOpen,
    setCodeHistory
  } = _ref4;
  const textInputRef = (0, _react.useRef)(null);
  const [focusOnButtons, setFocusOnButtons] = (0, _react.useState)(true);

  const onKeydown = _react.default.useCallback(event => {
    var _textInputRef$current;

    if (settings && !settings.searchBox && !settings.buttonMode === "recent") return null;
    const focusOnTextInput = (textInputRef === null || textInputRef === void 0 ? void 0 : (_textInputRef$current = textInputRef.current) === null || _textInputRef$current === void 0 ? void 0 : _textInputRef$current.children[0]) === document.activeElement;
    if (!focusOnTextInput) setFocusOnButtons(true);
    if (event.keyCode === 27) setOpen(false);
    if (arrowKeys.includes(event.key)) return null;
    if (event.keyCode <= 46 || event.keyCode >= 106) return null;
    if (textInputRef.current) textInputRef.current.click();
    setFocusOnButtons(false);
  }, [textInputRef, setOpen, settings]);

  const getExistingAnnotations = variable => {
    const annMap = {};

    for (let i = span[0]; i <= span[1]; i++) {
      if (annotations !== null && annotations !== void 0 && annotations[i]) {
        for (let id of Object.keys(annotations[i])) {
          const a = annotations[i][id];
          if (a.variable !== variable) continue;
          const annId = a.span[0] + "_" + id;
          annMap[annId] = _objectSpread({
            id
          }, annotations[i][id]);
        }
      }
    }

    return Object.keys(annMap).length > 0 ? Object.values(annMap) : [];
  };

  (0, _react.useEffect)(() => {
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  });

  const onSelect = (annotation, ctrlKey) => {
    var _variableMap$variable;

    if (annotation === "CANCEL") {
      setOpen(false);
      return;
    }

    updateAnnotations(tokens, annotation, setAnnotations, codeHistory, setCodeHistory, editMode);
    if (!(variableMap !== null && variableMap !== void 0 && (_variableMap$variable = variableMap[variable]) !== null && _variableMap$variable !== void 0 && _variableMap$variable.multiple) && !ctrlKey) setOpen(false);
  };

  const autoCode = (codeMap, existing) => {
    const codes = Object.keys(codeMap);
    if (codes.length !== 1) return null;
    const value = codes[0];
    const nonEmpty = existing.filter(e => e.value !== "EMPTY");

    if (nonEmpty.length === 0) {
      // If there is only one option (which only happens if there is only 1 possible value and nothing that can be deleted), select it automatically
      setTimeout(() => onSelect({
        variable,
        span,
        value,
        delete: false
      }), 0);
      setOpen(false);
    }

    if (editMode && nonEmpty.length === 1 && value === nonEmpty[0].value) {
      setTimeout(() => onSelect({
        variable,
        span,
        value,
        delete: true
      }), 0);
      setOpen(false);
    }
  };

  const getOptions = () => {
    var _variableMap$variable2;

    const existing = getExistingAnnotations(variable);
    const buttonOptions = [];
    const dropdownOptions = [];
    const codeMap = variableMap === null || variableMap === void 0 ? void 0 : (_variableMap$variable2 = variableMap[variable]) === null || _variableMap$variable2 === void 0 ? void 0 : _variableMap$variable2.codeMap;
    autoCode(codeMap, existing);

    for (let code of Object.keys(codeMap)) {
      const singleSelection = span === null || span[0] === span[1];
      if (singleSelection && tokenAnnotations[code]) continue;
      if (settings && settings.buttonMode === "all") buttonOptions.push({
        key: code,
        label: code,
        value: {
          variable,
          value: code,
          span,
          delete: false
        },
        color: (0, _tokenDesign.getColor)(code, codeMap)
      });
      let tree = codeMap[code].tree.join(" - ");
      dropdownOptions.push({
        key: code,
        value: {
          variable,
          value: code,
          span,
          delete: false
        },
        text: code + " test" + tree,
        content: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, code, /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("span", {
          style: {
            color: "grey"
          }
        }, tree))
      });
    } // use 'recent' mode if specified, or if settings are missing


    if (!settings || settings.buttonMode === "recent") {
      let nRecent = 9;

      for (let code of codeHistory) {
        if (nRecent < 0) break;
        if (!codeMap[code]) continue;
        buttonOptions.push({
          key: code,
          label: code,
          value: {
            variable,
            value: code,
            span,
            delete: false
          },
          color: (0, _tokenDesign.getColor)(code, codeMap)
        });
        nRecent--;
      }
    }

    if (existing && existing.length > 0) {
      for (let o of existing) {
        if (!codeMap[o.value]) continue;
        buttonOptions.push({
          tag: o.value,
          label: '"' + getTextSnippet(tokens, o.span) + '"',
          color: (0, _tokenDesign.getColor)(o.value, codeMap),
          value: _objectSpread(_objectSpread({}, o), {}, {
            delete: true
          }),
          textColor: "darkred"
        });
      }
    }

    return [buttonOptions, dropdownOptions];
  };

  const asButtonSelection = options => {
    // act automatically if button selection is the only mode, and there are no options or only 1
    // if (settings.buttonMode === "all" && !settings.searchBox) {
    //   if (options.length === 0) return null;
    //   if (options.length === 1) {
    //     // If there is only one option (which only happens if there is only 1 possible value and nothing that can be deleted), select it automatically
    //     setTimeout(() => onSelect(options[0].value), 0);
    //     setOpen(false);
    //   }
    //   if (
    //     editMode &&
    //     options.length === 2 &&
    //     (options[0].value.delete || options[1].value.delete)
    //   ) {
    //     // In editmode, if there is only 1 possible value, and it has already been selected, delete it automatically
    //     // Basically this means that for binary variables, clicking in edit mode equals toggling
    //     if (options[0].value.value === options[1].value.value) {
    //       setTimeout(() => onSelect({ ...options[0].value, delete: true }), 0);
    //       setOpen(false);
    //     }
    //   }
    // }
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, settings.buttonMode === "recent" && codeHistory.length > 0 ? /*#__PURE__*/_react.default.createElement("b", null, "Recent codes") : null, /*#__PURE__*/_react.default.createElement(_ButtonSelection.default, {
      id: "newCodePageButtons",
      active: focusOnButtons,
      setAnnotations: setAnnotations,
      options: options,
      setOpen: setOpen,
      onSelect: onSelect
    }));
  };

  const asDropdownSelection = options => {
    if (options.length === 0) return null; //const codeMap = variableMap?.[variable]?.codeMap;
    //if (!codeMap) return null;
    // use searchBox if specified OR if settings are missing
    // also, if buttonmode is 'recent', always show search box

    if (settings && !settings.searchBox && settings.buttonMode !== "recent") return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        height: "25px"
      }
    });
    return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Ref, {
      innerRef: textInputRef
    }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Dropdown, {
      fluid: true,
      placeholder: "<type to search>",
      style: {
        textAlign: "center",
        color: "black",
        width: "100%",
        height: "20px",
        marginBottom: "5px",
        overflow: "visible",
        position: "relative"
      },
      options: options,
      open: !focusOnButtons,
      search: true,
      selectOnNavigation: false,
      minCharacters: 0,
      autoComplete: "on",
      onClick: () => setFocusOnButtons(false),
      onSearchChange: (e, d) => {
        if (d.searchQuery === "") setFocusOnButtons(true);
      },
      onClose: () => setFocusOnButtons(true),
      onChange: (e, d) => {
        onSelect(d.value, e.ctrlKey);
      }
    }));
  };

  if (!variable) return null;
  const [buttonOptions, dropdownOptions] = getOptions();
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, asDropdownSelection(dropdownOptions), asButtonSelection(buttonOptions));
};

const getTextSnippet = function getTextSnippet(tokens, span) {
  let maxlength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 8;
  let text = tokens.slice(span[0], span[1] + 1).map(t => t.pre + t.text + t.post);
  if (text.length > maxlength) text = [text.slice(0, Math.floor(maxlength / 2)).join(""), " ... ", text.slice(-Math.floor(maxlength / 2)).join("")];
  return text.join("");
};

const updateAnnotations = (tokens, annotation, setAnnotations, codeHistory, setCodeHistory, editMode) => {
  const [from, to] = annotation.span;
  annotation.index = tokens[from].index;
  annotation.length = tokens[to].length + tokens[to].offset - tokens[from].offset;
  annotation.span = [tokens[from].index, tokens[to].index];
  annotation.section = tokens[from].section;
  annotation.offset = tokens[from].offset;
  setAnnotations(state => (0, _annotations.toggleSpanAnnotation)(_objectSpread({}, state), annotation, annotation.delete, editMode));
  setCodeHistory(state => {
    return _objectSpread(_objectSpread({}, state), {}, {
      [annotation.variable]: [annotation.value, ...codeHistory.filter(v => v !== annotation.value)]
    });
  });
};

var _default = useCodeSelector;
exports.default = _default;