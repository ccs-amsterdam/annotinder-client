import React, { useState, useEffect } from "react";
import Annotator from "../Annotator/Annotator";
import { Grid } from "semantic-ui-react";
import useBackend from "./components/useBackend";
import JobServerAPI from "./classes/JobServerAPI";
import HomeAdmin from "./components/HomeAdmin";
import HomeCoder from "./components/HomeCoder";

import { useSearchParams } from "react-router-dom";

// NOTE TO SELF
// Add option to code without having to log in (needs to happen in backend too)
// Then when coders first check in, they need to either give their email-adress OR say "stay anonymous"
// Codingjobs can then specify whether stay anonymous is allowed, and whether registration is required.

const AnnotatorAPIClient = () => {
  const [searchParams] = useSearchParams();
  let urlHost = searchParams.get("host");
  let urlToken = searchParams.get("token");
  let urlJobId = searchParams.get("job_id");

  // if local=[port], this is a local job without authentication and a single job (id=0)
  const [backend, loginForm] = useBackend(urlHost, urlToken);
  const jobServer = useJobServerBackend(backend, urlJobId);

  if (!backend) {
    // If backend isn't connected
    return (
      <Grid inverted textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
        <Grid.Column style={{ maxWidth: "500px" }}>{loginForm}</Grid.Column>
      </Grid>
    );
  }

  if (!jobServer) {
    if (!backend) return;
    // if backend is connected, but there is no jobServer (because no job_id was passed in the url)
    // show a screen with some relevant info for the user on this host. Like current / new jobs
    if (backend.is_admin) return <HomeAdmin backend={backend} loginForm={loginForm} />;
    return <HomeCoder backend={backend} loginForm={loginForm} />;
  }

  if (urlJobId && jobServer.job_id !== urlJobId) return null;
  if (urlHost && backend.host !== urlHost) return null;
  return <Annotator jobServer={jobServer} askFullScreen />;
};

const useJobServerBackend = (backend, jobId) => {
  const [jobServer, setJobServer] = useState(null);

  useEffect(() => {
    if (!backend || jobId == null || jobId === null) {
      setJobServer(null);
      return;
    }
    setJobServer(null);
    const js = new JobServerAPI(backend, jobId, setJobServer);
    js.init().then(() => setJobServer(js)); // add a check for if job_id is invalid
  }, [backend, jobId]);

  return jobServer;
};

export default AnnotatorAPIClient;
