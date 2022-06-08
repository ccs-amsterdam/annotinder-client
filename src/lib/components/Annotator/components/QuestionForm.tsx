import React, { useState, useEffect, useRef, ReactElement, useCallback } from "react";
import { Header, Segment, Icon } from "semantic-ui-react";
import styled from "styled-components";
import {
  Question,
  Unit,
  Answer,
  AnswerItem,
  SetState,
  Annotation,
  Token,
  Swipes,
  GoldFeedback,
} from "../../../types";
import {
  getMakesIrrelevantArray,
  processIrrelevantBranching,
} from "../functions/irrelevantBranching";
import {
  addAnnotationsFromAnswer,
  getAnswersFromAnnotations,
} from "../functions/mapAnswersToAnnotations";
import AnswerField from "./AnswerField";
import QuestionIndexStep from "./QuestionIndexStep";

const BACKGROUND = "#1B1C1D";
const COLOR = "white";

const QuestionDiv = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${BACKGROUND};
  border-top: 3px double ${COLOR};
  box-shadow: 5px 5px 5px 1px grey;
  overflow: auto;
  font-size: inherit;
  z-index: 9000;
`;

const MenuDiv = styled.div`
  width: 100%;
  display: flex;
`;

const BodyDiv = styled.div`
  display: flex;
  flex-flow: column;
  height: calc(100% - 30px);
  width: 100%;
  max-height: 100%;
  padding: 0px 10px 5px 10px;
  color: ${COLOR};
  font-size: inherit;
`;

const HeaderDiv = styled.div`
  width: 100%;
  flex: 1 1 auto;
  padding: 5px 0px;
  font-size: inherit;
