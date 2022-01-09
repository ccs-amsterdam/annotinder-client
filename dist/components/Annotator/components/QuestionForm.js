"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.string.search.js");

require("core-js/modules/es.regexp.constructor.js");

require("core-js/modules/es.regexp.to-string.js");

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/es.string.split.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

var _AnswerForms = require("./AnswerForms");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const DONE_COLOR = "lightgreen";
const IRRELEVANT_COLOR = "red";

const QuestionForm = _ref => {
  var _annotations$question;

  let {
    unit,
    tokens,
    questions,
    questionIndex,
    setQuestionIndex,
    setUnitIndex,
    swipe,
    blockEvents
  } = _ref;
  const [answerTransition, setAnswerTransition] = (0, _react.useState)();
  const answered = (0, _react.useRef)(false); // to prevent answering double (e.g. with swipe events)

  const [annotations, setAnnotations] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    if (!questions) return;
    prepareAnnotations(unit, tokens, questions, setAnnotations);
    answered.current = false;
  }, [unit, tokens, setAnnotations, questions]);
  if (!questions || !unit || !annotations) return null;

  if (!(questions !== null && questions !== void 0 && questions[questionIndex])) {
    setQuestionIndex(0);
    return null;
  }

  const question = prepareQuestion(unit, questions[questionIndex]);

  const onSelect = answer => {
    // write result to IDB/server and skip to next question or next unit
    if (answered.current) return null;
    answered.current = true;
    annotations[questionIndex].value = answer.code;
    annotations[questionIndex].makes_irrelevant = answer.makes_irrelevant;
    unit.annotations = updateAnnotations(annotations[questionIndex], unit.annotations);
    processIrrelevantBranching(unit, questions, annotations, questionIndex); // next (non-irrelevant) question in unit (null if no remaining)

    let newQuestionIndex = null;

    for (let i = questionIndex + 1; i < questions.length; i++) {
      if (annotations[i].value === "IRRELEVANT") continue;
      newQuestionIndex = i;
      break;
    }

    const status = newQuestionIndex === null ? "DONE" : "IN_PROGRESS";
    unit.jobServer.postAnnotations(unit.unitId, unit.annotations, status);
    setAnswerTransition(answer); // show given answer

    setTimeout(() => {
      // wait a little bit, so coder can see their answer and breathe
      setAnswerTransition(null); // if none remain, go to next unit

      if (newQuestionIndex === null) {
        setUnitIndex(state => state + 1);
        setQuestionIndex(0);
      } else {
        setQuestionIndex(newQuestionIndex);
      }

      answered.current = false;
    }, 250);
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    style: {
      height: "100%",
      width: "100%"
    }
  }, /*#__PURE__*/_react.default.createElement(QuestionIndexStep, {
    questions: questions,
    questionIndex: questionIndex,
    annotations: annotations,
    setQuestionIndex: setQuestionIndex
  }), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: "flex",
      position: "relative",
      flexFlow: "column",
      height: "calc(100% - 30px)",
      width: "100%",
      maxHeight: "100%",
      padding: "10px",
      color: "white",
      borderBottomLeftRadius: "30px",
      borderBottomRightRadius: "30px",
      backgroundColor: "#1B1C1D"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: "100%",
      flex: "1 1 auto",
      paddingBottom: "10px"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Header, {
    as: "h3",
    style: {
      color: "white"
    }
  }, question)), /*#__PURE__*/_react.default.createElement(AnswerSegment, {
    answerTransition: answerTransition,
    currentAnswer: annotations === null || annotations === void 0 ? void 0 : (_annotations$question = annotations[questionIndex]) === null || _annotations$question === void 0 ? void 0 : _annotations$question.value,
    questions: questions,
    questionIndex: questionIndex,
    onSelect: onSelect,
    swipe: swipe,
    blockEvents: blockEvents
  })));
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

      const i = questions.findIndex(q => q.name === value);
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
  if (tokens.length === 0) return null;
  const annotations = [];
  if (!unit.annotations) unit.annotations = [];

  for (let i = 0; i < questions.length; i++) {
    const annotation = createAnnotationObject(tokens, questions[i], i);
    annotation.value = getCurrentAnswer(unit.annotations, annotation);
    annotations.push(annotation);
  }

  setAnnotations(annotations);
};

const QuestionIndexStep = _ref2 => {
  let {
    questions,
    questionIndex,
    annotations,
    setQuestionIndex
  } = _ref2;
  //if (questions.length === 1) return null;
  const [canSelect, setCanSelect] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    const cs = annotations.map(a => a.value !== null);
    cs[0] = true;
    setCanSelect(cs);
  }, [annotations, setCanSelect]);
  (0, _react.useEffect)(() => {
    setCanSelect(state => {
      const newState = [...state];
      newState[questionIndex] = true;
      return newState;
    });
  }, [questionIndex, setCanSelect]);

  const setColor = i => {
    if (!annotations[i]) return ["black", IRRELEVANT_COLOR];
    if (annotations[i].value === "IRRELEVANT") return ["black", IRRELEVANT_COLOR];
    if (canSelect && i > questionIndex && !canSelect[i]) return ["white", "grey"];
    if (annotations[i].value) return ["black", DONE_COLOR];
    if (i === 0) return [DONE_COLOR, "#1B1C1D"];
    if (canSelect && canSelect[i]) return [DONE_COLOR, "#1B1C1D"];
    return [DONE_COLOR, "grey"];
  };

  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button.Group, {
    fluid: true,
    style: {
      border: "1px solid",
      height: "30px"
    }
  }, questions.map((q, i) => {
    const [color, background] = setColor(i);
    return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
      active: i === questionIndex,
      style: {
        padding: "0em 0.2em 0.2em 0.2em",
        minWidth: "2em",
        height: "30px",
        borderRadius: "0",
        fontSize: "12px",
        border: "1px solid darkgrey",
        background: background,
        textOverflow: "clip",
        overflow: "hidden",
        color: color
      },
      onClick: () => {
        if (canSelect[i]) {
          setQuestionIndex(i);
        }
      }
    }, /*#__PURE__*/_react.default.createElement("span", {
      title: questions[i].name
    }, questions[i].name));
  })));
};

