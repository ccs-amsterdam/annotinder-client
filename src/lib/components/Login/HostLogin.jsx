import React, { useState } from "react";
import { Segment, Grid, Button, Form } from "semantic-ui-react";
import { getHostInfo } from "./Backend";
import useWatchChange from "../../hooks/useWatchChange";

const HostLogin = ({ setHostInfo, sessionHost, searchParams, setSearchParams }) => {
  const [host, setHost] = useState(sessionHost);
  const [error, setError] = useState("");
  const paramHost = searchParams.get("host");
  const [waitForParam, setWaitForParam] = useState(false);

  const tryHost = (host) => {
    setHost(host);
    return getHostInfo(host)
      .then((hostinfo) => {
        hostinfo.host = host;
        searchParams.set("host", host);
        setSearchParams(searchParams);
        setHostInfo(hostinfo);
        setError("");
      })
      .catch((e) => {
        console.error(e);
        setHostInfo(null);
        setError("Invalid host");
      });
  };

  if (useWatchChange([paramHost])) {
    if (paramHost) {
      setWaitForParam(true);
      tryHost(paramHost).finally(() => setWaitForParam(false));
    }
  }

  if (waitForParam) return null;

  return (
    <Segment
      placeholder
      attached="bottom"
      style={{
        backdropFilter: "blur(3px)",
        background: "#aaaaaaaa",
        borderRadius: "10px",
        position: "relative",
      }}
    >
      <Grid stackable textAlign="center">
        <Grid.Row>
          <Grid.Column>
            <Form>
              <Form.Input
                placeholder="Host"
                name="host"
                label="Host"
                error={error || null}
                value={host}
                onChange={(e, d) => {
                  setHost(d.value);
                }}
                icon="home"
                iconPosition="left"
                autoFocus
              />

              <Button disabled={host.length === 0} primary fluid onClick={() => tryHost(host)}>
                Select host
              </Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <span
        style={{
          position: "absolute",
          color: "grey",
          fontSize: "10px",
          left: "5px",
          bottom: "-20px",
        }}
      >
        Version 0.3.4
      </span>
    </Segment>
  );
};

export default HostLogin;
