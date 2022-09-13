import React, { useState, useEffect } from "react";
import Annotator from "../Annotator/Annotator";
import { Loader } from "semantic-ui-react";
import JobServerAPI from "./classes/JobServerAPI";
import Home from "./components/Home";

import { useSearchParams } from "react-router-dom";
import Backend from "../Login/Backend";
import { JobServer } from "../../types";

import useLogin from "../Login/useLogin";

const AnnotatorPythonClient = () => {
  const [backend, loginscreen] = useLogin();
  const [jobServer, initJobServer] = useJobServer(backend);
  if (!backend) return loginscreen;

  if (initJobServer) return <Loader active content="Looking for codingjob" />;

  if (!jobServer) {
    // if backend is connected, but there is no jobServer (because no job_id was passed in the url)
    // show a screen with some relevant info for the user on this host. Like current / new jobs
    return <Home backend={backend} authForm={loginscreen} />;
  }

  return <Annotator jobServer={jobServer} />;
};

const useJobServer = (backend: Backend): [JobServer, boolean] => {
  const [jobServer, setJobServer] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [initializing, setInitializing] = useState(true);
  //let jobId = backend?.restricted_job || searchParams.get("job_id");
  let jobId = Number(searchParams.get("job_id"));
  jobId = jobId != null ? Number(jobId) : null;

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
    const js = new JobServerAPI(backend, jobId as number, setJobServer, returnLink);
    js.init()
      .then(() => {
        setJobServer(js);
        searchParams.set("job_id", String(jobId));
        setSearchParams(searchParams);
      })
      .catch(() => {
        searchParams.delete("job_id");
        setSearchParams(searchParams);
      })
      .finally(() => setInitializing(false)); // add a check for if job_id is invalid
  }, [backend, jobId, searchParams, setSearchParams]);

  return [jobServer, initializing];
};

export default React.memo(AnnotatorPythonClient);
