import { memo, ReactElement, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getHostInfo } from "./Backend";
import { useQuery } from "@tanstack/react-query";
import { SetState } from "../../types";
import UserLogin from "./UserLogin";
import HostLogin from "./HostLogin";
import styled from "styled-components";
import { Icon } from "semantic-ui-react";
import Modal from "../Common/components/Modal";
import DemoJobOverview from "../DemoJob/DemoJobOverview";

// make separate useSession hook that returns the current session and tries auto login

const LoginContainer = styled.div`
  backdrop-filter: blur(3px);
  border-radius: 10px;
  position: relative;
  text-align: center;
  display: flex;
  width: 100%;
  flex-direction: column;
  font-size: 1.4rem;
`;

const FormBox = styled.div`
  flex: 1 1 auto;
  display: grid;
  align-items: center;
  justify-items: center;
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
  const paramHost = (searchParams.get("host") || "").replace("%colon%", ":");
  const [host, setHost] = useState(paramHost);
  const [demoModal, setDemoModal] = useState(false);

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
    <>
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
        <span
          style={{ marginTop: "1rem", cursor: "pointer", color: "var(--primary-text)" }}
          onClick={() => setDemoModal(true)}
        >
          View Demo
        </span>
      </LoginContainer>
      <Modal open={demoModal} setOpen={setDemoModal}>
        <DemoJobOverview />
      </Modal>
    </>
  );
};

const HostLogoutDiv = styled.div`
  margin: auto;
  width: 100%;
  margin-bottom: 2rem;
  padding: 5px 10px;
  display: flex;
  text-align: center;
  justify-content: space-between;
  color: var(--text-light);
`;

const HostDetails = styled.div`
  overflow: auto;
  width: 400px;
  max-width: 100%;
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
      <HostDetails>
        <b>{host.replace(/http[s]?:\/\//, "")}</b>
        <br />
        <span>{email}</span>
        <br />
        <Icon
          color="blue"
          name="cancel"
          onClick={() => {
            searchParams.delete("host");
            setSearchParams(searchParams);
            setHost("");
            setEmail("");
          }}
          style={{ cursor: "pointer", padding: "0.5rem", fontSize: "1.5rem" }}
        />
      </HostDetails>
    </HostLogoutDiv>
  );
};

export default memo(Login);
