import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import UserLogin from "./UserLogin";
import HostLogin from "./HostLogin";
import Backend from "./Backend";
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

// make all jobs closed by default.
// Coders get access via invite links, and authenticated users can be added
// admins can't see users (nobody can)
// after entering host, immediately see jobs based on guest tokens and
// and

const useLogin = (): [Backend, ReactNode] => {
  const [backend, setBackend] = useState();
  const [session, setSession] = useLocalStorage("session", { host: "", token: "" });
  const [tryResumeSession, setTryResumeSession] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [hostInfo, setHostInfo] = useState();
  useEffect(() => {
    if (!session.host || !session.token) {
      setBackend(null);
      setHostInfo(null);
      setTryResumeSession(false);
      return;
    }

    const backend = new Backend(session.host, session.token);
    backend
      .init()
      .then(() => {
        setBackend(backend);
        setSearchParams({ host: session.host, job_id: backend?.restricted_job });
      })
      .catch((e) => {
        console.error(e);
        setBackend(null);
        setHostInfo();
      })
      .finally(() => setTryResumeSession(false));
  }, [session, setSession, setSearchParams]);

  const setToken = useCallback(
    (token) => {
      console.log("whaaat");
      setSession({ host: hostInfo?.host, token });
    },
    [hostInfo, setSession]
  );

  const render = () => {
    if (!backend && tryResumeSession) return <Loader active />;
    if (!backend && !hostInfo)
      return (
        <HostLogin
          setHostInfo={setHostInfo}
          sessionHost={session.host}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      );
    if (!backend)
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
