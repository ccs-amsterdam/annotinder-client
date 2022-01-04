"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchBoxDropdown = exports.ButtonSelection = exports.Annotinder = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

var _refNavigation = require("../../../functions/refNavigation");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const SearchBoxDropdown = /*#__PURE__*/_react.default.memo(_ref => {
  let {
    options,
    callback,
    blockEvents
  } = _ref;
  const ref = (0, _react.useRef)();
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Ref, {
    innerRef: ref
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Dropdown, {
    fluid: true,
    scrolling: true,
    upward: false,
    placeholder: "<type to search>",
    searchInput: {
      autoFocus: !blockEvents
    },
    style: {
      minWidth: "12em"
    },
    options: options.map(option => {
      return {
        key: option.code,
        value: option,
        text: option.code + (option.tree ? " (" + option.tree + ")" : ""),
        content: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, option.code, /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("span", {
          style: {
            color: "grey"
          }
        }, option.tree))
      };
    }),
    search: true,
    selection: true,
    compact: true,
    selectOnNavigation: false,
    minCharacters: 0,
    autoComplete: "on",
    onChange: (e, d) => {
      callback(d.value);
    }
  }));
});

exports.SearchBoxDropdown = SearchBoxDropdown;

const ButtonSelection = /*#__PURE__*/_react.default.memo(_ref2 => {
  let {
    options,
    callback,
    blockEvents
  } = _ref2;
  // render buttons for options (an array of objects with keys 'label' and 'color')
  // On selection perform callback function with the button label as input
  // if canDelete is TRUE, also contains a delete button, which passes null to callback
  const [selected, setSelected] = (0, _react.useState)(0);

  const onKeydown = _react.default.useCallback(event => {
    const nbuttons = options.length; // any arrowkey

    if (arrowKeys.includes(event.key)) {
      event.preventDefault();

      if (event.key === "ArrowRight") {
        if (selected < nbuttons - 1) setSelected(selected + 1);
      }

      if (event.key === "ArrowDown") {
        setSelected((0, _refNavigation.moveDown)(options, selected));
      }

      if (event.key === "ArrowLeft") {
        if (selected > 0) setSelected(selected - 1);
      }

      if (event.key === "ArrowUp") {
        setSelected((0, _refNavigation.moveUp)(options, selected));
      }

      return;
    } // delete


    if (event.keyCode === 46) {
      callback(null);
      setSelected(0);
    } // space or enter


    if (event.keyCode === 32 || event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();

      if (selected === options.length) {
        callback(null); // this means delete button was selected
      } else {
        callback(options[selected]);
      }

      setSelected(0);
    }
  }, [selected, callback, options]);

  (0, _react.useEffect)(() => {
    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown, blockEvents]);

  const mapButtons = () => {
    return options.map((option, i) => {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Ref, {
        innerRef: option.ref
      }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
        style: {
          backgroundColor: option.color,
          padding: "1em",
          margin: "0.2em",
          flex: "0.5 1 0",
          flexBasis: "0",
          fontWeight: "bold",
          fontSize: "1em",
          border: i === selected ? "3px solid black" : "3px solid #ece9e9"
        },
        key: option.code,
        value: option,
        compact: true,
        onMouseOver: () => setSelected(i),
        onClick: (e, d) => {
          callback(d.value);
          setSelected(0);
        }
      }, option.code)));
    });
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      //alignItems: "stretch",
      alignItems: "space-eventy",
      maxWidth: "100%",
      height: "100%",
      flexWrap: "wrap",
      justifyContent: "space-around"
    }
  }, mapButtons());
});

exports.ButtonSelection = ButtonSelection;

