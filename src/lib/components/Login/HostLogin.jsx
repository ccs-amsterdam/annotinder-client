import { useState } from "react";
import { Button, Form } from "semantic-ui-react";

interface HostLoginProps {
  host: String;
  email: String;
  setHost: SetState<string>;
  setEmail: SetState<string>;
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
    if (validEmail(emailInput)) {
      setHost(hostInput);
      setEmail(emailInput);
    }
  };

  const emailError = () => {
    if (invalidEmail) return "Please enter a valid email adress";
    if (hostInfoQuery.data) {
      if (!canRegister && !hostInfoQuery.data?.user)
        return "This user is not registered on this server";
    }
    return false;
  };

  return (
    <div>
      <Form loading={hostInfoQuery.isFetching} onSubmit={submit}>
        <h3 style={{ color: "var(--primary)", marginBottom: "0" }}>Sign-in</h3>
        <i>provide host and email address</i>
        <Form.Input
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
          style={{ width: "260px", marginTop: "0.5rem" }}
        />
        <Form.Input
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
          style={{ width: "260px" }}
        />

        <Button primary disabled={hostInput.length === 0} fluid>
          Connect to server
        </Button>
      </Form>
    </div>
  );
};

export default HostLogin;
