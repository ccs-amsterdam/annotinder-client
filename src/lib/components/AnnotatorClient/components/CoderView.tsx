import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Backend from "../../Login/Backend";
import { Job } from "../../../types";
import styled from "styled-components";
import GridList from "../../Common/GridList/GridList";
import {
  DataPoint,
  DataQuery,
  FilterQueryOption,
  GridItemTemplate,
  SortQueryOption,
} from "../../Common/GridList/GridListTypes";

const StyledDiv = styled.div`
  h2 {
    text-align: center;
  }
`;

interface CoderViewProps {
  backend: Backend;
}

export default function CoderView({ backend }: CoderViewProps) {
  return (
    <StyledDiv>
      <h2>Coding jobs</h2>
      <CoderJobsTable backend={backend} />
    </StyledDiv>
  );
}

const CoderJobsTable = ({ backend }: { backend: Backend }) => {
  const [, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    backend
      .getUserJobs()
      .then((jobs: Job[]) => {
        setJobs(jobs || []);
      })
      .catch((e: Error) => {
        console.error(e);
        setJobs([]);
      });
  }, [backend]);

  const onClick = (rowObj: DataPoint) => {
    setSearchParams({ host: backend.host, job_id: rowObj.id });
  };

  //const started = jobs ? jobs.filter((j) => j.modified != null) : [];
  //const newjobs = jobs ? jobs.filter((j) => j.modified == null) : [];

  function loadData(query: DataQuery) {
    let data = jobs.map((v) => {
      v.modified = v.modified && new Date(v.modified);
      v.created = v.created && new Date(v.created);
      v.progress = v.n_total ? (v.n_coded || 0) / v.n_total : NaN;
      v.status = v.progress === 1 ? "Done" : "In progress";
      return v;
    });

    sortData(data, query);
    data = data.slice(query.offset, query.offset + query.n);
    const meta = { offset: query.offset, total: jobs.length };
    return { data, meta };
  }

  return (
    <>
      <GridList
        loadData={loadData}
        onClick={onClick}
        template={gridItemTemplate}
        sortOptions={sortOptions}
        filterOptions={filterOptions}
      />
    </>
  );
};

const gridItemTemplate: GridItemTemplate[] = [
  { label: "Coding Job", value: "title", style: { fontWeight: "bold", fontSize: "1.6rem" } },
  {
    label: "Last activity",
    value: "modified",
    style: { fontStyle: "italic" },
  },
];

const sortOptions: SortQueryOption[] = [
  { variable: "modified", label: "Last activity", default: "desc" },
];

const filterOptions: FilterQueryOption[] = [{ variable: "title", label: "Title", type: "search" }];

const sortData = (data: DataPoint[], query: DataQuery) => {
  if (!query.sort || query.sort.length === 0) return;

  function compare(a: any, b: any) {
    if (!a && !b) return 0;
    const isDate = ((a || b) as Date).getMonth !== undefined;
    if (!a) return isDate ? -1 : 1;
    if (!b) return isDate ? 1 : -1;
    if (typeof a === "string") return a.localeCompare(b);
    return a - b;
  }

  data.sort((aData: DataPoint, bData: DataPoint) => {
    for (let sort of query.sort) {
      const a: any = aData[sort.variable];
      const b: any = bData[sort.variable];
      let diff = compare(a, b);
      if (diff !== 0) return sort.order === "asc" ? diff : -diff;
    }
    return 0;
  });
};
