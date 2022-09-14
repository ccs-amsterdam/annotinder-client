import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import UserLogin from "./UserLogin";
import HostLogin from "./HostLogin";
import Backend, { getHostInfo } from "./Backend";
import { Loader, Button } from "semantic-ui-react";

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const LoginWindow = styled.div`
  position: relative;
  margin: auto;
`;

// Ok, so hear me out!
// Make a login screen where users can enter an email address.
// If the address is not known, return an error
// If the address is known, see if they have a password. If so, reveal password input and login mail button
// if they do not have a password, send login mail
// whenever logged in via mail, always see an optional 'enter password' field, and a button to continue

// Optionally, a whitelist can be specified for which email addresses can be added.
// This can have wildcards to for instance allow all addresses of a given domain

// Then, in the case of a jobtoken.
// If there is no user_id, the user can either continue with the session,
// login unregistered ('for visitors'), or login via email ('for registered coders').
//
// If there is an 'id' parameter, the user is automatically logged in as unregisered
// with this specific id. The actual user.name will be a combination of this
// id with a unique id: [id]@unregistered-[i-in-db]
//
// In all cases, on login the token will be checked
// for a job_id, in which case the jobuser will also be made. This requires an endpoint for
// job_id = registerJobUser(backend.name, jobtoken)
// and job_id can then be added to searchParams to directly navigate to the job.

const useLogin = (): [Backend, ReactNode] => {
  const [backend, setBackend] = useState();
  const [session, setSession] = useLocalStorage("session", { host: "", token: "" });
  const [tryAutoLogin, setTryAutoLogin] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [hostInfo, setHostInfo] = useState();
  const [token, setToken] = useState("");

  const login = useCallback(
    async (host, token) => {
      if (!host || !token) return null;
      if (backend) return null;

      const b = new Backend(host, token);
      try {
        await b.init();
        setSession({ host: host, token: token });
        setBackend(b);
        searchParams.delete("user_id");
        searchParams.delete("jobtoken");
        searchParams.delete("as_guest");
        setSearchParams(searchParams);
      } catch (e) {
        try {
          // if login failed, check if host is valid. If so, set hostInfo immediately
          // so HostLogin doesn't need to render
          const hostInfo = await getHostInfo(host);
          hostInfo.host = host;
          setHostInfo(hostInfo);
        } catch (e) {
          setHostInfo();
        }
        setToken(false);
        setBackend(null);
      }
    },
    [searchParams, backend, setSearchParams, setSession]
  );

  useEffect(() => {
    // Will only run once on mount if session has both host and token
    if (!tryAutoLogin) return;
    setTryAutoLogin(false);

    // Never continue session if a user_id is provided.
    if (searchParams.get("user_id")) return;

    login(session.host, session.token);
  }, [login, tryAutoLogin, searchParams, session.host, session.token]);

  useEffect(() => {
    // Will never infinite loop, because login either succeeds and sets backend, or fails
    // and removes token (in which case login immediately stops)
    if (tryAutoLogin) return;
    login(hostInfo?.host, token);
  }, [login, tryAutoLogin, hostInfo, token]);

  console.log(tryAutoLogin.current);

  const render = () => {
    if (!backend && tryAutoLogin) return <Loader active />;
    if (!backend && !hostInfo)
      return (
        <HostLogin
          setHostInfo={setHostInfo}
          sessionHost={session.host}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      );
    if (!backend && !token)
      return (
        <UserLogin
          setToken={setToken}
          setHostInfo={setHostInfo}
          hostInfo={hostInfo}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      );
    return (
      <Logout
        setBackend={setBackend}
        setToken={setToken}
        session={session}
        setSession={setSession}
      />
    );
  };

  const loginscreen = (
    <Container>
      <LoginWindow>{render()}</LoginWindow>
    </Container>
  );

  return [backend, loginscreen];
};

const Logout = ({ setBackend, setToken, session, setSession }) => {
  const setLogout = () => {
    setBackend(null);
    setToken("");
    setSession({ host: session.host, token: "" });
  };

  return (
    <Button secondary onClick={setLogout}>
      Sign out
    </Button>
  );
};

export default useLogin;
