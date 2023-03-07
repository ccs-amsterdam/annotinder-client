import { useEffect, useMemo, useState } from "react";
import { TransitionablePortal } from "semantic-ui-react";
import { FullScreenNode, SetState, ConditionReport, Action } from "../../../types";
import Markdown from "../../Common/Markdown";
import styled from "styled-components";
import { FaCheck, FaWindowClose } from "react-icons/fa";

const RetryPortalContent = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  padding: 1em;
  padding-bottom: 35px;
  width: 100%;
  margin: 0;
  max-height: 50%;
  z-index: 10000;
  color: var(--text-fixed);
  background: var(--primary-light);
  border-bottom: 1px solid var(--primary-dark);

  .portalContent {
    text-align: center;
    font-size: 1.5rem;
    overflow: auto;
  }

  & .Hint {
    margin-top: 1rem;
  }

  .closeIcon {
    vertical-align: top;
    cursor: pointer;
    position: absolute;
    bottom: 0;
    z-index: 10000;
    width: 3.5rem;
    transform: translateY(1.5rem);
    left: calc(50% - 2.5rem);

    svg:hover {
      fill: var(--text);
    }
  }
`;

const ApplaudIcon = styled.div`
  position: fixed;
  display: flex;
  top: 30%;
  left: 0;
  width: 100%;
  z-index: 10000;
  animation: slideIn 0.6s;
  animation-fill-mode: forwards;

  div {
    margin: auto;
    width: 20%;
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
        <div className="portalContent">
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

const ApplaudPortal = ({ action, reportSuccess }: ApplaudPortalProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (action?.action === "applaud" && reportSuccess) setOpen(true);
    setTimeout(() => setOpen(false), 600);
  }, [action, reportSuccess]);

  if (!open) return null;

  return (
    <ApplaudIcon>
      <div>
        <FaCheck size="100%" color="#90ee90cf" />
      </div>
    </ApplaudIcon>
  );
};

interface CloseButtonProps {
  onClick: () => void;
}

const CloseButton = ({ onClick }: CloseButtonProps) => {
  return (
    <div className="closeIcon">
      <FaWindowClose size="100%" color="var(--primary)" onClick={onClick} />
    </div>
  );
};

export default FeedbackPortal;
