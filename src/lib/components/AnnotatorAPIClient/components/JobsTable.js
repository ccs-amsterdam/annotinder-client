import React from "react";
import { useSearchParams } from "react-router-dom";
import FullDataTable from "./FullDataTable";

const columns = [
  { name: "title", title: true },
  { name: "progress", f: (row) => `${row.n_coded || 0} / ${row.n_total}` },
  { name: "modified", title: true },
];

export default function JobsTable({ backend }) {
  const [, setSearchParams] = useSearchParams();

  const onClick = (rowObj) => {
    setSearchParams({ host: backend.host, job_id: rowObj.id });
  };

  const jobs = backend?.jobs;
  const started = jobs ? jobs.filter((j) => j.modified !== "NEW") : [];
  const newjobs = jobs ? jobs.filter((j) => j.modified === "NEW") : [];
  return <FullDataTable fullData={[...started, ...newjobs]} columns={columns} onClick={onClick} />;
}
