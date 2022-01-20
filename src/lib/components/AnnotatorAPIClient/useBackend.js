import React, { useEffect, useState, useRef } from "react";
import Backend, { passwordLogin } from "../../classes/Backend";
import { Header, Form, Button, Segment, Grid } from "semantic-ui-react";
import { useCookies } from "react-cookie";

const useBackend = (urlHost, urlToken) => {
  // Hook that tries to log in with the host and token from the cookies.
  // If this doesn't work (or there are not cookies), the second return value
  // is a login form component. If the form is submitted, this updates the cookies,
  // thus triggering useBackend to try the new host + token.
  const [cookies, setCookies] = useCookies(["login"]);
  const [backend, setBackend] = useState(null);
  const lastUrlToken = useRef(null);

  useEffect(() => {
    let host = urlHost || cookies?.login?.host || null;
    let token = cookies?.login?.[host + "__token__"] || null;

    if (urlToken && urlToken !== lastUrlToken.current) {
      lastUrlToken.current = urlToken;
      logIn(host, urlToken, cookies, setCookies, setBackend);
      return;
    }

    if (backend) {
      // if there is already a backend set, check if it matches host and token
      // if it does, we can stop. If it doesn't, remove backend and try to login again
      const sameHost = backend.host === host;
      const sameToken = backend.token === token;
      if (sameHost && sameToken) return;
      setBackend(null);
    }

    if (!host || token === "__INVALID__") return;
    logIn(host, token, cookies, setCookies, setBackend);
  }, [urlHost, urlToken, cookies, backend, setCookies, setBackend]);

  return [backend, <LoginForm />];
};

const logIn = async (host, token, cookies, setCookies, setBackend) => {
  const backend = new Backend(host, token);

  try {
    // maybe add check for specific user later. For now just check if can get token
    await backend.init();
    setBackend(backend);
    setCookies("login", { ...cookies.login, host, [host + "__token__"]: token }); // set host to last one logged in with
  } catch (e) {
    console.log(e.response);
    setBackend(null);
    setCookies("login", { ...cookies.login, host, [host + "__token__"]: "__INVALID__" }); // remove token if token failed
  }
};

export const LoginForm = () => {
  const [cookies, setCookies] = useCookies(["login"]);
  const host = cookies?.login?.host || null;

  const setLogin = (host, token) => {
    setCookies("login", { ...cookies.login, host, [host + "__token__"]: token });
  };

  const setLogout = () => {
    setCookies("login", { ...cookies.login, host, [host + "__token__"]: "__INVALID__" });
  };

  const hostHasValidToken =
    !!cookies?.login?.[host + "__token__"] &&
    cookies?.login?.[host + "__token__"] !== "__INVALID__";
  if (hostHasValidToken) return <SignOut setLogout={setLogout} />;
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
      console.log(e);
    }
  };

  useEffect(() => {
    // The recommended host is either the host in the url query or the last one logged in to (from cookie)
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
