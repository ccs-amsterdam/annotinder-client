import { memo, ReactElement, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getHostInfo } from "./Backend";
import { useQuery } from "@tanstack/react-query";
import { SetState } from "../../types";
import UserLogin from "./UserLogin";
import HostLogin from "./HostLogin";
import styled from "styled-components";
import { Icon } from "semantic-ui-react";

// make separate useSession hook that returns the current session and tries auto login

const LoginContainer = styled.div`
  & {
    backdrop-filter: blur(3px);
    border-radius: 10px;
    position: relative;
    text-align: center;
    display: flex;
    max-width: 280px;
    flex-direction: column;
  }
`;

const FormBox = styled.div`
  flex: 1 1 auto;
  display: grid;
  align-items: center;
  justify-items: center;
  maxheight: 100%;
  maxwidth: 100%;
  overflow: auto;
`;

const Title = styled.h1`
  color: var(--primary);
  font-size: 3.5rem;
  margin-bottom: 1rem;
`;

interface LoginProps {
  login: (host: string, token: string) => void;
  sessionList: ReactElement;
}

const Login = ({ login, sessionList }: LoginProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [host, setHost] = useState(searchParams.get("host") || "");
  const [email, setEmail] = useState("");
  const has_jobtoken = !!searchParams.get("jobtoken");
  const canRegister = false; // placeholder for if at some point we want to enable registering
  const hostInfoQuery = useQuery(["hostInfo", host, email], () => getHostInfo(host, email), {
    enabled: !!host,
    retry: false,
  });

  let hostLoginSuccess =
    canRegister || has_jobtoken ? hostInfoQuery.data != null : hostInfoQuery.data?.user != null;

  const render = () => {
    if (!hostLoginSuccess)
      return (
        <HostLogin
          host={host}
          email={email}
          setHost={setHost}
          setEmail={setEmail}
          canRegister={canRegister}
          hostInfoQuery={hostInfoQuery}
        />
      );
    return <UserLogin login={login} hostInfo={hostInfoQuery.data} searchParams={searchParams} />;
  };

  return (
    <LoginContainer>
      <Title>AnnoTinder</Title>
      {hostInfoQuery.data ? (
        <HostLogout
          host={host}
          email={email}
          setHost={setHost}
          setEmail={setEmail}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      ) : (
        sessionList
      )}
      <FormBox>
        <div>{render()}</div>
      </FormBox>
    </LoginContainer>
  );
};

const HostLogoutDiv = styled.div`
  margin: auto;
  margin-bottom: 2rem;
  padding: 5px 10px;
  display: flex;
  text-align: left;
  justify-content: space-between;
  color: #666666;
`;

interface HostLogoutProps {
  host: string;
  email: string;
  setHost: SetState<string>;
  setEmail: SetState<string>;
  searchParams: URLSearchParams;
  setSearchParams: any;
}

export const HostLogout = ({
  host,
  email,
  setHost,
  setEmail,
  searchParams,
  setSearchParams,
}: HostLogoutProps) => {
  if (!host) return null;

  return (
    <HostLogoutDiv>
      <div>
        <b>{host.replace(/http[s]?:\/\//, "")}</b>
        <br />
        <span>{email}</span>
      </div>
      <Icon
        color="blue"
        name="cancel"
        onClick={() => {
          searchParams.delete("host");
          setSearchParams(searchParams);
          setHost("");
          setEmail("");
        }}
        style={{ cursor: "pointer", paddingLeft: "4px", fontSize: "1.5rem" }}
      />
    </HostLogoutDiv>
  );
};

export default memo(Login);
