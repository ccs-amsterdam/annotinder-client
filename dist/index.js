"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "AnnotateTask", {
  enumerable: true,
  get: function get() {
    return _AnnotateTask.default;
  }
});
Object.defineProperty(exports, "Document", {
  enumerable: true,
  get: function get() {
    return _Document.default;
  }
});
Object.defineProperty(exports, "IndexController", {
  enumerable: true,
  get: function get() {
    return _IndexController.default;
  }
});
Object.defineProperty(exports, "QuestionTask", {
  enumerable: true,
  get: function get() {
    return _QuestionTask.default;
  }
});
Object.defineProperty(exports, "codeBookEdgesToMap", {
  enumerable: true,
  get: function get() {
    return _codebook.codeBookEdgesToMap;
  }
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function get() {
    return _Annotator.default;
  }
});
Object.defineProperty(exports, "exportSpanAnnotations", {
  enumerable: true,
  get: function get() {
    return _annotations.exportSpanAnnotations;
  }
});
Object.defineProperty(exports, "getCodeTreeArray", {
  enumerable: true,
  get: function get() {
    return _codebook.getCodeTreeArray;
  }
});
Object.defineProperty(exports, "getCodebook", {
  enumerable: true,
  get: function get() {
    return _codebook.getCodebook;
  }
});
Object.defineProperty(exports, "prepareDocument", {
  enumerable: true,
  get: function get() {
    return _createDocuments.prepareDocument;
  }
});
Object.defineProperty(exports, "standardizeCodes", {
  enumerable: true,
  get: function get() {
    return _codebook.standardizeCodes;
  }
});

var _Annotator = _interopRequireDefault(require("./components/Annotator/Annotator"));

var _QuestionTask = _interopRequireDefault(require("./components/Annotator/components/QuestionTask"));

var _AnnotateTask = _interopRequireDefault(require("./components/Annotator/components/AnnotateTask"));

var _IndexController = _interopRequireDefault(require("./components/Annotator/components/IndexController"));

var _Document = _interopRequireDefault(require("./components/Document/Document"));

var _createDocuments = require("./functions/createDocuments");

var _codebook = require("./functions/codebook");

var _annotations = require("./functions/annotations");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }