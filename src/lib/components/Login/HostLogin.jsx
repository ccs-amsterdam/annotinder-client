import React, { useState } from "react";
import { Icon, Grid, Button, Form } from "semantic-ui-react";
import { getHostInfo } from "./Backend";
import useWatchChange from "../../hooks/useWatchChange";

interface HostLoginProps {
  setHost: SetState<string>;
  hostInfoQuery: UseQueryResult;
  session: { host: string, token: string };
  searchParams: URLSearchParams;
}

export const HostLogin = ({ setHost, hostInfoQuery, session, searchParams }: HostLoginProps) => {
  const paramHost = searchParams.get("host");
  const [hostInput, setHostInput] = useState(session.host);

  if (useWatchChange([paramHost])) {
    if (paramHost) {
      setHostInput(paramHost);
      setHost(paramHost);
    }
  }

  return (
    <div>
      <Form loading={hostInfoQuery.isFetching} onSubmit={() => setHost(hostInput)}>
        <Form.Input
          placeholder="Host"
          name="host"
          label="Host"
          error={hostInfoQuery.isError ? "Could not connect to server" : null}
          value={hostInput}
          onChange={(e, d) => {
            setHostInput(d.value);
          }}
          icon="home"
          iconPosition="left"
          autoFocus
          style={{ width: "260px" }}
        />

        <Button disabled={hostInput.length === 0} primary fluid>
          Connect to server
        </Button>
      </Form>
    </div>
  );
};

export default HostLogin;
