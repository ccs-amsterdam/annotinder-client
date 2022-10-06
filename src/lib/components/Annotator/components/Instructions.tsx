import { useEffect, useRef, useState } from "react";
import { Modal, Button, Portal } from "semantic-ui-react";
import { FullScreenNode, CodeBook, SessionData } from "../../../types";
import Markdown from "../../Common/Markdown";

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

  function fancyClose() {
    const modal = modalRef?.current?.ref?.current;
    if (!modal) {
      setOpen(false);
      return;
    }
    modal.style.transform = "translate(-32.5vw, 55vh) scale(0.001)";
    setTimeout(() => {
      setOpen(false);
    }, 500);
  }

  if (!instruction) return null;

  return (
    <Portal
      closeOnTriggerClick
      transition={{ duration: 200 }}
      mountNode={fullScreenNode || undefined}
      onOpen={() => {
        const modal = modalRef?.current?.ref?.current;
        if (!modal) return;
        setTimeout(() => (modal.style.transform = ""), 0);
      }}
      onClose={() => setOpen(false)}
      open={open}
      style={{ zIndex: 800 }}
      trigger={
        <Button
          size="huge"
          icon="help circle"
          style={{
            position: "relative",
            background: "transparent",
            cursor: "pointer",
            color: "white",
            padding: "4px 5px 4px 5px",
            maxWidth: "40px",
            zIndex: 800,
          }}
          onClick={() => setOpen(true)}
        />
      }
    >
      <Modal
        ref={modalRef}
        closeIcon
        mountNode={fullScreenNode || undefined}
        open={true}
        dimmer="blurring"
        onClose={fancyClose}
        style={{ zIndex: 900, transition: "transform 0.5s" }}
      >
        <Modal.Content scrolling style={{ zIndex: 900 }}>
          <Markdown>{instruction}</Markdown>
          <Markdown>{instruction}</Markdown>
          <Markdown>{instruction}</Markdown>
          <Markdown>{instruction}</Markdown>
          <Markdown>{instruction}</Markdown>
        </Modal.Content>
      </Modal>
    </Portal>
  );
};

export default Instructions;
