import React, { useEffect, useState } from "react";

// Main pages. Use below in items to include in header menu
import Annotator from "../Annotator/Annotator";
import Backend from "../Login/Backend";
import JobServerR from "./classes/jobServerR";
import { JobServer, SetState } from "../../types";
import { CenteredDiv } from "../../styled/Styled";
import { FaSync } from "react-icons/fa";
import styled from "styled-components";

const PORT = 8000;
const TRY_EVERY = 1000;

const StyledDiv = styled.div`
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--background);
  color: var(--primary-text);

  h2 {
    color: var(--text);
  }
  svg {
    margin-bottom: 2rem;
    color: var(--primary-text);
    animation: spin 5s infinite linear;
  }
`;

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
      <CenteredDiv>
        <StyledDiv>
          <FaSync size="4rem" />
          <h2>{`Connecting to port ${PORT}`}</h2>
          <h3>
            If this takes forever, please make sure the R server is actually running on this port`
          </h3>
        </StyledDiv>
      </CenteredDiv>
    );
  }

  return <Annotator jobServer={jobServer} cantLeave />;
}

const login = async (setJobServer: SetState<JobServer>) => {
  try {
    const backend = new Backend("http://localhost:" + PORT, null);
    await backend.init();
    const js = new JobServerR(backend, "0", setJobServer);
    await js.init();
    setJobServer(js);
  } catch (e) {}
};
