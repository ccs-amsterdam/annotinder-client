import { useCallback, useState, useEffect, useRef } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useSearchParams } from "react-router-dom";
import Backend from "./Backend";
import styled from "styled-components";
import { Button, Divider, Icon, Modal } from "semantic-ui-react";

interface ActiveSession {
  host: string;
  token: string;
}
interface Sessions {
  [token: string]: Session;
}
interface Session {
  host: string;
  email: string;
  name: string;
  restricted_job: number;
  restricted_job_label: string;
}

const useSessions = () => {
  const [session, setSession] = useState({ host: "", token: "" });
  const [sessions, setSessions] = useLocalStorage("sessions", {});
  const [activeSession, setActiveSession] = useLocalStorage("last_login", { host: "", token: "" });
  const [searchParams, setSearchParams] = useSearchParams();
  const has_jobtoken = !!searchParams.get("jobtoken");
  const triedAutoLogin = useRef(false);

  const storeSession = useCallback(
    (backend: Backend) => {
      const sessionData = {
        host: backend.host,
        email: backend.email,
        name: backend.name,
        restricted_job: backend.restricted_job,
        restricted_job_label: backend.restricted_job_label,
      };
      setSessions((sessions: Sessions) => ({ ...sessions, [backend.token]: sessionData }));
      setActiveSession({ host: backend.host, token: backend.token });
    },
    [setSessions, setActiveSession]
  );

  const rmSession = useCallback(
    (token: string) => {
      setSessions((sessions: Sessions) => {
        delete sessions[token];
        return { ...sessions };
      });
      setActiveSession((activeSession: ActiveSession) => {
        if (activeSession.token === token) return { host: "", token: "" };
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

  const logout = () => {
    setSession({ host: "", token: "" });
    setActiveSession({
      host: "",
      token: "",
      email: "",
    });
    searchParams.delete("host");
    setSearchParams(searchParams);
  };

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

const SessionsContainer = styled.div``;

const SessionWithButton = styled.div`
  display: flex;
  align-items: center;
`;

const SessionBox = styled.div`
  width: 80%;
  margin: 0.5rem 0.5rem 0.5rem 10%;
  padding: 5px 10px;
  border-radius: 10px;
  border: 1px solid #2185d0;
  color: #666666;
  transition: background 0.3s;
  cursor: pointer;
  &:hover {
    background: var(--primary-light);
    color: white;
  }
`;

interface SessionListProps {
  login: (host: string, token: string) => void;
  sessions: Sessions;
  rmSession: (token: string) => void;
}

const SessionList = ({ login, sessions, rmSession }: SessionListProps) => {
  if (Object.keys(sessions).length === 0) return null;

  return (
    <SessionsContainer>
      <h3 style={{ color: "var(--primary)", marginBottom: "0" }}>active sessions</h3>
      <i>click to resume</i>
      {Object.keys(sessions).map((token) => {
        const session = sessions[token];
        const userlabel = session.email || session.name || "";
        return (
          <SessionWithButton key={token}>
            <SessionBox
              onClick={() => {
                login(session.host, token);
              }}
            >
              <b>{session.host.replace(/http[s]?:\/\//, "")}</b>
              {userlabel ? (
                <>
                  <br />
                  <span>{session.email || session.name || ""}</span>
                </>
              ) : null}
              <br />
              <span>{session.restricted_job_label}</span>
              {/* <div>
              <Icon
                color="blue"
                name="cancel"
                onClick={() => {
                  console.log("cancel");
                }}
                style={{ cursor: "pointer", paddingLeft: "4px" }}
              />
            </div> */}
            </SessionBox>
            <RemoveSession session={session} token={token} rmSession={rmSession} />
          </SessionWithButton>
        );
      })}
      <Divider />
    </SessionsContainer>
  );
};

interface RemoveSessionProps {
  session: Session;
  token: string;
  rmSession: (token: string) => void;
}

const RemoveSession = ({ session, token, rmSession }: RemoveSessionProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Modal
      on="click"
      open={open}
      position="bottom right"
      style={{ maxWidth: "280px" }}
      onClose={() => setOpen(false)}
      trigger={
        <Icon
          color="blue"
          name="cancel"
          onClick={() => {
            setOpen(true);
          }}
          style={{
            fontSize: "1.5em",
            height: "100%",
            flex: "1 1 auto",
            cursor: "pointer",
            padding: "8px 0px",
          }}
        />
      }
    >
      <Modal.Header>Sign-out</Modal.Header>
      <Modal.Content>
        {!session.email && (
          <>
            This session is not <i>registered</i> to an email address. Once signed-out, you will not
            be able to resume this session.
            <br />
            <br />
          </>
        )}
        Are you sure you wish to sign out?
      </Modal.Content>
      <Modal.Actions>
        <Button.Group fluid>
          <Button
            onClick={() => {
              rmSession(token);
              setOpen(false);
            }}
            color="red"
          >
            Sign out
          </Button>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
};

export default useSessions;
