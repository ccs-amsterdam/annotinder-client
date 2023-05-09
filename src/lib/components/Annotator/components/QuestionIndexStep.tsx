import { useState, useEffect } from "react";
import { Question, Answer, AnswerItem, SetState } from "../../../types";

import styled from "styled-components";
import { FaStepBackward, FaStepForward } from "react-icons/fa";

const QuestionIndexDiv = styled.div`
  min-height: 10px;
  justify-content: right;
  display: flex;

  .buttons {
    //min-width: 100px;
  }
`;

const Icon = styled.div<{ disabled?: boolean; hidden?: boolean }>`
  display: ${(p) => (p.hidden ? "none" : "block")};
  font-size: 2rem;
  padding: 0.5rem 0.5rem 0rem 0.5rem;
  cursor: ${(p) => (p.disabled ? "transparent" : "pointer")};
  color: ${(p) => (p.disabled ? "var(--background)" : "var(--primary-text)")};

  svg:hover {
    fill: ${(p) => (p.disabled ? "transparent" : "var(--secondary)")};
  }
`;

interface QuestionIndexStepProps {
  questions: Question[];
  questionIndex: number;
  answers: Answer[];
  setQuestionIndex: SetState<number>;
}

export default function QuestionIndexStep({
  questions,
  questionIndex,
  answers,
  setQuestionIndex,
}: QuestionIndexStepProps) {
  //if (questions.length === 1) return null;
  const [canSelect, setCanSelect] = useState([]);

  useEffect(() => {
    const cs = answers.map((a: Answer) => {
      return (
        a.items[0].values != null &&
        a.items[0].values.length !== 0 &&
        a.items[0].values[0] !== "IRRELEVANT"
      );
    });
    cs[0] = true;
    setCanSelect(cs);
  }, [answers, setCanSelect]);

  useEffect(() => {
    setCanSelect((state) => {
      const newState = [...state];
      if (questionIndex >= newState.length) return null;
      newState[questionIndex] = true;
      return newState;
    });
  }, [questionIndex, setCanSelect]);

  const getColor = (i: number) => {
    if (!answers[i]) return "grey";
    const done = !answers[i].items.some(
      (v: AnswerItem) => v.values == null || v.values.length === 0
    );
    const irrelevant = answers[i].items[0].values?.[0] === "IRRELEVANT";
    const selected = questionIndex === i;

    if (irrelevant) return "var(--red)";
    if (selected) return "var(--primary-text)";
    if (done) return "var(--secondary)";
    return "var(--primary-light)";
  };

  const previousIndex = getPreviousIndex(questionIndex, canSelect, answers);
  const nextIndex = getNextIndex(questionIndex, canSelect, questions, answers);

  // hide if only 1 question that is not yet done
  const hide = questions.length === 1;

  return (
    <QuestionIndexDiv>
      <Icon
        hidden={hide}
        onClick={() => previousIndex !== null && setQuestionIndex(previousIndex)}
        disabled={previousIndex === null}
      >
        <FaStepBackward />
      </Icon>
      <div className="buttons">
        {questions.map((q: Question, i: number) => {
          if (hide) return null;

          // size question buttons so that those near the selected question are largest
          const dist = Math.pow(1.5, -Math.abs(questionIndex - i));
          return (
            <button
              key={i}
              style={{
                borderRadius: "5px",
                transition: "all 0.2s",
                opacity: Math.max(dist, 0.2),
                padding: `5px ${dist * 15}px`,
                marginRight: `${3 * dist}px`,
                height: `${10 * dist}px`,
                border: `1px solid`,
                borderColor: i === questionIndex ? "var(--background-fixed)" : "transparent",
                background: getColor(i),
                cursor: "pointer",
              }}
              onClick={() => {
                if (canSelect?.[i]) {
                  const irrelevant = answers[i].items[0].values?.[0] === "IRRELEVANT";
                  if (!irrelevant) setQuestionIndex(i);
                }
              }}
            />
          );
        })}
      </div>
      <Icon
        hidden={hide}
        onClick={() => nextIndex !== null && setQuestionIndex(nextIndex)}
        disabled={nextIndex === null}
      >
        <FaStepForward />
      </Icon>
    </QuestionIndexDiv>
  );
}

function getPreviousIndex(questionIndex: number, canSelect: boolean[], answers: Answer[]) {
  for (let i = questionIndex - 1; i >= 0; i--) {
    if (!canSelect?.[i]) continue;
    if (answers[i].items[0].values?.[0] === "IRRELEVANT") continue;
    return i;
  }
  return null;
}
function getNextIndex(
  questionIndex: number,
  canSelect: boolean[],
  questions: Question[],
  answers: Answer[]
) {
  for (let i = questionIndex + 1; i < questions.length; i++) {
    if (!canSelect?.[i]) continue;
    if (answers[i].items[0].values?.[0] === "IRRELEVANT") continue;
    return i;
  }
  return null;
}
