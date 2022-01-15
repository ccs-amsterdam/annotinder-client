import React, { useState, useEffect } from "react";
import Annotator from "../Annotator/Annotator";
import { Grid, Header, Icon } from "semantic-ui-react";
import useBackend from "./useBackend";
import JobServerAPI from "../../classes/JobServerAPI";
import JobsTable from "./JobsTable";
import { useSearchParams } from "react-router-dom";

// NOTE TO SELF
// Add option to code without having to log in (needs to happen in backend too)
// Then when coders first check in, they need to either give their email-adress OR say "stay anonymous"
// Codingjobs can then specify whether stay anonymous is allowed, and whether registration is required.

const AnnotatorAPIClient = () => {
  const [searchParams] = useSearchParams();
  const urlHost = searchParams.get("host");
  const urlToken = searchParams.get("token");
  const urlJobId = searchParams.get("job_id");

  const [backend, loginForm] = useBackend(urlHost, urlToken);
  const jobServer = useJobServerBackend(backend, urlJobId);

  if (!backend)
    // If backend isn't connected, show login screen
    // If the url contained a host, this field is fixed
    return (
      <Grid inverted textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
        <Grid.Column style={{ maxWidth: "500px" }}>{loginForm}</Grid.Column>
      </Grid>
    );

  if (!jobServer) {
    if (!backend) return;
    // if backend is connected, but there is no jobServer (because no job_id was passed in the url)
    // show a screen with some relevant info for the user on this host. Like current / new jobs
    return <JobOverview backend={backend} loginForm={loginForm} />;
  }

  if (jobServer.job_id !== urlJobId) return null;
  if (urlHost && backend.host !== urlHost) return null;
  return <Annotator jobServer={jobServer} />;
};

const JobOverview = ({ backend, loginForm }) => {
  return (
    <Grid
      inverted
      textAlign="center"
      style={{ height: "100vh", maxHeight: "800px", width: "100vw" }}
      verticalAlign="middle"
    >
      <Grid.Column width="16" style={{ maxWidth: "500px" }}>
        <Grid.Row>
          <Header>
            <Icon name="home" />
            {backend.host}
          </Header>
          {loginForm}
        </Grid.Row>
        <br />
        <Grid.Row>
          <JobsTable backend={backend} />
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
};

const useJobServerBackend = (backend, jobId) => {
  const [jobServer, setJobServer] = useState(null);

  useEffect(() => {
    if (!backend || !jobId) {
      setJobServer(null);
      return;
    }
    setJobServer(null);
    const js = new JobServerAPI(backend, jobId);
    js.init().then(() => setJobServer(js)); // add a check for if job_id is invalid
  }, [backend, jobId]);

  return jobServer;
};

export default AnnotatorAPIClient;
