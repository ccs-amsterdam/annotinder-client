import { useEffect, useState, useRef } from "react";
import { Modal, Button, TransitionablePortal } from "semantic-ui-react";
import { FullScreenNode, CodeBook } from "../../../types";
import Markdown from "../../Common/Markdown";

interface InstructionsProps {
  codebook: CodeBook;
  fullScreenNode: FullScreenNode;
}

const Instructions = ({ codebook, fullScreenNode }: InstructionsProps) => {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState(null);

  // keep track of instructions that have been seen in the current session,
  // so that we only auto-open them the first time
  const seenInstructions = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const inst = codebook?.settings?.instruction;
    if (!inst) {
      setInstruction(null);
      setOpen(false);
      return;
    }
    setInstruction(inst);
    if (codebook?.settings?.auto_instruction) {
      if (!seenInstructions.current[inst]) setOpen(true);
      seenInstructions.current[inst] = true;
    }
  }, [codebook, seenInstructions]);

  if (!instruction) return null;

  return (
    <TransitionablePortal
      closeOnTriggerClick
      mountNode={fullScreenNode || undefined}
      onClose={() => setOpen(false)}
      open={open}
      style={{ zIndex: 10000 }}
      trigger={
        <Button
          size="huge"
          icon="help circle"
          style={{
            background: "transparent",
            cursor: "pointer",
            color: "white",
            padding: "4px 5px 4px 5px",
            maxWidth: "40px",
            zIndex: 1000,
          }}
          onClick={() => setOpen(true)}
        />
      }
    >
      <Modal
        closeIcon
        mountNode={fullScreenNode || undefined}
        open={true}
        onClose={() => setOpen(false)}
        style={{ zIndex: 10000 }}
      >
        <Modal.Content scrolling style={{ zIndex: 10000 }}>
          <Markdown>{instruction}</Markdown>
        </Modal.Content>
      </Modal>
    </TransitionablePortal>
  );
};

export default Instructions;
