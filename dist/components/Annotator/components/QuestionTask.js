"use strict";

require("core-js/modules/es.object.assign.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.json.stringify.js");

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/es.string.includes.js");

var _react = _interopRequireWildcard(require("react"));

var _QuestionForm = _interopRequireDefault(require("./QuestionForm"));

var _Document = _interopRequireDefault(require("lib/components/Document/Document"));

var _reactSwipeable = require("react-swipeable");

var _codebook = require("lib/functions/codebook");

var _semanticUiReact = require("semantic-ui-react");

var _reactCookie = require("react-cookie");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const documentSettings = {
  centerVertical: true
};

const QuestionTask = _ref => {
  let {
    unit,
    codebook,
    setUnitIndex,
    blockEvents,
    fullScreenNode
  } = _ref;
  console.log(fullScreenNode);
  const [tokens, setTokens] = (0, _react.useState)([]);
  const [questionIndex, setQuestionIndex] = (0, _react.useState)(0);
  const [questions, setQuestions] = (0, _react.useState)(null);
  const refs = {
    text: (0, _react.useRef)(),
    box: (0, _react.useRef)(),
    code: (0, _react.useRef)()
  };
  const [textReady, setTextReady] = (0, _react.useState)(0);
  const [cookies, setCookie] = (0, _reactCookie.useCookies)(["questionTaskSettings"]);
  const [settings, setSettings] = (0, _react.useState)(cookies.questionTaskSettings || {
    splitHeight: 60,
    textSize: 1
  });
  const divref = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    setCookie("questionTaskSettings", JSON.stringify(settings), {
      path: "/"
    });
  }, [settings, setCookie]);
  (0, _react.useEffect)(() => {
    if (!(codebook !== null && codebook !== void 0 && codebook.questions)) return;
    setQuestions(prepareQuestions(codebook));
  }, [codebook]);
  (0, _react.useEffect)(() => {
    if (!(refs !== null && refs !== void 0 && refs.text.current)) return null;
    refs.box.current.style.backgroundColor = "white";
    refs.text.current.style.transition = "";
    refs.box.current.style.transition = "";
    refs.box.current.style.opacity = 0;
    refs.text.current.style.transform = "translateX(0%) translateY(0%)";
  }, [refs.text, refs.box, unit, questionIndex]);
  (0, _react.useEffect)(() => {
    if (!(refs !== null && refs !== void 0 && refs.text.current)) return null;
    refs.box.current.style.transition = "opacity 200ms ease-out";
    refs.box.current.style.opacity = 1;
  }, [textReady, refs.text, refs.box, questionIndex]); // swipe controlls need to be up here due to working on the div wrapping the while question screen
  // use separate swipe for text (document) and menu rows, to disable swiping up
  // in text (which conflicts with scrolling)

  const [swipe, setSwipe] = (0, _react.useState)(null);
  const textSwipe = (0, _reactSwipeable.useSwipeable)(swipeControl(questions === null || questions === void 0 ? void 0 : questions[questionIndex], refs, setSwipe, false));
  const menuSwipe = (0, _reactSwipeable.useSwipeable)(swipeControl(questions === null || questions === void 0 ? void 0 : questions[questionIndex], refs, setSwipe, true));
  if (!unit) return null;
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: divref,
    style: {
      height: "100%"
    }
  }, /*#__PURE__*/_react.default.createElement("div", _extends({}, textSwipe, {
    style: {
      position: "relative",
      border: "1px solid",
      height: "".concat(settings.splitHeight, "%")
    }
  }), /*#__PURE__*/_react.default.createElement("div", {
    ref: refs.box,
    style: {
      height: "100%",
      width: "100%",
      overflow: "hidden",
      position: "absolute"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    ref: refs.code,
    style: {
      padding: "0.6em 0.3em",
      width: "100%",
      fontSize: "3em",
      position: "absolute"
    }
  }), /*#__PURE__*/_react.default.createElement("div", {
    ref: refs.text,
    style: {
      border: "1px solid",
      height: "100%",
      width: "100%",
      position: "absolute",
      top: "0",
      backgroundColor: "white",
      overflow: "hidden",
      fontSize: "".concat(settings.textSize, "em")
    }
  }, /*#__PURE__*/_react.default.createElement(_Document.default, {
    unit: unit,
    settings: documentSettings,
    setReady: setTextReady,
    returnTokens: setTokens,
    fullScreenNode: fullScreenNode
  }))), /*#__PURE__*/_react.default.createElement(SettingsPopup, {
    settings: settings,
    setSettings: setSettings,
    fullScreenNode: fullScreenNode
  })), /*#__PURE__*/_react.default.createElement("div", _extends({}, menuSwipe, {
    style: {
      height: "".concat(100 - settings.splitHeight, "%")
    }
  }), /*#__PURE__*/_react.default.createElement(_QuestionForm.default, {
    unit: unit,
    tokens: tokens,
    questions: questions,
    questionIndex: questionIndex,
    setQuestionIndex: setQuestionIndex,
    setUnitIndex: setUnitIndex,
    swipe: swipe,
    blockEvents: blockEvents
  })));
};

