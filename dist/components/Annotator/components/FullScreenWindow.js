"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FullScreenWindow = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _reactFullScreen = require("react-full-screen");

var _semanticUiReact = require("semantic-ui-react");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const FullScreenWindow = _ref => {
  let {
    children
  } = _ref;
  const fsHandle = (0, _reactFullScreen.useFullScreenHandle)();

  const fullScreenButton = /*#__PURE__*/_react.default.createElement(FullScreenButton, {
    handle: fsHandle
  });

  return /*#__PURE__*/_react.default.createElement(_reactFullScreen.FullScreen, {
    handle: fsHandle
  }, /*#__PURE__*/_react.default.createElement(DOMNodeProvider, {
    style: {
      height: "100%"
    }
  }, fullScreenNode => {
    // FullScreenFix children should be called as a function to pass on the fullScreenNode argument
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(AskFullScreenModal, {
      handle: fsHandle
    }), children(fullScreenNode, fullScreenButton));
  }));
};

exports.FullScreenWindow = FullScreenWindow;

const DOMNodeProvider = _ref2 => {
  let {
    children
  } = _ref2;
  // due to a bug in react-full-screen, pass on a 'fullScreenNode', which tells the popup
  // where to mount.
  // https://github.com/Semantic-Org/Semantic-UI-React/issues/4191
  const [fullScreenNode, setFullScreenNode] = (0, _react.useState)(null);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "dom-node-provider",
    ref: setFullScreenNode
  }, children(fullScreenNode));
};

const AskFullScreenModal = _ref3 => {
  let {
    handle
  } = _ref3;
  let [askFullscreen, setAskFullscreen] = (0, _react.useState)(true);
  (0, _react.useEffect)(() => {
    // this used to have location as dep
    setAskFullscreen(true);
  }, [setAskFullscreen, handle]); // Disable for now. Seems to not work in Apple devices
  //askFullscreen = false;

  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Modal, {
    open: askFullscreen
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Modal.Header, null, "Fullscreen mode"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Modal.Content, null, /*#__PURE__*/_react.default.createElement("p", null, "We recommend working in fullscreen, especially on mobile devices. You can always change this with the button in the top-right corner. For some devices fullscreen might not work."), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: "flex",
      height: "30%"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    primary: true,
    size: "massive",
    onClick: () => {
      if (!handle.active) handle.enter();
      setAskFullscreen(false);
    },
    style: {
      flex: "1 1 auto"
    }
  }, "Fullscreen"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    secondary: true,
    size: "massive",
    onClick: () => {
      if (handle.active) handle.exit();
      setAskFullscreen(false);
    },
    style: {
      flex: "1 1 auto"
    }
  }, "Windowed"))));
};

const FullScreenButton = _ref4 => {
  let {
    handle
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon.Group, {
    size: "big",
    style: {
      paddingRight: "10px",
      position: "absolute",
      top: "0px",
      right: 0
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
    link: true,
    name: handle.active ? "compress" : "expand",
    onClick: () => {
      handle.active ? handle.exit() : handle.enter();
    }
  }));
};

var _default = FullScreenWindow;
exports.default = _default;