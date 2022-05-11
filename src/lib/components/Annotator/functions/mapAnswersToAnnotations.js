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

  if (question.type === "scale") {
    // for question types that support items, loop over all items, create the variable (questionname.item)
    // then fill an array with matched annotations
    return question.items.map((item) => {
      const itemname = item?.name ?? item; // item can be a string or {name, label}
      const label = item?.label ?? item;
      for (let annotation of annotations || []) {
        if (isMatch(annotation, answer, itemname))
          return { item: itemname, label, value: annotation.value };
      }
      return { item: itemname, label, value: null };
    });
  }

  // create an array of all annotation values
  if (!annotations) return null;
  const values = [];
  for (let annotation of annotations) {
    if (isMatch(annotation, answer)) values.push({ value: annotation.value });
  }
  if (values.length === 0) return [{ value: null }];
  return values;
};

const isMatch = (annotation, answer, item = null) => {
  const variable = item ? answer.variable + "." + item : answer.variable;
  return (
    annotation.variable === variable &&
    annotation.field === answer.field &&
    annotation.offset === answer.offset &&
    annotation.length === answer.length
  );
};

export const addAnnotationsFromAnswer = (answer, annotations, question) => {
  // transforms answers to annotations, and either replaces existing annotations or
  // creates new ones.
  if (!annotations) annotations = [];

  if (question.type === "scale") {
    valueloop: for (let valueObj of answer.values) {
      for (let annotation of annotations) {
        if (isMatch(annotation, answer, valueObj.item)) {
          annotation.value = valueObj.value;
          continue valueloop;
        }
      }
      annotations.push({
        ...answer,
        variable: `${answer.variable}.${valueObj.item}`,
        value: valueObj.value,
      });
    }
    return annotations;
  }

  // just update the first match or push to array
  const valueMatched = answer.values.reduce((obj, value) => {
    obj[value.value] = false;
    return obj;
  }, {});
  for (let annotation of annotations) {
    if (isMatch(annotation, answer)) {
      // if it is a match, three things can happen.
      // - the annotation value does occur in the answer value, in which case we leave it alone
      // - an answer value does not have an annotation, in which case we add it
      // - the annotation value does not occur in the answer values, in which case we delete it
      if (valueMatched[annotation.value] !== undefined) {
        // if not undefined, the value occurs in the answer
        valueMatched[annotation.value] = true;
        continue;
      } else {
        annotation.value = undefined;
      }
    }
  }
  for (let key of Object.keys(valueMatched)) {
    if (!valueMatched[key]) annotations.push({ ...answer, value: key });
  }
  return annotations.filter((a) => a.value !== undefined);
};
