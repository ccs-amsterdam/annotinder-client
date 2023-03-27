import nlp from "compromise";

// would be better, but jest doesn't allow it.
//import nlp from "compromise/one";

import { TextField, Token, RawToken, RawTokenColumn } from "../../../types";

/**
 * Tokenize a document, but allowing for multiple text fields to be concatenated as different fields.
 * @param {*} textFields  An array of objects, where each object has the structure {name, value}. 'name' becomes the name of the field, 'value' is the text
 *                         each item can also have an 'offset' key with an integer value, in case the value is a subset starting at the [offset] character (this is needed to get the correct positions in the original document)
 *                         each item can also have a 'unit_start' and 'unit_end' key, each with an integer value to indicate where in this textField the codingUnit starts/ends.
 *                         If both unit_start and unit_end is omitted, the whole text is considered codingUnit.
 *                         As an alternative to unit_start and unit_end, can also have context_before and context_after to specify context, which should both be strings
 * @returns
 */
export const parseTokens = (textFields: TextField[]): Token[] => {
  const tokens: Token[] = [];
  let token = null;
  let paragraph = 0; // offset can be used if position in original article is known
  let tokenIndex = 0;
  let t = null;
  let text = null;

  let has_unit_start = false;
  for (let textField of textFields)
    if (textField.unit_start != null || textField.context_before != null) has_unit_start = true;
  let unit_started = !has_unit_start; // if unit start not specified, start from beginning
  let unit_ended = false;

  for (let textField of textFields) {
    let field = textField.name || "text";
    let offset = textField.offset || 0;

    text = textField.value;
    // should be impossible for value to be an array due to unfoldFields, but typescript doesn't catch that
    if (Array.isArray(text)) text = text.join("");

    let textParts = [text];
    let text_length = text.length;
    if (textField.context_before != null) {
      textParts = [textField.context_before, text];
      text_length = text_length + textField.context_before.length;
      textField.unit_start = textField.context_before.length - 1;
    }
    if (textField.context_after != null) {
      textField.unit_end = text_length - 1;
      textParts.push(textField.context_after);
    }

    for (let text of textParts) {
      const tokenized = nlp.tokenize(text) as any; // circumvent some typescript issues
      t = tokenized.json({ offset: true });

      for (let sent = 0; sent < t.length; sent++) {
        for (let term = 0; term < t[sent].terms.length; term++) {
          token = t[sent].terms[term];

          if (textField.unit_start != null && token.offset.start + offset >= textField.unit_start)
            unit_started = true;
          if (textField.unit_end != null && token.offset.start + offset > textField.unit_end)
            unit_ended = true;

          const tokenobj: Token = {
            field: field,
            offset: token.offset.start + offset,
            length: token.offset.length,
            paragraph: paragraph,
            index: tokenIndex,
            text: token.text,
            pre: sent === 0 && term === 0 ? " " + token.pre : token.pre, // add whitespace to first token. (Will be ignored if not needed due to how html is rendered)
            post: token.post,
            codingUnit: unit_started && !unit_ended,
            annotations: [],
          };
          tokens.push(tokenobj);
          tokenIndex++;
          if (/(?:\r?\n)+/.test(token.post)) paragraph++;
        }
      }
      offset += text.length;
    }
    paragraph++;

    if (textField.unit_end != null) unit_ended = true;
  }
  return tokens;
};

export const importTokens = (tokens: RawToken[] | RawTokenColumn): Token[] => {
  if (!Array.isArray(tokens)) tokens = tokensColumnToRow(tokens);

  let paragraph = 0;
  let last_paragraph = tokens[0].paragraph;

  let offset = 0;
  let totalLength = 0;

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].text == null) {
      if (tokens[i].token != null) {
        tokens[i].text = tokens[i].token;
      } else {
        alert("Invalid token data:\n\nimported tokens must have 'text' or 'token' field");
        return null;
      }
    }
    if (tokens[i].offset == null && tokens[i].start != null) tokens[i].offset = tokens[i].start;
    if (tokens[i].length == null) tokens[i].length = tokens[i].text.length;

    if (tokens[i].pre == null) tokens[i].pre = "";
    if (tokens[i].post == null && tokens[i].space != null) tokens[i].post = tokens[i].space;
    if (tokens[i].post == null) {
      if (tokens[i].offset != null && tokens[i].length != null) {
        tokens[i].post =
          i < tokens[i].length - 1
            ? " ".repeat(Math.max(0, tokens[i + 1].offset - tokens[i].offset - tokens[i].length))
            : "";
      } else {
        tokens[i].post = " ";
      }
    }

    totalLength = tokens[i].length + tokens[i].post.length;
    if (i < tokens.length - 1) totalLength = totalLength + (tokens[i + 1].pre?.length || 0);

    if (tokens[i].offset == null) {
      tokens[i].offset = offset;
      offset = offset + totalLength;
    }

    if (i < tokens.length - 1) {
      if (!tokens[i].field || tokens[i].field === tokens[i + 1].field) {
        if (tokens[i + 1].offset == null && tokens[i + 1].start != null)
          tokens[i + 1].offset = tokens[i + 1].start;
        if (tokens[i + 1].offset && tokens[i + 1].offset < tokens[i].offset + totalLength) {
          alert(
            `Invalid token position data. The length of "${
              tokens[i].pre + tokens[i].text + tokens[i].post
            }" on position ${tokens[i].offset} exeeds the offset/start position of the next token`
          );
          return null;
        }
      }
    }

    // ensure paragraph counter
    // if paragraph exists, still overwrite with new counter to ensure that it adds up
    if (tokens[i].paragraph == null) {
      tokens[i].paragraph = paragraph;
      if (tokens[i].text.includes("\n") || tokens[i].post.includes("\n")) paragraph++;
    } else {
      if (tokens[i].paragraph !== last_paragraph) {
        last_paragraph = tokens[i].paragraph;
        paragraph++;
      }
      tokens[i].paragraph = paragraph;
    }

    if (tokens[i].field == null) tokens[i].field = "text";
    tokens[i].index = i;
  }

  const preparedTokens: Token[] = [];
  for (let token of tokens) {
    // to appease typescript
    const preparedToken: Token = {
      field: token.field ?? "",
      offset: token.offset ?? 0,
      length: token.length ?? 0,
      paragraph: token.paragraph ?? 0,
      index: token.index ?? 0,
      text: token.text ?? "",
      pre: token.pre ?? "",
      post: token.post ?? "",
      codingUnit: token.codingUnit ?? true,
      annotations: token.annotations ?? [],
    };
    preparedTokens.push(preparedToken);
  }
  return preparedTokens;
};

/**
 * changes tokens in column format
 *  {{offset: [1,2], token: ["hello","world"]}
 * to row format
 *  [{offset: 1, token: "hello"}, {offset: 2, token: "world"}]
 *
 * row format is easier to work with, but column format is more efficient
 * so allow it to be used as input.
 * @param {} tokens
 */
export const tokensColumnToRow = (tokens: RawTokenColumn): RawToken[] => {
  const columns: string[] = Object.keys(tokens);
  const n = tokens[columns[0] as keyof RawTokenColumn].length;

  const tokensArray = [];
  for (let i = 0; i < n; i++) {
    const token: RawToken = columns.reduce((obj, column) => {
      obj[column] = tokens[column as keyof RawTokenColumn][i];
      return obj;
    }, {} as any);

    tokensArray.push(token);
  }

  return tokensArray;
};
