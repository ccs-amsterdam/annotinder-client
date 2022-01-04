"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = require("react");

var _createDocuments = require("../../../functions/createDocuments");

const useUnit = (unit, safetyCheck, returnTokens, setCodeHistory) => {
  const [preparedUnit, setPreparedUnit] = (0, _react.useState)({});
  const [annotations, setAnnotations] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    if (!(unit !== null && unit !== void 0 && unit.text) && !unit.text_fields && !unit.tokens) return null;
    if (!unit.annotations) unit.annotations = [];

    if (unit.importedAnnotations && !unit.status) {
      // only if status is new (which currently is just no status)
      unit.annotations = unit.annotations.concat(unit.importedAnnotations);
    }

    initializeCodeHistory(unit.annotations, setCodeHistory);
    const document = (0, _createDocuments.prepareDocument)(unit);
    safetyCheck.current = {
      tokens: document.tokens //annotationsChanged: false,
      //annotations: hash(document.annotations),

    };
    setPreparedUnit({
      tokens: document.tokens,
      text_fields: document.text_fields,
      meta_fields: document.meta_fields
    });
    setAnnotations(document.annotations);
    if (returnTokens) returnTokens(document.tokens);
  }, [unit, returnTokens, safetyCheck, setCodeHistory]); // if returnAnnotations is falsy (so not passed to Document), make setAnnotations
  // falsy as well. This is used further down as a sign that annotations are disabled

  return [preparedUnit, annotations, setAnnotations];
};

const initializeCodeHistory = (annotations, setCodeHistory) => {
  const ch = {};

  for (let annotation of annotations) {
    if (!ch[annotation.variable]) ch[annotation.variable] = new Set();
    ch[annotation.variable].add(annotation.value);
  }

  for (let key of Object.keys(ch)) {
    ch[key] = [...ch[key]];
  }

  setCodeHistory(ch);
};

var _default = useUnit;
exports.default = _default;