import React, { useEffect, useState } from "react";

// Main pages. Use below in items to include in header menu
import Annotator from "../Annotator/Annotator";
import Backend from "./classes/Backend";
import JobServerAPI from "./classes/JobServerAPI";
import { Grid, Header, Icon } from "semantic-ui-react";

const PORT = 8000;
const TRY_EVERY = 1000;

// This is mainly included here for development.
// The actual version used by R is in ccs-annotator-client-r

export default function AnnotatorRClient() {
  // A simple client that just looks for a backend on the host
  // Assumes only 1 job (with job_id = 0 or just ignored in backend)
  const [jobServer, setJobServer] = useState(null);

  useEffect(() => {
    if (jobServer) return null;

    const interval = setInterval(() => {
      login(setJobServer);
    }, TRY_EVERY);

    return () => clearInterval(interval);
  }, [jobServer, setJobServer]);

  if (!jobServer) {
    return (
      <Grid inverted textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
        <Grid.Column style={{ maxWidth: "500px" }}>
          <Icon
            name="sync"
            size="huge"
            style={{
              animation: "rotation 5s infinite linear",
            }}
          />
          <Header>{`Connecting to port ${PORT}. If this takes forever, please make sure the server is actually running`}</Header>
        </Grid.Column>
      </Grid>
    );
  }

  return <Annotator jobServer={jobServer} />;
}

const login = async (setJobServer) => {
  try {
    const backend = new Backend("http://localhost:" + PORT, null);
    await backend.init();
    const js = new JobServerAPI(backend, 0, setJobServer);
    await js.init();
    setJobServer(js);
  } catch (e) {}
};
