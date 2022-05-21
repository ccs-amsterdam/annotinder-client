import React, { ReactElement } from "react";
import { TextField, Token, RenderedText } from "../../../types";

export default function renderText(tokens: Token[], text_fields: TextField[], containerRef: any) {
  const text: RenderedText = text_fields.reduce((obj: any, tf: TextField) => {
    obj[tf.name] = [];
    return obj;
  }, {});
  //const text = { text: [] }; // yes, it would make sense to just make text an array, but for some reason React doesn't accept it
  if (tokens.length === 0) return text;

  let field = [];
  let paragraph = [];
  let sentence = [];
  let codingUnit = tokens[0].codingUnit;
  let field_name = tokens[0].field;
  let paragraph_nr = tokens[0].paragraph;
  let sentence_nr = tokens[0].sentence;

  const getLayout = (field_name: string) =>
    text_fields.find((tf: TextField) => tf.name === field_name);
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
        text[field_name].push(
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
    text[field_name].push(renderField(layout, "last_" + field_name, field, field_name));
  return text;
}

const renderField = (
  layout: TextField,
  paragraph_key: string,
  paragraphs: ReactElement[],
  field: string
) => {
  const fontstyle = (paragraphs: ReactElement[]) => {
    if (layout) {
      return (
        <>
          {layout.label ? (
            <span
              key={field + paragraph_key + "label"}
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
            key={field + paragraph_key}
            className="noselect"
            style={{
              fontSize: `${layout.size != null ? layout.size : 1}em`,
              fontWeight: layout.bold ? "bold" : "normal",
              fontStyle: layout.italic ? "italic" : "normal",
              textAlign: layout.justify ? "justify" : layout.center ? "center" : "left",
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
    <span className="field" key={"field" + field}>
      {fontstyle(paragraphs)}
    </span>
  );
};

const renderParagraph = (
  layout: TextField,
  paragraph_nr: number,
  sentences: ReactElement[],
  end: boolean
) => {
  if (layout?.paragraphs != null && !layout?.paragraphs)
    return (
      <span key={"par" + paragraph_nr}>
        <span>{sentences}</span>
      </span>
    );

  return (
    // uses span behaving like p, because p is not allowed due to nested div (for Label)
    <div
      key={"pardiv" + paragraph_nr}
      style={{ display: "flex", paddingRight: "25px", paddingLeft: "25px" }}
    >
      <span
        key={"par" + paragraph_nr}
        className="paragraph"
        style={{
          flex: "1 98%",
          paddingBottom: end ? "1.5em" : "0em",
          display: "table",
        }}
      >
        {sentences}
      </span>
    </div>
  );
};

const renderSentence = (position: number | string, sentence_nr: number, tokens: ReactElement[]) => {
  return (
    <span key={position + "_" + sentence_nr} className="sentence">
      {tokens}
    </span>
  );
};

const renderToken = (token: Token, codingUnit: boolean) => {
  return (
    <span
      key={"token" + token.index}
      ref={token.ref}
      className={codingUnit ? "token codingUnit" : "token"}
      data-tokenindex={token.arrayIndex}
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