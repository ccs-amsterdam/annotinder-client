import React, { useState, useEffect } from "react";
import Annotator from "../Annotator/Annotator";
import JobServerPython from "./classes/JobServerPython";
import Home from "./components/Home";

import { useSearchParams } from "react-router-dom";
import Backend from "../Login/Backend";
import { JobServer } from "../../types";

import useLogin from "../Login/useLogin";
import { Loader } from "../../styled/Styled";

const AnnotatorPythonClient = () => {
  const [backend, authForm] = useLogin();
  const [jobServer, initJobServer] = useJobServer(backend);
  if (!backend) return authForm;

  if (initJobServer) return <Loader active content="Looking for codingjob" />;

  if (!jobServer) {
    // if backend is connected, but there is no jobServer (because no job_id was passed in the url)
    // show a screen with some relevant info for the user on this host. Like current / new jobs
    return <Home backend={backend} authForm={authForm} />;
  }

  return <Annotator jobServer={jobServer} askFullScreen authForm={authForm} />;
};

const useJobServer = (backend: Backend): [JobServer, boolean] => {
  const [jobServer, setJobServer] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [initializing, setInitializing] = useState(true);

  let jobId = backend?.restricted_job;
  const jobIdParam = searchParams.get("job_id") as string;
  if (jobId == null && jobIdParam) jobId = jobIdParam;

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
    const js = new JobServerPython(backend, jobId, setJobServer, returnLink);
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
