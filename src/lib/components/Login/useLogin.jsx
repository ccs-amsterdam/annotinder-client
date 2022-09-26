import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Login from "./Login";
import Backend from "./Backend";
// import GuestJobs from "./GuestJobs";
import useSessions from "./useSessions";
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

const useLogin = (): [Backend, ReactNode] => {
  const [session, login, logout, storeSession, sessionList] = useSessions();

  const backendQuery = useQuery(
    ["backend", session],
    async () => {
      if (!session.host || !session.token) return null;
      const backend = new Backend(session.host, session.token);
      await backend.init();
      storeSession(backend);
      return backend;
    },
    {
      enabled: !!session.host,
    }
  );

  const render = () => {
    if (backendQuery.isFetching)
      return <Loader active style={{ minWidth: "200px" }} content="Connecting to server" />;
    if (!backendQuery.data) return <Login login={login} sessionList={sessionList} />;
    return <Logout logout={logout} />;
  };

  const authForm = (
    <Container>
      <LoginWindow>
        {/* <GuestJobs /> */}
        {render()}
      </LoginWindow>
    </Container>
  );

  return [backendQuery.data, authForm];
};

const Logout = ({ logout }) => {
  // need to think about naming. Now not technically logout,
  // because the session is not immediately removed
  // (maybe add second button for logout that does immediately remove)
  return (
    <Button secondary onClick={logout}>
      Go to Login Screen
    </Button>
  );
};

export default useLogin;
