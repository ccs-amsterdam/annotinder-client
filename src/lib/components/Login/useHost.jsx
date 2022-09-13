import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Segment, Grid, Button, Form } from "semantic-ui-react";
import { OauthClients, HostInfo } from "../../types";
import { getHostInfo } from "../AnnotatorClient/classes/Backend";
import useWatchChange from "../../hooks/useWatchChange";
import useLocalStorage from "../../hooks/useLocalStorage";

function useHost(paramHost: string, storedHost: string): [HostInfo, ReactNode] {
  const [hostInfo, setHostInfo] = useState(null);
  const [storageHost, setStorageHost] = useLocalStorage("host", "");

  const tryHost = (host) => {
    getHostInfo(host)
      .then((hostinfo) => {
        hostinfo.host = host;
        setHostInfo(hostinfo);
        setStorageHost(host);
      })
      .catch((e) => {
        console.error(e);
        setHostInfo(null);
      });
  };

  if (useWatchChange([paramHost])) {
    if (!hostInfo && paramHost) tryHost(paramHost);
  }
  if (useWatchChange([storageHost])) {
    if (!hostInfo && !paramHost && storageHost) tryHost(storageHost);
  }

  const hostlogin = <HostLogin tryHost={tryHost} />;
  return [hostInfo, hostlogin];
}

const HostLogin = ({ tryHost }) => {
  const [host, setHost] = useState("");

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
                value={host}
                onChange={(e, d) => {
                  setHost(d.value);
                }}
                icon="home"
                iconPosition="left"
                autoFocus
              />

              <Button disabled={host.length === 0} primary fluid onClick={() => tryHost(host)}>
                Sign in
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

export default useHost;
