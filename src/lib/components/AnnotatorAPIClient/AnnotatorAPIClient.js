import React, { useState, useEffect } from "react";
import Annotator from "../Annotator/Annotator";
import { Grid, Header, Icon } from "semantic-ui-react";
import useBackend from "./useBackend";
import JobServerAPI from "../../classes/JobServerAPI";
import JobsTable from "./JobsTable";
import { useLocation } from "react-router-dom";

//   http://localhost:3000/CCS_annotator#/annotator?url=http://localhost:5000/codingjob/25

// NOTE TO SELF
// Add option to code without having to log in (needs to happen in backend too)
// Then when coders first check in, they need to either give their email-adress OR say "stay anonymous"
// Codingjobs can then specify whether stay anonymous is allowed, and whether registration is required.

const AnnotatorAPIClient = () => {
  const location = useLocation();
  const [urlHost, urlJobId, setJobId] = useParseUrl(location);
  const [backend, loginForm] = useBackend(urlHost);
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
    // if backend is connected, but there is no jobServer (because no job_id was passed in the url)
    // show a screen with some relevant info for the user on this host. Like current / new jobs
    return <JobOverview backend={backend} setJobId={setJobId} loginForm={loginForm} />;
  }

  if (jobServer.job_id !== urlJobId) return null;
  return <Annotator jobServer={jobServer} />;
};

const JobOverview = ({ backend, setJobId, loginForm }) => {
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
          <JobsTable backend={backend} setJobId={setJobId} />
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

/**
 * look for the query parameter url  (?url = ...)
  /if it exists, return the origin/host and the last part of the path (which should be the job_id)
 * @param {*} href from window.location.href
 * @returns 
 */
const useParseUrl = (location) => {
  const [host, setHost] = useState();
  const [jobId, setJobId] = useState();

  useEffect(() => {
    if (!location.search) {
      setHost(null);
      setJobId(null);
      return;
    }
    const href = location.search.replace("%colon%", ":"); // hack for issue with QR code URLs
    const params = href.split("?")?.[1];
    if (!params) return [null, null];

    const parts = params.split("&");
    const queries = parts.reduce((obj, part) => {
      const [key, value] = part.split("=");
      obj[decodeURIComponent(key)] = decodeURIComponent(value);
      return obj;
    }, {});
    if (!queries.url) return [null, null];

    const url = new URL(queries.url);
    setHost(url.origin);
    setJobId(url.pathname.split("/").slice(-1)[0]);
  }, [setHost, setJobId, location]);

  return [host, jobId];
};

export default AnnotatorAPIClient;
