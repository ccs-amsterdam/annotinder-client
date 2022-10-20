import { useEffect, useMemo, useState } from "react";
import { TransitionablePortal, Segment, Button, Icon, List } from "semantic-ui-react";
import { FullScreenNode, SetState, ConditionReport, Action } from "../../../types";
import Markdown from "../../Common/Markdown";

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
      <Segment
        style={{
          top: "0%",
          left: "0%",
          position: "fixed",
          width: "100%",
          margin: "0",
          maxHeight: "50%",
          overflow: "auto",
          zIndex: 1000,
          background: "var(--lightred)",
          border: "1px solid var(--primary)",
          textAlign: "center",
          fontSize: "1em",
          paddingBottom: "35px",
        }}
      >
        <CloseButton onClick={() => setConditionReport({ evaluation: {}, damage: {} })} />
        <div
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: "30px",
          }}
        >
          {/* <Icon name="exclamation" style={{ color: "crimson" }} /> */}
        </div>
        <Markdown>{action?.message}</Markdown>
        <List>
          {(action?.submessages || []).map((sm: string, i) => {
            return (
              <List.Item key={i}>
                <List.Content>
                  <Markdown>{sm}</Markdown>
                </List.Content>
              </List.Item>
            );
          })}
        </List>
      </Segment>
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
    <Button
      fluid
      icon="close"
      size="huge"
      style={{
        background: "crimson",
        height: "25px",
        padding: "0px",
        color: "var(--text)",
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
