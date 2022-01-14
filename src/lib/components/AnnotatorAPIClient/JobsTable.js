import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Container, Pagination, Table, Icon } from "semantic-ui-react";

const PAGESIZE = 10;
const columns = [
  { name: "title" },
  { name: "progress", f: (row) => `${row.n_coded || 0} / ${row.n_total}` },
  { name: "modified" },
];

const JobsTable = ({ backend, setJobId }) => {
  const [jobs, setJobs] = useState(null);
  const history = useHistory();

  useEffect(() => {
    let isSubscribed = true;
    if (!backend) {
      setJobs(null);
    } else
      backend.getJobs().then((d) => {
        if (isSubscribed) setJobs(d.jobs);
      });
    return () => (isSubscribed = false);
  }, [backend]);

  const onClick = (rowObj) => {
    history.push("?url=" + backend.host + `/codingjob/${rowObj.id}`);
    setJobId(rowObj.id);
  };

  const started = jobs ? jobs.filter((j) => j.modified !== "NEW") : [];
  const newjobs = jobs ? jobs.filter((j) => j.modified === "NEW") : [];
  return <FullDataTable fullData={[...started, ...newjobs]} columns={columns} onClick={onClick} />;
};

/**
 * PaginationTable wrapper for if the full data is already in memory
 */
const FullDataTable = ({ fullData, columns, onClick }) => {
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
    />
  );
};

/**
 * A nice table with pagination
 * @param {array} data an Array with data for a single page
 * @param {array} columns an Array with objects indicating which columns to show and how
 * @param {int} pages the number of pages
 * @param {function} pageChange the function to perform on pagechange. Gets pageindex as an argument, and should update data
 * @returns
 */
const PaginationTable = ({ data, columns, pages, pageChange, onClick }) => {
  const createHeaderRow = (data, columns) => {
    return columns.map((col, i) => {
      return (
        <Table.HeaderCell key={i} width={col.width || null}>
          <span title={col.name}>{col.name}</span>
        </Table.HeaderCell>
      );
    });
  };

  const createBodyRows = (data) => {
    return data.map((rowObj, i) => {
      return (
        <Table.Row key={i} style={{ cursor: "pointer" }} onClick={() => onClick(rowObj)}>
          {createRowCells(rowObj)}
        </Table.Row>
      );
    });
  };

  const createRowCells = (rowObj) => {
    return columns.map((column, i) => {
      if (column.hide) return null;

      let content;
      if (column.f) {
        content = column.f(rowObj);
      } else {
        content = rowObj ? rowObj[column.name] : null;
      }
      if (content instanceof Date) content = content.toISOString().slice(0, 19).replace(/T/g, " ");
      return (
        <Table.Cell key={i}>
          <span title={content}>{content}</span>
        </Table.Cell>
      );
    });
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
          <Table.Row>{createHeaderRow(data, columns)}</Table.Row>
        </Table.Header>
        <Table.Body>{createBodyRows(data)}</Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan={columns.length}>
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

export default JobsTable;
