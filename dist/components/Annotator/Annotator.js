"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

var _DownloadAnnotations = _interopRequireDefault(require("./components/DownloadAnnotations"));

var _IndexController = _interopRequireDefault(require("./components/IndexController"));

var _Task = _interopRequireDefault(require("./components/Task"));

var _FullScreenWindow = _interopRequireDefault(require("./components/FullScreenWindow"));

require("lib/components/Annotator/annotatorStyle.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Render an annotator for the provided jobServer class
 *
 * @param {*} jobServer  A jobServer class
 */
const Annotator = _ref => {
  let {
    jobServer
  } = _ref;
  const [unitIndex, setUnitIndex] = (0, _react.useState)(-1);
  const [preparedUnit, setPreparedUnit] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    // on start (or jobserver changes), unitIndex based on progress
    setUnitIndex(jobServer.progress.n_coded);
  }, [jobServer, setUnitIndex]);
  (0, _react.useEffect)(() => {
    // When unitIndex changes, get the unit
    if (!jobServer) return;
    getUnit(jobServer, unitIndex, setPreparedUnit, setUnitIndex);
  }, [unitIndex, jobServer, setUnitIndex, setPreparedUnit]);

  const content = fullScreenNode => {
    if (unitIndex < 0) return null;
    if (unitIndex === null) return /*#__PURE__*/_react.default.createElement(Finished, {
      jobServer: jobServer
    });
    return /*#__PURE__*/_react.default.createElement(_Task.default, {
      unit: preparedUnit,
      setUnitIndex: setUnitIndex,
      fullScreenNode: fullScreenNode
    });
  };

  const [maxHeight, maxWidth] = getWindowSize(jobServer);
  return /*#__PURE__*/_react.default.createElement(_FullScreenWindow.default, null, (fullScreenNode, fullScreenButton) =>
  /*#__PURE__*/
  // FullScreenWindow passes on the fullScreenNode needed to mount popups, and a fullScreenButton to handle on/off
  _react.default.createElement("div", {
    style: {
      maxWidth,
      maxHeight,
      background: "white",
      margin: "0 auto",
      padding: "0",
      height: "100%",
      border: "1px solid white"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      height: "45px",
      padding: "0",
      position: "relative"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: "85%",
      paddingLeft: "7.5%"
    }
  }, /*#__PURE__*/_react.default.createElement(_IndexController.default, {
    n: jobServer === null || jobServer === void 0 ? void 0 : jobServer.progress.n_total,
    index: unitIndex,
    setIndex: setUnitIndex,
    canGoBack: jobServer === null || jobServer === void 0 ? void 0 : jobServer.progress.seek_backwards,
    canGoForward: jobServer === null || jobServer === void 0 ? void 0 : jobServer.progress.seek_forwards
  })), /*#__PURE__*/_react.default.createElement("div", null, fullScreenButton)), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      height: "calc(100% - 45px)",
      padding: "0"
    }
  }, content(fullScreenNode))));
};

const getUnit = async (jobServer, unitIndex, setPreparedUnit, setUnitIndex) => {
  if (unitIndex < 0) return;

  try {
    const unit = await jobServer.getUnit(unitIndex);
    setPreparedUnit(_objectSpread(_objectSpread({
      jobServer,
      unitId: unit.id
    }, unit.unit), {}, {
      annotations: unit.annotation,
      status: unit.status
    }));
  } catch (e) {
    var _e$response;

    if (((_e$response = e.response) === null || _e$response === void 0 ? void 0 : _e$response.status) === 404) setUnitIndex(null);
    setPreparedUnit(null);
    console.log(e);
  }
};

const getWindowSize = jobServer => {
  var _jobServer$codebook;

  switch (jobServer === null || jobServer === void 0 ? void 0 : (_jobServer$codebook = jobServer.codebook) === null || _jobServer$codebook === void 0 ? void 0 : _jobServer$codebook.type) {
    case "questions":
      return ["800px", "1000px"];

    case "annotate":
      return ["2000px", "2000px"];

    default:
      return ["100%", "100%"];
  }
};

const Finished = _ref2 => {
  let {
    jobServer
  } = _ref2;
  if (!jobServer) return null;

  if (!jobServer.getAllAnnotations) {
    return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid, {
      container: true,
      centered: true,
      verticalAlign: "middle",
      style: {
        margin: "0",
        padding: "0"
      }
    }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Row, {
      style: {
        marginTop: "40%"
      }
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
      name: "flag checkered",
      size: "huge",
      style: {
        transform: "scale(5)"
      }
    }))));
  } else {
    return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid, {
      container: true,
      centered: true,
      verticalAlign: "middle",
      style: {
        margin: "0",
        padding: "0"
      }
    }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Row, {
      style: {
        marginTop: "40%"
      }
    }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, {
      width: 4
    }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
      name: "flag checkered",
      size: "huge",
      style: {
        transform: "scale(1)"
      }
    })), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, {
      width: 8
    }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Header, null, "You finished the codingjob!"), /*#__PURE__*/_react.default.createElement("p", null, "Please download your results and send them to whoever gave you this job. "), /*#__PURE__*/_react.default.createElement(_DownloadAnnotations.default, {
      jobServer: jobServer
    }))));
  }
};

var _default = Annotator;
exports.default = _default;