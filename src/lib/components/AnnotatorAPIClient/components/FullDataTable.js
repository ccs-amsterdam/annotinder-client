import React, { useState, useEffect } from "react";
import { Container, Pagination, Table, Icon, Button } from "semantic-ui-react";

const PAGESIZE = 10;

/**
 * PaginationTable wrapper for if the full data is already in memory
 * @param {array} fullData array with objects
 * @param {array} columns  array with objects specifying what data to show in the columns
 * @param {function} onClick Optional. If given, clicking row calls the function with the row object as argument
 * @param {array}   buttons  Optional, Array with components that render a button. Will be put in a buttongroup in first column.
 *                           The component will be given the props "row" (the row object) and "backend" (see backend property)
 * @param {class}  backend   If buttons is used, backend can be passed along, so that it can be given to the button rendering component
 */
export default function FullDataTable({ fullData, columns, onClick, buttons, backend }) {
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(1);

  const pageChange = (activePage) => {
    const offset = (activePage - 1) * PAGESIZE;
    const newdata = fullData.slice(offset, offset + PAGESIZE);
    setData(newdata);
  };

  useEffect(() => {
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

  return (
    <PaginationTable
      data={data}
      pages={pages}
      columns={columns}
      pageChange={pageChange}
      onClick={onClick}
      buttons={buttons}
      backend={backend}
    />
  );
}

/**
 * A nice table with pagination
 * @param {array} data an Array with data for a single page
 * @param {array} columns an Array with objects indicating which columns to show and how
 * @param {int} pages the number of pages
 * @param {function} pageChange the function to perform on pagechange. Gets pageindex as an argument, and should update data
 * @returns
 */
const PaginationTable = ({ data, columns, pages, pageChange, onClick, buttons, backend }) => {
  const createHeaderRow = (data, columns) => {
    return columns.map((col, i) => {
      return (
        <Table.HeaderCell key={i} width={col.width || null}>
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

      let content;
      if (column.f) {
        content = column.f(rowObj);
      } else {
        content = rowObj ? rowObj[column.name] : null;
      }
      if (content instanceof Date) content = content.toISOString().slice(0, 19).replace(/T/g, " ");
      return (
        <Table.Cell ref={column.ref} key={i}>
          <span title={column.title ? content : null}>{content}</span>
        </Table.Cell>
      );
    });
    if (buttons) {
      cells = [
        <Table.Cell>
          <Button.Group>
            {buttons.map((ButtonComponent) => (
              <ButtonComponent row={rowObj} backend={backend} />
            ))}
          </Button.Group>
        </Table.Cell>,
        ...cells,
      ];
    }
    return cells;
  };
  if (data.length < 1) return null;

  return (
    <Container>
      <Table
        unstackable
        selectable
        fixed
        compact
        singleLine
        size="small"
        style={{ fontSize: "10px" }}
      >
        <Table.Header>
          <Table.Row>
            {buttons ? <Table.HeaderCell key="buttons" /> : null}
            {createHeaderRow(data, columns)}
          </Table.Row>
        </Table.Header>
        <Table.Body>{createBodyRows(data)}</Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan={buttons ? columns.length + 1 : columns.length}>
              {pages > 1 ? (
                <Pagination
                  size="mini"
                  floated="right"
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
                ></Pagination>
              ) : null}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </Container>
  );
};
