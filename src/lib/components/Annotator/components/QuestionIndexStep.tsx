import { useState, useEffect } from "react";
import { Question, Answer, SetState } from "../../../types";

import styled from "styled-components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const QuestionIndexDiv = styled.div`
  min-height: 10px;
  justify-content: right;
  align-items: center;
  display: flex;

  .buttons {
    //min-width: 100px;
    padding-top: 0.5rem;
  }
  b {
    padding-top: 0.3rem;
  }
`;

const Icon = styled.div<{ disabled?: boolean; hidden?: boolean }>`
  display: ${(p) => (p.hidden ? "none" : "block")};
  font-size: 3rem;
  transform: scale(1, 1.1);
  padding: 0rem 0.5rem 0rem 0.5rem;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  color: ${(p) => (p.disabled ? "transparent" : "var(--primary-text)")};

  /* svg:hover {
    fill: ${(p) => (p.disabled ? "grey" : "var(--secondary)")};
  } */
`;

interface QuestionIndexStepProps {
  children?: React.ReactNode;
  questions: Question[];
  questionIndex: number;
  answers: Answer[];
  setQuestionIndex: SetState<number>;
}

export default function QuestionIndexStep({
  children,
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

  const previousIndex = getPreviousIndex(questionIndex, canSelect, answers);
  const nextIndex = getNextIndex(questionIndex, canSelect, questions, answers);
  //const visibleIndex = getVisibleIndex(answers, questionIndex);

  // hide if only 1 question that is not yet done
  const hide = questions.length === 1;

  return (
    <QuestionIndexDiv>
      <Icon
        hidden={hide}
        onClick={() => previousIndex !== null && setQuestionIndex(previousIndex)}
        disabled={previousIndex === null}
      >
        <FaChevronLeft />
      </Icon>
      {children}

      <Icon
        hidden={hide}
        onClick={() => nextIndex !== null && setQuestionIndex(nextIndex)}
        disabled={nextIndex === null}
      >
        <FaChevronRight />
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

// function getVisibleIndex(answers: Answer[], questionIndex: number) {
//   // only show coder the index ignoring the irrelevant questions
//   let visibleIndex = 0;
//   for (let i = 0; i < questionIndex; i++) {
//     if (answers[i].items[0].values?.[0] === "IRRELEVANT") continue;
//     visibleIndex++;
//   }
//   return visibleIndex;
// }
