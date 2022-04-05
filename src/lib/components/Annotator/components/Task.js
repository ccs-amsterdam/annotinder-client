import React from "react";
import QuestionTask from "./QuestionTask";
import AnnotateTask from "./AnnotateTask";

const Task = ({ unit, setUnitIndex, fullScreenNode, nextDelay }) => {
  const codebook = unit?.jobServer?.codebook;

  if (!codebook || !unit) return null;

  const renderTaskPreview = (type) => {
    switch (type) {
      case "questions":
        return (
          <QuestionTask
            unit={unit}
            codebook={codebook}
            setUnitIndex={setUnitIndex}
            fullScreenNode={fullScreenNode}
            nextDelay={nextDelay}
          />
        );
      case "annotate":
        return (
          <AnnotateTask
            unit={unit}
            codebook={codebook}
            setUnitIndex={setUnitIndex}
            fullScreenNode={fullScreenNode}
            nextDelay={nextDelay}
          />
        );
      default:
        return null;
    }
  };

  if (!codebook?.type) return null;
  return renderTaskPreview(codebook.type);
};

export default Task;
