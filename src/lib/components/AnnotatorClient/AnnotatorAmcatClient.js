import React, { useState, useEffect } from "react";
import Annotator from "../Annotator/Annotator";
import { Grid, Loader } from "semantic-ui-react";
import useBackend from "./components/useBackend";
import JobServerAPI from "./classes/JobServerAPI";
import Home from "./components/Home";

import { useSearchParams } from "react-router-dom";

// NOTE TO SELF
// Add option to code without having to log in (needs to happen in backend too)
// Then when coders first check in, they need to either give their email-adress OR say "stay anonymous"
// Codingjobs can then specify whether stay anonymous is allowed, and whether registration is required.

const AnnotatorAmcatClient = () => {
  const [backend, authForm, initBackend] = useBackend();
  const [jobServer, initJobServer] = useJobServer(backend);

  if (initBackend) return <Loader active content="Trying to connect to server" />;

  if (!backend) {
    // If backend isn't connected
    return (
      <Grid inverted textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
        <Grid.Column style={{ maxWidth: "500px" }}>{authForm}</Grid.Column>
      </Grid>
    );
  }

  if (initJobServer) return <Loader active content="Looking for codingjob" />;

  if (!jobServer) {
    // if backend is connected, but there is no jobServer (because no job_id was passed in the url)
    // show a screen with some relevant info for the user on this host. Like current / new jobs
    return <Home backend={backend} authForm={authForm} />;
  }

  return <Annotator jobServer={jobServer} />;
};

const useJobServer = (backend) => {
  const [jobServer, setJobServer] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [initializing, setInitializing] = useState(true);
  let jobId = backend?.restricted_job || searchParams.get("job_id");

  useEffect(() => {
    if (!backend) {
      setJobServer(null);
      return;
    }
    if (jobId == null || jobId === null) {
      setInitializing(false);
      setJobServer(null);
      return;
    }
    setJobServer(null);
    const returnLink = backend?.restricted_job ? null : "/";
    const js = new JobServerAPI(backend, jobId, setJobServer, returnLink);
    js.init()
      .then(() => setJobServer(js))
      .catch(() => {
        searchParams.delete("job_id");
        setSearchParams(searchParams);
      })
      .finally(() => setInitializing(false)); // add a check for if job_id is invalid
  }, [backend, jobId, searchParams, setSearchParams]);

  return [jobServer, initializing];
};

export default React.memo(AnnotatorAmcatClient);
