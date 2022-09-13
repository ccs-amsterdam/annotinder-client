import useHost from "./useHost";
import styled from "styled-components";
import useBackend from "./useBackend";
import useWatchChange from "../../hooks/useWatchChange";
import { useSearchParams } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const LoginWindow = styled.div`
  margin: auto;
`;

// maybe make useLogin, which returns [backend, loginScreen]

interface Auth {
  host: string;
  tokens: {
    [host: string]: string,
  };
}
const defaultAuth: Auth = { currentHost: null, hosts: {} };

const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auth, setAuth] = useLocalStorage("auth", defaultAuth);

  const [hostInfo, HostLogin] = useHost(searchParams.host, auth.host);
  //const backend = useBackend(hostInfo, searchParams);

  if (useWatchChange([backend])) {
    if (backend) {
      const newAuth = { ...auth, host: backend.host };
      newAuth[backend.host] = backend.token;
      setAuth(newAuth);
      searchParams.delete("host");
      searchParams.delete("jobtoken");
      searchParams.delete("user_id");
      setSearchParams(searchParams);
    }
  }

  const render = () => {
    if (!hostInfo?.host) return HostLogin;
    return <div>{hostInfo?.host}</div>;
  };

  console.log(hostInfo);

  return (
    <Container>
      <LoginWindow>{render()}</LoginWindow>
    </Container>
  );
};

export default Login;
