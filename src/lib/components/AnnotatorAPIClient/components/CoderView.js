import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FullDataTable from "./FullDataTable";
import { Grid, Header } from "semantic-ui-react";

const columns = [
  { name: "title", title: true },
  { name: "progress", f: (row) => `${row.n_coded || 0} / ${row.n_total}` },
  { name: "modified", title: true, date: true },
  { name: "created", title: true, date: true },
];

export default function CoderView({ backend }) {
  return (
    <Grid centered stackable>
      <Grid.Row>
        <Grid.Column width="8">
          <Header>Coding jobs</Header>
          <CoderJobsTable backend={backend} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

const CoderJobsTable = ({ backend }) => {
  const [, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    backend
      .getUserJobs()
      .then((jobs) => {
        setJobs(jobs.jobs || []);
      })
      .catch((e) => {
        console.error(e);
        setJobs([]);
      });
  }, [backend]);

  const onClick = (rowObj) => {
    setSearchParams({ host: backend.host, job_id: rowObj.id });
  };

  const started = jobs ? jobs.filter((j) => j.modified !== "NEW") : [];
  const newjobs = jobs ? jobs.filter((j) => j.modified === "NEW") : [];
  return (
    <FullDataTable
      fullData={[...started, ...newjobs]}
      setFullData={setJobs}
      columns={columns}
      onClick={onClick}
    />
  );
};
