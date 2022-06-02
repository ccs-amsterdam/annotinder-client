import React, { useState, useEffect, useRef, ReactElement } from "react";
import { Header, Button, Segment, Icon } from "semantic-ui-react";
import {
  Question,
  Unit,
  Answer,
  AnswerItem,
  SetState,
  Annotation,
  Token,
  Swipes,
} from "../../../types";
import { getMakesIrrelevantArray } from "../functions/irrelevantBranching";
import {
  addAnnotationsFromAnswer,
  getAnswersFromAnnotations,
} from "../functions/mapAnswersToAnnotations";
import AnswerField from "./AnswerField";

const ANSWERFIELD_BACKGROUND = "#1B1C1D";
const ANSWERFIELD_COLOR = "white";

interface QuestionFormProps {
  children: ReactElement;
  unit: Unit;
  tokens: Token[];
  questions: Question[];
  questionIndex: number;
  setQuestionIndex: SetState<number>;
  setUnitIndex: SetState<number>;
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
  swipe,
  blockEvents,
}: QuestionFormProps) => {
  const blockAnswer = useRef(false); // to prevent answering double (e.g. with swipe events)
  const [answers, setAnswers] = useState<Answer[]>(null);
  const [questionText, setQuestionText] = useState(<div />);

  useEffect(() => {
    if (!questions) return;
    getAnswersFromAnnotations(unit, tokens, questions, setAnswers);
    blockAnswer.current = false;
    setQuestionIndex(0);
  }, [unit, tokens, setAnswers, setQuestionIndex, questions]);

  useEffect(() => {
    if (!questions?.[questionIndex] || !unit) return null;
    setQuestionText(prepareQuestion(unit, questions[questionIndex], answers));
  }, [unit, questions, questionIndex, answers]);

  if (!questions || !unit || !answers) return null;
  if (!questions?.[questionIndex]) {
    setQuestionIndex(0);
    return null;
  }

  const onAnswer = (items: AnswerItem[], onlySave = false, minDelay = 0): void => {
    // posts results and skips to next question, or next unit if no questions left.
    // If onlySave is true, only write to db without going to next question
    if (blockAnswer.current) return null;
    blockAnswer.current = true;

    try {
      answers[questionIndex].items = items;
      answers[questionIndex].makes_irrelevant = getMakesIrrelevantArray(
        items,
        questions[questionIndex].options
      );

      console.log(answers[questionIndex]);
      unit.annotations = addAnnotationsFromAnswer(answers[questionIndex], unit.annotations);

      const irrelevantQuestions = processIrrelevantBranching(
        unit,
        questions,
        answers,
        questionIndex
      );

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

      if (newQuestionIndex !== null) {
        // if there is a next question, postAnnotation immediately and unblock answering after half a second
        // (to prevent accidentally double clicking)
        unit.jobServer.postAnnotations(unit.unitId, unit.unitIndex, cleanAnnotations, status);
        setTimeout(() => setQuestionIndex(newQuestionIndex), minDelay);
        setTimeout(() => (blockAnswer.current = false), 500);
      } else {
        // if this was the last question of the unit, wait untill postAnnotation is completed so that the database
        // has registered that the unit is done (otherwise it won't give the next unit)
        // don't need to unblock answering, because this happens automatically when the unit state is updated with the new unit

        const start = new Date();
        unit.jobServer
          .postAnnotations(unit.unitId, unit.unitIndex, cleanAnnotations, status)
          .then((res: any) => {
            const delay = new Date().getTime() - start.getTime();
            const extradelay = Math.max(0, minDelay - delay);
            setTimeout(() => setUnitIndex((state: number) => state + 1), extradelay);
          });
      }
    } catch (e) {
      console.log(e);
      // just to make certain the annotator doesn't block if something goes wrong
      blockAnswer.current = false;
    }
  };

  let done = true;
  for (let a of answers) {
    for (let item of a.items) {
      if (item.values.length === 0) done = false;
    }
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: ANSWERFIELD_BACKGROUND,
        borderTop: `3px double ${ANSWERFIELD_COLOR}`,
        boxShadow: "5px 5px 5px 1px grey",
        overflow: "auto",
        fontSize: "inherit",
        zIndex: 9000,
      }}
    >
      <div style={{ width: "100%", display: "flex" }}>
        <div style={{}}>{children}</div>
        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          <QuestionIndexStep
            questions={questions}
            questionIndex={questionIndex}
            answers={answers}
            setQuestionIndex={setQuestionIndex}
          />
        </div>
        <div style={{ position: "relative", width: "43px" }}>
          {done ? (
            <Icon
              size="big"
              name="check square outline"
              style={{
                fontSize: "10px",
                position: "absolute",
                right: "12px",
                paddingTop: "4px",
                marginRight: "0",
                color: "lightgreen",
                transform: "scale(3)",
              }}
            />
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexFlow: "column",
          height: "calc(100% - 30px)",
          width: "100%",
          maxHeight: "100%",
          padding: "0px 10px 5px 10px",
          color: ANSWERFIELD_COLOR,
          fontSize: "inherit",

          //borderBottomLeftRadius: "5px",
          //borderBottomRightRadius: "5px",
        }}
      >
        <div style={{ width: "100%", flex: "1 1 auto", padding: "5px 0px", fontSize: "inherit" }}>
          <Header
            as="h3"
            textAlign="center"
            style={{ color: ANSWERFIELD_COLOR, fontSize: "1.2em" }}
          >
            {questionText}
          </Header>
        </div>
        <Segment
          style={{
            flex: "0.5 1 auto",
            padding: "0",
            overflowY: "auto",
            height: "100%",
            minHeight: "50px", // safety net for when mobile keyboard pops up
            width: "100%",
            margin: "0",
            fontSize: "inherit",
          }}
        >
          <AnswerField
            answers={answers}
            questions={questions}
            questionIndex={questionIndex}
            onAnswer={onAnswer}
            swipe={swipe}
            blockEvents={blockEvents}
          />
        </Segment>
      </div>
    </div>
  );
};

