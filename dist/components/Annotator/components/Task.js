"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _QuestionTask = _interopRequireDefault(require("./QuestionTask"));

var _AnnotateTask = _interopRequireDefault(require("./AnnotateTask"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Task = _ref => {
  var _unit$jobServer;

  let {
    unit,
    setUnitIndex,
    fullScreenNode
  } = _ref;
  const codebook = unit === null || unit === void 0 ? void 0 : (_unit$jobServer = unit.jobServer) === null || _unit$jobServer === void 0 ? void 0 : _unit$jobServer.codebook;
  if (!codebook || !unit) return null;

  const renderTaskPreview = type => {
    switch (type) {
      case "questions":
        return /*#__PURE__*/_react.default.createElement(_QuestionTask.default, {
          unit: unit,
          codebook: codebook,
          setUnitIndex: setUnitIndex,
          fullScreenNode: fullScreenNode
        });

      case "annotate":
        return /*#__PURE__*/_react.default.createElement(_AnnotateTask.default, {
          unit: unit,
          codebook: codebook,
          setUnitIndex: setUnitIndex,
          fullScreenNode: fullScreenNode
        });

      default:
        return null;
    }
  };

  if (!(codebook !== null && codebook !== void 0 && codebook.type)) return null;
  return renderTaskPreview(codebook.type);
};

var _default = Task;
exports.default = _default;