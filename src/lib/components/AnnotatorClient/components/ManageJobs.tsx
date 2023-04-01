import { useEffect, useCallback, useState } from "react";
import Backend from "../../Login/Backend";
import { Job, SetState } from "../../../types";
import JobDetails from "./JobDetails";
import GridList from "../../Common/components/GridList/GridList";
import {
  DataPoint,
  DataQuery,
  GridItemTemplate,
  FilterQueryOption,
  SortQueryOption,
} from "../../Common/components/GridList/GridListTypes";
import { sortData } from "../../Common/components/GridList/GridListFunctions";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface ManageJobsProps {
  backend: Backend;
}

export default function ManageJobs({ backend }: ManageJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    getAllJobs(backend, setJobs);
  }, [backend, setJobs]);

  const loadData = useCallback(
    async (query: DataQuery) => {
      let data: DataPoint[] = jobs.map((v: any) => {
        v = { ...v };
        v.title = v.id + ": " + v.title;
        v.created = v.created && new Date(v.created);
        return v;
      });

      data = data.filter((v) => {
        for (let filter of query.filter) {
          if (filter.type === "search") {
            const str: string = v[filter.variable] as string;
            if (typeof str !== "string") continue;
            if (!str.toLowerCase().includes(filter.search.toLowerCase())) return false;
          }
          if (filter.type === "select" && filter.select && filter.select.length > 0) {
            if (!filter.select.includes(v[filter.variable])) return false;
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

  const setDetail = useCallback(
    async (data: DataPoint) => {
      return <JobDetails backend={backend} jobId={data.id} setJobs={setJobs} />;
    },
    [backend, setJobs]
  );

  return (
    <GridList
      loadData={loadData}
      setDetail={setDetail}
      template={template}
      sortOptions={sortOptions}
      filterOptions={filterOptions}
    />
  );
}

const template: GridItemTemplate[] = [
  { label: "Coding Job", value: "title", style: { fontWeight: "bold", fontSize: "1.6rem" } },
  {
    label: "Created by",
    value: "creator",
    style: { textAlign: "left" },
  },
  {
    label: "Created",
    value: "created",
    style: { fontStyle: "italic", width: "50%", textAlign: "left" },
  },
  {
    label: "archived",
    value: (dp: DataPoint) => (dp.archived ? <FaEyeSlash /> : <FaEye />),
    style: { fontStyle: "italic", width: "50%", textAlign: "right" },
  },
];

const sortOptions: SortQueryOption[] = [{ variable: "created", label: "Created", default: "desc" }];

const filterOptions: FilterQueryOption[] = [
  { variable: "title", label: "Coding Job Title", type: "search" },
  { variable: "creator", label: "Creator", type: "search" },
  {
    variable: "archived",
    label: "Archived",
    type: "select",
    selectOptions: [
      { label: <FaEyeSlash />, value: true },
      { label: <FaEye />, value: false },
    ],
  },
];

const getAllJobs = (backend: Backend, setJobs: SetState<Job[]>) => {
  backend
    .getAllJobs()
    .then((jobs: Job[]) => {
      setJobs(jobs || []);
    })
    .catch((e: Error) => {
      console.error(e);
      setJobs([]);
    });
};
