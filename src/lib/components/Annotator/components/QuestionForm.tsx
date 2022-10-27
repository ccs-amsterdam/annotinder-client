import React, { useState, useRef, ReactElement, useCallback } from "react";
import { Icon } from "semantic-ui-react";
import styled from "styled-components";
import useWatchChange from "../../../hooks/useWatchChange";
import {
  Question,
  Unit,
  Answer,
  AnswerItem,
  SetState,
  Annotation,
  Swipes,
  ConditionReport,
  Transition,
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

const QuestionDiv = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  background-color: var(--background-inversed-fixed);
  border-top: 3px double var(--text-inversed-fixed);
  box-shadow: 0px 5px 5px 1px grey;
  font-size: inherit;
  z-index: 50;
  overflow: auto;
`;

const MenuDiv = styled.div`
  position: relative;
  z-index: 51;
  width: 100%;
  display: flex;
`;

const BodyDiv = styled.div`
  display: flex;
  flex-flow: column;
  height: calc(100% - 30px);
  width: 100%;
  padding: 0px 10px 5px 10px;
  color: var(--text-inversed-fixed);
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
  color: "var(--green)",
  transform: "scale(3)",
};

interface QuestionFormProps {
  /** Buttons can be passed as children, that will be shown on the topleft of the question form */
  children: ReactElement | ReactElement[];
  /** The unit */
  unit: Unit;
  /** The tokens of the unit. Used to include span offset and length in the annotation
   * (this allows questions about a part of a document, like a sentence, to be made into document annotations) */
  questions: Question[];
  questionIndex: number;
  setQuestionIndex: SetState<number>;
  nextUnit: () => void;
  setConditionReport: SetState<ConditionReport>;
  swipe: Swipes;
  setSwipe: SetState<Swipes>;
  startTransition: ({ direction, color }: Transition, nextUnit: boolean) => void;
  blockEvents: boolean;
}

const QuestionForm = ({
  children,
  unit,
  questions,
  questionIndex,
  setQuestionIndex,
  nextUnit,
  setConditionReport,
  swipe,
  setSwipe,
  startTransition,
  blockEvents,
}: QuestionFormProps) => {
  const blockAnswer = useRef(false); // to prevent answering double (e.g. with swipe events)
  const [answers, setAnswers] = useState<Answer[]>(null);
  const [questionText, setQuestionText] = useState(<div />);

  if (useWatchChange([unit, questions])) {
    if (questions) setAnswers(getAnswersFromAnnotations(unit, questions));
  }

  if (useWatchChange([unit, questions, answers, questionIndex])) {
    if (!questions?.[questionIndex] || !unit) {
      setQuestionIndex(0);
    } else {
      setQuestionText(prepareQuestion(unit, questions[questionIndex], answers));
      blockAnswer.current = false;
    }
  }

  const onAnswer = useCallback(
    (items: AnswerItem[], onlySave = false, transition?: Transition): void => {
      // posts results and skips to next question, or next unit if no questions left.
      // If onlySave is true, only write to db without going to next question

      // Swipe is now passed down via a state, so state needs to be reset
      // before the next question or unit. It would probably be better to
      // do this via a function, but than this would need to be passed up from
      // AnswerField. At some point think of this when refactoring
      setSwipe(null);

      processAnswer(
        items,
        onlySave,
        unit,
        questions,
        answers,
        questionIndex,
        nextUnit,
        setQuestionIndex,
        setConditionReport,
        (nextUnit: boolean) => startTransition(transition, nextUnit),
        blockAnswer
      );
    },
    [
      answers,
      questionIndex,
      questions,
      setQuestionIndex,
      nextUnit,
      setConditionReport,
      unit,
      setSwipe,
      startTransition,
    ]
  );

  if (!questions || !unit || !answers) return null;
  if (!questions?.[questionIndex]) return null;

  const done = unit.status === "DONE";

  return (
    <QuestionDiv>
      <MenuDiv>
        <div
          style={{
            position: "relative",
            zIndex: 100,
            display: "flex",
            width: "60px",
            color: "var(--text-inversed-fixed)",
          }}
        >
          {children}
        </div>
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
        <HeaderDiv className="AnswerHeader">
          <h2
            style={{ color: "var(--text-inversed-fixed)", fontSize: "1.2em", textAlign: "center" }}
          >
            {questionText}
          </h2>
        </HeaderDiv>

        <AnswerField
          answers={answers}
          questions={questions}
          questionIndex={questionIndex}
          onAnswer={onAnswer}
          swipe={swipe}
          blockEvents={blockEvents}
        />
      </BodyDiv>
    </QuestionDiv>
  );
};

