"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

var _refNavigation = require("../../../functions/refNavigation");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const ButtonSelection = _ref => {
  let {
    id,
    active,
    options,
    onSelect
  } = _ref;
  const [selected, setSelected] = (0, _react.useState)(0);
  const [allOptions, setAllOptions] = (0, _react.useState)([]);
  const deleted = (0, _react.useRef)({});
  (0, _react.useEffect)(() => {
    // add cancel button and (most importantly) add refs used for navigation
    const cancelOption = {
      cancel: true,
      label: "CLOSE",
      color: "grey",
      value: "CANCEL",
      textColor: "white"
    };
    let allOptions = [...options, cancelOption];

    for (let option of allOptions) option.ref = /*#__PURE__*/_react.default.createRef();

    setAllOptions(allOptions);
  }, [options, setAllOptions]);

  const onKeydown = _react.default.useCallback(event => {
    const nbuttons = allOptions.length; // any arrowkey

    if (arrowKeys.includes(event.key)) {
      event.preventDefault();

      if (event.key === "ArrowRight") {
        if (selected < nbuttons - 1) setSelected(selected + 1);
      }

      if (event.key === "ArrowDown") {
        setSelected((0, _refNavigation.moveDown)(allOptions, selected));
      }

      if (event.key === "ArrowLeft") {
        if (selected > 0) setSelected(selected - 1);
      }

      if (event.key === "ArrowUp") {
        setSelected((0, _refNavigation.moveUp)(allOptions, selected));
      }

      return;
    } // space or enter


    if (event.keyCode === 32 || event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();
      let value = allOptions[selected].value;
      onSelect(value, event.ctrlKey);
    }
  }, [selected, allOptions, onSelect]);

  (0, _react.useEffect)(() => {
    if (active) {
      window.addEventListener("keydown", onKeydown);
    } else {
      window.removeEventListener("keydown", onKeydown);
    }

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [active, onKeydown]);

  const button = (option, i) => {
    const textColor = option.value.delete ? "#682c2c" : "black";
    const tagColor = option.value.delete ? option.value : "white";
    const tagBorderColor = option.color.slice(0, 7);
    const borderColor = option.value.delete ? "darkred" : "black";
    const bgColor = option.color;
    return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Ref, {
      innerRef: option.ref
    }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
      style: {
        flex: "1 1 auto",
        padding: "4px 2px",
        background: bgColor,
        color: textColor,
        border: "3px solid",
        borderColor: i === selected ? borderColor : "white",
        margin: "1px"
      },
      key: option.label + "_" + i,
      value: option.value,
      compact: true,
      size: "mini",
      onMouseOver: () => setSelected(i),
      onClick: (e, d) => onSelect(d.value, e.ctrlKey)
    }, option.tag ? /*#__PURE__*/_react.default.createElement("span", {
      style: {
        display: "inline-block",
        float: "left",
        background: tagColor,
        color: "black",
        borderRadius: "0px",
        border: "2px solid ".concat(tagBorderColor),
        padding: "2px",
        margin: "-4px 4px -4px -2px"
      }
    }, "".concat(option.tag, " ")) : null, /*#__PURE__*/_react.default.createElement("span", null, option.label)));
  };

  const mapButtons = () => {
    let i = 0;
    let cancelButton;
    const selectButtons = [];
    const deleteButtons = [];

    for (let option of allOptions) {
      if (deleted.current[option.value]) continue;
      if (option.value === "CANCEL") cancelButton = button(option, i);else if (option.value.delete) deleteButtons.push(button(option, i));else selectButtons.push(button(option, i));
      i++;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      key: id + "_buttons"
    }, /*#__PURE__*/_react.default.createElement("div", {
      key: id + "_1",
      style: {
        display: "flex",
        flexWrap: "wrap",
        marginBottom: "10px"
      }
    }, selectButtons), deleteButtons.length > 0 ? /*#__PURE__*/_react.default.createElement("b", null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
      name: "trash alternate"
    }), " Delete codes") : null, /*#__PURE__*/_react.default.createElement("div", {
      key: id + "_2",
      style: {
        display: "flex",
        flexWrap: "wrap"
      }
    }, deleteButtons), /*#__PURE__*/_react.default.createElement("div", {
      key: id + "_3",
      style: {
        display: "flex",
        flexWrap: "wrap"
      }
    }, cancelButton));
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    key: id
  }, mapButtons());
};

var _default = ButtonSelection;
exports.default = _default;