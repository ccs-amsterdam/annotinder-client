"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _AnnotateNavigation = _interopRequireDefault(require("./components/AnnotateNavigation"));

var _Tokens = _interopRequireDefault(require("./components/Tokens"));

var _useCodeSelector = _interopRequireDefault(require("./components/useCodeSelector"));

var _annotations = require("../../functions/annotations");

var _useUnit = _interopRequireDefault(require("./components/useUnit"));

var _SelectVariable = _interopRequireDefault(require("./components/SelectVariable"));

require("./documentStyle.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * This is hopefully the only Component in this folder that you'll ever see. It should be fairly isolated
 * and easy to use, but behind the scenes it gets dark real fast.
 * @param {*} unit     A unit object, as created in JobServerClass (or standardizeUnit)
 * @param {*} variables An object with variables, where each variable is an array of codes
 * @param {*} settings An object with settings. Supports "editAll" (and probably more to come)
 * @param {*} onChangeAnnotations An optional function for saving annotations.
 *                              If not given, users cannot make annotations
 * @param {*} returnTokens   An optional function for getting access to the tokens array
 * @param {*} returnVariableMap An optional function for getting access to the variableMap
 * @param {*} setReady       A function for passing a boolean to the parent to indicate that the
 *                           text is ready (which is usefull if the parent wants to transition
 *                           to new texts nicely)
 * @param {*} blockEvents    boolean. If true, disable event listeners
 * @param {*} fullScreenNode In fullscreenmode, popups can require a mountNode.
 * @returns
 */
const Document = _ref => {
  let {
    unit,
    variables,
    //codes,
    settings,
    onChangeAnnotations,
    returnTokens,
    returnVariableMap,
    setReady,
    blockEvents,
    fullScreenNode
  } = _ref;
  const safetyCheck = (0, _react.useRef)(null); // ensures only new annotations for the current unit are passed to onChangeAnnotations

  const [variable, setVariable] = (0, _react.useState)(null);
  const [codeHistory, setCodeHistory] = (0, _react.useState)({});
  const [tokensReady, setTokensReady] = (0, _react.useState)(0);
  const [preparedUnit, annotations, setAnnotations] = (0, _useUnit.default)(unit, safetyCheck, returnTokens, setCodeHistory);
  const [codeSelector, triggerCodeSelector, variableMap, codeSelectorOpen, editMode] = (0, _useCodeSelector.default)(preparedUnit.tokens, variables, variable, annotations, setAnnotations, codeHistory, setCodeHistory, fullScreenNode);
  (0, _react.useEffect)(() => {
    if (!annotations || !onChangeAnnotations) return; // check if same unit, to prevent annotations from spilling over due to race conditions

    if (safetyCheck.current.tokens !== preparedUnit.tokens) return;
    onChangeAnnotations((0, _annotations.exportSpanAnnotations)(annotations, preparedUnit.tokens, true));
  }, [preparedUnit.tokens, annotations, onChangeAnnotations]);
  (0, _react.useEffect)(() => {
    if (returnVariableMap) returnVariableMap(variableMap);
  }, [variableMap, returnVariableMap]);
  (0, _react.useEffect)(() => {
    if (setReady) setReady(current => current + 1);
    setAnnotations(state => _objectSpread({}, state)); //trigger DOM update after token refs have been prepared
  }, [tokensReady, setAnnotations, setReady]);
  if (!preparedUnit.tokens) return null;
  console.log(preparedUnit);
  return /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      maxHeight: "100%",
      flexDirection: "column"
    }
  }, /*#__PURE__*/_react.default.createElement(_Tokens.default, {
    tokens: preparedUnit.tokens,
    text_fields: preparedUnit.text_fields,
    meta_fields: preparedUnit.meta_fields,
    setReady: setTokensReady,
    maxHeight: variables && variables.length > 1 ? "calc(100% - 60px)" : "calc(100% - 30px)",
    editMode: editMode
  }), /*#__PURE__*/_react.default.createElement(_SelectVariable.default, {
    variables: variables,
    variable: variable,
    setVariable: setVariable,
    editAll: settings === null || settings === void 0 ? void 0 : settings.editAll,
    minHeight: variables && variables.length > 1 ? 60 : 30 //'px'

  }), /*#__PURE__*/_react.default.createElement(_AnnotateNavigation.default, {
    tokens: preparedUnit.tokens,
    variableMap: variableMap,
    annotations: annotations,
    disableAnnotations: !onChangeAnnotations || !variableMap,
    editMode: editMode || variable === "EDIT ALL",
    triggerCodeSelector: triggerCodeSelector,
    eventsBlocked: codeSelectorOpen || blockEvents,
    fullScreenNode: fullScreenNode
  }), codeSelector || null);
};

var _default = /*#__PURE__*/_react.default.memo(Document);

exports.default = _default;