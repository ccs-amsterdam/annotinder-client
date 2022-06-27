import { TransitionablePortal, Segment, Button, Icon } from "semantic-ui-react";
import { FullScreenNode, SetState, ConditionReport, CodeBook } from "../../../types";
import Markdown from "../../Common/Markdown";

interface FeedbackPortalProps {
  codebook: CodeBook;
  conditionReport: ConditionReport;
  setConditionReport: SetState<ConditionReport>;
  fullScreenNode: FullScreenNode;
}

const defaultMessage =
  "### You gave an incorrect answer.\n\nThis is a **training** unit. \nPlease have another look, and select a different answer";

const FeedbackPortal = ({
  codebook,
  conditionReport,
  setConditionReport,
  fullScreenNode,
}: FeedbackPortalProps) => {
  return (
    <>
      <RetryPortal
        conditionReport={conditionReport}
        setConditionReport={setConditionReport}
        fullScreenNode={fullScreenNode}
      />
      <ApplaudPortal
        conditionReport={conditionReport}
        setConditionReport={setConditionReport}
        fullScreenNode={fullScreenNode}
      />
    </>
  );
};

interface RetryPortalProps {
  conditionReport: ConditionReport;
  setConditionReport: SetState<ConditionReport>;
  fullScreenNode: FullScreenNode;
}

const RetryPortal = ({ conditionReport, setConditionReport, fullScreenNode }: RetryPortalProps) => {
  return (
    <TransitionablePortal
      key="retry"
      closeOnDocumentClick={false}
      transition={{ animation: "fly down", duration: 600 }}
      mountNode={fullScreenNode || undefined}
      onClose={() => {
        setConditionReport({ action: "pass", feedback: [] });
      }}
      open={conditionReport?.action === "retry"}
      style={{ zIndex: 10000 }}
    >
      <Segment
        style={{
          top: "0%",
          left: "0%",
          position: "fixed",
          width: "100%",
          margin: "0",
          minHeight: "25%",
          maxHeight: "50%",
          overflow: "auto",
          zIndex: 1000,
          background: "rgb(223, 239, 251, 0.95)",
          border: "1px solid #136bae",
          textAlign: "center",
          fontSize: "1em",
          paddingBottom: "25px",
        }}
      >
        <CloseButton onClick={() => setConditionReport({ action: "pass", feedback: [] })} />
        <div
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: "30px",
          }}
        >
          <Icon name="exclamation circle" color="blue" />
        </div>
        <Markdown>{defaultMessage}</Markdown>
      </Segment>
    </TransitionablePortal>
  );
};

interface ApplaudPortalProps {
  conditionReport: ConditionReport;
  setConditionReport: SetState<ConditionReport>;
  fullScreenNode: FullScreenNode;
}

const ApplaudPortal = ({
  conditionReport,
  setConditionReport,
  fullScreenNode,
}: ApplaudPortalProps) => {
  return (
    <TransitionablePortal
      key="applaud"
      closeOnDocumentClick={false}
      transition={{ duration: 200, animation: "scale" }}
      mountNode={fullScreenNode || undefined}
      onClose={() => {
        setConditionReport({ action: "pass", feedback: [] });
      }}
      open={conditionReport?.action === "applaud"}
      style={{ zIndex: 10000 }}
    >
      <Icon
        name="check square"
        style={{
          top: "25%",
          left: "25%",
          position: "fixed",
          width: "50%",
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
      primary
      icon="close"
      size="huge"
      style={{
        height: "25px",
        padding: "0px",
        color: "white",
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