const prepareQuestion = (unit: Unit, question: Question, answers: Answer[]) => {
  if (!question?.question) return <div />;
  let preparedQuestion = question.question;

  const regex = /{(.*?)}/g;
  if (answers) {
    // matchAll not yet supported by RStudio browser
    //const matches = [...Array.from(preparedQuestion.matchAll(regex))];
    //for (let m of matches) {
    let m: RegExpExecArray;
    while ((m = regex.exec(preparedQuestion))) {
      const m0: string = m[0];
      const m1: string = m[1];
      let answer;
      if (unit.unit.variables) {
        answer = { variable: m1, items: [{ values: [unit.unit.variables[m1]] }] };
      }
      if (answers) {
        answer = answers.find((a) => a.variable === m1) || answer;
      }

      if (answer) {
        const value = answer.items[0].values.join(", ");
        preparedQuestion = preparedQuestion.replace(m0, "{" + value + "}");
      }
    }
  }

  return markedString(preparedQuestion);
};

const markedString = (text: string) => {
  const regex = new RegExp(/{(.*?)}/); // Match text inside two curly brackets

  text = text.replace(/(\r\n|\n|\r)/gm, "");
  return (
    <div>
      {text.split(regex).reduce((prev: (string | ReactElement)[], current: string, i: number) => {
        if (i % 2 === 0) {
          prev.push(current);
        } else {
          prev.push(
            <mark
              key={i + current}
              style={{ color: "var(--primary-light)", backgroundColor: "transparent" }}
            >
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
  unit: Unit,
  questions: Question[],
  answers: Answer[],
  questionIndex: number,
  nextUnit: () => void,
  setQuestionIndex: SetState<number>,
  setConditionReport: SetState<ConditionReport>,
  transition: (nextUnit: boolean) => void,
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

    unit.unit.annotations = addAnnotationsFromAnswer(answers[questionIndex], unit.unit.annotations);

    const irrelevantQuestions = processIrrelevantBranching(unit, questions, answers, questionIndex);

    // next (non-irrelevant) question in unit (null if no remaining)
    let newQuestionIndex: number = null;
    for (let i = questionIndex + 1; i < questions.length; i++) {
      if (irrelevantQuestions[i]) continue;
      newQuestionIndex = i;
      break;
    }

    const status = newQuestionIndex === null ? "DONE" : "IN_PROGRESS";
    const cleanAnnotations = unit.unit.annotations.map((a: Annotation) => {
      const { field, offset, length, variable, value } = a;
      return { field, offset, length, variable, value };
    });

    if (onlySave) {
      // if just saving (for multivalue questions)
      unit.jobServer.postAnnotations(unit.unitId, cleanAnnotations, status);
      blockAnswer.current = false;
      return;
    }

    const start = new Date();
    const conditionReport: ConditionReport = await unit.jobServer.postAnnotations(
      unit.unitId,
      cleanAnnotations,
      status
    );
    conditionReport.reportSuccess = true;

    setConditionReport(conditionReport);
    const action = conditionReport?.evaluation?.[questions[questionIndex].name]?.action;
    if (action === "block") {
      // pass
    } else if (action === "retry") {
      blockAnswer.current = false;
    } else {
      let minDelay;
      if (newQuestionIndex === null) {
        minDelay = 250;
        transition(true);
      } else {
        minDelay = 150;
        transition(false);
      }

      const delay = new Date().getTime() - start.getTime();
      const extradelay = Math.max(0, minDelay - delay);
      await new Promise((resolve) => setTimeout(resolve, extradelay));

      // check if there are other variables in the current unit that have an action
      for (let i = 0; i < questions.length; i++) {
        const action = conditionReport?.evaluation?.[questions[i].name]?.action;
        if (action === "block" || action === "retry") newQuestionIndex = i;
      }

      if (newQuestionIndex !== null) {
        setQuestionIndex(newQuestionIndex);
      } else {
        nextUnit();
      }
      blockAnswer.current = false;
    }
  } catch (e) {
    console.error(e);
    // just to make certain the annotator doesn't block if something goes wrong
    blockAnswer.current = false;
  }
};

export default React.memo(QuestionForm);
