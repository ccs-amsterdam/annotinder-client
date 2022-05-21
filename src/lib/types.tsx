import { ReactElement, RefObject } from "react";
// common interfaces

///// GENERIC

// For passing on setState functions, which can either take a value or a function
export interface SetState<Type> {
  (value: Type): void;
  (value: (value: Type) => Type): void;
}
// !! apparently this already exists as Dispatch<SetStateAction<string>>
//    where Dispatch<function> just says return value is void

///// ANNOTATIONS
export interface Annotation {
  variable: string;
  length: number;
  value: string | number;
  field: string;
  offset: number;
  index?: number;
  text?: string;
  span?: [number, number];
  token_span?: [number, number];
}

// an intermediate format for annotations used internally for more efficient editing in 'annotation' mode
export interface SpanAnnotation extends Annotation {
  id?: string;
}

// {token_index: {variable+value: {SpanAnnotation}}}
// note that js doesn't distinguish between '2' and 2 as a key
export interface SpanAnnotations {
  [key: number | string]: {
    [key: string]: SpanAnnotation;
  };
}

///// QUESTIONS MODE

// an intermediate format that maps annotations to questions in 'questions' mode
export interface Answer {
  variable: string;
  values: AnswerItem[];
  length?: number;
  field?: string;
  offset?: number;
}

export interface AnswerItem {
  item: string;
  values: (string | number)[];
  optional?: boolean;
  invalid?: boolean;
}

/** Answer options used in 'questions' mode */
export interface AnswerOption {
  /** the code string */
  code: string;
  /** If the codebook is hierarchical, an array of all the code parents */
  tree: string[];
  /** An array with names of questions (or all "REMAINING" question) that become irrelevant if this options is chosen */
  makes_irrelevant: string[];
  /** Like makes_irrelevant, but the questions become irrelevant if this option is NOT chosen */
  required_for: string[];
  /** The color (e.g., for button display) */
  color: string;
  /** If the options are rendered as buttons, the ref enables navigation */
  ref: RefObject<HTMLElement>;
}

/** An object that maps an AnswerOption to left, right and up swipes */
export type Swipes = "left" | "right" | "up";
export interface SwipeOptions {
  left: AnswerOption;
  right: AnswerOption;
  up: AnswerOption;
}

/** Used in AnswerField to manage answers given in the sub components */
export interface OnSelectParams {
  /** The answer given.  */
  value?: string | number | (string | number)[];
  /** The item for which the answer is given (if question has multiple items) */
  itemIndex?: number;
  /** Only relevant if value is not an array. If false, the answer values array (AnswerItem.values) will always be
   * of length 1 (which we treat as a scalar). If true, the answer values array can have zero or multiple
   * values, and the value now given will be toggled in/out of the array.
   */
  multiple?: boolean;
  /** If True, giving this answer immediately finishes the question (posts annotations and goes to next question or unit) */
  finish?: boolean;
  /** If True, the current answer is marked as invalid, and the user will not be able to continue (if the value is required) */
  invalid?: boolean;
  /** If True, post the annotations but without going to the next question/unit */
  save?: boolean;
}

///// UNIT DATA

export interface Unit {
  jobServer: any;
  unitIndex: number;
  unitId: number | string; // this is the backend id, not the external id
  annotations: Annotation[];
  status: "DONE" | "IN_PROGRESS";
  tokens?: RawToken[];
  text_fields?: TextField[];
  meta_fields?: MetaField[];
  image_fields?: ImageField[];
  markdown_field?: string;
  importedAnnotations?: Annotation[];
}

export interface TextField {
  name: string;
  value: string;
  offset?: number;
  unit_start?: number;
  unit_end?: number;
  context_before?: string;
  context_after?: string;
  [key: string]: string | number | boolean; // mostly layout stuff
}

export interface RenderedText {
  [key: string]: ReactElement[];
}

export interface ImageField {
  name: string;
  filename?: string;
  base64?: string;
  caption?: string;
  style?: any;
  [key: string]: string | number | boolean; // mostly layout stuff
}

export interface RenderedImages {
  [key: string]: ReactElement;
}

export interface MetaField {
  name: string;
  label: string;
  value: string | number;
  [key: string]: string | number | boolean; // mostly layout stuff
}

///// CODES

export interface Code {
  code: string;
  [key: string]: any;
}

export interface CodeMap {
  [key: string]: any;
}

export interface CodeTree {
  code: string;
  codeTrail: string[];
  [key: string]: any;
}

///// TOKENS

// token after parsing/preparing, as used in the annotator
export interface Token {
  field: string;
  paragraph: number;
  sentence: number;
  index: number;
  offset: number;
  length: number;
  text: string;
  codingUnit: boolean;
  pre: string;
  post: string;
  annotations: { name: string; value: string | number }[];
  containerRef?: any; // once rendered, a Token will carry refs for it's own element and it's container element
  ref?: any;
  arrayIndex?: number; // once rendered, the index of the rendered tokens. Can differ from 'index' if current unit is a subset of a document (so index does not start at 0)
}

// token as it can occur in a unit. This includes alternative conventions in NLP parsers
// that will be converted to Token format
export interface RawToken {
  field?: string;
  paragraph?: number;
  sentence?: number;
  index?: number;
  offset?: number;
  length?: number;
  text?: string;
  codingUnit?: boolean;
  pre?: string;
  post?: string;
  annotations?: { name: string; value: string | number }[];
  token?: string;
  start?: number;
  end?: number;
  space?: string;
}

// raw token in column format.
export interface RawTokenColumn {
  field?: string[];
  paragraph?: number[];
  sentence?: number[];
  index?: number[];
  text?: string[];
  token?: string[];
  offset?: number[];
  length?: number[];
  start?: number[];
  end?: number[];
  pre?: string[];
  post?: string[];
  space?: string[];
  codingUnit?: boolean[];
  annotations?: { name: string; value: string | number }[][];
}

////// DOCUMENT

export interface Doc {
  /** A processed version of a Unit, for use in the Document component */
  tokens?: Token[];
  text_fields?: TextField[];
  meta_fields?: MetaField[];
  image_fields?: ImageField[];
  markdown_field?: string;
}

export interface ImportedCodes {
  /** Keys are variable names, values are objects in which keys are code-values, and their value is always true.
   *  Used for quick lookup of whether a value is allowed to be used for a given variable
   */
  [key: string]: {
    [key: string]: boolean;
  };
}

export interface CodeHistory {
  /** Keys are variable names, values are arrays of values that the variable has recently been coded with */
  [key: string]: string[];
}

export interface Variable {
  name: string;
  codes: Code[];
  instruction: string;
  searchBox: boolean;
  buttonMode: "all" | "recent";
  only_edit: boolean;
  only_imported: boolean;
  multiple: boolean;
  editMode: boolean;
  onlyImported: boolean;
  codeMap?: CodeMap;
}

export interface VariableMap {
  [key: string]: Variable;
}
