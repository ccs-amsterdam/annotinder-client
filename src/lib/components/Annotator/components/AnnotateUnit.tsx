import QuestionTask from "./QuestionTask";
import AnnotateTask from "./AnnotateTask";
import {
  FullScreenNode,
  JobServer,
  SetUnitIndex,
  Unit,
  SessionData,
  CodeBook,
} from "../../../types";
import { useMemo } from "react";
import { useCallback } from "react";

interface AnnotateUnitProps {
  unit: Unit;
  jobServer: JobServer;
  unitIndex: number;
  setUnitIndex: SetUnitIndex;
  fullScreenNode: FullScreenNode;
}

const AnnotateUnit = ({
  unit,
  jobServer,
  unitIndex,
  setUnitIndex,
  fullScreenNode,
}: AnnotateUnitProps) => {
  const sessionData: SessionData = useMemo(() => {
    return { seenInstructions: {} };
  }, []);

  const nextUnit = useCallback(() => {
    setUnitIndex(unitIndex + 1);
  }, [unitIndex, setUnitIndex]);

  // Both the unit and the codingjob can have a codebook
  // codebook is the default codebook applied to all units
  // unit.codebook is a unit specific codebook that overrides the default
  if (unitIndex < 0) return null;
  let codebook = unit?.unit.codebook || jobServer?.codebook;
  if (!codebook || !unit) return null;

  return (
    <Task
      unit={unit}
      codebook={codebook}
      nextUnit={nextUnit}
      sessionData={sessionData}
      fullScreenNode={fullScreenNode}
    />
  );
};

interface TaskProps {
  unit: Unit;
  codebook: CodeBook;
  nextUnit: () => void;
  sessionData: SessionData;
  fullScreenNode: FullScreenNode;
}

const Task = ({ unit, codebook, nextUnit, sessionData, fullScreenNode }: TaskProps) => {
  if (codebook.type === "questions") {
    // Codebooks can indicate that certain questions need to be asked
    // multiple times (per annotation, per field). If so, the questions need to be 'unfolded'.

    return (
      <QuestionTask
        unit={unit}
        codebook={codebook}
        nextUnit={nextUnit}
        fullScreenNode={fullScreenNode}
        sessionData={sessionData}
      />
    );
  }
  if (codebook.type === "annotate")
    return (
      <AnnotateTask
        unit={unit}
        codebook={codebook}
        nextUnit={nextUnit}
        fullScreenNode={fullScreenNode}
        sessionData={sessionData}
      />
    );

  return null;
};

export default AnnotateUnit;
