import React, { useEffect, useRef, useState } from "react";
import Backend, { passwordLogin } from "../classes/Backend";
import { Header, Form, Button, Segment, Grid } from "semantic-ui-react";
import useLocalStorage from "lib/hooks/useLocalStorage";

const useBackend = (urlHost, urlToken) => {
  // Hook that tries to log in with the host and token from local storage
  // If this doesn't work, the second return value is a login form component.
  // If the form is submitted, this updates the local storage
  // and triggers useBackend to try the new host + token.
  const [auth, setAuth] = useLocalStorage("auth", {});
  const [backend, setBackend] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // we want auth to update, but not trigger the useEffect, so
  // we'll pass it around as a ref
  const authref = useRef();
  authref.current = auth;

  useEffect(() => {
    let host = urlHost || auth?.host || null;
    let token = urlToken || auth?.[host + "__token__"] || null;
    if (!host || !token) {
      setBackend(null);
      setInitializing(false);
      return;
    }
    if (backend && host === backend.host && token === backend.token) return; // do nothing if already logged in

    const b = new Backend(host, token);
    b.init()
      .then(() => setBackend(b))
      .catch((e) => {
        setBackend(null);
        console.error(e);
      })
      .finally(() => setInitializing(false));
  }, [auth, backend, urlHost, urlToken, setInitializing]);

  if (initializing) return [null, null];
  return [backend, <LoginForm urlHost={urlHost} backend={backend} auth={auth} setAuth={setAuth} />];
};

const logIn = async (host, token, auth, setAuth) => {
  const backend = new Backend(host, token);

  try {
    const refreshedToken = await backend.getToken();
    setAuth({ ...auth, host, [host + "__token__"]: refreshedToken.token }); // set host to last one logged in with
  } catch (e) {
    setAuth({ ...auth, host, [host + "__token__"]: null }); // remove token if token failed
  }
};

export const LoginForm = ({ urlHost, backend, auth, setAuth }) => {
  const host = urlHost || auth?.host || null;

  const setLogin = (host, token) => {
    logIn(host, token, auth, setAuth);
  };

  const setLogout = () => {
    setAuth({ ...auth, host, [host + "__token__"]: null });
  };

  if (backend) return <SignOut setLogout={setLogout} />;
  return <SignIn recHost={host} setLogin={setLogin} />;
};

const SignOut = ({ setLogout }) => {
  return (
    <>
      <Grid textAlign="center">
        <Grid.Column>
          <Button secondary onClick={setLogout}>
            Sign out
          </Button>
        </Grid.Column>
      </Grid>
    </>
  );
};

const SignIn = ({ recHost, setLogin }) => {
  const [host, setHost] = useState("");
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
      setInvalidPassword(true);
      console.error(e);
    }
  };

  useEffect(() => {
    // The recommended host is either the host in the url query or the last one logged in to
    if (recHost) setHost(recHost);
  }, [recHost]);

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
          </Grid.Row>
        </Grid>
      </Segment>
    </>
  );
};

export default useBackend;
