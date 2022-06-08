import QuestionTask from "./QuestionTask";
import AnnotateTask from "./AnnotateTask";
import {
  FullScreenNode,
  JobServer,
  SetState,
  Unit,
  SessionData,
  GoldFeedback,
} from "../../../types";
import { useMemo } from "react";

interface AnnotateUnitProps {
  unit: Unit;
  jobServer: JobServer;
  unitIndex: number;
  setUnitIndex: SetState<number>;
  setGoldFeedback: SetState<GoldFeedback[]>;
  fullScreenNode: FullScreenNode;
}

const AnnotateUnit = ({
  unit,
  jobServer,
  unitIndex,
  setUnitIndex,
  setGoldFeedback,
  fullScreenNode,
}: AnnotateUnitProps) => {
  const sessionData: SessionData = useMemo(() => {
    return { seenInstructions: {} };
  }, []);

  // Both the unit and the codingjob can have a codebook
  // codebook is the default codebook applied to all units
  // unit.codebook is a unit specific codebook that overrides the default
  if (unitIndex < 0) return null;
  const codebook = unit?.codebook || jobServer?.codebook;
  if (!codebook || !unit) return null;

  if (codebook.type === "questions")
    return (
      <QuestionTask
        unit={unit}
        codebook={codebook}
        setUnitIndex={setUnitIndex}
        setGoldFeedback={setGoldFeedback}
        fullScreenNode={fullScreenNode}
        sessionData={sessionData}
      />
    );

  if (codebook.type === "annotate")
    return (
      <AnnotateTask
        unit={unit}
        codebook={codebook}
        setUnitIndex={setUnitIndex}
        setGoldFeedback={setGoldFeedback}
        fullScreenNode={fullScreenNode}
        sessionData={sessionData}
      />
    );

  return null;
};

export default AnnotateUnit;