const SettingsPopup = _ref2 => {
  let {
    settings,
    setSettings,
    fullScreenNode
  } = _ref2;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Popup, {
    on: "click",
    mountNode: fullScreenNode || undefined,
    trigger: /*#__PURE__*/_react.default.createElement(_semanticUiReact.Icon, {
      size: "large",
      name: "setting",
      style: {
        position: "absolute",
        cursor: "pointer",
        top: "1px",
        left: "-1px",
        color: "#1b1c1d",
        padding: "5px 0px",
        height: "30px"
      }
    })
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form.Group, {
    grouped: true
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form.Field, null, /*#__PURE__*/_react.default.createElement("label", null, "text window size ", /*#__PURE__*/_react.default.createElement("font", {
    style: {
      color: "blue"
    }
  }, "".concat(settings.splitHeight, "%"))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Input, {
    size: "mini",
    step: 2,
    min: 20,
    max: 80,
    type: "range",
    value: settings.splitHeight,
    onChange: (e, d) => setSettings(state => _objectSpread(_objectSpread({}, state), {}, {
      splitHeight: d.value
    }))
  })), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form.Field, null, /*#__PURE__*/_react.default.createElement("label", null, "text size scaling ", /*#__PURE__*/_react.default.createElement("font", {
    style: {
      color: "blue"
    }
  }, "".concat(settings.textSize))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Input, {
    size: "mini",
    step: 0.025,
    min: 0.4,
    max: 1.6,
    type: "range",
    value: settings.textSize,
    onChange: (e, d) => setSettings(state => _objectSpread(_objectSpread({}, state), {}, {
      textSize: d.value
    }))
  })))));
};

const prepareQuestions = codebook => {
  const questions = codebook.questions;
  return questions.map(question => {
    const codeMap = (0, _codebook.codeBookEdgesToMap)(question.codes);
    let cta = (0, _codebook.getCodeTreeArray)(codeMap);
    cta = addRequiredFor([...cta]);
    const [options, swipeOptions] = getOptions(cta);
    return _objectSpread(_objectSpread({}, question), {}, {
      options,
      swipeOptions
    }); // it's important that this deep copies question
  });
};

const addRequiredFor = cta => {
  // if codebook has a required_for question, check if this code has it. If not, it's the same as this code having
  // a makes_irrelevant for this question. This way we only need to process the makes_irrelevant logic (which is easier)
  const haveRequired = cta.reduce((s, code) => {
    if (!code.required_for) return s;

    if (typeof code.required_for !== "object") {
      s.add(code.required_for);
    } else {
      for (let rf of code.required_for) s.add(rf);
    }

    return s;
  }, new Set());

  for (let code of cta) {
    for (let hasReq of haveRequired) {
      if (!code.required_for || code.required_for !== hasReq && !code.required_for.includes(hasReq)) {
        if (!code.makes_irrelevant.includes(hasReq)) code.makes_irrelevant = [...code.makes_irrelevant, hasReq];
      }
    }
  }

  return cta;
};

const getOptions = cta => {
  const options = [];
  const swipeOptions = {}; // object, for fast lookup in swipeControl

  for (let code of cta) {
    if (!code.active) continue;
    if (!code.activeParent) continue;
    let tree = code.tree.join(" - ");
    const option = {
      code: code.code,
      tree: tree,
      makes_irrelevant: code.makes_irrelevant,
      color: code.color
    };
    if (code.swipe) swipeOptions[code.swipe] = option;
    options.push(option);
  }

  return [options, swipeOptions];
};

