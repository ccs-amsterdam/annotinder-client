import { useState } from "react";
import { Form } from "semantic-ui-react";
import { StyledButton } from "../../styled/StyledSemantic";
import { UseQueryResult } from "@tanstack/react-query";
import { HostInfo, SetState } from "../../types";

interface HostLoginProps {
  host: String;
  email: String;
  setHost: SetState<String>;
  setEmail: SetState<String>;
  canRegister: Boolean;
  hostInfoQuery: UseQueryResult;
}

export const HostLogin = ({
  host,
  email,
  setHost,
  setEmail,
  canRegister,
  hostInfoQuery,
}: HostLoginProps) => {
  const [hostInput, setHostInput] = useState(host);
  const [emailInput, setEmailInput] = useState(email);
  const [invalidEmail, setInvalidEmail] = useState(false);

  const validEmail = () => {
    const notEmail = !emailInput.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    if (notEmail) {
      setInvalidEmail(true);
      return false;
    }
    return true;
  };

  const submit = () => {
    if (validEmail()) {
      setHost(hostInput);
      setEmail(emailInput);
    }
  };

  const emailError = () => {
    if (invalidEmail) return "Please enter a valid email adress";
    if (hostInfoQuery.data) {
      const hostInfo: HostInfo = hostInfoQuery.data;
      if (!canRegister && !hostInfo.user) return "This user is not registered on this server";
    }
    return false;
  };

  return (
    <Form
      loading={hostInfoQuery.isFetching}
      onSubmit={submit}
      style={{ width: "250px", maxWidth: "100%" }}
    >
      <h3 style={{ color: "var(--primary)", marginBottom: "0" }}>Sign-in</h3>
      <i>provide host and email address</i>
      <Form.Input
        fluid
        placeholder="Host"
        name="host"
        error={hostInfoQuery.isError ? "Could not connect to server" : null}
        value={hostInput}
        onChange={(e, d) => {
          setHostInput(d.value);
        }}
        icon="home"
        iconPosition="left"
        autoFocus
        style={{ marginTop: "0.5rem" }}
      />
      <Form.Input
        fluid
        placeholder="email"
        name="email"
        autoComplete="email"
        error={emailError()}
        icon="mail"
        iconPosition="left"
        value={emailInput}
        onChange={(e, d) => {
          setEmailInput(d.value);
          setInvalidEmail(false);
        }}
      />

      <StyledButton primary disabled={hostInput.length === 0} fluid>
        Connect to server
      </StyledButton>
    </Form>
  );
};

export default HostLogin;
