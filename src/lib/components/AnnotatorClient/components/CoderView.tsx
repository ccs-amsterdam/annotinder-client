import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FullDataTable from "./FullDataTable";
import { Grid, Header } from "semantic-ui-react";
import Backend from "../../Login/Backend";
import { RowObj, Job } from "../../../types";

const columns = [
  { name: "title", title: true },
  {
    name: "progress",
    f: (row: RowObj) => (row.n_total ? `${row.n_coded || 0} / ${row.n_total}` : ""),
  },
  { name: "modified", title: true, date: true },
  { name: "created", title: true, date: true },
  { name: "creator", title: true },
];

interface CoderViewProps {
  backend: Backend;
}

export default function CoderView({ backend }: CoderViewProps) {
  return (
    <Grid centered stackable>
      <Grid.Row>
        <Grid.Column textAlign="center" width="10">
          <Header>Coding jobs</Header>
          <CoderJobsTable backend={backend} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
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

  const onClick = (rowObj: RowObj) => {
    setSearchParams({ host: backend.host, job_id: rowObj.id });
  };

  const started = jobs ? jobs.filter((j) => j.modified != null) : [];
  const newjobs = jobs ? jobs.filter((j) => j.modified == null) : [];
  return (
    <FullDataTable
      fullData={[...started, ...newjobs]}
      setFullData={setJobs}
      columns={columns}
      onClick={onClick}
    />
  );
};
