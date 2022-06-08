import { TransitionablePortal, Segment, Header } from "semantic-ui-react";
import { FullScreenNode, SetState, GoldFeedback } from "../../../types";
import Markdown from "../../Common/Markdown";

interface GoldFeedbackPortalProps {
  goldFeedback: GoldFeedback[];
  setGoldFeedback: SetState<GoldFeedback[]>;
  fullScreenNode: FullScreenNode;
}

const GoldFeedbackPortal = ({
  goldFeedback,
  setGoldFeedback,
  fullScreenNode,
}: GoldFeedbackPortalProps) => {
  const open = goldFeedback && goldFeedback.length > 0;

  return (
    <TransitionablePortal
      transition={{ duration: 200 }}
      mountNode={fullScreenNode || undefined}
      onClose={() => setGoldFeedback([])}
      open={open}
      style={{ zIndex: 10000 }}
    >
      <Segment
        style={{
          top: "15%",
          left: "25%",
          position: "fixed",
          minWidth: "50%",
          maxWidth: "75%",
          maxHeight: "50%",
          overflow: "auto",
          zIndex: 1000,
          background: "rgba(220, 20, 60, 0.433)",
          border: "1px solid #136bae",
        }}
      >
        <Header textAlign="center"></Header>
      </Segment>
    </TransitionablePortal>
  );
};

export default GoldFeedbackPortal;
