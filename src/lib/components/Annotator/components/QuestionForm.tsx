import React, { useState, useEffect, useRef } from "react";
import { Header, Button, Segment, Icon } from "semantic-ui-react";
import { getMakesIrrelevantArray } from "../functions/irrelevantBranching";
import {
  addAnnotationsFromAnswer,
  getAnswersFromAnnotations,
} from "../functions/mapAnswersToAnnotations";
import AnswerField from "./AnswerField";

const ANSWERFIELD_BACKGROUND = "#1B1C1D";
const ANSWERFIELD_COLOR = "white";

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
}) => {
  const blockAnswer = useRef(false); // to prevent answering double (e.g. with swipe events)
  const [answers, setAnswers] = useState(null);
  const [questionText, setQuestionText] = useState(<div />);

  useEffect(() => {
    if (!questions) return;
    getAnswersFromAnnotations(unit, tokens, questions, setAnswers);
    blockAnswer.current = false;
    setQuestionIndex(0);
  }, [unit, tokens, setAnswers, setQuestionIndex, questions]);

  useEffect(() => {
    if (!questions?.[questionIndex] || !unit) return null;
    setQuestionText(prepareQuestion(unit, questions[questionIndex]));
  }, [unit, questions, questionIndex]);

  if (!questions || !unit || !answers) return null;
  if (!questions?.[questionIndex]) {
    setQuestionIndex(0);
    return null;
  }

  const onAnswer = (itemValues, onlySave = false, minDelay = 0) => {
    // posts results and skips to next question, or next unit if no questions left.
    // If onlySave is true, only write to db without going to next question
    if (blockAnswer.current) return null;
    blockAnswer.current = true;

    try {
      answers[questionIndex].values = itemValues;
      answers[questionIndex].makes_irrelevant = getMakesIrrelevantArray(
        itemValues,
        questions[questionIndex].options
      );

      unit.annotations = addAnnotationsFromAnswer(
        answers[questionIndex],
        unit.annotations,
        questions[questionIndex]
      );

      const irrelevantQuestions = processIrrelevantBranching(
        unit,
        questions,
        answers,
        questionIndex
      );

      // next (non-irrelevant) question in unit (null if no remaining)
      let newQuestionIndex = null;
      for (let i = questionIndex + 1; i < questions.length; i++) {
        if (irrelevantQuestions[i]) continue;
        newQuestionIndex = i;
        break;
      }

      const status = newQuestionIndex === null ? "DONE" : "IN_PROGRESS";
      const cleanAnnotations = unit.annotations.map((u) => {
        const { field, offset, length, variable, value, meta, makes_irrelevant } = u;
        return { field, offset, length, variable, value, meta, makes_irrelevant };
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
        setQuestionIndex(newQuestionIndex);
        setTimeout(() => (blockAnswer.current = false), 500);
      } else {
        // if this was the last question of the unit, wait untill postAnnotation is completed so that the database
        // has registered that the unit is done (otherwise it won't give the next unit)
        // don't need to unblock answering, because this happens automatically when the unit state is updated with the new unit

        const start = new Date();
        unit.jobServer
          .postAnnotations(unit.unitId, unit.unitIndex, cleanAnnotations, status)
          .then((res) => {
            const delay = new Date().getTime() - start.getTime();
            const extradelay = Math.max(0, minDelay - delay);
            setTimeout(() => setUnitIndex((state) => state + 1), extradelay);
          });
      }
    } catch (e) {
      console.log(e);
      // just to make certain the annotator doesn't block if something goes wrong
      blockAnswer.current = false;
    }
  };

  const done = !questions.some(
    (q, i) => answers[i].values.filter((v) => !!v.value).length !== answers[i].values.length
  );

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

          //borderBottomLeftRadius: "5px",
          //borderBottomRightRadius: "5px",
        }}
      >
        <div style={{ width: "100%", flex: "1 1 auto", padding: "5px 0px" }}>
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
            currentAnswer={answers?.[questionIndex]?.values}
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
      for (let a of answers[i].values) a.values = ["IRRELEVANT"];
      unit.annotations = addAnnotationsFromAnswer(answers[i], unit.annotations, questions[i]);
    } else {
      irrelevantQuestions[i] = false;
      // If a question is marked as IRRELEVANT, double check whether this is still the case
      // (a coder might have changed a previous answer)
      for (let a of answers[i].values) {
        if (a.values[0] === "IRRELEVANT") a.values = [];
      }
      unit.annotations = addAnnotationsFromAnswer(answers[i], unit.annotations, questions[i]);
    }
  }
  return irrelevantQuestions;
};

const QuestionIndexStep = ({ questions, questionIndex, answers, setQuestionIndex }) => {
  //if (questions.length === 1) return null;
  const [canSelect, setCanSelect] = useState([]);

  useEffect(() => {
    const cs = answers.map((a) => {
      return (
        a.values[0].values != null &&
        a.values[0].values.length !== 0 &&
        a.values[0].values[0] !== "IRRELEVANT"
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

  const getColor = (i) => {
    if (!answers[i]) return "grey";
    const done = !answers[i].values.some((v) => v.values == null || v.values.length === 0);
    const irrelevant = answers[i].values[0].values?.[0] === "IRRELEVANT";
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
      {questions.map((q, i) => {
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
                const irrelevant = answers[i].values[0].values?.[0] === "IRRELEVANT";
                if (!irrelevant) setQuestionIndex(i);
              }
            }}
          />
        );
      })}
    </>
  );
};

const prepareQuestion = (unit, question) => {
  if (!question?.question) return <div />;
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
