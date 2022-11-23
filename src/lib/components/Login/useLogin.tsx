import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Login from "./Login";
import Backend from "./Backend";
// import GuestJobs from "./GuestJobs";
import useSessions from "./useSessions";
import { Loader } from "semantic-ui-react";
import { StyledButton } from "../../styled/StyledSemantic";
import { ReactElement, useCallback } from "react";

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const LoginWindow = styled.div`
  width: 400px;
  max-width: 100%;
  padding: 2rem 1rem;
  position: relative;
  margin: auto;
`;

// rewrite with middlecat
// - replace sessions with active jobs
// - a jobtoken creates an active job
//   - if jobtoken has user_id, create job immediately as anonymous
//   - if not, user needs to log in via middlecat
// - if there is no jobtoken, users needs to log in

const useLogin = (): [Backend, ReactElement] => {
  const [session, login, logout, storeSession, sessionList] = useSessions();

  const backendQuery = useQuery<Backend>(
    ["backend", session],
    async () => {
      if (!session.host || !session.token) return null;
      const backend = new Backend(session.host, session.token);
      await backend.init();
      storeSession(backend);
      return backend;
    },
    {
      retry: 2,
      refetchOnWindowFocus: false,
      enabled: !!session.host,
    }
  );

  const render = useCallback(() => {
    if (backendQuery.isFetching)
      return <Loader active style={{ minWidth: "200px" }} content="Connecting to server" />;
    if (!backendQuery.data) return <Login login={login} sessionList={sessionList} />;

    return <Logout logout={logout} />;
  }, [backendQuery, login, logout, sessionList]);

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

interface LogoutProps {
  logout: () => void;
}

const Logout = ({ logout }: LogoutProps) => {
  // need to think about naming. Now not technically logout,
  // because the session is not immediately removed
  // (maybe add second button for logout that does immediately remove)
  return (
    <StyledButton secondary onClick={logout}>
      Go to Login Screen
    </StyledButton>
  );
};

export default useLogin;
