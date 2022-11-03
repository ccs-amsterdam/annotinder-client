import { useEffect, useRef, useState } from "react";
import { TransitionablePortal } from "semantic-ui-react";
import { FullScreenNode, CodeBook, SessionData } from "../../../types";
import Markdown from "../../Common/Markdown";
import { StyledModal, StyledButton } from "../../../styled/StyledSemantic";

interface InstructionsProps {
  codebook: CodeBook;
  sessionData: SessionData;
  fullScreenNode: FullScreenNode;
}

const Instructions = ({ codebook, sessionData, fullScreenNode }: InstructionsProps) => {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const inst = codebook?.settings?.instruction;
    if (!inst) {
      setInstruction(null);
      setOpen(false);
      return;
    }
    setInstruction(inst);
    if (codebook?.settings?.auto_instruction) {
      if (!sessionData.seenInstructions[inst]) setOpen(true);
      sessionData.seenInstructions[inst] = true;
    }
  }, [codebook, sessionData]);

  useEffect(() => {
    const stopPropagation = (e: any) => open && e.stopPropagation();
    const stopWhat = ["keydown", "keyup"];
    for (const what of stopWhat) document.addEventListener(what, stopPropagation);
    return () => {
      for (const what of stopWhat) document.removeEventListener(what, stopPropagation);
    };
  }, [open]);

  if (!instruction) return null;

  return (
    <TransitionablePortal
      closeOnTriggerClick
      transition={{ duration: 200 }}
      mountNode={fullScreenNode || undefined}
      onClose={() => setOpen(false)}
      open={open}
      style={{ zIndex: 800 }}
      trigger={
        <StyledButton
          size="huge"
          icon="help circle"
          style={{
            position: "relative",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-inversed-fixed)",
            padding: "4px 5px",
            maxWidth: "20px",
            zIndex: 800,
          }}
          onClick={() => setOpen(true)}
        />
      }
    >
      <StyledModal
        ref={modalRef}
        closeIcon
        mountNode={fullScreenNode || undefined}
        open={true}
        dimmer="blurring"
        onClose={() => setOpen(false)}
        style={{ zIndex: 900 }}
      >
        <StyledModal.Content
          scrolling
          style={{
            zIndex: 900,
            maxHeight: "calc(100vh - 10rem)",
            background: "var(--background)",
            color: "var(--text)",
            border: "1px solid var(--background-inversed)",
          }}
        >
          <Markdown>{instruction}</Markdown>
        </StyledModal.Content>
      </StyledModal>
    </TransitionablePortal>
  );
};

export default Instructions;
