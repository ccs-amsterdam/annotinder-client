import React, { useState, useEffect } from "react";
import { Header, Divider, Segment, Grid, Button, Form, Icon } from "semantic-ui-react";
import { HostInfo, SetState } from "../../types";
import useLocalStorage from "../../hooks/useLocalStorage";
import Backend, { passwordLogin, redeemJobToken, requestMagicLink } from "./Backend";

interface UserLoginProps {
  setToken: SetState<string>;
  hostInfo: HostInfo;
  searchParams: URLSearchParams;
  setSearchParams: any;
}

const UserLogin = ({ setToken, hostInfo, searchParams, setSearchParams }: UserLoginProps) => {
  const host = hostInfo.host;
  const userId = searchParams.get("user_id");
  const jobtoken = searchParams.get("jobtoken");
  const asGuest = searchParams.get("as_guest");

  return (
    <>
      {jobtoken ? (
        <>
          <Divider vertical>Or</Divider>
          <GuestLogin
            setToken={setToken}
            host={hostInfo.host}
            userId={userId}
            jobtoken={jobtoken}
            asGuest={asGuest}
          />
        </>
      ) : null}
      <RegisteredLogin setToken={setToken} host={host} />
    </>
  );
};

const RegisteredLogin = ({ setToken, host }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [mode, setMode] = useState("magiclink");

  // const hostInfoQuery = useQuery(["hostInfo", host], () => getHostInfo(host), {
  //   enabled: !!host,
  //   retry: false,
  // });

  const validEmail = () => {
    const notEmail = !email.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    if (notEmail) {
      setInvalidEmail(true);
      return false;
    }
    return true;
  };

  const tryPasswordLogin = async () => {
    if (!validEmail()) return;

    setPassword("");
    try {
      const token = await passwordLogin(host, email, password);
      setToken(token);
    } catch (e) {
      setToken("");
      setInvalidPassword(true);
      console.error(e);
    }
  };

  const magicLink = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(e);
    if (!validEmail()) return;
    const ml = await requestMagicLink(host, email);
    console.log(ml);
  };

  return (
    <div>
      <Form onSubmit={() => tryPasswordLogin()}>
        <Form.Input
          placeholder="email"
          name="email"
          autoComplete="email"
          error={invalidEmail ? "Please enter a valid email adress" : false}
          label="Email"
          icon="mail"
          iconPosition="left"
          value={email}
          onChange={(e, d) => {
            setEmail(d.value);
          }}
          style={{ width: "260px" }}
        />

        <div>
          <Form.Input
            placeholder="password"
            name="password"
            autoComplete="current-password"
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
            style={{ width: "260px" }}
          />
          <Button key="password" disabled={password.length === 0} primary fluid>
            Sign in
          </Button>
        </div>
        <Button key="magiclink" fluid secondary onClick={magicLink}>
          Send Email link
        </Button>
      </Form>
    </div>
  );
};

const GuestLogin = ({ setToken, host, userId, jobtoken, asGuest }) => {
  const [guestAuth, setGuestAuth] = useLocalStorage("guest_auth", {});

  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;
  const alreadyGuest = !!guestAuth[key];

  useEffect(() => {
    //if (!asGuest) return;
    if (!jobtoken) return;
    redeemShuffle(host, userId, jobtoken, setToken, guestAuth, setGuestAuth);
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
            redeemShuffle(host, userId, jobtoken, setToken, guestAuth, setGuestAuth);
          }}
        >
          {alreadyGuest ? "Continue" : "Log in"}
        </Button>
      </div>
    </Grid.Column>
  );
};

const redeemShuffle = async (host, userId, jobtoken, setToken, guestAuth, setGuestAuth) => {
  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;

  if (guestAuth[key]) {
    const data = guestAuth[key];
    const backend = new Backend(host, data.token);
    try {
      await backend.init();
      // token still works
      setToken(backend.token);
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
    setToken(data.token);
  } catch (e) {
    console.error(e);
  }
};

export default UserLogin;
