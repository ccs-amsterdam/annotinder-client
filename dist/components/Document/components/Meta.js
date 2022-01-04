"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

var _react = _interopRequireDefault(require("react"));

var _semanticUiReact = require("semantic-ui-react");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Meta = _ref => {
  let {
    meta_fields
  } = _ref;
  const visibleMetaFields = meta_fields.filter(mf => mf.visible);

  const cellStyle = row => {
    const style = {
      borderTop: "none"
    };
    if (row.bold) style.fontWeight = "bold";
    if (row.italic) style.fontStyle = "italic";
    return style;
  };

  const rows = () => {
    return visibleMetaFields.map(row => {
      return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, {
        style: {
          fontSize: "".concat(row.size != null ? row.size : 1, "em")
        }
      }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
        width: 1,
        style: {
          borderTop: "none"
        }
      }, /*#__PURE__*/_react.default.createElement("b", null, row.label || row.name)), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
        style: cellStyle(row)
      }, formatValue(row.value)));
    });
  };

  if (visibleMetaFields.length === 0) return null;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table, {
    basic: "very",
    compact: true,
    style: {
      lineHeight: "0.8",
      padding: "10px",
      paddingLeft: "10px",
      border: "1px solid grey",
      boxShadow: "5px 3px 3px #e0f2ff",
      background: "#e1f2ff",
      color: "black"
    }
  }, rows());
};

const formatValue = value => {
  //   try if value is a date, if so, format accordingly
  //   Only remove T if time for now. Complicated due to time zones.
  const dateInt = Date.parse(value);

  if (dateInt) {
    return value.replace("T", " ");
  } // if (dateInt) {
  //   let date = new Date(dateInt);
  //   const offset = date.getTimezoneOffset();
  //   //date = new Date(date.getTime() - offset * 60 * 1000);
  //   return date.toISOString().replace("T", " ").split(".")[0];
  // }


  return value;
};

var _default = Meta;
exports.default = _default;