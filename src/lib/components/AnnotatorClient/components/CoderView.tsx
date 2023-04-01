import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Backend from "../../Login/Backend";
import { Job } from "../../../types";
import styled from "styled-components";
import GridList from "../../Common/components/GridList/GridList";
import {
  DataPoint,
  DataQuery,
  FilterQueryOption,
  GridItemTemplate,
  SortQueryOption,
} from "../../Common/components/GridList/GridListTypes";
import { sortData } from "../../Common/components/GridList/GridListFunctions";

const StyledDiv = styled.div`
  position: relative;
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

  const loadData = useCallback(
    async (query: DataQuery) => {
      let data = jobs.map((v) => {
        v = { ...v };
        v.title = v.id + ": " + v.title;
        v.modified = v.modified && new Date(v.modified);
        v.created = v.created && new Date(v.created);
        v.progress = v.n_total ? Math.round((100 * (v.n_coded || 0)) / v.n_total) : null;
        v.progressLabel = v.progress != null ? `${v.progress}%` : "not started";
        v.status = v.progress === 1 ? "Done" : "In progress";
        return v;
      });
      data = data.filter((v) => {
        for (let filter of query.filter) {
          if (filter.type === "search") {
            if (!v[filter.variable]?.toLowerCase().includes(filter.search.toLowerCase()))
              return false;
          }
        }
        return true;
      });

      sortData(data, query);
      const meta = { offset: query.offset, total: data.length };
      data = data.slice(query.offset, query.offset + query.n);
      return { data, meta };
    },
    [jobs]
  );

  return (
    <>
      <GridList
        loadData={loadData}
        onClick={onClick}
        template={template}
        sortOptions={sortOptions}
        filterOptions={filterOptions}
      />
    </>
  );
};

const template: GridItemTemplate[] = [
  { label: "Coding Job", value: "title", style: { fontWeight: "bold", fontSize: "1.6rem" } },
  {
    label: "Last activity",
    value: "modified",
    style: { fontStyle: "italic", width: "50%" },
  },
  {
    label: "% Completed",
    value: "progressLabel",
    style: { fontStyle: "italic", width: "50%", textAlign: "right" },
  },
];

const sortOptions: SortQueryOption[] = [
  { variable: "modified", label: "Last activity", default: "desc" },
  { variable: "progress", label: "% Completed" },
];

const filterOptions: FilterQueryOption[] = [
  { variable: "title", label: "Coding Job Title", type: "search" },
];
