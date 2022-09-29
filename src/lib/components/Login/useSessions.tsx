import { useCallback, useState, useEffect, useRef, ReactElement } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useSearchParams } from "react-router-dom";
import Backend from "./Backend";
import SessionList from "./SessionList";
import { Sessions, ActiveSession } from "../../types";

const useSessions = (): [
  { host: string; token: string },
  (host: string, token: string) => void,
  () => void,
  (backend: Backend) => void,
  ReactElement
] => {
  const [session, setSession] = useState({ host: "", token: "" });
  const [sessions, setSessions] = useLocalStorage("sessions", {});
  const [activeSession, setActiveSession] = useLocalStorage("activeSession", {
    host: "",
    token: "",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const has_jobtoken = !!searchParams.get("jobtoken");
  const triedAutoLogin = useRef(false);

  useEffect(() => {
    console.log(session);
  }, [session]);

  const storeSession = useCallback(
    (backend: Backend) => {
      const sessionData = {
        host: backend.host,
        user_id: backend.user_id,
        token: backend.token,
        email: backend.email,
        name: backend.name,
        restricted_job: backend.restricted_job,
        restricted_job_label: backend.restricted_job_label,
      };
      const key = backend.user_id + "@" + backend.host;
      setSessions((sessions: Sessions) => ({ ...sessions, [key]: sessionData }));
      setActiveSession({ key, host: backend.host, token: backend.token });
    },
    [setSessions, setActiveSession]
  );

  const rmSession = useCallback(
    (key: string) => {
      setSessions((sessions: Sessions) => {
        delete sessions[key];
        return { ...sessions };
      });
      setActiveSession((activeSession: ActiveSession) => {
        if (activeSession.key === key) return { host: "", token: "" };
        return activeSession;
      });
    },
    [setActiveSession, setSessions]
  );

  const login = useCallback(
    (host: string, token: string) => {
      setSession({ host, token });
    },
    [setSession]
  );

  const logout = useCallback(() => {
    setSession({ host: "", token: "" });
    setActiveSession({
      host: "",
      token: "",
      email: "",
    });
    searchParams.delete("host");
    searchParams.delete("job_id");
    setSearchParams(searchParams);
  }, [setSession, setActiveSession, searchParams, setSearchParams]);

  useEffect(() => {
    // autologin. Only try once and only if there is no jobtoken
    if (triedAutoLogin.current) return;
    triedAutoLogin.current = true;
    if (has_jobtoken || !activeSession.host || !activeSession.token) return;
    login(activeSession.host, activeSession.token);
  }, [activeSession, triedAutoLogin, login, has_jobtoken]);

  const sessionList = <SessionList login={login} sessions={sessions} rmSession={rmSession} />;

  return [session, login, logout, storeSession, sessionList];
};

export default useSessions;
