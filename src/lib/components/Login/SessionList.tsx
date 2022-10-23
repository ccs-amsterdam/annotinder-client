import { useState } from "react";
import styled from "styled-components";
import { Divider, Icon } from "semantic-ui-react";
import { StyledButton, StyledModal } from "../../styled/StyledSemantic";
import { Sessions, Session } from "../../types";

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
  border: 1px solid var(--primary);
  color: var(--text-light);
  transition: background 0.3s;
  cursor: pointer;
  overflow: auto;
  &:hover {
    background: var(--primary-light);
    color: var(--text-inversed);
  }
`;

interface SessionListProps {
  login: (host: string, token: string) => void;
  sessions: Sessions;
  rmSession: (key: string) => void;
}

const SessionList = ({ login, sessions, rmSession }: SessionListProps) => {
  if (Object.keys(sessions).length === 0) return null;

  return (
    <SessionsContainer>
      <h3 style={{ color: "var(--primary)", marginBottom: "0" }}>active sessions</h3>
      <i>click to resume</i>
      {Object.keys(sessions).map((key) => {
        const session = sessions[key];
        const userlabel = session.email || session.name || "";
        return (
          <SessionWithButton key={key}>
            <SessionBox
              onClick={() => {
                login(session.host, session.token);
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
            </SessionBox>
            <RemoveSession session={session} sessionKey={key} rmSession={rmSession} />
          </SessionWithButton>
        );
      })}
      <Divider />
    </SessionsContainer>
  );
};

interface RemoveSessionProps {
  session: Session;
  sessionKey: string;
  rmSession: (key: string) => void;
}

const RemoveSession = ({ session, sessionKey, rmSession }: RemoveSessionProps) => {
  const [open, setOpen] = useState(false);
  return (
    <StyledModal
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
      <StyledModal.Header>Sign-out</StyledModal.Header>
      <StyledModal.Content>
        {!session.email && (
          <>
            This session is not <i>registered</i> to an email address. Once signed-out, you will not
            be able to resume this session.
            <br />
            <br />
          </>
        )}
        Are you sure you wish to sign out?
      </StyledModal.Content>
      <StyledModal.Actions>
        <StyledButton.Group fluid>
          <StyledButton
            onClick={() => {
              rmSession(sessionKey);
              setOpen(false);
            }}
            color="red"
          >
            Sign out
          </StyledButton>
          <StyledButton onClick={() => setOpen(false)}>Cancel</StyledButton>
        </StyledButton.Group>
      </StyledModal.Actions>
    </StyledModal>
  );
};

export default SessionList;
