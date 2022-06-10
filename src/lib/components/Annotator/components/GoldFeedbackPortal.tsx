import { TransitionablePortal, Segment, Button, Icon } from "semantic-ui-react";
import { FullScreenNode, SetState, GoldFeedback, CodeBook } from "../../../types";
import Markdown from "../../Common/Markdown";

interface GoldFeedbackPortalProps {
  codebook: CodeBook;
  goldFeedback: GoldFeedback[];
  setGoldFeedback: SetState<GoldFeedback[]>;
  fullScreenNode: FullScreenNode;
}

const defaultMessage =
  "### You gave an incorrect answer.\n\nThis is a **training** unit. \nPlease have another look, and select a different answer";

const GoldFeedbackPortal = ({
  codebook,
  goldFeedback,
  setGoldFeedback,
  fullScreenNode,
}: GoldFeedbackPortalProps) => {
  const open = goldFeedback && goldFeedback.length > 0;

  return (
    <TransitionablePortal
      closeOnDocumentClick={false}
      transition={{ animation: "fly down", duration: 600 }}
      mountNode={fullScreenNode || undefined}
      onClose={() => {
        setGoldFeedback([]);
      }}
      open={open}
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
        <CloseButton onClick={() => setGoldFeedback([])} />
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

export default GoldFeedbackPortal;
