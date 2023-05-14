import { useState } from "react";
import { Form, Input, Message } from "semantic-ui-react";
import { StyledButton } from "../../styled/StyledSemantic";
import styled from "styled-components";
import { HostInfo, SetState } from "../../types";
import { passwordLogin, redeemMagicLink, requestMagicLink } from "./Backend";
import JobTokenLogin from "./JobTokenLogin";

interface UserLoginProps {
  login: (host: string, token: string) => void;
  hostInfo: HostInfo;
  searchParams: URLSearchParams;
}

const UserLogin = ({ login, hostInfo, searchParams }: UserLoginProps) => {
  const host = hostInfo.host;
  let userId = searchParams.get("user_id");
  const jobtoken = searchParams.get("jobtoken");
  const asGuest = !!searchParams.get("as_guest");

  // ad-hoc hack for user id from motivaction
  // should not be used outside of this branch, and implies need for more
  // flexible solution in the new (nextjs) version
  const d_number = searchParams.get("d");
  const k_number = searchParams.get("k");
  if (d_number && k_number) userId = `d=${d_number}&k=${k_number}`;

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

interface RegisteredLoginProps {
  login: (host: string, token: string) => void;
  host: string;
  email: string;
  hasPassword: boolean;
}

const RegisteredLogin = ({ login, host, email, hasPassword }: RegisteredLoginProps) => {
  const [useMagicLink, setUseMagicLink] = useState(false);

  return (
    <div>
      {hasPassword && !useMagicLink ? (
        <PasswordLogin host={host} email={email} login={login} />
      ) : null}
      <MagicLinkLogin
        host={host}
        email={email}
        login={login}
        useMagicLink={useMagicLink}
        setUseMagicLink={setUseMagicLink}
      />
    </div>
  );
};

interface PasswordLoginProps {
  host: string;
  email: string;
  login: (host: string, token: string) => void;
}

const PasswordLogin = ({ host, email, login }: PasswordLoginProps) => {
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

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Form.Input
        placeholder="password"
        name="password"
        autoComplete="current-password"
        error={loginError ? loginError : false}
        type="password"
        icon="lock"
        iconPosition="left"
        value={password}
        onChange={(e, d) => {
          setLoginError("");
          setPassword(d.value);
        }}
        style={{ width: "260px", fontSize: "1.5rem" }}
      />
      <StyledButton
        onClick={tryPasswordLogin}
        primary
        key="password"
        disabled={password.length === 0}
        fluid
      >
        Sign in
      </StyledButton>
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

interface MagicLinkLoginProps {
  host: string;
  email: string;
  login: (host: string, token: string) => void;
  useMagicLink: boolean;
  setUseMagicLink: SetState<boolean>;
}

const MagicLinkLogin = ({
  host,
  email,
  login,
  useMagicLink,
  setUseMagicLink,
}: MagicLinkLoginProps) => {
  const [secret, setSecret] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const tryMagicLinkLogin = (e: any) => {
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

  const sendMagicLink = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setUseMagicLink(true);
      await requestMagicLink(host, email);
    } catch (e) {
      console.error(e);
      // response status 429 means mail has already been sent
      if (e.response.status === 429) {
        setUseMagicLink(true);
      }
    }
  };

  if (useMagicLink)
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
        <StyledButton primary fluid disabled={secret.length !== 6} onClick={tryMagicLinkLogin}>
          Sign-in
        </StyledButton>
      </SecretForm>
    );

  return (
    <MagicLink key="magiclink" onClick={sendMagicLink}>
      Sign in via email
    </MagicLink>
  );
};

export default UserLogin;
