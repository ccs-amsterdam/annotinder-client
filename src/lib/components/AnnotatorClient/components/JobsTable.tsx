import React, { useEffect } from "react";
import FullDataTable from "./FullDataTable";
import { Button } from "semantic-ui-react";
import { Column } from "../../../types";

const columns: Column[] = [
  { name: "id", title: true, width: 2 },
  { name: "title", title: true, width: 6 },
  { name: "created", title: true, date: true, width: 6 },
  { name: "creator", title: true, width: 6 },
];

export default function JobsTable({ backend, setJob, jobs, setJobs, jobId, setJobId }) {
  useEffect(() => {
    getAllJobs(backend, setJobs);
  }, [backend, setJobs]);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      if (jobs && jobs.length > 0) setJobId(jobs[0].id);
      return;
    }
    backend
      .getCodingjobDetails(jobId)
      .then(setJob)
      .catch((e) => {
        console.error(e);
        setJob(null);
      });
  }, [jobs, jobId, backend, setJob, setJobId]);

  const onClick = async (job) => {
    setJobId(job.id);
  };

  return (
    <FullDataTable
      fullData={jobs}
      setFullData={setJobs}
      buttons={ArchiveButton}
      columns={columns}
      onClick={onClick}
      backend={backend}
      isActive={(row) => row.id === jobId}
    />
  );
}

const setJobSettings = async (id, backend, settingsObj, setJobs, setJob) => {
  backend.setJobSettings(id, settingsObj);
  setJobs((jobs) => {
    const i = jobs.findIndex((j) => j.id === Number(id));
    if (i >= 0) jobs[i] = { ...jobs[i], ...settingsObj };
    return [...jobs];
  });
  // setJob is optional because it doesn't work if set via the button in FullDataTable
  if (setJob) setJob((job) => ({ ...job, ...settingsObj }));
};

const ArchiveButton = ({ row, backend, setData, style }) => {
  if (!backend) return null;

  return (
    <Button
      icon={row.archived ? "eye slash" : "eye"}
      onClick={(e, d) => {
        //toggleJobArchived(row.id, backend, setData);
        setJobSettings(row.id, backend, { archived: !row.archived }, setData, null);
      }}
      style={{ padding: "5px", background: row.archived ? "#f76969" : "", ...style }}
    />
  );
};

const getAllJobs = (backend, setJobs) => {
  backend
    .getAllJobs()
    .then((jobs) => {
      setJobs(jobs.jobs || []);
    })
    .catch((e) => {
      console.error(e);
      setJobs([]);
    });
};
