"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.split.js");

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/web.url.js");

require("core-js/modules/web.url-search-params.js");

var _react = _interopRequireWildcard(require("react"));

var _Annotator = _interopRequireDefault(require("../Annotator/Annotator"));

var _semanticUiReact = require("semantic-ui-react");

var _useBackend = _interopRequireDefault(require("./useBackend"));

var _JobServerAPI = _interopRequireDefault(require("../../classes/JobServerAPI"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

//   http://localhost:3000/CCS_annotator#/annotator?url=http://localhost:5000/codingjob/25
const AnnotatorAPIClient = () => {
  const [urlHost, urlJobId] = parseUrl(window.location.href);
  const [backend, loginForm] = (0, _useBackend.default)(urlHost);
  const jobServer = useJobServerBackend(backend, urlJobId);
  if (!backend) // If backend isn't connected, show login screen
    // If the url contained a host, this field is fixed
    return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid, {
      inverted: true,
      textAlign: "center",
      style: {
        height: "100vh"
      },
      verticalAlign: "middle"
    }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, {
      style: {
        maxWidth: "500px"
      }
    }, loginForm));

  if (!jobServer) {
    // if backend is connected, but there is no jobServer (because no job_id was passed in the url)
    // show a screen with some relevant info for the user on this host. Like current / new jobs
    return /*#__PURE__*/_react.default.createElement(JobOverview, {
      backend: backend,
      loginForm: loginForm
    });
  }

  return /*#__PURE__*/_react.default.createElement(_Annotator.default, {
    jobServer: jobServer
  });
};

const JobOverview = _ref => {
  let {
    backend,
    loginForm
  } = _ref;
  backend.getJobs().then(j => console.log(j));
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid, {
    inverted: true,
    textAlign: "center",
    style: {
      height: "100vh"
    },
    verticalAlign: "middle"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Header, null, backend.host), loginForm)), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Row, null, "test"));
};

const useJobServerBackend = (backend, jobId) => {
  const [jobServer, setJobServer] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    if (!backend || !jobId) {
      setJobServer(null);
      return;
    }

    const js = new _JobServerAPI.default(backend, jobId);
    js.init().then(() => setJobServer(js)); // add a check for if job_id is invalid
  }, [backend, jobId]);
  return jobServer;
};
/**
 * look for the query parameter url  (?url = ...)
  /if it exists, return the origin/host and the last part of the path (which should be the job_id)
 * @param {*} href from window.location.href
 * @returns 
 */


const parseUrl = href => {
  var _href$split;

  const params = (_href$split = href.split("?")) === null || _href$split === void 0 ? void 0 : _href$split[1];
  if (!params) return [null, null];
  const parts = params.split("&");
  const queries = parts.reduce((obj, part) => {
    const [key, value] = part.split("=");
    obj[decodeURIComponent(key)] = decodeURIComponent(value);
    return obj;
  }, {});
  if (!queries.url) return [null, null];
  const url = new URL(queries.url);
  return [url.origin, url.pathname.split("/").slice(-1)[0]];
};

var _default = AnnotatorAPIClient;
exports.default = _default;