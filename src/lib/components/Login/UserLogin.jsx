import { useState } from "react";
import { Button, Form } from "semantic-ui-react";
import styled from "styled-components";
import { HostInfo } from "../../types";
import { passwordLogin, requestMagicLink } from "./Backend";
import JobTokenLogin from "./JobTokenLogin";

interface UserLoginProps {
  login: (host: string, token: string) => void;
  hostInfo: HostInfo;
  searchParams: URLSearchParams;
}

const UserLogin = ({ login, hostInfo, searchParams }: UserLoginProps) => {
  const host = hostInfo.host;
  const userId = searchParams.get("user_id");
  const jobtoken = searchParams.get("jobtoken");
  const asGuest = searchParams.get("as_guest");

  if (jobtoken) {
    return (
      <JobTokenLogin
        login={login}
        host={hostInfo.host}
        userId={userId}
        jobtoken={jobtoken}
        asGuest={asGuest}
      />
    );
  }
  return <RegisteredLogin login={login} host={host} email={hostInfo.user?.email} />;
};

const RegisteredLogin = ({ login, host, email }) => {
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const tryPasswordLogin = async () => {
    setPassword("");
    try {
      const token = await passwordLogin(host, email, password);
      login(host, token);
    } catch (e) {
      login(host, "");
      if (e.response.status === 429) {
        setLoginError(e.response.data.detail);
      } else {
        setLoginError("Invalid password for this Host & Username");
      }
      console.error(e);
    }
  };

  const magicLink = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    await requestMagicLink(host, email);
  };

  return (
    <div>
      <Form onSubmit={() => tryPasswordLogin()}>
        <div>
          <Form.Input
            placeholder="password"
            name="password"
            autoComplete="current-password"
            error={loginError ? loginError : false}
            label="Password"
            type="password"
            icon="lock"
            iconPosition="left"
            value={password}
            onChange={(e, d) => {
              setLoginError("");
              setPassword(d.value);
            }}
            style={{ width: "260px" }}
          />
          <Button primary key="password" disabled={password.length === 0} fluid>
            Sign in
          </Button>
        </div>

        <MagicLink key="magiclink" onClick={magicLink}>
          Send Email link
        </MagicLink>
      </Form>
    </div>
  );
};

const MagicLink = styled.div`
  border: 1px solid grey;

  margin-top: 10px;
  padding: 5px;
  cursor: pointer;
`;

export default UserLogin;
