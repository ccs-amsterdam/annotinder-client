import React from "react";
import randomColor from "randomcolor";
import {
  Code,
  CodeMap,
  CodeTree,
  Variable,
  AnswerOption,
  SwipeOptions,
  Question,
  CodeBook,
  RawCodeBook,
} from "../types";
import standardizeColor from "./standardizeColor";

export function importCodebook(codebook: RawCodeBook): CodeBook {
  if (!codebook) return null;
  if (codebook.type === "annotate")
    return {
      type: "annotate",
      variables: importVariables(codebook.variables),
      settings: codebook.settings || {},
    };

  if (codebook.type === "questions")
    return {
      type: "questions",
      questions: importQuestions(codebook.questions),
      settings: codebook.settings || {},
    };
}

const importVariables = (variables: Variable[]): Variable[] => {
  // checks and preparation of variables
  return variables.map((variable) => {
    return {
      ...variable,
      codeMap: codeBookEdgesToMap(variable.name, variable.codes),
    };
  });
};

const importQuestions = (questions: Question[]): Question[] => {
  // checks and preparation of questions
  return questions.map((question) => {
    const fillMissingColor = !["scale"].includes(question.type);
    const codeMap = codeBookEdgesToMap(question.name, question.codes, fillMissingColor);
    let cta = getCodeTreeArray(codeMap);
    const [options, swipeOptions] = getOptions(cta);

    const out = { ...question, options, swipeOptions }; // it's important that this deep copies question
    if (out.fields && !Array.isArray(out.fields)) out.fields = [out.fields];
    if (out.perAnnotation && !Array.isArray(out.perAnnotation))
      out.perAnnotation = [out.perAnnotation];
    return out;
  });
};

const getOptions = (cta: CodeTree[]): [AnswerOption[], SwipeOptions] => {
  const options = [];
  const swipeOptions: any = {}; // object, for fast lookup in swipeControl

  for (let code of cta) {
    if (!code.active) continue;
    if (!code.activeParent) continue;
    let tree = code.tree.join(" - ");
    const option: AnswerOption = {
      code: code.code,
      tree: tree,
      makes_irrelevant: code.makes_irrelevant,
      required_for: code.required_for,
      color: standardizeColor(code.color, "88"),
      ref: React.createRef(), // used for keyboard navigation of buttons
    };
    if (code.swipe) swipeOptions[code.swipe] = option;
    options.push(option);
  }
  // if swipe options for left and right are not specified, use order.
  if (!swipeOptions.left && !swipeOptions.right) {
    swipeOptions.left = options?.[0];
    swipeOptions.right = options?.[1];
    swipeOptions.up = options?.[2];
  }
  return [options, swipeOptions];
};

export const standardizeCodes = (
  variable: string,
  codes: Code[] | string[],
  fillMissingColor: boolean
): Code[] => {
  if (!codes) return [];
  return codes.map((code: any, i) => {
    if (typeof code !== "object") code = { code };
    code.variable = variable;
    if (code.active == null) code.active = true;
    if (code.activeParent == null) code.activeParent = true;
    if (code.tree == null) code.tree = [];
    if (code.parent == null) code.parent = "";
    if (code.makes_irrelevant == null) code.makes_irrelevant = [];
    if (typeof code.makes_irrelevant !== "object") code.makes_irrelevant = [code.makes_irrelevant];

    if (code.required_for == null) code.required_for = [];
    if (typeof code.required_for !== "object") code.required_for = [code.required_for];

    if (code.color == null) {
      code.color = null;
      if (fillMissingColor) code.color = randomColor({ seed: code.code, luminosity: "light" });
    }
    return code;
  });
};

export const codeBookEdgesToMap = (
  variable: string,
  codes: Code[] | string[],
  fillMissingColor: boolean = true
) => {
  const standardizedCodes = standardizeCodes(variable, codes, fillMissingColor);
  // codesis an array of objects, but for efficients operations
  // in the annotator we convert it to an object with the codes as keys
  const codeMap: CodeMap = standardizedCodes.reduce((result, code) => {
    result[code.code] = {
      ...code,
      children: [],
      totalChildren: 0,
      totalActiveChildren: 0,
    };
    return result;
  }, {} as any);

  // If there are codes of which the parent doesn't exist, add the parent
  const originalKeys = Object.keys(codeMap);
  for (const key of originalKeys) {
    if (codeMap[key].parent !== "" && !codeMap[codeMap[key].parent]) {
      codeMap[codeMap[key].parent] = {
        code: codeMap[key].parent,
        parent: "",
        children: [],
        active: false,
        totalChildren: 0,
        totalActiveChildren: 0,
      };
    }
  }

  for (const code of Object.keys(codeMap)) {
    [codeMap[code].tree, codeMap[code].activeParent, codeMap[code].foldToParent] = parentData(
      codeMap,
      code
    );

    if (codeMap[code].parent) codeMap[codeMap[code].parent].children.push(code);

    for (const parent of codeMap[code].tree) {
      codeMap[parent].totalChildren++;
      if (codeMap[code].active && codeMap[code].activeParent) {
        codeMap[parent].totalActiveChildren++;
      }
    }
  }

  return codeMap;
};

/**
 * Transform codeMap into an array of codes.
 * The different from the original code array (that is used to create the codemap)
 * is that codes in this array also contain information on their position in the tree (which among other things makes codes searchable by parent/child in dropdown selection)
 * and that codes are sorted in the order of the tree (first code and all its children/grandchildren, seconcode and all its children/grandchildren, etc.)
 * @param codeMap
 * @param showColors
 * @returns
 */
export const getCodeTreeArray = (codeMap: CodeMap): CodeTree[] => {
  let parents = Object.keys(codeMap).filter(
    (code) => !codeMap[code].parent || codeMap[code].parent === ""
  );
  const codeTreeArray: CodeTree[] = [];
  fillCodeTreeArray(codeMap, parents, codeTreeArray, []);
  return codeTreeArray.map((object, i) => ({ ...object, i: i }));
};

const fillCodeTreeArray = (
  codeMap: CodeMap,
  parents: string[],
  codeTreeArray: CodeTree[],
  codeTrail: string[]
) => {
  for (const code of parents) {
    let newcodeTrail = [...codeTrail];
    newcodeTrail.push(code);

    codeTreeArray.push({
      ...codeMap[code],
      code: code,
      codeTrail: codeTrail,
      level: codeTrail.length,
      color: codeMap[code].color,
    });

    if (codeMap[code].children) {
      fillCodeTreeArray(codeMap, codeMap[code].children, codeTreeArray, newcodeTrail);
    }
  }
};

const parentData = (codeMap: CodeMap, code: string) => {
  // get array of parents from highest to lowers (tree)
  // look at parents to see if one is not active (activeParent).
  //    (this only matters if the same parent is folded, otherwise only the parent code itself is inactive)
  // look if there are folded parents, and if so pick the highest (foldToParent)
  const parents = [];
  let activeParent = true;
  let foldToParent = "";

  let parent = codeMap[code].parent;
  while (parent) {
    parents.push(parent);
    if (codeMap[parent].folded != null && codeMap[parent].folded) {
      foldToParent = parent; // this ends up being the highest level folded parent

      // code is inactive if only one of the folded parents is inactive
      if (codeMap[parent].active != null && !codeMap[parent].active) activeParent = false;
    }
    parent = codeMap[parent].parent;
  }
  return [parents.reverse(), activeParent, foldToParent];
};
