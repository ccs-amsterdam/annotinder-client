import React, { useState, useEffect, useRef } from "react";
import { Header, Button } from "semantic-ui-react";
import AnswerField from "./AnswerField";

const DONE_COLOR = "#70cd70e6";
const IRRELEVANT_COLOR = "red";
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
  const [annotations, setAnnotations] = useState(null);

  useEffect(() => {
    if (!questions) return;
    prepareAnnotations(unit, tokens, questions, setAnnotations);
    answered.current = false;
  }, [unit, tokens, setAnnotations, questions]);

  if (!questions || !unit || !annotations) return null;
  if (!questions?.[questionIndex]) {
    setQuestionIndex(0);
    return null;
  }

  const question = prepareQuestion(unit, questions[questionIndex]);

  const onSelect = (answer, onlySave = false) => {
    // write result to IDB/server and skip to next question or next unit
    // if onlySave is true, only write to db without going to next question
    if (answered.current) return null;
    answered.current = true;

    annotations[questionIndex].value = answer.code;
    annotations[questionIndex].makes_irrelevant = answer.makes_irrelevant;
    unit.annotations = updateAnnotations(annotations[questionIndex], unit.annotations);
    processIrrelevantBranching(unit, questions, annotations, questionIndex);

    // next (non-irrelevant) question in unit (null if no remaining)
    let newQuestionIndex = null;
    for (let i = questionIndex + 1; i < questions.length; i++) {
      if (annotations[i].value === "IRRELEVANT") continue;
      newQuestionIndex = i;
      break;
    }

    const status = newQuestionIndex === null ? "DONE" : "IN_PROGRESS";
    const cleanAnnotations = unit.annotations.map((u) => {
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
          annotations={annotations}
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
          currentAnswer={annotations?.[questionIndex]?.value}
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

const processIrrelevantBranching = (unit, questions, annotations, questionIndex) => {
  // checks all the branching in the given answers
  const which = new Set();
  for (let a in Object.keys(unit.annotations)) {
    const makesIrrelevant = unit.annotations[a].makes_irrelevant;
    if (makesIrrelevant == null || makesIrrelevant === null) continue;
    for (let value of makesIrrelevant) {
      if (value === "REMAINING") {
        for (let i = questionIndex + 1; i < annotations.length; i++) which.add(i);
      }
      const i = questions.findIndex((q) => q.name === value);
      if (i >= 0) which.add(i);
    }
  }

  for (let i = 0; i < annotations.length; i++) {
    if (which.has(i)) {
      // gives the value "IRRELEVANT" to targeted questions
      annotations[i].value = "IRRELEVANT";
      unit.annotations = updateAnnotations(annotations[i], unit.annotations);
    } else {
      // this happens if a coders goes back and changes all answers that marked a question as "IRRELEVANT"
      if (annotations[i].value === "IRRELEVANT") {
        delete annotations[i].value;
        unit.annotations = updateAnnotations(annotations[i], unit.annotations);
      }
    }
  }
};

const prepareAnnotations = (unit, tokens, questions, setAnnotations) => {
  // create a list with annotations for each question, and see if they have been answered yet
  const annotations = [];
  if (!unit.annotations) unit.annotations = [];
  for (let i = 0; i < questions.length; i++) {
    const annotation = createAnnotationObject(tokens, questions[i], i);
    annotation.value = getCurrentAnswer(unit.annotations, annotation);
    annotations.push(annotation);
  }
  setAnnotations(annotations);
};

const QuestionIndexStep = ({ questions, questionIndex, annotations, setQuestionIndex }) => {
  //if (questions.length === 1) return null;
  const [canSelect, setCanSelect] = useState();

  useEffect(() => {
    const cs = annotations.map((a) => a.value !== null);
    cs[0] = true;
    setCanSelect(cs);
  }, [annotations, setCanSelect]);

  useEffect(() => {
    setCanSelect((state) => {
      const newState = [...state];
      newState[questionIndex] = true;
      return newState;
    });
  }, [questionIndex, setCanSelect]);

  const setColor = (i) => {
    if (!annotations[i]) return ["black", IRRELEVANT_COLOR];
    if (annotations[i].value === "IRRELEVANT") return ["black", IRRELEVANT_COLOR];
    if (canSelect && i > questionIndex && !canSelect[i]) return ["white", "grey"];
    if (annotations[i].value) return ["black", DONE_COLOR];
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

const createAnnotationObject = (tokens, question, questionIndex) => {
  // creates an object with all information about the annotation except for the
  // value. This lets us check whether the annotations already exists, and add
  // or change the value.

  let annObj = { variable: question.name, value: null };

  if (tokens.length > 0) {
    const fields = {};
    const lastToken = tokens[tokens.length - 1];

    const charspan = [0, lastToken.offset + lastToken.length];
    const indexspan = [0, tokens.length - 1];
    let [unitStarted, unitEnded] = [false, false];

    let i = 0;
    for (let token of tokens) {
      if (token.codingUnit && !fields[token.field]) fields[token.field] = 1;
      if (!unitStarted && token.codingUnit) {
        unitStarted = true;
        charspan[0] = token.offset;
        indexspan[0] = i;
      }
      if (!unitEnded && !token.codingUnit && unitStarted) {
        unitEnded = true;
        charspan[1] = tokens[i - 1].offset + tokens[i - 1].length;
        indexspan[1] = i - 1;
      }
      i++;
    }

    // make these optional? Because they're not tokenizer agnostic
    const meta = {
      length_tokens: 1 + indexspan[1] - indexspan[0],
      length_paragraphs: 1 + tokens[indexspan[1]].paragraph - tokens[indexspan[0]].paragraph,
      length_sentences: 1 + tokens[indexspan[1]].sentence - tokens[indexspan[0]].sentence,
    };

    annObj = {
      ...annObj,
      field: Object.keys(fields).join(" + "),
      offset: charspan[0],
      length: charspan[1] - charspan[0],
      meta,
    };
  }

  return annObj;
};

const sameQuestion = (x, y) => {
  return (
    x.variable === y.variable &&
    x.field === y.field &&
    x.offset === y.offset &&
    x.length === y.length
  );
};

const getCurrentAnswer = (annotations, annotationObject) => {
  if (!annotations) return null;
  for (let annotation of annotations) {
    if (sameQuestion(annotation, annotationObject)) return annotation.value;
  }
  return null;
};

const updateAnnotations = (newAnnotation, annotations) => {
  if (!annotations) annotations = [];
  for (let i = 0; i < annotations.length; i++) {
    if (sameQuestion(annotations[i], newAnnotation)) {
      annotations[i] = newAnnotation;
      return annotations;
    }
  }
  annotations.push(newAnnotation);
  return annotations;
};

// const showCurrent = (currentAnswer, type) => {
//   if (type === "confirm") return null;
//   if (currentAnswer == null) return null;
//   return (
//     <div>
//       <Segment
//         basic
//         style={{
//           padding: "0 0 0.5em 0",
//           margin: "0",
//           borderRadius: "0",
//           background: ANSWERFIELD_BACKGROUND,
//           color: DONE_COLOR,
//           textAlign: "center",
//         }}
//       >
//         <div style={{ marginTop: "0.3em" }}>
//           Current answer:{"  "}
//           <b style={{ fontSize: "1.5em" }}>{`${currentAnswer}`}</b>
//         </div>
//       </Segment>
//     </div>
//   );
// };

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