`;

const iconStyle = {
  fontSize: "10px",
  position: "absolute",
  right: "12px",
  paddingTop: "4px",
  marginRight: "0",
  color: "lightgreen",
  transform: "scale(3)",
};

const segmentStyle = {
  flex: "0.5 1 auto",
  padding: "0",
  overflowY: "auto",
  height: "100%",
  minHeight: "50px", // safety net for when mobile keyboard pops up
  width: "100%",
  margin: "0",
  fontSize: "inherit",
};

interface QuestionFormProps {
  children: ReactElement | ReactElement[];
  unit: Unit;
  tokens: Token[];
  questions: Question[];
  questionIndex: number;
  setQuestionIndex: SetState<number>;
  setUnitIndex: SetState<number>;
  setGoldFeedback: SetState<GoldFeedback[]>;
  swipe: Swipes;
  blockEvents: boolean;
}

const QuestionForm = ({
  children,
  unit,
  tokens,
  questions,
  questionIndex,
  setQuestionIndex,
  setUnitIndex,
  setGoldFeedback,
  swipe,
  blockEvents,
}: QuestionFormProps) => {
  const blockAnswer = useRef(false); // to prevent answering double (e.g. with swipe events)
  const [answers, setAnswers] = useState<Answer[]>(null);
  const [questionText, setQuestionText] = useState(<div />);

  useEffect(() => {
    if (!questions) return;
    getAnswersFromAnnotations(unit, tokens, questions, setAnswers);
    setQuestionIndex(0);
  }, [unit, tokens, setAnswers, setQuestionIndex, questions]);

  useEffect(() => {
    if (!questions?.[questionIndex] || !unit) {
      setQuestionIndex(0);
      return;
    }
    setQuestionText(prepareQuestion(unit, questions[questionIndex], answers));
    blockAnswer.current = false;
  }, [unit, questions, questionIndex, answers, setQuestionIndex]);

  const onAnswer = useCallback(
    (items: AnswerItem[], onlySave = false, minDelay = 0): void => {
      // posts results and skips to next question, or next unit if no questions left.
      // If onlySave is true, only write to db without going to next question
      processAnswer(
        items,
        onlySave,
        minDelay,
        unit,
        questions,
        answers,
        questionIndex,
        setUnitIndex,
        setQuestionIndex,
        setGoldFeedback,
        blockAnswer
      );
    },
    [answers, questionIndex, questions, setQuestionIndex, setUnitIndex, setGoldFeedback, unit]
  );

  if (!questions || !unit || !answers) return null;
  if (!questions?.[questionIndex]) return null;

  let done = true;
  for (let a of answers) {
    for (let item of a.items) {
      if (item.values.length === 0) done = false;
    }
  }

  return (
    <QuestionDiv>
      <MenuDiv>
        <div style={{ display: "flex", width: "60px" }}>{children}</div>
        <div style={{ width: "100%", textAlign: "center" }}>
          <QuestionIndexStep
            questions={questions}
            questionIndex={questionIndex}
            answers={answers}
            setQuestionIndex={setQuestionIndex}
          />
        </div>
        <div style={{ position: "relative", width: "60px" }}>
          {done ? <Icon size="big" name="check square outline" style={iconStyle} /> : null}
        </div>
      </MenuDiv>

      <BodyDiv>
        <HeaderDiv>
          <Header as="h3" textAlign="center" style={{ color: COLOR, fontSize: "1.2em" }}>
            {questionText}
          </Header>
        </HeaderDiv>
        <Segment style={segmentStyle}>
          <AnswerField
            answers={answers}
            questions={questions}
            questionIndex={questionIndex}
            onAnswer={onAnswer}
            swipe={swipe}
            blockEvents={blockEvents}
          />
        </Segment>
      </BodyDiv>
    </QuestionDiv>
  );
};

const prepareQuestion = (unit: Unit, question: Question, answers: Answer[]) => {
  if (!question?.question) return <div />;
  let preparedQuestion = question.question;

  const regex = /{(.*?)}/g;
  const matches = [...Array.from(preparedQuestion.matchAll(regex))];
  for (let m of matches) {
    const answer = answers.find((a) => a.variable === m["1"]);
    if (answer) {
      const value = answer.items[0].values.join(", ");
      preparedQuestion = preparedQuestion.replace(m["0"], "{" + value + "}");
    }
  }

  if (!unit.variables) return markedString(preparedQuestion);

  for (let variable of Object.keys(unit.variables)) {
    if (preparedQuestion.search(`\\[${variable}\\]`) >= 0) {
      let code = unit.variables[variable];
      const codeTag = `{${code}}`; // add optional color from itemquestions
      preparedQuestion = preparedQuestion.replace(`[${variable}]`, codeTag);
    }
  }

  return markedString(preparedQuestion);
};

const markedString = (text: string) => {
  const regex = new RegExp(/{(.*?)}/); // Match text inside two square brackets

  text = text.replace(/(\r\n|\n|\r)/gm, "");
  return (
    <div>
      {text.split(regex).reduce((prev: (string | ReactElement)[], current: string, i: number) => {
        if (i % 2 === 0) {
          prev.push(current);
        } else {
          prev.push(
            <mark key={i + current} style={{ color: "lightblue", backgroundColor: "transparent" }}>
              {current}
            </mark>
          );
        }
        return prev;
      }, [])}
    </div>
  );
};

const processAnswer = async (
  items: AnswerItem[],
  onlySave = false,
  minDelay = 0,
  unit: Unit,
  questions: Question[],
  answers: Answer[],
  questionIndex: number,
  setUnitIndex: SetState<number>,
  setQuestionIndex: SetState<number>,
  setGoldFeedback: SetState<GoldFeedback[]>,
  blockAnswer: any
): Promise<void> => {
  if (blockAnswer.current) return null;
  blockAnswer.current = true;

  try {
    answers[questionIndex].items = items;
    answers[questionIndex].makes_irrelevant = getMakesIrrelevantArray(
      items,
      questions[questionIndex].options
    );

    unit.annotations = addAnnotationsFromAnswer(answers[questionIndex], unit.annotations);

    const irrelevantQuestions = processIrrelevantBranching(unit, questions, answers, questionIndex);

    // next (non-irrelevant) question in unit (null if no remaining)
    let newQuestionIndex: number = null;
    for (let i = questionIndex + 1; i < questions.length; i++) {
      if (irrelevantQuestions[i]) continue;
      newQuestionIndex = i;
      break;
    }

    const status = newQuestionIndex === null ? "DONE" : "IN_PROGRESS";
    const cleanAnnotations = unit.annotations.map((a: Annotation) => {
      const { field, offset, length, variable, value } = a;
      return { field, offset, length, variable, value };
    });

    if (onlySave) {
      // if just saving (for multivalue questions)
      unit.jobServer.postAnnotations(unit.unitId, unit.unitIndex, cleanAnnotations, status);
      blockAnswer.current = false;
      return;
    }

    const start = new Date();
    const goldfeedback: GoldFeedback[] = await unit.jobServer.postAnnotations(
      unit.unitId,
      unit.unitIndex,
      cleanAnnotations,
      status
    );
    if (goldfeedback.length > 0) {
      setGoldFeedback(goldfeedback);
      blockAnswer.current = false;
    } else {
      const delay = new Date().getTime() - start.getTime();
      const extradelay = Math.max(0, minDelay - delay);
      await new Promise((resolve) => setTimeout(resolve, extradelay));
      if (newQuestionIndex !== null) {
        setQuestionIndex(newQuestionIndex);
      } else {
        setUnitIndex((state: number) => state + 1);
      }
      blockAnswer.current = false;
    }
  } catch (e) {
    console.log(e);
    // just to make certain the annotator doesn't block if something goes wrong
    blockAnswer.current = false;
  }
};

export default React.memo(QuestionForm);
