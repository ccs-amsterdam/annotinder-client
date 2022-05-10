import React, { useState, useEffect, useRef } from "react";
import { Header, Button } from "semantic-ui-react";
import {
  addAnnotationsFromAnswer,
  getAnswersFromAnnotations,
} from "../functions/mapAnswersToAnnotations";
import AnswerField from "./AnswerField";

const DONE_COLOR = "#70cd70e6";
const IRRELEVANT_COLOR = "grey";
const ANSWERFIELD_BACKGROUND = "#1B1C1D";
const ANSWERFIELD_COLOR = "white";
//const ANSWERFIELD_BACKGROUND = "white";
//const ANSWERFIELD_COLOR = "black";

const QuestionForm = ({
  unit,
  tokens,
  questions,
  questionIndex,
  setQuestionIndex,
  setUnitIndex,
  swipe,
  blockEvents,
}) => {
  const answered = useRef(false); // to prevent answering double (e.g. with swipe events)
  const [answers, setAnswers] = useState(null);

  useEffect(() => {
    if (!questions) return;
    getAnswersFromAnnotations(unit, tokens, questions, setAnswers);
    answered.current = false;
  }, [unit, tokens, setAnswers, questions]);

  if (!questions || !unit || !answers) return null;
  if (!questions?.[questionIndex]) {
    setQuestionIndex(0);
    return null;
  }

  const question = prepareQuestion(unit, questions[questionIndex]);

  const onSelect = (answer, onlySave = false) => {
    // This is the callback function used in the AnswerField Components.
    // It posts results and skips to next question, or next unit if no questions left.
    // If onlySave is true, only write to db without going to next question
    if (answered.current) return null;
    answered.current = true;

    answers[questionIndex].value = Array.isArray(answer.code)
      ? answer.code
      : [{ value: answer.code }];
    answers[questionIndex].makes_irrelevant = answer.makes_irrelevant;
    unit.annotations = addAnnotationsFromAnswer(answers[questionIndex], unit.annotations, question);
    const irrelevantQuestions = processIrrelevantBranching(unit, questions, answers, questionIndex);

    // next (non-irrelevant) question in unit (null if no remaining)
    let newQuestionIndex = null;
    for (let i = questionIndex + 1; i < questions.length; i++) {
      if (irrelevantQuestions[i]) continue;
      newQuestionIndex = i;
      break;
    }

    const status = newQuestionIndex === null ? "DONE" : "IN_PROGRESS";
    let cleanAnnotations = unit.annotations.map((u) => {
      const cleanAnnotation = { ...u };
      delete cleanAnnotation.makes_irrelevant;
      return cleanAnnotation;
    });
    //delete cleanAnnotations.makes_irrelevant;
    unit.jobServer.postAnnotations(unit.unitId, unit.unitIndex, cleanAnnotations, status);

    if (onlySave) {
      answered.current = false;
      return;
    }

    setTimeout(() => {
      // wait a little bit, so coder can see their answer and breathe

      // if none remain, go to next unit
      if (newQuestionIndex === null) {
        setUnitIndex((state) => state + 1);
        setQuestionIndex(0);
      } else {
        setQuestionIndex(newQuestionIndex);
      }

      answered.current = false;
    }, 250);
  };

  const showQuestionButtons = questions && questions.length > 1;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: ANSWERFIELD_BACKGROUND,
        borderTop: `3px double ${ANSWERFIELD_COLOR}`,
        boxShadow: "5px 5px 5px 1px grey",
        overflow: "auto",
        zIndex: 9000,
      }}
    >
      {showQuestionButtons ? (
        <QuestionIndexStep
          questions={questions}
          questionIndex={questionIndex}
          answers={answers}
          setQuestionIndex={setQuestionIndex}
        />
      ) : null}

      <div
        style={{
          display: "flex",
          flexFlow: "column",
          height: showQuestionButtons ? "calc(100% - 30px)" : "100%",
          width: "100%",
          maxHeight: "100%",
          padding: "10px",
          color: ANSWERFIELD_COLOR,

          //borderBottomLeftRadius: "5px",
          //borderBottomRightRadius: "5px",
        }}
      >
        <div style={{ width: "100%", flex: "1 1 auto", paddingBottom: "10px" }}>
          <Header as="h3" textAlign="center" style={{ color: ANSWERFIELD_COLOR }}>
            {question}
          </Header>
        </div>

        <AnswerField
          currentAnswer={answers?.[questionIndex]?.value}
          questions={questions}
          questionIndex={questionIndex}
          onSelect={onSelect}
          swipe={swipe}
          blockEvents={blockEvents}
        />
      </div>
    </div>
  );
};

