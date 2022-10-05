import React, { useState, useEffect } from "react";
import { Button } from "semantic-ui-react";
import { Question, Answer, AnswerItem, SetState } from "../../../types";

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

    if (irrelevant) return "crimson";
    if (done && selected) return "#0c4f83";
    if (selected) return "#0c4f83";
    if (done) return "#7fb9eb";
    return "#d3dfe9";
  };

  // hide if only 1 question that is not yet done

  const hide = questions.length === 1;
  return (
    <>
      {questions.map((q: Question, i: number) => {
        if (hide) return null;

        // size question buttons so that those near the selected question are largest
        const dist = Math.pow(1.2, -Math.abs(questionIndex - i));
        return (
          <Button
            key={i}
            circular
            size="mini"
            active={i === questionIndex}
            style={{
              transition: "padding 0.2s opacity 0.2s background 0.2s",
              opacity: Math.max(dist, 0.2),
              padding: `6px ${dist * 24}px`,
              height: `${15 * dist}px`,
              border: `1px solid`,
              borderColor: i === questionIndex ? "#000000" : "#ffffff",
              background: getColor(i),
              color: "white",
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
    </>
  );
}
