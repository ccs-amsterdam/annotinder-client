import React, { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Segment, Grid, Button, Form } from "semantic-ui-react";
import { OauthClients, HostInfo } from "../../types";
import Backend, { getHostInfo } from "../AnnotatorClient/classes/Backend";
import useWatchChange from "../../hooks/useWatchChange";
import useLocalStorage from "../../hooks/useLocalStorage";

function useBackend(hostInfo: HostInfo, searchParams): Backend {
  const [backend, setBackend] = useState(null);
  //const [guestAuth, setGuestAuth] = useLocalStorage("guest_auth", {});
  const [storageToken, setStorageToken] = useLocalStorage("token", "");

  const userId = searchParams.get("user_id");
  const jobtoken = searchParams.get("jobtoken");
  const asGuest = searchParams.get("guest");
  const logintoken = searchParams.get("logintoken");

  const login = useCallback(
    async (token) => {
      if (!hostInfo?.host) return null;
      const b = new Backend(hostInfo.host, token);
      try {
        await b.init();
        if (userId && b.name !== userId) {
          setBackend(null);
          return;
        }
        setStorageToken(token);
        setBackend(b);
      } catch (e) {
        setBackend(null);
      }
    },
    [hostInfo, userId]
  );

  if (useWatchChange([hostInfo])) {
    if (!backend && storageToken) tryToken(storageToken);
  }

  const userlogin = <UserLogin hostInfo={hostInfo} login={login} />;
  return token;
}

const UserLogin = ({ hostInfo, login }) => {
  return (
    <Segment placeholder attached="bottom" style={{ borderRadius: "10px", position: "relative" }}>
      <Grid textAlign="center">
        <Grid.Row>
          <AsGuest host={hostInfo.host} userId={userId} jobtoken={jobtoken} asGuest={asGuest} />
          <AsUser host={host} userId={userId} jobtoken={jobtoken} />
          <Divider vertical>Or</Divider>
        </Grid.Row>
      </Grid>
    </Segment>
  );
};

const AsGuest = ({ host, jobtoken, asGuest }) => {
  const [guestAuth, setGuestAuth] = useLocalStorage("guest_auth", {});

  const userId = searchParams.get("user_id");
  const navigate = useNavigate();

  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;
  const alreadyGuest = !!guestAuth[key];

  useEffect(() => {
    if (!asGuest) return;
    redeemShuffle(host, userId, jobtoken, guestAuth, setGuestAuth, navigate)
      .then()
      .catch((e) => {
        console.log("show error message or something");
      });
  }, [guestAuth, host, userId, jobtoken, navigate, setGuestAuth, asGuest]);

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
            redeemShuffle(host, userId, jobtoken, guestAuth, setGuestAuth, navigate)
              .then()
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

const AsUser = ({ host, userId, jobtoken }) => {
  //const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);

  const tryPasswordLogin = async () => {
    setPassword("");
    try {
      const token = await passwordLogin(host, name, password);
      setLogin(host, token);
    } catch (e) {
      setLogin(null, null);
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

const redeemShuffle = async (host, userId, jobtoken, guestAuth, setGuestAuth, navigate) => {
  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;

  if (guestAuth[key]) {
    const data = guestAuth[key];
    const backend = new Backend(host, data.token);
    try {
      await backend.init();
      // token still works
      navigate(`/?host=${host}&token=${data.token}&job_id=${data.job_id}`);
    } catch (e) {
      // there is a token but it no longer works. (typically happens when resetting db in dev)
      delete guestAuth[key];
      setGuestAuth(guestAuth);
    }
  }

  if (!guestAuth[key]) {
    try {
      const data = await redeemJobToken(host, jobtoken, userId);
      setGuestAuth({ ...guestAuth, [key]: data });
      navigate(`/?host=${host}&token=${data.token}&job_id=${data.job_id}`);
    } catch (e) {
      console.error(e);
    }
  }
};

export default useBackend;