const swipeControl = function swipeControl(question, refs, setSwipe, alwaysDoVertical) {
  let triggerdist = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 150;
  if (!question) return {};
  if (question.type !== "annotinder") return {};
  const transitionTime = 200; // const blockSwipe = useRef()

  const swipeConfig = {
    delta: 10,
    // min distance(px) before a swipe starts. *See Notes*
    preventDefaultTouchmoveEvent: false,
    // call e.preventDefault *See Details*
    trackTouch: true,
    // track touch input
    trackMouse: false,
    // track mouse input
    rotationAngle: 0 // set a rotation angle

  };

  const getDeltas = d => {
    let deltaX = d.deltaX;
    let deltaY = d.deltaY;
    if (Math.abs(deltaX) > Math.abs(deltaY) + 10) deltaY = 0;
    if (Math.abs(deltaX) < Math.abs(deltaY) + 10) deltaX = 0;

    if (!alwaysDoVertical) {
      // the bottom menu always allows vertical upward swipe, but for the
      // text div we only allow swiping up if scrolled all the way to bottom
      // get the tokensContainer
      const el = refs.text.current.getElementsByClassName("TokensContainer")[0];
      const bottom = el.scrollHeight - Math.ceil(el.scrollTop) === el.clientHeight;
      if (!bottom) deltaY = 0;
    }

    return [deltaX, deltaY];
  };

  return _objectSpread({
    onSwiping: d => {
      var _question$swipeOption, _question$swipeOption2;

      const [deltaX, deltaY] = getDeltas(d);
      if (deltaX > 0 && !question.swipeOptions.right) return;
      if (deltaX < 0 && !question.swipeOptions.left) return;
      if (deltaY < 0 && !question.swipeOptions.up) return;
      if (deltaY !== 0 && deltaY > 0) return;
      refs.text.current.style.transition = "";
      refs.text.current.style.transform = "translateX(".concat(deltaX, "px) translateY(").concat(deltaY, "px)");
      let bgc = (_question$swipeOption = question.swipeOptions.up) === null || _question$swipeOption === void 0 ? void 0 : _question$swipeOption.color;
      let code = (_question$swipeOption2 = question.swipeOptions.up) === null || _question$swipeOption2 === void 0 ? void 0 : _question$swipeOption2.code;
      let [bottom, talign] = ["0%", "center"];

      if (deltaX > 0) {
        var _question$swipeOption3, _question$swipeOption4;

        bgc = (_question$swipeOption3 = question.swipeOptions.right) === null || _question$swipeOption3 === void 0 ? void 0 : _question$swipeOption3.color;
        code = (_question$swipeOption4 = question.swipeOptions.right) === null || _question$swipeOption4 === void 0 ? void 0 : _question$swipeOption4.code;
        [bottom, talign] = ["40%", "left"];
      }

      if (deltaX < 0) {
        var _question$swipeOption5, _question$swipeOption6;

        bgc = (_question$swipeOption5 = question.swipeOptions.left) === null || _question$swipeOption5 === void 0 ? void 0 : _question$swipeOption5.color;
        code = (_question$swipeOption6 = question.swipeOptions.left) === null || _question$swipeOption6 === void 0 ? void 0 : _question$swipeOption6.code;
        [bottom, talign] = ["40%", "right"];
      }

      refs.box.current.style.backgroundColor = bgc;
      refs.code.current.innerText = code;
      refs.code.current.style.bottom = bottom;
      refs.code.current.style.textAlign = talign;
    },
    onSwiped: d => {
      const [deltaX, deltaY] = getDeltas(d);
      if (deltaX > 0 && !question.swipeOptions.right) return;
      if (deltaX < 0 && !question.swipeOptions.left) return;
      if (deltaY < 0 && !question.swipeOptions.up) return;
      if (deltaY !== 0 && deltaY > 0) return;
      refs.text.current.style.transition = "transform ".concat(transitionTime, "ms ease-out, opacity ").concat(transitionTime, "ms ease-out");

      if (Math.abs(deltaX) < triggerdist && Math.abs(deltaY) < triggerdist) {
        refs.text.current.style.transform = "translateX(0%) translateY(0%)"; //refs.box.current.style.backgroundColor = "white";
      } else {
        refs.text.current.style.transform = "translateX(".concat(deltaX > 0 ? 100 : deltaX < 0 ? -100 : 0, "%) translateY(").concat(deltaY > 0 ? 100 : -100, "%)");
        refs.box.current.style.transition = "opacity ".concat(transitionTime, "ms ease-out");
        refs.box.current.style.opacity = 0;
        let dir = "up";
        dir = deltaX > 0 ? "right" : "left";
        setSwipe(dir);
        setSwipe(null);
      }
    }
  }, swipeConfig);
};

var _default = /*#__PURE__*/_react.default.memo(QuestionTask);

exports.default = _default;