import QuestionTask from "./QuestionTask";
import AnnotateTask from "./AnnotateTask";
import {
  FullScreenNode,
  JobServer,
  SetState,
  Unit,
  SessionData,
  GoldFeedback,
  CodeBook,
} from "../../../types";
import { useState, useMemo, useEffect } from "react";
import GoldFeedbackPortal from "../components/GoldFeedbackPortal";

interface AnnotateUnitProps {
  unit: Unit;
  jobServer: JobServer;
  unitIndex: number;
  setUnitIndex: SetState<number>;
  fullScreenNode: FullScreenNode;
}

const AnnotateUnit = ({
  unit,
  jobServer,
  unitIndex,
  setUnitIndex,
  fullScreenNode,
}: AnnotateUnitProps) => {
  const [goldFeedback, setGoldFeedback] = useState<GoldFeedback[]>([]);

  const sessionData: SessionData = useMemo(() => {
    return { seenInstructions: {} };
  }, []);

  useEffect(() => {
    setGoldFeedback(unit?.goldFeedback || []);
  }, [unit]);

  console.log(goldFeedback);
  // Both the unit and the codingjob can have a codebook
  // codebook is the default codebook applied to all units
  // unit.codebook is a unit specific codebook that overrides the default
  if (unitIndex < 0) return null;
  const codebook = unit?.codebook || jobServer?.codebook;
  if (!codebook || !unit) return null;

  return (
    <>
      <Task
        unit={unit}
        codebook={codebook}
        setUnitIndex={setUnitIndex}
        setGoldFeedback={setGoldFeedback}
        sessionData={sessionData}
        fullScreenNode={fullScreenNode}
      />
      <GoldFeedbackPortal
        codebook={codebook}
        goldFeedback={goldFeedback}
        setGoldFeedback={setGoldFeedback}
        fullScreenNode={fullScreenNode}
      />
    </>
  );
};

interface TaskProps {
  unit: Unit;
  codebook: CodeBook;
  setUnitIndex: SetState<number>;
  setGoldFeedback: SetState<GoldFeedback[]>;
  sessionData: SessionData;
  fullScreenNode: FullScreenNode;
}

const Task = ({
  unit,
  codebook,
  setUnitIndex,
  setGoldFeedback,
  sessionData,
  fullScreenNode,
}: TaskProps) => {
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
