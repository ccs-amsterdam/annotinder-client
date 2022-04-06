import React, { useEffect, useState } from "react";
import Backend, { passwordLogin } from "../classes/Backend";
import { Header, Form, Button, Segment, Grid } from "semantic-ui-react";
import useLocalStorage from "lib/hooks/useLocalStorage";
import { useSearchParams } from "react-router-dom";

const useBackend = () => {
  // Hook that tries to log in with the host and token from local storage
  // If this doesn't work, the second return value is a login form component.
  // If the form is submitted, this updates the local storage
  // and triggers useBackend to try the new host + token.
  const [searchParams, setSearchParams] = useSearchParams();
  const [auth, setAuth] = useLocalStorage("auth", {});
  const [backend, setBackend] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // manage url parameters
    // if url parameters are changed, update auth if needed
    // if auth changes, update parameters
    let urlHost = searchParams.get("host")?.replace("%colon%", ":");
    let urlToken = searchParams.get("token");
    let host = urlHost || auth?.host || null;
    let token = urlToken || auth?.[host + "__token__"] || null;

    if (urlToken || host !== urlHost) {
      // token must always be removed after usage so people don't accidentally share it
      // host should always be in the url parameters, because a user can work across hosts
      searchParams.set("host", host);
      searchParams.delete("token");
      setSearchParams(searchParams);
    }

    if (!urlHost && !urlToken) return;
    if (!host) return; // a token without a host is like
    if (host === auth.host && token === auth?.[host + "__token__"]) return;
    setAuth({ ...auth, host, [host + "__token__"]: token });
  }, [auth, setAuth, searchParams, setSearchParams]);

  useEffect(() => {
    // this tries to 'initialize' login with current settings, When done, initialize is set to
    // false, and the hook will then return the backend and AuthForm. If a backend connection was not made,
    // the auth form is a login screen. Otherwise its a logout screen.
    let host = auth?.host || null;
    let token = auth?.[host + "__token__"] || null;
    if (!host || !token) {
      setBackend(null);
      setInitializing(false);
      return;
    }
    if (backend && host === backend.host && token === backend.token) return; // do nothing if already logged in

    const b = new Backend(host, token);
    b.init()
      .then(() => {
        setBackend(b);
      })
      .catch((e) => {
        setBackend(null);
      })
      .finally(() => setInitializing(false));
  }, [auth, backend, setInitializing]);

  if (initializing) return [null, null];
  return [backend, <AuthForm backend={backend} auth={auth} setAuth={setAuth} />];
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

export const AuthForm = ({ backend, auth, setAuth }) => {
  const host = auth?.host || null;

  const setLogin = (host, token) => {
    console.log(host);
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
