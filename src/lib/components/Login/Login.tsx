import React, { memo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Backend, { getHostInfo } from "./Backend";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { SetState } from "../../types";
import useLocalStorage from "../../hooks/useLocalStorage";
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

interface LoginProps {
  backend: Backend;
  setBackend: SetState<Backend>;
}

const Login = ({ backend, setBackend }: LoginProps) => {
  const [session, setSession] = useLocalStorage("session", { host: "", token: "" });
  const [searchParams, setSearchParams] = useSearchParams();
  const [host, setHost] = useState("");
  const hostInfoQuery = useQuery(["hostInfo", host], () => getHostInfo(host), {
    enabled: !!host,
    retry: false,
  });

  const login = useCallback(
    (token: string) => {
      if (!host || !token) {
        setBackend(null);
        return;
      }
      const backend = new Backend(host, token);
      backend
        .init()
        .then(() => {
          setBackend(backend);
          setSession({ host, token });
        })
        .catch((e: Error) => {
          console.error(e);
          setBackend(null);
        });
    },

    [host, setBackend]
  );

  const render = () => {
    if (!hostInfoQuery.data)
      return (
        <HostLogin
          setHost={setHost}
          hostInfoQuery={hostInfoQuery}
          session={session}
          searchParams={searchParams}
        />
      );
    return (
      <UserLogin
        setToken={login}
        hostInfo={hostInfoQuery.data}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    );
  };

  return (
    <LoginContainer>
      {hostInfoQuery.data ? (
        <HostLogout
          host={host}
          setHost={setHost}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      ) : null}
      <FormBox>
        <div>{render()}</div>
      </FormBox>
    </LoginContainer>
  );
};

const HostLogoutDiv = styled.div`
  margin: auto;
  margin-bottom: 15px;
  padding: 5px 10px;
  border-radius: 10px;
  border: 1px solid #2185d0;
  display: flex;
  color: #666666;
`;

interface HostLogoutProps {
  host: string;
  setHost: SetState<string>;
  searchParams: URLSearchParams;
  setSearchParams: any;
}

export const HostLogout = ({ host, setHost, searchParams, setSearchParams }: HostLogoutProps) => {
  if (!host) return null;
  return (
    <HostLogoutDiv>
      <span>{host}</span>
      <Icon
        color="blue"
        name="cancel"
        onClick={() => {
          searchParams.delete("host");
          setSearchParams(searchParams);
          setHost("");
        }}
        style={{ cursor: "pointer", paddingLeft: "4px" }}
      />
    </HostLogoutDiv>
  );
};

export default memo(Login);
