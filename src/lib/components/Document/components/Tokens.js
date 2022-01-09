import React, { useEffect, useRef, useState } from "react";
import { Ref } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";
import Meta from "./Meta";

const Tokens = ({ tokens, text_fields, meta_fields, setReady, maxHeight }) => {
  const [text, setText] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    // immitates componentdidupdate to scroll to the textUnit after rendering tokens
    const firstTextUnitToken = tokens.find((token) => token.codingUnit);
    const hasContext = tokens.some((token) => !token.codingUnit);
    if (!hasContext) {
      containerRef.current.scrollTop = 0;
      return;
    }
    if (firstTextUnitToken?.ref?.current && containerRef.current) {
      scrollToMiddle(containerRef.current, firstTextUnitToken.ref.current, 1 / 3);
    }
  });

  useEffect(() => {
    if (!tokens) return null;
    setText(renderText(tokens, text_fields, containerRef));
    if (setReady) setReady((current) => current + 1); // setReady is an optional property used to let parents know the text is ready.
  }, [tokens, text_fields, setReady]);

  if (tokens === null) return null;

  return (
    <Ref innerRef={containerRef}>
      <div
        key="tokens"
        style={{
          flex: "1",
          display: "flex",
          alignItems: null,
          overflow: "auto",
          maxHeight: maxHeight,
        }}
      >
        <div
          className="TokensContainer"
          style={{
            flex: "1 97%",
            width: "100%",
          }}
        >
          <div
            key="meta"
            style={{
              width: "100%",
              textAlign: "right",
              padding: "10px 30px",
            }}
          >
            <Meta meta_fields={meta_fields} />
          </div>
          <div key="text" style={{ padding: "20px" }}>
            {text["text"]}
          </div>
          <div key="empty_space" style={{ height: "25px" }} />
        </div>
      </div>
    </Ref>
  );
};

const renderText = (tokens, text_fields, containerRef) => {
  const text = { text: [] }; // yes, it would make sense to just make text an array, but for some reason React doesn't accept it
  if (tokens.length === 0) return text;

  let field = [];
  let paragraph = [];
  let sentence = [];
  let codingUnit = tokens[0].codingUnit;
  let field_name = tokens[0].field;
  let paragraph_nr = tokens[0].paragraph;
  let sentence_nr = tokens[0].sentence;

  const getLayout = (field_name) => text_fields.find((tf) => tf.name === field_name);
  let layout = getLayout(field_name);

  for (let i = 0; i < tokens.length; i++) {
    tokens[i].arrayIndex = i;

    if (tokens[i].sentence !== sentence_nr) {
      if (sentence.length > 0) paragraph.push(renderSentence(i, sentence_nr, sentence));
      sentence = [];
    }
    if (tokens[i].paragraph !== paragraph_nr) {
      if (paragraph.length > 0) {
        field.push(
          renderParagraph(
            getLayout(field_name),
            paragraph_nr,
            paragraph,
            tokens[i].paragraph !== paragraph_nr
          )
        );
      }
      paragraph = [];
    }

    if (tokens[i].field !== field_name) {
      if (field.length > 0)
        text["text"].push(
          renderField(getLayout(field_name), i + "_" + field_name, field, field_name)
        );
      field = [];
    }

    paragraph_nr = tokens[i].paragraph;
    sentence_nr = tokens[i].sentence;
    field_name = tokens[i].field;
    codingUnit = tokens[i].codingUnit;

    // give each token the informatinon its element, container
    tokens[i].containerRef = containerRef;
    if (codingUnit) tokens[i].ref = React.createRef();

    sentence.push(renderToken(tokens[i], codingUnit));
  }

  layout = getLayout(field_name);
  if (sentence.length > 0) paragraph.push(renderSentence("last", sentence_nr, sentence));
  if (paragraph.length > 0) field.push(renderParagraph(layout, paragraph_nr, paragraph, false));
  if (field.length > 0)
    text["text"].push(renderField(layout, "last_" + field_name, field, field_name));
  return text;
};

const renderField = (layout, paragraph_nr, paragraphs, field) => {
  const fontstyle = (paragraphs) => {
    if (layout) {
      return (
        <>
          {layout.label ? (
            <span
              key={field + paragraph_nr + "label"}
              style={{
                color: "grey",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {layout.label}
            </span>
          ) : null}
          <span
            key={field + paragraph_nr}
            className="noselect"
            style={{
              fontSize: `${layout.size != null ? layout.size : 1}em`,
              fontWeight: layout.bold ? "bold" : "normal",
              fontStyle: layout.italic ? "italic" : "normal",
              textAlign: layout.justify ? "justify" : "left",
            }}
          >
            {paragraphs}
          </span>
        </>
      );
    }
    return paragraphs;
  };

  return (
    // uses span behaving like p, because p is not allowed due to nested div (for Label)
    <span className="field" key={"field" + field}>
      {fontstyle(paragraphs)}
    </span>
  );
};

const renderParagraph = (layout, paragraph_nr, sentences, end) => {
  if (!layout?.paragraphs)
    return (
      <span key={"par" + paragraph_nr}>
        <span>{sentences}</span>
      </span>
    );

  return (
    // uses span behaving like p, because p is not allowed due to nested div (for Label)
    <div key={"pardiv" + paragraph_nr} style={{ display: "flex" }}>
      <span
        key={"par" + paragraph_nr}
        className="paragraph"
        style={{
          flex: "1 98%",
          paddingBottom: end ? "1.5em" : "0em",
          display: "table",
          paddingLeft: "0.3em",
        }}
      >
        {sentences}
      </span>
    </div>
  );
};

const renderSentence = (position, sentence_nr, tokens) => {
  return (
    <span key={position + "_" + sentence_nr} className="sentence">
      {tokens}
    </span>
  );
};

const renderToken = (token, codingUnit) => {
  return (
    <span
      key={"token" + token.index}
      ref={token.ref}
      className={codingUnit ? "token codingUnit" : "token"}
      tokenindex={token.arrayIndex}
    >
      <span key={"pre" + token.index} className="pre">
        {token.pre}
      </span>
      <span key={"text" + token.index} className="text">
        {token.text}
      </span>
      <span key={"post" + token.index} className="post">
        {token.post}
      </span>
    </span>
  );
};

export default React.memo(Tokens);
