import { AnswerOption, AnswerItem, CodeTree } from "../../../types";

export const addRequiredFor = (cta: CodeTree[]) => {
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
  }, new Set<string>());

  for (let code of cta) {
    for (let hasReq of Array.from(haveRequired)) {
      if (
        !code.required_for ||
        (code.required_for !== hasReq && !code.required_for.includes(hasReq))
      ) {
        if (!code.makes_irrelevant.includes(hasReq))
          code.makes_irrelevant = [...code.makes_irrelevant, hasReq];
      }
    }
  }
  return cta;
};

export const getMakesIrrelevantArray = (items: AnswerItem[], options: AnswerOption[]): string[] => {
  // given the selected values, determine the array of questions to make irrelevant
  // based on the makes_irrelevant and requred_for array of codes.
  // returns an array of questions that should be marked as irrelevant
  if (!options || options.length === 0) return [];

  const makes_irrelevant: { [code: string]: { [question: string]: boolean } } = {};
  const required_for: { [code: string]: { [question: string]: boolean } } = {}; // (note that earlier AddRequiredFor must have been used)
  const question_has_required_for: { [question: string]: boolean } = {};

  for (let option of options || []) {
    //if (!valueMap[option.code]) continue;
    for (let mi of option.makes_irrelevant || []) {
      if (!makes_irrelevant[option.code]) makes_irrelevant[option.code] = {};
      makes_irrelevant[option.code][mi] = true;
    }
    for (let rf of option.required_for || []) {
      if (!required_for[option.code]) required_for[option.code] = {};
      required_for[option.code][rf] = true;
      if (!question_has_required_for[rf]) question_has_required_for[rf] = true;
    }
  }

  const answer_makes_irrelevant: { [question: string]: boolean } = {}; // reduce both required for and makes irrelevant
  for (let item of items) {
    for (let value of item.values) {
      if (makes_irrelevant[value])
        for (let mi of Object.keys(makes_irrelevant[value])) answer_makes_irrelevant[mi] = true;
      for (let qhrf of Object.keys(question_has_required_for)) {
        if (!required_for?.[value]?.[qhrf]) answer_makes_irrelevant[qhrf] = true;
      }
    }
  }

  return Object.keys(answer_makes_irrelevant);
};
