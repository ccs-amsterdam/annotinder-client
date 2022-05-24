import React, { CSSProperties, useEffect } from "react";
import FullDataTable from "./FullDataTable";
import { Button } from "semantic-ui-react";
import { Column, Job, JobSettings, RowObj, SetState } from "../../../types";
import Backend from "../classes/Backend";

const columns: Column[] = [
  { name: "id", title: true, width: 2 },
  { name: "title", title: true, width: 6 },
  { name: "created", title: true, date: true, width: 6 },
  { name: "creator", title: true, width: 6 },
];

interface JobsTableProps {
  backend: Backend;
  setJob: SetState<Job>;
  jobs: Job[];
  setJobs: SetState<Job[]>;
  jobId: number;
  setJobId: SetState<number>;
}

export default function JobsTable({
  backend,
  setJob,
  jobs,
  setJobs,
  jobId,
  setJobId,
}: JobsTableProps) {
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

  const onClick = async (job: RowObj) => {
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

const setJobSettings = async (
  id: number,
  backend: Backend,
  settingsObj: JobSettings,
  setJobs: SetState<Job[]>,
  setJob: SetState<Job>
) => {
  backend.setJobSettings(id, settingsObj);
  setJobs((jobs) => {
    const i = jobs.findIndex((j) => j.id === Number(id));
    if (i >= 0) jobs[i] = { ...jobs[i], ...settingsObj };
    return [...jobs];
  });
  // setJob is optional because it doesn't work if set via the button in FullDataTable
  if (setJob) setJob((job: Job) => ({ ...job, ...settingsObj }));
};

interface ArchiveButtonProps {
  row: RowObj;
  backend: Backend;
  setData: SetState<RowObj[]>;
  style: CSSProperties;
}

const ArchiveButton = ({ row, backend, setData, style }: ArchiveButtonProps) => {
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
