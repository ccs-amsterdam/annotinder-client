import { useState, useEffect } from "react";
import JobServerAPI from "./classes/JobServerAPI";
import { useSearchParams } from "react-router-dom";

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

export default useJobServer;
