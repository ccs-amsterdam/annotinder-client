"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireDefault(require("react"));

var _semanticUiReact = require("semantic-ui-react");

var _tokenDesign = require("../../../functions/tokenDesign");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const COLWIDTHS = [4, 4, 2, 2]; // for offset and text

const AnnotateTable = _ref => {
  let {
    tokens,
    variableMap,
    annotations
  } = _ref;
  if (!variableMap || Object.keys(variableMap).length === 0) return null;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table, {
    style: {
      fontSize: "10px",
      maxHeight: "100%",
      borderRadius: "0px"
    },
    fixed: true,
    role: "grid",
    "arioa-labelledby": "header",
    unstackable: true,
    singleLine: true,
    compact: "very",
    size: "small"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Header, {
    className: "annotations-thead",
    style: {
      height: "40px"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
    title: "Variable",
    width: COLWIDTHS[0]
  }, "Variable"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
    title: "Vale",
    width: COLWIDTHS[1]
  }, "Value"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
    title: "Section",
    width: COLWIDTHS[2]
  }, "Section"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
    title: "Position",
    width: COLWIDTHS[3]
  }, "Position"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
    title: "Text"
  }, "Text"))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Body, {
    className: "annotations-tbody",
    style: {
      overflow: "auto",
      height: "calc(100% - 40px)"
    }
  }, annotationRows(tokens, variableMap, annotations)));
};

const annotationRows = (tokens, variableMap, annotations) => {
  const rows = [];
  let i = 0;

  const onClick = span => {
    if (!span) return;
    const token = tokens === null || tokens === void 0 ? void 0 : tokens[span[0]];
    if (token !== null && token !== void 0 && token.triggerCodePopup) token.triggerCodePopup(span);
  };

  for (const annotation of annotations) {
    const text = annotation.text || "";

    const row = /*#__PURE__*/_react.default.createElement(AnnotationRow, {
      key: i,
      variable: annotation.variable,
      variableMap: variableMap,
      annotation: annotation,
      onClick: onClick,
      text: text
    });

    if (row !== null) rows.push(row);
    i++;
  }

  return rows;
};

const AnnotationRow = _ref2 => {
  var _variableMap$annotati, _codeMap$annotation$v;

  let {
    variable,
    variableMap,
    annotation,
    onClick: _onClick,
    text
  } = _ref2;
  if (!(variableMap !== null && variableMap !== void 0 && (_variableMap$annotati = variableMap[annotation.variable]) !== null && _variableMap$annotati !== void 0 && _variableMap$annotati.codeMap)) return null;
  const codeMap = variableMap[variable].codeMap;
  if (!(codeMap !== null && codeMap !== void 0 && codeMap[annotation.value]) || !codeMap[annotation.value].active) return null;
  const color = (0, _tokenDesign.getColor)(annotation.value, codeMap);
  const label = (_codeMap$annotation$v = codeMap[annotation.value]) !== null && _codeMap$annotation$v !== void 0 && _codeMap$annotation$v.foldToParent ? "".concat(codeMap[annotation.value].foldToParent, " - ").concat(annotation.value) : annotation.value;
  const position = "".concat(annotation.offset, "-").concat(annotation.offset + annotation.length);
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, {
    className: "annotations-tr",
    onClick: () => _onClick(annotation.token_span),
    style: {
      cursor: "pointer"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
    width: COLWIDTHS[0]
  }, /*#__PURE__*/_react.default.createElement("span", {
    title: variable
  }, variable)), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
    title: label,
    width: COLWIDTHS[1],
    style: color ? {
      background: color
    } : null
  }, /*#__PURE__*/_react.default.createElement("span", {
    title: label
  }, label)), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
    title: annotation.section,
    width: COLWIDTHS[2]
  }, annotation.section), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
    title: position,
    width: COLWIDTHS[3]
  }, position), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, null, /*#__PURE__*/_react.default.createElement("span", {
    title: text
  }, text)));
};

var _default = AnnotateTable;
exports.default = _default;