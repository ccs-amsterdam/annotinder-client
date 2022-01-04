"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const IndexController = _ref => {
  let {
    n,
    index,
    setIndex,
    canGoForward = true,
    canGoBack = true
  } = _ref;
  const reached = (0, _react.useRef)(0); // if canGoBack but not canGoForward, can still go forward after going back

  const canMove = (0, _react.useRef)(false);
  const [loading, setLoading] = (0, _react.useState)(false);
  const [activePage, setActivePage] = (0, _react.useState)(1);
  const [delayedActivePage, setDelayedActivePage] = (0, _react.useState)(1);
  (0, _react.useEffect)(() => {
    if (index < 0) return;
    if (index !== null) setActivePage(Math.min(index + 1, n + 1));
    if (index === null) setActivePage(n + 1);
  }, [index, n, setActivePage]);
  (0, _react.useEffect)(() => {
    reached.current = 0;
    canMove.current = false;
  }, [n]);
  (0, _react.useEffect)(() => {
    if (!n) return null;
    setActivePage(1);
    canMove.current = true;
  }, [n, setActivePage]);
  (0, _react.useEffect)(() => {
    if (!n) return null;
    reached.current = Math.max(activePage, reached.current);

    if (activePage - 1 === n) {
      setIndex(null);
    } else {
      setIndex(activePage - 1);
    }

    setDelayedActivePage(activePage);
  }, [n, setIndex, activePage]);
  (0, _react.useEffect)(() => {
    if (!n) return null;

    if (activePage === delayedActivePage) {
      setLoading(false);
      return null;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      setActivePage(delayedActivePage);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [activePage, delayedActivePage, n, setLoading]);
  if (!n) return null;
  const progress = 100 * Math.max(0, reached.current - 1) / n;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Segment, {
    style: {
      display: "flex",
      border: "none",
      boxShadow: "none",
      padding: "0",
      marginTop: "5px",
      leftMargin: "0px",
      width: "100%",
      maxHeight: "35px",
      borderRadius: "0"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Loader, {
    active: loading,
    content: ""
  }), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Pagination, {
    secondary: true,
    activePage: delayedActivePage,
    pageItem: delayedActivePage <= n ? "".concat(delayedActivePage, " / ").concat(n) : "done / ".concat(n),
    size: "mini",
    firstItem: null,
    lastItem: null,
    prevItem: canGoBack ? "back" : "   ",
    nextItem: canGoForward || activePage < reached.current ? "next" : "   ",
    siblingRange: 0,
    boundaryRange: 0,
    ellipsisItem: null,
    totalPages: n + 1,
    onClick: (e, d) => e.stopPropagation(),
    onPageChange: (e, d) => {
      if ((canGoForward || activePage < reached.current) && Number(d.activePage) > activePage) setActivePage(Number(d.activePage));
      if (canGoBack && Number(d.activePage) < activePage) setActivePage(Number(d.activePage));
    },
    style: {
      fontSize: "9px",
      border: "none",
      boxShadow: "none",
      padding: 0,
      margin: 0
    }
  }), /*#__PURE__*/_react.default.createElement("input", {
    style: {
      flex: "1 1 auto",
      background: "linear-gradient(to right, #7dd48d ".concat(progress, "%, #fff ").concat(progress, "% 100%, #fff 100%)")
    },
    min: 1,
    max: n + 1,
    onChange: e => {
      if (Number(e.target.value) > delayedActivePage) {
        if (canGoForward) {
          setDelayedActivePage(Number(e.target.value));
        } else {
          setDelayedActivePage(Math.min(reached.current, Number(e.target.value)));
        }
      }

      if (canGoBack && Number(e.target.value) < delayedActivePage) setDelayedActivePage(Number(e.target.value));
    },
    type: "range",
    value: delayedActivePage
  }));
};

var _default = IndexController;
exports.default = _default;