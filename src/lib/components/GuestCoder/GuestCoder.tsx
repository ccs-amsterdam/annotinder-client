import React, { useEffect, useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";

import { useNavigate, useSearchParams } from "react-router-dom";
import Backend, { redeemJobToken } from "../AnnotatorClient/classes/Backend";
import { Button, Divider, Form, Grid, Header, Icon, Popup, Segment } from "semantic-ui-react";

// store redeemed tokens in localstorage
// If a token has already been redeemed, don't redeem it again
// maybe make separate home page for unregistered users / guests (rename RedeemToken to AnnotatorAPIGuestCLient

// Have users provide a username / email when redeeming guest token

const GuestCoder = () => {
  const [searchParams] = useSearchParams();
  const [guestAuth, setGuestAuth] = useLocalStorage("guest_auth", {});
  const host = searchParams.get("host")?.replace("%colon%", ":");
  const userId = searchParams.get("user_id");
  const jobtoken = searchParams.get("jobtoken");
  const asGuest = searchParams.get("guest");

  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;
  const alreadyGuest = !!guestAuth[key];

  return (
    <Grid inverted textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: "600px" }}>
        <Segment
          placeholder
          attached="bottom"
          style={{ borderRadius: "10px", position: "relative" }}
        >
          <Grid textAlign="center">
            <Grid.Row>
              <AsGuest
                guestAuth={guestAuth}
                setGuestAuth={setGuestAuth}
                host={host}
                userId={userId}
                jobtoken={jobtoken}
                asGuest={asGuest}
              />
              <AsUser host={host} userId={userId} jobtoken={jobtoken} />
              <Divider vertical>Or</Divider>
            </Grid.Row>
          </Grid>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

const AsGuest = ({ guestAuth, setGuestAuth, host, userId, jobtoken, asGuest }) => {
  const navigate = useNavigate();

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
          Log in once with your current device. You can then still close the app and return later,
          but only using this device (and using the same browser)
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
          Log in
        </Button>
      </div>
    </Grid.Column>
  );
};

const AsUser = ({ host, userId, jobtoken }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);

  const tryPasswordLogin = async () => {
    const notEmail = !email.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if (notEmail) {
      setInvalidEmail(true);
      return;
    }

    setPassword("");
    try {
      const token = await passwordLogin(host, email, password);
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
          placeholder="email adress"
          error={invalidEmail ? "Please enter a valid email adress" : false}
          name="email"
          label="Email"
          icon="mail"
          iconPosition="left"
          value={email}
          onChange={(e, d) => {
            if (d.value.length < 100) {
              setInvalidEmail(false);
              setEmail(d.value);
            }
          }}
        />
        <Form.Input
          placeholder="password"
          name="password"
          error={invalidPassword ? "Invalid password for this host & email" : false}
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

export default React.memo(GuestCoder);
