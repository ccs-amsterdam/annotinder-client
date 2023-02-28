import React, { useState, useEffect } from "react";
import { Question, Answer, AnswerItem, SetState } from "../../../types";
import { CustomButton } from "../../../styled/StyledSemantic";

import styled from "styled-components";

const QuestionIndexDiv = styled.div`
  min-height: 10px;
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
    if (done && selected) return "var(--primary-dark)";
    if (selected) return "var(--secondary)";
    if (done) return "var(--primary-light)";
    return "var(--primary-light)";
  };

  // hide if only 1 question that is not yet done

  const hide = questions.length === 1;
  return (
    <QuestionIndexDiv>
      {questions.map((q: Question, i: number) => {
        if (hide) return null;

        // size question buttons so that those near the selected question are largest
        const dist = Math.pow(1.5, -Math.abs(questionIndex - i));
        return (
          <CustomButton
            key={i}
            size={0.6}
            style={{
              transition: "all 0.2s",
              opacity: Math.max(dist, 0.2),
              padding: `5px ${dist * 15}px`,
              marginRight: `${3 * dist}px`,
              height: `${10 * dist}px`,
              border: `1px solid`,
              borderColor: i === questionIndex ? "var(--text-fixed)" : "var(--text-inversed-fixed)",
              background: getColor(i),
              color: "var(--text-fixed)",
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
    </QuestionIndexDiv>
  );
}
