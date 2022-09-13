import { useState, useCallback } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import UserLogin from "./UserLogin";
import HostLogin from "./HostLogin";
import Backend, { getHostInfo } from "./Backend";
import { Dimmer, Loader, Button } from "semantic-ui-react";
import useWatchChange from "../../hooks/useWatchChange";

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const LoginWindow = styled.div`
  position: relative;
  margin: auto;
`;

const useLogin = (): [Backend, ReactNode] => {
  const [backend, setBackend] = useState();
  const [session, setSession] = useLocalStorage("session", { host: "", token: "" });
  const [tryAutoLogin, setTryAutoLogin] = useState(session.host && session.token);
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get("user_id");

  const [hostInfo, setHostInfo] = useState();
  const [token, setToken] = useState("");

  const rmLoginParams = useCallback(() => {
    // if login is successfull, remove all URL parameters with login details
    searchParams.delete("user_id");
    searchParams.delete("jobtoken");
    searchParams.delete("as_guest");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const login = async (host, token) => {
    if (!host || !token) return null;
    const b = new Backend(host, token);
    try {
      await b.init();
      if (userId && b.name !== userId) {
        setBackend(null);
        return;
      }
      setSession({ host: host, token: token });
      setBackend(b);
      rmLoginParams();
    } catch (e) {
      try {
        const hostInfo = await getHostInfo(host);
        setHostInfo(hostInfo);
      } catch (e) {
        setHostInfo();
      }
      setToken(false);
      setBackend(null);
    }
    setTryAutoLogin(false);
  };

  if (useWatchChange([tryAutoLogin])) {
    if (tryAutoLogin) login(session.host, session.token);
  }

  if (useWatchChange([hostInfo, token])) {
    if (!tryAutoLogin) login(hostInfo?.host, token);
  }

  const render = () => {
    if (tryAutoLogin)
      return (
        <Dimmer active>
          <Loader />
        </Dimmer>
      );
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
