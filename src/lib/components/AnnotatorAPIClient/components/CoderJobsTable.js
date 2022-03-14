import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react/cjs/react.development";
import FullDataTable from "./FullDataTable";

const columns = [
  { name: "title", title: true },
  { name: "progress", f: (row) => `${row.n_coded || 0} / ${row.n_total}` },
  { name: "modified", title: true },
];

export default function CoderJobsTable({ backend }) {
  const [, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    backend
      .getCodingjobs()
      .then((jobs) => {
        setJobs(jobs.jobs || []);
      })
      .catch((e) => {
        console.log(e);
        setJobs([]);
      });
  }, [backend]);

  const onClick = (rowObj) => {
    setSearchParams({ host: backend.host, job_id: rowObj.id });
  };

  const started = jobs ? jobs.filter((j) => j.modified !== "NEW") : [];
  const newjobs = jobs ? jobs.filter((j) => j.modified === "NEW") : [];
  return <FullDataTable fullData={[...started, ...newjobs]} columns={columns} onClick={onClick} />;
}
