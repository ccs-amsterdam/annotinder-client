"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

var _react = _interopRequireWildcard(require("react"));

var _reactPapaparse = require("react-papaparse");

var _semanticUiReact = require("semantic-ui-react");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const DownloadAnnotations = _ref => {
  let {
    jobServer
  } = _ref;
  const [data, setData] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    switch (jobServer.codebook.type) {
      case "annotate":
        formatAnnotateTaskResults(jobServer, setData);
        break;

      case "questions":
        formatQuestionsTaskResults(jobServer, setData);
        break;

      default:
        return null;
    }
  }, [jobServer]);
  return /*#__PURE__*/_react.default.createElement(_reactPapaparse.CSVDownloader, {
    filename: "CSSannotator_".concat(jobServer.title, "_").concat(jobServer.set, "_").concat(jobServer.coderName, ".json"),
    data: data,
    style: {
      cursor: "pointer"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    loading: data === null,
    primary: true,
    content: "Download results",
    icon: "download",
    labelPosition: "left",
    size: "huge"
  }));
};

const formatAnnotateTaskResults = async (jobServer, setData) => {
  // annotate results are returned in long format
  const unitMap = jobServer.units.reduce((obj, unit) => {
    obj[unit.unit_id] = unit;
    return obj;
  }, {});
  const annotationsPerUnit = jobServer.getAllAnnotations(); // this needs to be replaced by a method of the jobServer

  const results = [];

  for (let unitAnnotations of annotationsPerUnit) {
    const annotations = unitAnnotations.annotations;
    const unit = unitMap[unitAnnotations.unit_id];

    for (let annotation of annotations) {
      const result = _objectSpread(_objectSpread({
        document_id: unit.document_id,
        unit_id: unit.unit_id
      }, unit.provenance), annotation);

      results.push(result);
    }
  }

  setData(results);
};

const formatQuestionsTaskResults = async (jobServer, setData) => {
  // questions results are returned in wide format
  const results = []; // variables of annotations are formatted as Q[question index]_[question name]
  // question index starts at 1, and spaces in question name are replaced with underscores

  const variables = jobServer.codebook.questions.map((question, i) => "Q".concat(i + 1, "_").concat(question.name.replace(" ", "_")));
  const unitMap = jobServer.units.reduce((obj, unit) => {
    obj[unit.unit_id] = unit;
    return obj;
  }, {});
  const annotationsPerUnit = jobServer.getAllAnnotations(); // The local jobserver needs this method

  for (let unitAnnotations of annotationsPerUnit) {
    const annotations = unitAnnotations.annotations;
    const unit = unitMap[unitAnnotations.unit_id];

    const result = _objectSpread(_objectSpread({
      document_id: unit.document_id,
      unit_id: unit.unit_id
    }, unit.provenance), {}, {
      offset: annotations[0].offset,
      length: annotations[0].length,
      section: annotations[0].section
    }, annotations[0].meta);

    if (unit.meta) {
      for (let key of Object.keys(unit.meta)) {
        result["meta_" + key] = unit.meta[key];
      }
    }

    for (let variable of variables) {
      const a = annotations.find(annotation => annotation.variable === variable);
      result[variable] = a == null ? null : a.value;
    }

    results.push(result);
  }

  setData(results);
};

var _default = DownloadAnnotations;
exports.default = _default;