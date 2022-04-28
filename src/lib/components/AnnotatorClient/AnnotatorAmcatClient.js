import React, { useState, useEffect } from "react";
import Annotator from "../Annotator/Annotator";
import { Grid } from "semantic-ui-react";
import useBackend from "./components/useBackend";
import JobServerAPI from "./classes/JobServerAPI";
import Home from "./components/Home";

import { useSearchParams } from "react-router-dom";

// NOTE TO SELF
// Add option to code without having to log in (needs to happen in backend too)
// Then when coders first check in, they need to either give their email-adress OR say "stay anonymous"
// Codingjobs can then specify whether stay anonymous is allowed, and whether registration is required.

const AnnotatorAmcatClient = () => {
  const [backend, authForm] = useBackend();
  const jobServer = useJobServer(backend);

  if (!backend) {
    // If backend isn't connected
    return (
      <Grid inverted textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
        <Grid.Column style={{ maxWidth: "500px" }}>{authForm}</Grid.Column>
      </Grid>
    );
  }

  if (!jobServer) {
    // if backend is connected, but there is no jobServer (because no job_id was passed in the url)
    // show a screen with some relevant info for the user on this host. Like current / new jobs
    return <Home backend={backend} authForm={authForm} />;
  }

  //if (urlJobId && jobServer.job_id !== urlJobId) return null;
  //if (urlHost && backend.host !== urlHost) return null;
  return <Annotator jobServer={jobServer} />;
};

const useJobServer = (backend) => {
  const [jobServer, setJobServer] = useState(null);
  const [searchParams] = useSearchParams();
  let urlJobId = searchParams.get("job_id");

  useEffect(() => {
    if (!backend || urlJobId == null || urlJobId === null) {
      setJobServer(null);
      return;
    }
    setJobServer(null);
    const js = new JobServerAPI(backend, urlJobId, setJobServer);
    js.init().then(() => setJobServer(js)); // add a check for if job_id is invalid
  }, [backend, urlJobId]);

  return jobServer;
};

export default React.memo(AnnotatorAmcatClient);