const AnswerSegment = _ref3 => {
  let {
    answerTransition,
    currentAnswer,
    questions,
    questionIndex,
    onSelect,
    swipe,
    blockEvents
  } = _ref3;
  if (answerTransition) return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Segment, {
    style: {
      display: "flex",
      flex: "1 1 auto",
      padding: "0",
      overflowY: "auto",
      height: "100%",
      width: "100%",
      margin: "0",
      background: answerTransition.color,
      justifyContent: "center",
      alignItems: "center"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Header, {
    as: "h1"
  }, answerTransition.code));
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, showCurrent(currentAnswer || answerTransition), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Segment, {
    style: {
      flex: "1 1 auto",
      padding: "0",
      overflowY: "auto",
      height: "100%",
      width: "100%",
      borderBottomLeftRadius: "10px",
      borderBottomRightRadius: "10px",
      margin: "0"
    }
  }, questions[questionIndex].type === "search code" ? /*#__PURE__*/_react.default.createElement(_AnswerForms.SearchBoxDropdown, {
    options: questions[questionIndex].options,
    callback: onSelect,
    blockEvents: blockEvents
  }) : null, questions[questionIndex].type === "select code" ? /*#__PURE__*/_react.default.createElement(_AnswerForms.ButtonSelection, {
    options: questions[questionIndex].options,
    callback: onSelect,
    blockEvents: blockEvents
  }) : null, questions[questionIndex].type === "annotinder" ? /*#__PURE__*/_react.default.createElement(_AnswerForms.Annotinder, {
    swipeOptions: questions[questionIndex].swipeOptions,
    currentAnswer: currentAnswer,
    callback: onSelect,
    swipe: swipe,
    blockEvents: blockEvents
  }) : null));
};

const createAnnotationObject = (tokens, question, questionIndex) => {
  // creates an object with all information about the annotation except for the
  // value. This lets us check whether the annotations already exists, and add
  // or change the value.
  if (tokens.length === 0) return null;
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
  } // make these optional? Because they're not tokenizer agnostic


  const meta = {
    length_tokens: 1 + indexspan[1] - indexspan[0],
    length_paragraphs: 1 + tokens[indexspan[1]].paragraph - tokens[indexspan[0]].paragraph,
    length_sentences: 1 + tokens[indexspan[1]].sentence - tokens[indexspan[0]].sentence
  };
  return {
    variable: "Q".concat(questionIndex + 1, "_").concat(question.name.replace(" ", "_")),
    value: null,
    field: Object.keys(fields).join(" + "),
    offset: charspan[0],
    length: charspan[1] - charspan[0],
    meta
  };
};

const sameQuestion = (x, y) => {
  return x.variable === y.variable && x.field === y.field && x.offset === y.offset && x.length === y.length;
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

const showCurrent = currentAnswer => {
  if (currentAnswer == null) return null;
  return /*#__PURE__*/_react.default.createElement("div", {
    style: {
      backgroundColor: "white",
      color: "black"
    }
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Segment, {
    style: {
      padding: "0 0 0.5em 0",
      margin: "0",
      borderRadius: "0",
      background: "#1B1C1D",
      color: DONE_COLOR,
      textAlign: "center"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      marginTop: "0.3em"
    }
  }, "you answered:", "  ", /*#__PURE__*/_react.default.createElement("b", {
    style: {
      fontSize: "1.5em"
    }
  }, "".concat(currentAnswer)))));
};

const prepareQuestion = (unit, question) => {
  let preparedQuestion = question.question;
  if (!unit.variables) return;

  for (let variable of Object.keys(unit.variables)) {
    if (preparedQuestion.search("\\[".concat(variable, "\\]")) >= 0) {
      let code = unit.variables[variable];
      const codeTag = "{{lightyellow###".concat(code, "}}"); // add optional color from itemquestions

      preparedQuestion = preparedQuestion.replace("[".concat(variable, "]"), codeTag);
    }
  }

  return markedString(preparedQuestion);
};

const markedString = text => {
  const regex = new RegExp(/{{(.*?)}}/); // Match text inside two square brackets

  text = text.replace(/(\r\n|\n|\r)/gm, "");
  return /*#__PURE__*/_react.default.createElement("div", null, text.split(regex).reduce((prev, current, i) => {
    if (i % 2 === 0) {
      prev.push(current);
    } else {
      const [color, string] = current.split("###");
      prev.push( /*#__PURE__*/_react.default.createElement("mark", {
        key: i + current,
        style: {
          backgroundColor: color
        }
      }, string));
    }

    return prev;
  }, []));
};

var _default = /*#__PURE__*/_react.default.memo(QuestionForm);

exports.default = _default;