const processIrrelevantBranching = (
  unit: any,
  questions: Question[],
  answers: Answer[],
  questionIndex: number
) => {
  // checks all the branching in the given answers
  const which = new Set();
  for (let a of answers) {
    if (a.makes_irrelevant == null) continue;
    for (let value of a.makes_irrelevant) {
      if (value === "REMAINING") {
        for (let i = questionIndex + 1; i < questions.length; i++) which.add(i);
      }
      const i = questions.findIndex((q: Question) => q.name === value);
      if (i >= 0) which.add(i);
    }
  }
  const irrelevantQuestions = new Array(questions.length).fill(false);

  for (let i = 0; i < questions.length; i++) {
    if (which.has(i)) {
      irrelevantQuestions[i] = true;
      // gives the value "IRRELEVANT" to targeted questions
      for (let a of answers[i].items) a.values = ["IRRELEVANT"];
      unit.annotations = addAnnotationsFromAnswer(answers[i], unit.annotations);
    } else {
      irrelevantQuestions[i] = false;
      // If a question is marked as IRRELEVANT, double check whether this is still the case
      // (a coder might have changed a previous answer)
      for (let a of answers[i].items) {
        if (a.values[0] === "IRRELEVANT") a.values = [];
      }
      unit.annotations = addAnnotationsFromAnswer(answers[i], unit.annotations);
    }
  }
  return irrelevantQuestions;
};

interface QuestionIndexStepProps {
  questions: Question[];
  questionIndex: number;
  answers: Answer[];
  setQuestionIndex: SetState<number>;
}

const QuestionIndexStep = ({
  questions,
  questionIndex,
  answers,
  setQuestionIndex,
}: QuestionIndexStepProps) => {
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
        return (
          <Button
            key={i}
            circular
            size="mini"
            active={i === questionIndex}
            style={{
              padding: "6px 15px",
              border: `1px solid`,
              borderColor: i === questionIndex ? "black" : "white",
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

export default React.memo(QuestionForm);
