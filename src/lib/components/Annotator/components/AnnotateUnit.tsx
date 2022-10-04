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
  let codebook = unit?.codebook || jobServer?.codebook;
  if (!codebook || !unit) return null;

  codebook = unfoldCodebook(codebook, unit);
  console.log(codebook);

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

/**
 * Codebooks can indicate that certain questions need to be asked
 * multiple times, e.g., per annotation. If so, the questions
 * need to be 'unfolded'.
 *
 * @param codebook
 * @param unit
 * @returns
 */
const unfoldCodebook = (codebook: CodeBook, unit: Unit) => {
  if (codebook.type === "annotate") return codebook;

  let needsUnfold = false;
  for (let question of codebook.questions) {
    if (question.perAnnotation && unit.importedAnnotations) needsUnfold = true;
    if (question.perField) needsUnfold = true;
  }
  if (!needsUnfold) return codebook;

  const questions = [];
  for (let question of codebook.questions) {
    if (!question.perAnnotation && !question.perField) {
      questions.push(question);
      continue;
    }

    // perAnnotation
    for (let a of unit.importedAnnotations || []) {
      if (!question.perAnnotation.includes(a.variable)) continue;
      const q = { ...question, annotations: [a] };
      if (question.focusAnnotations) q.fields = [a.field];
      questions.push(q);
    }

    console.log(question.perField);
    // perField
    if (question.perField) {
      if (!Array.isArray(question.perField)) question.perField = [question.perField];

      const fields = new Set([]);
      if (unit.grid?.areas) {
        for (let row of unit.grid.areas) {
          for (let column of row) {
            if (column !== ".") fields.add(column);
          }
        }
      } else {
        for (let f of unit.text_fields || []) fields.add(f.name);
        for (let f of unit.markdown_fields || []) fields.add(f.name);
        for (let f of unit.image_fields || []) fields.add(f.name);
      }

      for (let field of fields) {
        for (let fieldmatch of question.perField) {
          console.log(field, fieldmatch);
          if (field.toLowerCase().includes(fieldmatch.toLowerCase())) {
            questions.push({ ...question, fields: [field] });
            break;
          }
        }
      }
    }
  }
  codebook.questions = questions;

  return codebook;
};

interface TaskProps {
  unit: Unit;
  codebook: CodeBook;
  nextUnit: () => void;
  sessionData: SessionData;
  fullScreenNode: FullScreenNode;
}

const Task = ({ unit, codebook, nextUnit, sessionData, fullScreenNode }: TaskProps) => {
  if (codebook.type === "questions")
    return (
      <QuestionTask
        unit={unit}
        codebook={codebook}
        nextUnit={nextUnit}
        fullScreenNode={fullScreenNode}
        sessionData={sessionData}
      />
    );

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