const processIrrelevantBranching = (unit, questions, answers, questionIndex) => {
  // checks all the branching in the given answers
  const which = new Set();
  for (let a in Object.keys(unit.annotations)) {
    const makesIrrelevant = unit.annotations[a].makes_irrelevant;
    if (makesIrrelevant == null) continue;
    for (let value of makesIrrelevant) {
      if (value === "REMAINING") {
        for (let i = questionIndex + 1; i < questions.length; i++) which.add(i);
      }
      const i = questions.findIndex((q) => q.name === value);
      if (i >= 0) which.add(i);
    }
  }
  const irrelevantQuestions = new Array(questions.length).fill(false);

  for (let i = 0; i < questions.length; i++) {
    if (which.has(i)) {
      irrelevantQuestions[i] = true;
      // gives the value "IRRELEVANT" to targeted questions
      for (let a of answers[i].value) a.value = "IRRELEVANT";
      unit.annotations = addAnnotationsFromAnswer(answers[i], unit.annotations, questions[i]);
    } else {
      irrelevantQuestions[i] = false;
      // If a question is marked as IRRELEVANT, double check whether this is still the case
      // (a coder might have changed a previous answer)
      for (let a of answers[i].value) {
        if (a.value === "IRRELEVANT") delete a.value;
      }
      unit.annotations = addAnnotationsFromAnswer(answers[i], unit.annotations, questions[i]);
    }
  }
  return irrelevantQuestions;
};

const QuestionIndexStep = ({ questions, questionIndex, answers, setQuestionIndex }) => {
  //if (questions.length === 1) return null;
  const [canSelect, setCanSelect] = useState();

  useEffect(() => {
    const cs = answers.map((a) => {
      if (Array.isArray(a.value)) {
        return a.value[0].value !== null;
      } else {
        return a.value !== null;
      }
    });
    cs[0] = true;
    setCanSelect(cs);
  }, [answers, setCanSelect]);

  useEffect(() => {
    setCanSelect((state) => {
      const newState = [...state];
      newState[questionIndex] = true;
      return newState;
    });
  }, [questionIndex, setCanSelect]);

  const setColor = (i) => {
    if (!answers[i]) return ["black", IRRELEVANT_COLOR];
    let done, irrelevant;
    if (Array.isArray(answers[i].value)) {
      done = answers[i].value.filter((v) => !!v.value).length === answers.length;
      irrelevant = answers[i].value[0].value === "IRRELEVANT";
    } else {
      done = !!answers[i].value;
      irrelevant = answers[i].value === "IRRELEVANT";
    }

    if (irrelevant) return ["black", IRRELEVANT_COLOR];
    if (canSelect && i > questionIndex && !canSelect[i]) return ["white", "grey"];
    if (done) return ["black", DONE_COLOR];
    if (i === 0) return [DONE_COLOR, "#1B1C1D"];
    if (canSelect && canSelect[i]) return [DONE_COLOR, "#1B1C1D"];
    return [DONE_COLOR, "grey"];
  };

  return (
    <div>
      <Button.Group
        fluid
        style={{
          border: "1px solid",
          height: "30px",
          padding: "1px",
        }}
      >
        {questions.map((q, i) => {
          const [color, background] = setColor(i);
          return (
            <Button
              key={i}
              active={i === questionIndex}
              style={{
                padding: "0em 0.2em 0.2em 0.2em",

                minWidth: "2em",
                height: "30px",
                borderRadius: "0",
                fontSize: "12px",
                border: "1px solid darkgrey",
                background: background,
                textOverflow: "clip",
                overflow: "hidden",
                color: color,
              }}
              onClick={() => {
                if (canSelect[i]) {
                  setQuestionIndex(i);
                }
              }}
            >
              {/* {i + 1} */}
              <span title={questions[i].name}>{questions[i].name}</span>
            </Button>
          );
        })}
      </Button.Group>
    </div>
  );
};

const prepareQuestion = (unit, question) => {
  if (!question?.question) return "";
  let preparedQuestion = question.question;
  if (!unit.variables) return markedString(preparedQuestion);

  for (let variable of Object.keys(unit.variables)) {
    if (preparedQuestion.search(`\\[${variable}\\]`) >= 0) {
      let code = unit.variables[variable];
      const codeTag = `{{lightyellow###${code}}}`; // add optional color from itemquestions
      preparedQuestion = preparedQuestion.replace(`[${variable}]`, codeTag);
    }
  }

  return markedString(preparedQuestion);
};

const markedString = (text) => {
  const regex = new RegExp(/{{(.*?)}}/); // Match text inside two square brackets

  text = text.replace(/(\r\n|\n|\r)/gm, "");
  return (
    <div>
      {text.split(regex).reduce((prev, current, i) => {
        if (i % 2 === 0) {
          prev.push(current);
        } else {
          const [color, string] = current.split("###");
          prev.push(
            <mark key={i + current} style={{ backgroundColor: color }}>
              {string}
            </mark>
          );
        }
        return prev;
      }, [])}
    </div>
  );
};

export default React.memo(QuestionForm);
