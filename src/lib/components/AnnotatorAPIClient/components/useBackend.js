import React, { useEffect, useRef, useState } from "react";
import Backend, { passwordLogin } from "../classes/Backend";
import { Header, Form, Button, Segment, Grid } from "semantic-ui-react";
import { useCookies } from "react-cookie";

const useBackend = (urlHost, urlToken) => {
  // Hook that tries to log in with the host and token from the cookies.
  // If this doesn't work (or there are not cookies), the second return value
  // is a login form component. If the form is submitted, this updates the cookies,
  // thus triggering useBackend to try the new host + token.
  const [badCookies, setCookies] = useCookies(["auth"]);
  const [backend, setBackend] = useState(null);

  // we want cookies to update, but not trigger the useEffect, so
  // we'll pass it around as a ref
  const cookieref = useRef();
  cookieref.current = badCookies;

  //const lastUrlToken = useRef(null);

  useEffect(() => {
    const cookies = cookieref.current;
    let host = urlHost || cookies?.auth?.host || null;
    let token = urlToken || cookies?.auth?.[host + "__token__"] || null;
    console.log(host, token);

    if (!host || !token) return;
    logIn(host, token, cookies, setCookies, setBackend);
  }, [urlHost, urlToken, cookieref, setCookies, setBackend]);

  return [
    backend,
    <LoginForm
      urlHost={urlHost}
      backend={backend}
      cookies={cookieref.current}
      setCookies={setCookies}
      setBackend={setBackend}
    />,
  ];
};

const logIn = async (host, token, cookies, setCookies, setBackend) => {
  const backend = new Backend(host, token);

  try {
    // maybe add check for specific user later. For now just check if can get token
    await backend.init();
    setBackend(backend);
    setCookies("auth", { ...cookies.auth, host, [host + "__token__"]: token }, { path: "/" }); // set host to last one logged in with
  } catch (e) {
    const newcookies = { ...cookies.auth, host, [host + "__token__"]: null };
    setBackend((state) => (state === null ? state : null));
    setCookies("auth", newcookies, { path: "/" }); // remove token if token failed
  }
};

export const LoginForm = ({ urlHost, backend, setBackend }) => {
  const [cookies, setCookies] = useCookies([]);
  const host = urlHost || cookies?.auth?.host || null;

  const setLogin = (host, token) => {
    logIn(host, token, cookies, setCookies, setBackend);
  };

  const setLogout = () => {
    setBackend(null);
    setCookies("auth", { ...cookies.auth, host, [host + "__token__"]: null }, { path: "/" });
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