const Annotinder = /*#__PURE__*/_react.default.memo(_ref3 => {
  var _swipeOptions$up, _swipeOptions$up2, _swipeOptions$up3, _swipeOptions$left, _swipeOptions$left2, _swipeOptions$left3, _swipeOptions$right, _swipeOptions$right2, _swipeOptions$right3;

  let {
    swipeOptions,
    callback,
    swipe,
    blockEvents
  } = _ref3;
  // const left = options.find(option => option.swipe === "left");
  // const up = options.find(option => option.swipe === "up");
  // const right = options.find(option => option.swipe === "right");
  (0, _react.useEffect)(() => {
    if (swipe) {
      if (swipe === "right") callback(swipeOptions.right);
      if (swipe === "up") callback(swipeOptions.up);
      if (swipe === "left") callback(swipeOptions.left);
    }
  }, [swipe, callback, swipeOptions]);

  const onKeydown = _react.default.useCallback(event => {
    // any arrowkey
    if (arrowKeys.includes(event.key)) {
      event.preventDefault();
      if (event.key === "ArrowRight") callback(swipeOptions.right);
      if (event.key === "ArrowUp") callback(swipeOptions.up);
      if (event.key === "ArrowLeft") callback(swipeOptions.left);
    }
  }, [callback, swipeOptions]);

  (0, _react.useEffect)(() => {
    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown, blockEvents]);
  return /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignContent: "stretch",
      height: "100%"
    }
  }, swipeOptions.up == null ? null : /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    fluid: true,
    disabled: swipeOptions.up == null,
    onClick: (e, d) => callback(swipeOptions.up),
    style: {
      margin: "0",
      padding: "0",
      flex: "1 1 auto",
      borderRadius: "0",
      border: "1px solid",
      background: ((_swipeOptions$up = swipeOptions.up) === null || _swipeOptions$up === void 0 ? void 0 : _swipeOptions$up.color) || "white"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      color: "black",
      fontWeight: "bold",
      fontSize: "1em"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
    name: (_swipeOptions$up2 = swipeOptions.up) !== null && _swipeOptions$up2 !== void 0 && _swipeOptions$up2.code ? "arrow up" : null
  }), /*#__PURE__*/_react.default.createElement("span", null, ((_swipeOptions$up3 = swipeOptions.up) === null || _swipeOptions$up3 === void 0 ? void 0 : _swipeOptions$up3.code) || ""))), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      flex: "1 1 auto"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      padding: "0",
      margin: "0",
      display: "flex",
      height: "100%",
      flexWrap: "wrap",
      alignContent: "stretch"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    disabled: swipeOptions.left == null,
    onClick: (e, d) => callback(swipeOptions.left),
    style: {
      margin: "0",
      padding: "0",
      flex: "1 1 auto",
      width: "45%",
      borderRadius: "0",
      border: "1px solid",
      background: ((_swipeOptions$left = swipeOptions.left) === null || _swipeOptions$left === void 0 ? void 0 : _swipeOptions$left.color) || "white"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      color: "black",
      fontWeight: "bold",
      fontSize: "1em"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
    name: (_swipeOptions$left2 = swipeOptions.left) !== null && _swipeOptions$left2 !== void 0 && _swipeOptions$left2.code ? "arrow left" : null
  }), /*#__PURE__*/_react.default.createElement("span", null, ((_swipeOptions$left3 = swipeOptions.left) === null || _swipeOptions$left3 === void 0 ? void 0 : _swipeOptions$left3.code) || ""))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    disabled: swipeOptions.right == null,
    onClick: (e, d) => callback(swipeOptions.right),
    style: {
      padding: "0",
      margin: "0",
      flex: "1 1 auto",
      width: "45%",
      borderRadius: "0",
      border: "1px solid",
      background: ((_swipeOptions$right = swipeOptions.right) === null || _swipeOptions$right === void 0 ? void 0 : _swipeOptions$right.color) || "white"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      color: "black",
      fontWeight: "bold",
      fontSize: "1em"
    }
  }, /*#__PURE__*/_react.default.createElement("span", null, ((_swipeOptions$right2 = swipeOptions.right) === null || _swipeOptions$right2 === void 0 ? void 0 : _swipeOptions$right2.code) || ""), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
    name: (_swipeOptions$right3 = swipeOptions.right) !== null && _swipeOptions$right3 !== void 0 && _swipeOptions$right3.code ? "arrow right" : null
  }))))));
});

exports.Annotinder = Annotinder;