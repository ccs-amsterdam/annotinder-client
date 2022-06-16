import QuestionTask from "./QuestionTask";
import AnnotateTask from "./AnnotateTask";
import {
  FullScreenNode,
  JobServer,
  SetState,
  Unit,
  SessionData,
  ConditionReport,
  CodeBook,
} from "../../../types";
import { useState, useMemo, useEffect } from "react";
import FeedbackPortal from "./FeedbackPortal";

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
  const [conditionReport, setConditionReport] = useState<ConditionReport>(null);

  const sessionData: SessionData = useMemo(() => {
    return { seenInstructions: {} };
  }, []);

  useEffect(() => {
    setConditionReport(null);
  }, [unit]);

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
        setConditionReport={setConditionReport}
        sessionData={sessionData}
        fullScreenNode={fullScreenNode}
      />
      <FeedbackPortal
        codebook={codebook}
        conditionReport={conditionReport}
        setConditionReport={setConditionReport}
        fullScreenNode={fullScreenNode}
      />
    </>
  );
};

interface TaskProps {
  unit: Unit;
  codebook: CodeBook;
  setUnitIndex: SetState<number>;
  setConditionReport: SetState<ConditionReport>;
  sessionData: SessionData;
  fullScreenNode: FullScreenNode;
}

const Task = ({
  unit,
  codebook,
  setUnitIndex,
  setConditionReport,
  sessionData,
  fullScreenNode,
}: TaskProps) => {
  if (codebook.type === "questions")
    return (
      <QuestionTask
        unit={unit}
        codebook={codebook}
        setUnitIndex={setUnitIndex}
        setConditionReport={setConditionReport}
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
        setConditionReport={setConditionReport}
        fullScreenNode={fullScreenNode}
        sessionData={sessionData}
      />
    );

  return null;
};

export default AnnotateUnit;
