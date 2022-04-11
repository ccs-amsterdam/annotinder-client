import React, { useState, useEffect } from "react";
import { Container, Pagination, Table, Icon, Button, Search } from "semantic-ui-react";

const PAGESIZE = 10;

/**
 * PaginationTable wrapper for if the full data is already in memory
 * @param {array} fullData array with objects
 * @param {function} setFullData if table needs to update fulldata state
 * @param {array} columns  array with objects specifying what data to show in the columns
 * @param {function} onClick Optional. If given, clicking row calls the function with the row object as argument
 * @param {array}   buttons  Optional, Component or Array with Components that render buttons. Will be put in a buttongroup in first column.
 *                           The component will be given the props "row" (the row object), "backend" (see backend property), and "setData" (for setFullData).
 * @param {class}  backend   If buttons is used, backend can be passed along, so that it can be given to the button rendering component
 * @param {function} isActive A function that takes a row as input, and returns a boolean for whether the row is displayed as active
 */
export default function FullDataTable({
  fullData,
  setFullData,
  columns,
  onClick,
  buttons,
  backend,
  isActive,
}) {
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");

  const pageChange = (activePage) => {
    const offset = (activePage - 1) * PAGESIZE;
    const newdata = filteredData.slice(offset, offset + PAGESIZE);
    setData(newdata);
  };

  useEffect(() => {
    if (!search === "") {
      setFilteredData(fullData);
      return;
    }
    const lsearch = search.toLowerCase();
    const fdata = fullData.filter((row) => {
      for (let value of Object.values(row)) {
        if (typeof value === "object") continue;
        if (String(value).toLowerCase().includes(lsearch)) return true;
      }
      return false;
    });
    setFilteredData(fdata);
  }, [fullData, search]);

  useEffect(() => {
    if (!filteredData) {
      setData([]);
      return null;
    }
    const n = filteredData.length;
    setPages(Math.ceil(n / PAGESIZE));
    let newdata = [];
    if (n > 0) newdata = filteredData.slice(0, PAGESIZE);
    setData(newdata);
  }, [filteredData]);

  //if (!data) return;

  return (
    <PaginationTable
      data={data}
      setFullData={setFullData}
      pages={pages}
      columns={columns}
      pageChange={pageChange}
      onClick={onClick}
      buttons={buttons}
      backend={backend}
      isActive={isActive}
      setSearch={setSearch}
    />
  );
}

const headerStyle = {
  color: "white",
  background: "#2185d0",
  borderBottom: "1px solid black",
  borderTop: "1px solid black",
  borderRadius: "0px",
  paddingTop: "5px",
  paddingBottom: "5px",
};
const headerStyleLeft = {
  ...headerStyle,
  borderTopLeftRadius: "5px",
  borderBottomLeftRadius: "5px",
  borderLeft: "1px solid black",
};
const headerStyleRight = {
  ...headerStyle,
  borderTopRightRadius: "5px",
  borderBottomRightRadius: "5px",
  borderRight: "1px solid black",
};
const rowStyle = {
  border: "none",
  borderBottom: "none",
  height: "30px",
};
const footerStyle = {
  color: "black",
  background: "transparent",
  //borderTop: "2px solid black",
  borderTop: "0px",
  borderRadius: "0px",
  padding: "10px 0px 5px 0px",
  textAlign: "center",
};

/**
 * A nice table with pagination
 * @param {array} data an Array with data for a single page
 * @param {array} columns an Array with objects indicating which columns to show and how
 * @param {int} pages the number of pages
 * @param {function} pageChange the function to perform on pagechange. Gets pageindex as an argument, and should update data
 * @returns
 */
