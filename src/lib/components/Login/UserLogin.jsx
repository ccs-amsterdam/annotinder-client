import { useState } from "react";
import { Button, Form, Input, Message } from "semantic-ui-react";
import styled from "styled-components";
import { HostInfo } from "../../types";
import { passwordLogin, redeemMagicLink, requestMagicLink } from "./Backend";
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
  return (
    <RegisteredLogin
      login={login}
      host={host}
      email={hostInfo.user?.email}
      hasPassword={hostInfo.user?.has_password}
    />
  );
};

const RegisteredLogin = ({ login, host, email, hasPassword }) => {
  return (
    <div>
      <PasswordLogin host={host} email={email} login={login} hasPassword={hasPassword} />
      <MagicLinkLogin host={host} email={email} login={login} />
    </div>
  );
};

const PasswordLogin = ({ host, email, login, hasPassword }) => {
  const [loginError, setLoginError] = useState("");
  const [password, setPassword] = useState("");

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

  if (!hasPassword) return null;

  return (
    <Form onSubmit={() => tryPasswordLogin()}>
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
    </Form>
  );
};

const MagicLink = styled.div`
  border: 1px solid grey;
  border-radius: 10px;
  margin-top: 10px;
  padding: 5px;
  cursor: pointer;
`;

const SecretForm = styled.form`
  & p {
    color: var(--primary);
  }
  & .button {
    margin-top: 10px;
    background: red;
  }
`;

const SecretInput = styled.input`
  padding: 0;
  background: linear-gradient(to left, #ccc 1px, transparent 0);
  background-size: 19.5px 1px;
  width: 120px;
  font: 32.5px monaco, monospace;
  color: var(--secondary-light);
`;

const MagicLinkLogin = ({ host, email, login }) => {
  const [secret, setSecret] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [send, setSend] = useState(false);
  const [loginError, setLoginError] = useState("");

  const tryMagicLinkLogin = (e) => {
    e.preventDefault();
    if (secret.length !== 6) return;
    if (newPassword) {
      if (newPassword.length < 8) {
        setLoginError("Password needs to be at least 8 characters long");
        return;
      }
    }

    redeemMagicLink(host, email, secret, newPassword)
      .then((token) => {
        login(host, token);
      })
      .catch((e) => {
        console.error(e);
        setLoginError(e.response?.data?.detail || "Invalid secret");
      });
  };

  const sendMagicLink = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setSend(true);
      await requestMagicLink(host, email);
    } catch (e) {
      console.error(e);
      // response status 429 means mail has already been sent
      if (e.response.status === 429) {
        setSend(true);
      }
    }
  };

  if (send)
    return (
      <SecretForm onSubmit={tryMagicLinkLogin}>
        <p>An email was send with a sign-in secret</p>
        <SecretInput
          type="text"
          value={secret}
          maxLength={6}
          onChange={(e) => {
            setSecret(e.target.value.replace(/\D/g, ""));
          }}
        />

        <div style={{ marginTop: "20px" }}>
          <b>New password</b> (optional)
          <Input
            fluid
            placeholder="new password"
            name="password"
            type="password"
            label="set password"
            labelPosition="top"
            value={newPassword}
            onChange={(e, d) => {
              setLoginError("");
              setNewPassword(d.value);
            }}
            style={{
              width: "260px",
              borderRadius: "10px",
              background: newPassword.length === 0 ? "grey" : "white",
            }}
          />
        </div>
        {loginError ? <Message negative>{loginError}</Message> : null}
        <Button primary fluid disabled={secret.length !== 6} onClick={tryMagicLinkLogin}>
          Sign-in
        </Button>
      </SecretForm>
    );

  return (
    <MagicLink key="magiclink" onClick={sendMagicLink}>
      Sign in via email
    </MagicLink>
  );
};

export default UserLogin;
