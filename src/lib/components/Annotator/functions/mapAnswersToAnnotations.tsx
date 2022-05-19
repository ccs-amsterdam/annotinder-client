// There is a direct mapping between answers to questions and annotations.
// A question answer has the whole unit as a span (field, offset, length)
// The question name is the variable and the answer the value.
// For a simple question this is a single annotations. but there are some special cases:
// -- scale questions can have multiple items. In the annotations the variable names then become [question name].[item]
//    and in the question answers this is represented as an array of objects with items and values [{item, value}]
// -- questions where multiple codes can be selected correspond to multiple annotations as usual,
//    and in the question answers this is represented as an array of objects

export const getAnswersFromAnnotations = (unit, tokens, questions, setAnswers) => {
  const answers = [];
  if (!unit.annotations) unit.annotations = [];
  for (let i = 0; i < questions.length; i++) {
    const answer = createAnswer(tokens, questions[i]);
    answer.values = getAnswerValues(unit.annotations, answer, questions[i]);
    answers.push(answer);
  }
  setAnswers(answers);
};

const createAnswer = (tokens, question) => {
  // creates an object with the variable, field, offset and length of the annotation
  // that corresponds to this answer.

  let answer = { variable: question.name, values: null };
  if (!tokens.length > 0) return answer;

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

  answer = {
    ...answer,
    field: Object.keys(fields).join(" + "),
    offset: charspan[0],
    length: charspan[1] - charspan[0],
    meta,
  };

  return answer;
};

const getAnswerValues = (annotations, answer, question) => {
  // loops over all annotations (in unit) to find the ones that match the question annotation
  // (i.e. that have the same variable, field, offset and length)
  // return an array of objects {item, values} that should match question.items (also see AnswerField.js)
  // if question doesn't have items, will be an array of length 1 where item is null

  question.items = question.items || [""];
  return question.items.map((item) => {
    const itemname = item?.name ?? item; // item can be a string or {name, label}
    const values = [];
    for (let annotation of annotations || []) {
      if (isMatch(annotation, answer, itemname)) {
        values.push(annotation.value);
      }
    }
    return { item: itemname, optional: item.optional, values: values };
  });
};

const createVariable = (variable, item) => {
  return item === "" || item == null ? variable : variable + "." + item;
};

const isMatch = (annotation, answer, item = "") => {
  return (
    annotation.variable === createVariable(answer.variable, item) &&
    annotation.field === answer.field &&
    annotation.offset === answer.offset &&
    annotation.length === answer.length
  );
};

export const addAnnotationsFromAnswer = (answer, annotations, question) => {
  // transforms answers to annotations, and either replaces existing annotations or
  // creates new ones.
  if (!annotations) annotations = [];

  const valueMap = answer.values.reduce((obj, valueObj) => {
    // create a map of answers[item][value]
    if (obj[valueObj.item] === undefined) obj[valueObj.item] = {};
    for (let value of valueObj.values) obj[valueObj.item][value] = false;
    return obj;
  }, {});

  for (let item of Object.keys(valueMap)) {
    for (let annotation of annotations) {
      if (isMatch(annotation, answer, item)) {
        // if it is a match, three things can happen.
        // case 1: the annotation value does occur in the answer value, in which case we leave it alone
        // case 2: the annotation value does not occur in the answer values, in which case we delete it
        // case 3: an answer value does not have an annotation, in which case we add it
        if (valueMap[item][annotation.value] !== undefined) {
          // case 1
          valueMap[item][annotation.value] = true; // keeping track for case 3
        } else {
          // case 2
          annotation.value = undefined;
        }
      }
    }
  }

  for (let item of Object.keys(valueMap)) {
    for (let value of Object.keys(valueMap[item])) {
      if (valueMap[item][value]) continue;
      // case 3
      const variable = createVariable(answer.variable, item);
      annotations.push({
        ...answer,
        variable,
        value,
      });
    }
  }

  return annotations.filter((a) => a.value !== undefined);
};
