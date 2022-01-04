"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _semanticUiReact = require("semantic-ui-react");

var _scroll = require("../../../functions/scroll");

var _Meta = _interopRequireDefault(require("./Meta"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const Tokens = _ref => {
  let {
    tokens,
    text_fields,
    meta_fields,
    setReady,
    maxHeight
  } = _ref;
  const [text, setText] = (0, _react.useState)({});
  const containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    var _firstTextUnitToken$r;

    // immitates componentdidupdate to scroll to the textUnit after rendering tokens
    const firstTextUnitToken = tokens.find(token => token.codingUnit);
    const hasContext = tokens.some(token => !token.codingUnit);

    if (!hasContext) {
      containerRef.current.scrollTop = 0;
      return;
    }

    if (firstTextUnitToken !== null && firstTextUnitToken !== void 0 && (_firstTextUnitToken$r = firstTextUnitToken.ref) !== null && _firstTextUnitToken$r !== void 0 && _firstTextUnitToken$r.current && containerRef.current) {
      (0, _scroll.scrollToMiddle)(containerRef.current, firstTextUnitToken.ref.current, 1 / 3);
    }
  });
  (0, _react.useEffect)(() => {
    if (!tokens) return null;
    setText(renderText(tokens, text_fields, containerRef));
    if (setReady) setReady(current => current + 1); // setReady is an optional property used to let parents know the text is ready.
  }, [tokens, text_fields, setReady]);
  if (tokens === null) return null;
  return /*#__PURE__*/_react.default.createElement(_semanticUiReact.Ref, {
    innerRef: containerRef
  }, /*#__PURE__*/_react.default.createElement("div", {
    key: "tokens",
    style: {
      flex: "1",
      display: "flex",
      alignItems: null,
      overflow: "auto",
      maxHeight: maxHeight
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "TokensContainer",
    style: {
      flex: "1 97%",
      width: "100%"
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    key: "meta",
    style: {
      width: "100%",
      textAlign: "right",
      padding: "10px 30px"
    }
  }, /*#__PURE__*/_react.default.createElement(_Meta.default, {
    meta_fields: meta_fields
  })), /*#__PURE__*/_react.default.createElement("div", {
    key: "text",
    style: {
      padding: "20px"
    }
  }, text["text"]), /*#__PURE__*/_react.default.createElement("div", {
    key: "empty_space",
    style: {
      height: "25px"
    }
  }))));
};

const renderText = (tokens, text_fields, containerRef) => {
  const text = {
    text: []
  }; // yes, it would make sense to just make text an array, but for some reason React doesn't accept it

  if (tokens.length === 0) return text;
  let section = [];
  let paragraph = [];
  let sentence = [];
  let codingUnit = tokens[0].codingUnit;
  let section_name = tokens[0].section;
  let paragraph_nr = tokens[0].paragraph;
  let sentence_nr = tokens[0].sentence;

  const getLayout = section_name => text_fields.find(tf => tf.name === section_name);

  let layout = getLayout(section_name);

  for (let i = 0; i < tokens.length; i++) {
    tokens[i].arrayIndex = i;

    if (tokens[i].sentence !== sentence_nr) {
      if (sentence.length > 0) paragraph.push(renderSentence(i, sentence_nr, sentence));
      sentence = [];
    }

    if (tokens[i].paragraph !== paragraph_nr) {
      if (paragraph.length > 0) {
        section.push(renderParagraph(getLayout(section_name), paragraph_nr, paragraph, tokens[i].paragraph !== paragraph_nr));
      }

      paragraph = [];
    }

    if (tokens[i].section !== section_name) {
      if (section.length > 0) text["text"].push(renderSection(getLayout(section_name), i + "_" + section_name, section, section_name));
      section = [];
    }

    paragraph_nr = tokens[i].paragraph;
    sentence_nr = tokens[i].sentence;
    section_name = tokens[i].section;
    codingUnit = tokens[i].codingUnit; // give each token the informatinon its element, container

    tokens[i].containerRef = containerRef;
    if (codingUnit) tokens[i].ref = /*#__PURE__*/_react.default.createRef();
    sentence.push(renderToken(tokens[i], codingUnit));
  }

  layout = getLayout(section_name);
  if (sentence.length > 0) paragraph.push(renderSentence("last", sentence_nr, sentence));
  if (paragraph.length > 0) section.push(renderParagraph(layout, paragraph_nr, paragraph, false));
  if (section.length > 0) text["text"].push(renderSection(layout, "last_" + section_name, section, section_name));
  return text;
};

const renderSection = (layout, paragraph_nr, paragraphs, section) => {
  const fontstyle = paragraphs => {
    if (layout) {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, layout.label ? /*#__PURE__*/_react.default.createElement("span", {
        key: section + paragraph_nr + "label",
        style: {
          color: "grey",
          fontWeight: "bold",
          textAlign: "center"
        }
      }, layout.label) : null, /*#__PURE__*/_react.default.createElement("span", {
        key: section + paragraph_nr,
        className: "noselect",
        style: {
          fontSize: "".concat(layout.size != null ? layout.size : 1, "em"),
          fontWeight: layout.bold ? "bold" : "normal",
          fontStyle: layout.italic ? "italic" : "normal",
          textAlign: layout.justify ? "justify" : "left"
        }
      }, paragraphs));
    }

    return paragraphs;
  };

  return (
    /*#__PURE__*/
    // uses span behaving like p, because p is not allowed due to nested div (for Label)
    _react.default.createElement("span", {
      className: "section",
      key: "section" + section
    }, fontstyle(paragraphs))
  );
};

const renderParagraph = (layout, paragraph_nr, sentences, end) => {
  if (!(layout !== null && layout !== void 0 && layout.paragraphs)) return /*#__PURE__*/_react.default.createElement("span", {
    key: "par" + paragraph_nr
  }, /*#__PURE__*/_react.default.createElement("span", null, sentences));
  return (
    /*#__PURE__*/
    // uses span behaving like p, because p is not allowed due to nested div (for Label)
    _react.default.createElement("div", {
      key: "pardiv" + paragraph_nr,
      style: {
        display: "flex"
      }
    }, /*#__PURE__*/_react.default.createElement("span", {
      key: "par" + paragraph_nr,
      className: "paragraph",
      style: {
        flex: "1 98%",
        paddingBottom: end ? "1.5em" : "0em",
        display: "table",
        paddingLeft: "0.3em"
      }
    }, sentences))
  );
};

const renderSentence = (position, sentence_nr, tokens) => {
  return /*#__PURE__*/_react.default.createElement("span", {
    key: position + "_" + sentence_nr,
    className: "sentence"
  }, tokens);
};

const renderToken = (token, codingUnit) => {
  return /*#__PURE__*/_react.default.createElement("span", {
    key: "token" + token.index,
    ref: token.ref,
    className: codingUnit ? "token codingUnit" : "token",
    tokenindex: token.arrayIndex
  }, /*#__PURE__*/_react.default.createElement("span", {
    key: "pre" + token.index,
    className: "pre"
  }, token.pre), /*#__PURE__*/_react.default.createElement("span", {
    key: "text" + token.index,
    className: "text"
  }, token.text), /*#__PURE__*/_react.default.createElement("span", {
    key: "post" + token.index,
    className: "post"
  }, token.post));
};

var _default = /*#__PURE__*/_react.default.memo(Tokens);

exports.default = _default;