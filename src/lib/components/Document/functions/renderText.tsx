import React, { createRef, ReactElement } from "react";
import { TextField, Token, RenderedText, FieldRefs } from "../../../types";

export default function renderText(
  tokens: Token[],
  text_fields: TextField[],
  containerRef: any,
  fieldRefs: FieldRefs
): RenderedText {
  const text: RenderedText = text_fields.reduce((obj: any, tf: TextField) => {
    obj[tf.name] = [];
    return obj;
  }, {});
  //const text = { text: [] }; // yes, it would make sense to just make text an array, but for some reason React doesn't accept it
  if (tokens.length === 0) return text;

  // when changing documents, make sure new tokens have unique key. Otherwise, React can keep DOM styling
  // from the previous document. We just add the current time to the token keys.
  const keyChain = Date.now();

  let field = [];
  let paragraph = [];
  let codingUnit = tokens[0].codingUnit;
  let field_name = tokens[0].field;
  let paragraph_nr = tokens[0].paragraph;

  const getTextField = (field_name: string) =>
    text_fields.find((tf: TextField) => tf.name === field_name);
  let textField = getTextField(field_name);

  for (let i = 0; i < tokens.length; i++) {
    tokens[i].arrayIndex = i;

    if (tokens[i].paragraph !== paragraph_nr) {
      if (paragraph.length > 0) {
        field.push(
          renderParagraph(
            getTextField(field_name),
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
          renderField(getTextField(field_name), i + "_" + field_name, field, field_name, fieldRefs)
        );
      field = [];
    }

    paragraph_nr = tokens[i].paragraph;
    field_name = tokens[i].field;
    codingUnit = tokens[i].codingUnit;

    // give each token the informatinon its element, container
    tokens[i].containerRef = containerRef;
    if (codingUnit) tokens[i].ref = React.createRef();

    paragraph.push(renderToken(tokens[i], codingUnit, keyChain));
  }

  textField = getTextField(field_name);
  if (paragraph.length > 0) field.push(renderParagraph(textField, paragraph_nr, paragraph, false));
  if (field.length > 0)
    text[field_name].push(
      renderField(textField, "last_" + field_name, field, field_name, fieldRefs)
    );
  return text;
}

const renderField = (
  textField: TextField,
  paragraph_key: string,
  paragraphs: ReactElement[],
  field: string,
  fieldRefs: any
) => {
  const fontstyle = (paragraphs: ReactElement[]) => {
    if (textField) {
      return (
        <>
          {textField.label ? (
            <span
              key={field + paragraph_key + "label"}
              style={{
                paddingLeft: "10px",
                color: "grey",
                fontWeight: "bold",
              }}
            >
              {textField.label}
            </span>
          ) : null}
          <span
            key={field + paragraph_key}
            className="noselect"
            //style={{ textAlign: "justify", ...(textField.style || {}) }}
          >
            {paragraphs}
          </span>
        </>
      );
    }
    return paragraphs;
  };

  fieldRefs[field] = createRef();
  return (
    <div
      ref={fieldRefs[field]}
      className="field"
      key={"tokens-" + field}
      style={{
        gridArea: textField.grid_area,
        padding: "10px 0px 10px 0px",
        margin: "0px 10px 0px 10px",
        //display: "table",
        textAlign: "justify",
        hyphens: "auto",
        //alignSelf: "center",
        ...(textField.style || {}),
      }}
    >
      {fontstyle(paragraphs)}
    </div>
  );
};

const renderParagraph = (
  textField: TextField,
  paragraph_nr: number,
  tokens: ReactElement[],
  end: boolean
) => {
  if (textField?.paragraphs != null && !textField?.paragraphs)
    return (
      <span key={"par" + paragraph_nr}>
        <span>{tokens}</span>
      </span>
    );

  return (
    <p
      key={"par" + paragraph_nr}
      className="paragraph"
      style={{
        padding: "0px 10px 0px 10px",
        //display: "table",
      }}
    >
      {tokens}
    </p>
  );
};

const renderToken = (token: Token, codingUnit: boolean, keyChain: number) => {
  return (
    <span
      key={"token" + token.index + "_" + keyChain}
      tabIndex={token.index}
      ref={token.ref}
      className={codingUnit ? "token codingUnit" : "token"}
      data-tokenindex={token.arrayIndex}
    >
      <span key={"pre" + token.index} className="pre">
        {token.pre}
        <mark className="relation" />
      </span>
      <span key={"text" + token.index} className="text">
        {token.text}
        <mark className="relation" />
      </span>
      <span key={"post" + token.index} className="post">
        {token.post}
        <mark className="relation" />
      </span>
    </span>
  );
};
