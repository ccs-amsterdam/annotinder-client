import React, { useState, useEffect, useCallback } from "react";
import { Container, Pagination, Table, Icon, Search } from "semantic-ui-react";
import { ButtonComponentProps, Column, RowObj, SetState, TableData } from "../../../types";

interface APITableProps {
  /** Function for getting rows given a page index, page size, and optionally a query */
  getData: (pageIndex: number, pagesize: number, query?: string) => TableData;
  /** array with objects specifying what data to show in the columns */
  columns?: Column[];
  /** Optional. If given, clicking row calls the function with the row object as argument */
  onClick?: (rowobj: object) => void;
  /** pagesize */
  pageSize?: number;
  /** A number that can be incremented to update the data. e.g., to update table if another component changes data on server */
  update?: number;
}

/**
 * PaginationTable wrapper for if the full data is already in memory
 */
export default function APITable({ getData, columns, onClick, pageSize, update }: APITableProps) {
  const [data, setData] = useState<TableData>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState(null);

  useEffect(() => {
    setData(getData(page, pageSize || 10, search));
  }, [getData, setData, page, search, pageSize, update]);

  if (!data) return null;

  return (
    <PaginationTable
      data={data}
      columns={columns}
      setPage={setPage}
      onClick={onClick}
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
  borderTop: "0px",
  borderRadius: "0px",
  padding: "10px 0px 5px 0px",
  textAlign: "center",
};

interface PaginationTableProps {
  data: TableData;
  columns: Column[];
  setPage: SetState<number>;
  onClick: (value: RowObj) => void;
  setSearch: SetState<string>;
}

const PaginationTable = ({ data, columns, setPage, onClick, setSearch }: PaginationTableProps) => {
  const [active, setActive] = useState(null);

  const createHeaderRow = (columns: Column[]) => {
    return columns.map((col, i) => {
      let style = headerStyle;
      //if (i === 0 && !buttons) style = headerStyleLeft;
      if (i === columns.length - 1) style = headerStyleRight;
      return (
        <Table.HeaderCell key={i} width={col.width || null} style={style}>
          <span>{col.label || col.name}</span>
        </Table.HeaderCell>
      );
    });
  };

  const createBodyRows = (data: TableData) => {
    return data.rows.map((rowObj, i) => {
      return (
        <Table.Row
          key={i}
          active={rowObj?.id != null && active == rowObj.id}
          style={{ cursor: onClick ? "pointer" : "default" }}
          onClick={() => {
            setActive(rowObj?.id);
            onClick ? onClick(rowObj) : null;
          }}
        >
          {createRowCells(rowObj)}
        </Table.Row>
      );
    });
  };

  const createRowCells = (rowObj: RowObj) => {
    let cells = columns.map((column, i) => {
      if (column.hide) return null;

      let content;
      if (column.f) {
        content = column.f(rowObj);
      } else {
        content = rowObj ? rowObj[column.name] : null;
      }
      if (column.date && content && content !== "NEW") {
        content = new Date(content);
        content = content.toISOString().slice(0, 19).replace(/T/g, " ");
      }
      return (
        <Table.Cell key={i} style={rowStyle}>
          <span title={column.title ? content : null}>{content}</span>
        </Table.Cell>
      );
    });

    return cells;
  };
  //if (data.length < 1) return null;

  const nbuttons = Array.isArray(buttons) ? buttons.length : 1;

  return (
    <Container>
      <Table unstackable selectable fixed compact="very" size="small" style={{ border: "none" }}>
        <Table.Header>
          <Table.Row>
            {buttons ? (
              <Table.HeaderCell key="buttons" widths={nbuttons * 2} style={headerStyleLeft} />
            ) : null}
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
              <FooterContent pages={pages} setPage={setPage} setSearch={setSearch} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </Container>
  );
};

interface FooterContentProps {
  pages: number;
  setPage: SetState<number>;
  setSearch: SetState<string>;
}

const FooterContent = ({ pages, pageChange, setSearch }: FooterContentProps) => {
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
        onPageChange={(e, d) => pageChange(Number(d.activePage))}
        style={{ padding: "0", fontSize: "0.9em" }}
      ></Pagination>
    </div>
  );
};

export default PaginationTable;
