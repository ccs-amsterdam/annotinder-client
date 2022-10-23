import React, { useEffect, useState } from "react";

// Main pages. Use below in items to include in header menu
import Annotator from "../Annotator/Annotator";
import Backend from "../Login/Backend";
import JobServerR from "./classes/jobServerR";
import { Grid, Icon } from "semantic-ui-react";
import { JobServer, SetState } from "../../types";

const PORT = 8000;
const TRY_EVERY = 1000;

export default function AnnotatorRClient() {
  // A simple client that just looks for a backend on the host
  // Assumes only 1 job (with job_id = 0 or just ignored in backend)
  const [jobServer, setJobServer] = useState(null);

  useEffect(() => {
    if (jobServer) return;

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
          <h2>{`Connecting to port ${PORT}. If this takes forever, please make sure the server is actually running`}</h2>
        </Grid.Column>
      </Grid>
    );
  }

  return <Annotator jobServer={jobServer} cantLeave />;
}

const login = async (setJobServer: SetState<JobServer>) => {
  try {
    const backend = new Backend("http://localhost:" + PORT, null);
    await backend.init();
    const js = new JobServerR(backend, 0, setJobServer);
    await js.init();
    setJobServer(js);
  } catch (e) {}
};
