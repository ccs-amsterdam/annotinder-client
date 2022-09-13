import React, { useState, useEffect } from "react";
import { Header, Divider, Segment, Grid, Button, Form, Icon } from "semantic-ui-react";
import { HostInfo, SetState } from "../../types";
import useLocalStorage from "../../hooks/useLocalStorage";
import Backend, { passwordLogin, redeemJobToken } from "./Backend";

interface UserLoginProps {
  setToken: SetState<string>;
  hostInfo: HostInfo;
  searchParams: URLSearchParams;
  setSearchParams: any;
}

const UserLogin = ({
  setToken,
  hostInfo,
  setHostInfo,
  searchParams,
  setSearchParams,
}: UserLoginProps) => {
  const host = hostInfo.host;
  const userId = searchParams.get("user_id");
  const jobtoken = searchParams.get("jobtoken");
  const asGuest = searchParams.get("as_guest");

  return (
    <Segment placeholder attached="bottom" style={{ borderRadius: "10px", position: "relative" }}>
      <Grid textAlign="center">
        <Grid.Row>
          <Grid.Column style={{ fontSize: "1.5em", fontWeight: "bold" }}>
            {hostInfo.host}
            {"  "}
            <Icon
              color="blue"
              name="undo"
              onClick={() => {
                searchParams.delete("host");
                setSearchParams(searchParams);
                setHostInfo();
              }}
              style={{ cursor: "pointer" }}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <AsGuest
            setToken={setToken}
            host={hostInfo.host}
            userId={userId}
            jobtoken={jobtoken}
            asGuest={asGuest}
          />
          <AsUser setToken={setToken} host={host} />
          <Divider vertical>Or</Divider>
        </Grid.Row>
      </Grid>
    </Segment>
  );
};

const AsGuest = ({ setToken, host, userId, jobtoken, asGuest }) => {
  const [guestAuth, setGuestAuth] = useLocalStorage("guest_auth", {});

  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;
  const alreadyGuest = !!guestAuth[key];

  useEffect(() => {
    if (!asGuest) return;
    redeemShuffle(host, userId, jobtoken, guestAuth, setGuestAuth)
      .then((token) => {
        setToken(token);
      })
      .catch((e) => {
        setToken("");
        console.log("show error message or something");
      });
  }, [setToken, guestAuth, host, userId, jobtoken, setGuestAuth, asGuest]);

  return (
    <Grid.Column width="8">
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Header style={{ color: "rgb(33, 133, 208)", marginBottom: "20px" }}>One-time login</Header>
        <p style={{ marginLeft: "10%", marginRight: "10%" }}>
          {alreadyGuest
            ? "This device is already logged in. Click here to continue"
            : "Log in once with your current device. You can then still close the app and return later, but only using this device (and using the same browser)"}
        </p>

        <Button
          primary
          fluid
          style={{ marginTop: "20px" }}
          onClick={() => {
            redeemShuffle(host, userId, jobtoken, guestAuth, setGuestAuth)
              .then((token) => {
                setToken(token);
              })
              .catch((e) => {
                console.log("show error message or something");
              });
          }}
        >
          {alreadyGuest ? "Continue" : "Log in"}
        </Button>
      </div>
    </Grid.Column>
  );
};

const AsUser = ({ setToken, host }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);

  const tryPasswordLogin = async () => {
    setPassword("");
    try {
      const token = await passwordLogin(host, name, password);
      setToken(token);
    } catch (e) {
      setToken("");
      setInvalidPassword(true);
      console.error(e);
    }
  };

  return (
    <Grid.Column width="8">
      <Header style={{ color: "rgb(33, 133, 208)" }}>User login</Header>

      <Form>
        <Form.Input
          placeholder="Username"
          name="user"
          label="Username"
          icon="user"
          iconPosition="left"
          value={name}
          onChange={(e, d) => {
            setName(d.value);
          }}
        />
        <Form.Input
          placeholder="password"
          name="password"
          error={invalidPassword ? "Invalid password for this Host & Username" : false}
          label="Password"
          type="password"
          icon="lock"
          iconPosition="left"
          value={password}
          onChange={(e, d) => {
            setInvalidPassword(false);
            setPassword(d.value);
          }}
        />
        <Button disabled={password.length === 0} primary fluid onClick={tryPasswordLogin}>
          Sign in
        </Button>
      </Form>
    </Grid.Column>
  );
};

const redeemShuffle = async (host, userId, jobtoken, guestAuth, setGuestAuth) => {
  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;

  if (guestAuth[key]) {
    const data = guestAuth[key];
    const backend = new Backend(host, data.token);
    try {
      await backend.init();
      // token still works
      return backend.token;
    } catch (e) {
      // TODO check if e is forbidden. If so, delete token. But don't delete if just server down or
      console.log(e);
      // there is a token but it no longer works. (typically happens when resetting db in dev)
      delete guestAuth[key];
      setGuestAuth(guestAuth);
    }
  }

  try {
    const data = await redeemJobToken(host, jobtoken, userId);
    setGuestAuth({ ...guestAuth, [key]: data });
    return data.token;
  } catch (e) {
    console.error(e);
    return "";
  }
};

export default UserLogin;