const PaginationTable = ({
  data,
  setFullData,
  columns,
  pages,
  pageChange,
  onClick,
  buttons,
  backend,
  setSearch,
  isActive,
}) => {
  const createHeaderRow = (data, columns) => {
    return columns.map((col, i) => {
      let style = headerStyle;
      if (i === 0 && !buttons) style = headerStyleLeft;
      if (i === columns.length - 1) style = headerStyleRight;
      return (
        <Table.HeaderCell key={i} width={col.width || null} style={style}>
          <span>{col.name}</span>
        </Table.HeaderCell>
      );
    });
  };

  const createBodyRows = (data) => {
    return data.map((rowObj, i) => {
      return (
        <Table.Row
          key={i}
          active={isActive ? isActive(rowObj) : false}
          style={{ cursor: onClick ? "pointer" : "default" }}
          onClick={() => (onClick ? onClick(rowObj) : null)}
        >
          {createRowCells(rowObj)}
        </Table.Row>
      );
    });
  };

  const createRowCells = (rowObj) => {
    let cells = columns.map((column, i) => {
      if (column.hide) return null;
      columns.ref = React.createRef();

      if (column.component) {
        const Component = column.component;
        return (
          <Table.Cell ref={column.ref} key={i} style={rowStyle}>
            <Component backend={backend} rowObj={rowObj} />
          </Table.Cell>
        );
      }

      let content;
      if (column.f) {
        content = column.f(rowObj);
      } else {
        content = rowObj ? rowObj[column.name] : null;
      }
      if (column.date && content !== "NEW") {
        content = new Date(content);
        content = content.toISOString().slice(0, 19).replace(/T/g, " ");
      }
      return (
        <Table.Cell ref={column.ref} key={i} style={rowStyle}>
          <span title={column.title ? content : null}>{content}</span>
        </Table.Cell>
      );
    });
    if (buttons) {
      const buttonsArray = Array.isArray(buttons) ? buttons : [buttons];
      cells = [
        <Table.Cell key={"button." + rowObj.id} style={{ rowStyle, padding: "0px !important" }}>
          <Button.Group>
            {buttonsArray.map((ButtonComponent, i) => (
              <ButtonComponent
                key={rowObj.id + "." + i}
                row={rowObj}
                backend={backend}
                setData={setFullData}
                style={{ padding: "2px" }}
              />
            ))}
          </Button.Group>
        </Table.Cell>,
        ...cells,
      ];
    }
    return cells;
  };
  //if (data.length < 1) return null;

  return (
    <Container>
      <Table
        color="transparent"
        unstackable
        selectable
        fixed
        compact="very"
        singleLine
        size="small"
        style={{ border: "none" }}
      >
        <Table.Header>
          <Table.Row>
            {buttons ? <Table.HeaderCell key="buttons" style={headerStyleLeft} /> : null}
            {createHeaderRow(data, columns)}
          </Table.Row>
        </Table.Header>
        <Table.Body>{createBodyRows(data)}</Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell
              colSpan={buttons ? columns.length + 1 : columns.length}
              style={footerStyle}
            >
              <FooterContent pages={pages} pageChange={pageChange} setSearch={setSearch} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </Container>
  );
};

const FooterContent = ({ pages, pageChange, setSearch }) => {
  const [loading, setLoading] = useState(false);
  const [delayedSearch, setDelayedSearch] = useState("");

  useEffect(() => {
    if (delayedSearch !== "") setLoading(true);
    const timer = setTimeout(() => {
      setSearch(delayedSearch);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [delayedSearch, setSearch]);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
      <Search
        showNoResults={false}
        size="small"
        icon="search"
        loading={loading}
        style={{ display: "inline-flex", borderRadius: "10px" }}
        onSearchChange={(e, d) => setDelayedSearch(d.value)}
      />
      <Pagination
        size="mini"
        boundaryRange={1}
        siblingRange={1}
        ellipsisItem={{
          content: <Icon name="ellipsis horizontal" />,
          icon: true,
        }}
        firstItem={{
          content: <Icon name="angle double left" />,
          icon: true,
        }}
        lastItem={{
          content: <Icon name="angle double right" />,
          icon: true,
        }}
        prevItem={{ content: <Icon name="angle left" />, icon: true }}
        nextItem={{
          content: <Icon name="angle right" />,
          icon: true,
        }}
        pointing
        secondary
        defaultActivePage={1}
        totalPages={pages}
        onPageChange={(e, d) => pageChange(d.activePage)}
        style={{ padding: "0", fontSize: "0.9em" }}
      ></Pagination>
    </div>
  );
};
