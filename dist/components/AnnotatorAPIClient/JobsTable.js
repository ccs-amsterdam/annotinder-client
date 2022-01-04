"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

var _react = _interopRequireWildcard(require("react"));

var _reactRouterDom = require("react-router-dom");

var _semanticUiReact = require("semantic-ui-react");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const PAGESIZE = 10;
const columns = [{
  name: "title"
}, {
  name: "progress",
  f: row => "".concat(row.n_coded || 0, " / ").concat(row.n_total)
}, {
  name: "modified"
}];

const JobsTable = _ref => {
  let {
    backend,
    setJobId
  } = _ref;
  const [jobs, setJobs] = (0, _react.useState)(null);
  const history = (0, _reactRouterDom.useHistory)();
  (0, _react.useEffect)(() => {
    let isSubscribed = true;

    if (!backend) {
      setJobs(null);
    } else backend.getJobs().then(d => {
      if (isSubscribed) setJobs(d.jobs);
    });

    return () => isSubscribed = false;
  }, [backend]);

  const onClick = rowObj => {
    history.push("?url=" + backend.host + "/codingjob/".concat(rowObj.id));
    setJobId(rowObj.id);
  };

  return /*#__PURE__*/_react.default.createElement(FullDataTable, {
    fullData: jobs,
    columns: columns,
    onClick: onClick
  });
};
/**
 * PaginationTable wrapper for if the full data is already in memory
 */


const FullDataTable = _ref2 => {
  let {
    fullData,
    columns,
    onClick
  } = _ref2;
  const [data, setData] = (0, _react.useState)([]);
  const [pages, setPages] = (0, _react.useState)(1);

  const pageChange = activePage => {
    const offset = (activePage - 1) * PAGESIZE;
    const newdata = fullData.slice(offset, offset + PAGESIZE);
    setData(newdata);
  };

  (0, _react.useEffect)(() => {
    if (!fullData) {
      setData([]);
      return null;
    }

    const n = fullData.length;
    setPages(Math.ceil(n / PAGESIZE));
    let newdata = [];
    if (n > 0) newdata = fullData.slice(0, PAGESIZE);
    setData(newdata);
  }, [fullData]);
  if (!data) return;
  return /*#__PURE__*/_react.default.createElement(PaginationTable, {
    data: data,
    pages: pages,
    columns: columns,
    pageChange: pageChange,
    onClick: onClick
  });
};
/**
 * A nice table with pagination
 * @param {array} data an Array with data for a single page
 * @param {array} columns an Array with objects indicating which columns to show and how
 * @param {int} pages the number of pages
 * @param {function} pageChange the function to perform on pagechange. Gets pageindex as an argument, and should update data
 * @returns
 */


const PaginationTable = _ref3 => {
  let {
    data,
    columns,
    pages,
    pageChange,
    onClick: _onClick
  } = _ref3;

  const createHeaderRow = (data, columns) => {
    return columns.map((col, i) => {
      return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
        key: i,
        width: col.width || null
      }, /*#__PURE__*/_react.default.createElement("span", {
        title: col.name
      }, col.name));
    });
  };

  const createBodyRows = data => {
    return data.map((rowObj, i) => {
      return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, {
        key: i,
        style: {
          cursor: "pointer"
        },
        onClick: () => _onClick(rowObj)
      }, createRowCells(rowObj));
    });
  };

  const createRowCells = rowObj => {
    return columns.map((column, i) => {
      if (column.hide) return null;
      let content;

      if (column.f) {
        content = column.f(rowObj);
      } else {
        content = rowObj ? rowObj[column.name] : null;
      }

      if (content instanceof Date) content = content.toISOString().slice(0, 19).replace(/T/g, " ");
      return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Cell, {
        key: i
      }, /*#__PURE__*/_react.default.createElement("span", {
        title: content
      }, content));
    });
  };

  if (data.length < 1) return null;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Container, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table, {
    unstackable: true,
    selectable: true,
    fixed: true,
    compact: true,
    singleLine: true,
    size: "small",
    style: {
      fontSize: "10px"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Header, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, createHeaderRow(data, columns))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Body, null, createBodyRows(data)), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Footer, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Table.HeaderCell, {
    colSpan: columns.length
  }, pages > 1 ? /*#__PURE__*/_react.default.createElement(_semanticUiReact.Pagination, {
    size: "mini",
    floated: "right",
    boundaryRange: 1,
    siblingRange: 1,
    ellipsisItem: {
      content: /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
        name: "ellipsis horizontal"
      }),
      icon: true
    },
    firstItem: {
      content: /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
        name: "angle double left"
      }),
      icon: true
    },
    lastItem: {
      content: /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
        name: "angle double right"
      }),
      icon: true
    },
    prevItem: {
      content: /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
        name: "angle left"
      }),
      icon: true
    },
    nextItem: {
      content: /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
        name: "angle right"
      }),
      icon: true
    },
    pointing: true,
    secondary: true,
    defaultActivePage: 1,
    totalPages: pages,
    onPageChange: (e, d) => pageChange(d.activePage)
  }) : null)))));
};

var _default = JobsTable;
exports.default = _default;