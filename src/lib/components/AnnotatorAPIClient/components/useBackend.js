import React, { useEffect, useState } from "react";
import Backend, { getToken } from "../../../classes/Backend";
import { Header, Form, Button, Segment, Grid, Divider } from "semantic-ui-react";
import { useCookies } from "react-cookie";

const useBackend = (urlHost) => {
  const [cookies, setCookies] = useCookies(["backend"]);
  const [backend, setBackend] = useState(null);

  console.log(cookies);

  useEffect(() => {
    // First check for host in URL, if missing, check for host in cookies.
    const host = urlHost || cookies?.backend?.host || null;

    if (host && host !== backend?.host) setBackend(null); // reset backend if host changes
    if (backend || !host || !cookies?.backend?.token) return;
    logIn(cookies, setCookies, setBackend);
  }, [cookies, backend, urlHost, setCookies, setBackend]);

  return [backend, <LoginForm host={urlHost || cookies?.backend?.host || null} />];
};

const logIn = async (cookies, setCookies, setBackend) => {
  const backend = new Backend(
    cookies?.backend?.host,
    cookies?.backend?.email,
    cookies?.backend?.token
  );
  try {
    // maybe add check for specific user later. For now just check if can get token
    await backend.init();
    setBackend(backend);
  } catch (e) {
    console.log(e);
    setBackend(null);
    setCookies("backend", JSON.stringify({ ...backend, token: null }), { path: "/" });
  }
};

export const LoginForm = ({ host = null }) => {
  const [cookies, setCookies] = useCookies(["backend"]);

  const backend = cookies.backend || {
    host: "http://localhost:5000",
    email: "test@user.com",
    token: null,
  };

  if (host) backend.host = host;

  const setLogin = (value) => {
    setCookies("backend", JSON.stringify(value), { path: "/" });
  };
  const setLogout = () => {
    setCookies("backend", JSON.stringify({ ...backend, token: null }), { path: "/" });
  };

  if (backend.token) return <SignOut backend={backend} setLogout={setLogout} />;
  return <SignIn backend={backend} setLogin={setLogin} />;
};

const SignOut = ({ backend, setLogout }) => {
  return (
    <>
      <Grid textAlign="center">
        <Grid.Column>
          <Button secondary onClick={setLogout}>
            Sign out from <span style={{ color: "lightblue" }}>{backend.email}</span>
          </Button>
        </Grid.Column>
      </Grid>
    </>
  );
};

const SignIn = ({ backend, setLogin }) => {
  const [host, setHost] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);

  const passwordLogin = async () => {
    setPassword("");
    try {
      const token = await getToken(host, email, password);
      setLogin({ host, email, token });
    } catch (e) {
      setInvalidPassword(true);
      console.log(e);
    }
  };

  const emailError = !email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  useEffect(() => {
    if (backend?.email) setEmail(backend.email);
    if (backend?.host) setHost(backend.host);
  }, [backend]);

  return (
    <>
      <Header icon="user" content="Register or sign in" />

      <Segment placeholder attached="bottom">
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
                    if (d.value.length < 100) setHost(d.value);
                  }}
                  icon="home"
                  iconPosition="left"
                  autoFocus
                />
                <Form.Input
                  placeholder="email adress"
                  error={emailError ? "Please enter a valid email adress" : false}
                  name="email"
                  label="Email"
                  icon="mail"
                  iconPosition="left"
                  value={email}
                  onChange={(e, d) => {
                    if (d.value.length < 100) setEmail(d.value);
                  }}
                />
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider />
        <Grid columns={2} textAlign="center">
          <Grid.Row verticalAlign="middle">
            <Grid.Column>
              <Form>
                <Button circular primary fluid style={{ width: "7em", height: "7em" }}>
                  Login by email (not yet functional)
                </Button>
              </Form>
            </Grid.Column>
            <Divider vertical>Or</Divider>
            <Grid.Column>
              <Form>
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
                <Button disabled={password.length === 0} primary fluid onClick={passwordLogin}>
                  Sign in
                </Button>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </>
  );
};

export default useBackend;
