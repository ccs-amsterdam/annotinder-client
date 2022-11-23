import { useEffect, useMemo, useState } from "react";
import { TransitionablePortal, Icon } from "semantic-ui-react";
import { FullScreenNode, SetState, ConditionReport, Action } from "../../../types";
import Markdown from "../../Common/Markdown";
import { StyledButton } from "../../../styled/StyledSemantic";
import styled from "styled-components";

const RetryPortalContent = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  padding: 1em;
  padding-bottom: 35px;
  width: 100%;
  margin: 0;
  max-height: 50%;
  overflow: auto;
  z-index: 1000;
  color: var(--text-fixed);
  background: var(--lightred);
  border: 1px solid var(--primary);
  text-align: center;
  font-size: 1em;

  & .Hint {
    margin-top: 1rem;
  }
`;

interface FeedbackPortalProps {
  variable: string;
  conditionReport: ConditionReport;
  setConditionReport: SetState<ConditionReport>;
  fullScreenNode: FullScreenNode;
}

const FeedbackPortal = ({
  variable,
  conditionReport,
  setConditionReport,
  fullScreenNode,
}: FeedbackPortalProps) => {
  const action = useMemo(
    () => conditionReport?.evaluation?.[variable],
    [conditionReport, variable]
  );

  return (
    <>
      <RetryPortal
        action={action}
        setConditionReport={setConditionReport}
        fullScreenNode={fullScreenNode}
      />
      <ApplaudPortal
        action={action}
        reportSuccess={conditionReport?.reportSuccess}
        fullScreenNode={fullScreenNode}
      />
    </>
  );
};

interface RetryPortalProps {
  action: Action;
  setConditionReport: SetState<ConditionReport>;
  fullScreenNode: FullScreenNode;
}

const retryTransition = { animation: "slide down", duration: 300 };

const RetryPortal = ({ action, setConditionReport, fullScreenNode }: RetryPortalProps) => {
  return (
    <TransitionablePortal
      key="retry"
      closeOnDocumentClick={false}
      transition={retryTransition}
      mountNode={fullScreenNode || undefined}
      onClose={() => {
        setConditionReport({ evaluation: {}, damage: {} });
      }}
      open={action?.action === "retry"}
      style={{ zIndex: 10000 }}
    >
      <RetryPortalContent>
        <CloseButton onClick={() => setConditionReport({ evaluation: {}, damage: {} })} />

        <Markdown>{action?.message}</Markdown>
        <div className="Hint">
          {(action?.submessages || []).map((sm: string, i) => {
            return (
              <div style={{ marginBottom: "0.5em" }} key={i}>
                <Markdown>{sm}</Markdown>
              </div>
            );
          })}
        </div>
      </RetryPortalContent>
    </TransitionablePortal>
  );
};

interface ApplaudPortalProps {
  action: Action;
  reportSuccess: boolean;
  fullScreenNode: FullScreenNode;
}

const applaudTransition = { duration: 200, animation: "scale" };

const ApplaudPortal = ({ action, reportSuccess, fullScreenNode }: ApplaudPortalProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (action?.action === "applaud") setOpen(true);
    setTimeout(() => setOpen(false), 300);
  }, [action]);

  return (
    <TransitionablePortal
      key="applaud"
      closeOnDocumentClick={false}
      transition={applaudTransition}
      mountNode={fullScreenNode || undefined}
      open={open && reportSuccess}
      style={{ zIndex: 10000 }}
    >
      <Icon
        name="check"
        style={{
          top: "35%",
          left: "0%",
          position: "fixed",
          width: "100%",
          margin: "0",
          zIndex: 1000,
          color: "#90ee90cf",
          textAlign: "center",
          fontSize: "min(50vw, 30em)",
        }}
      />
    </TransitionablePortal>
  );
};

interface CloseButtonProps {
  onClick: (e: any, d: Object) => void;
}

const CloseButton = ({ onClick }: CloseButtonProps) => {
  return (
    <StyledButton
      fluid
      icon="close"
      size="huge"
      style={{
        background: "crimson",
        height: "25px",
        padding: "0px",
        color: "var(--text-fixed)",
        position: "absolute",
        left: "0%",
        bottom: "0%",
        zIndex: 10000,
      }}
      onClick={onClick}
    />
  );
};

export default FeedbackPortal;
