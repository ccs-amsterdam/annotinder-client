import {
  ReactElement,
  RefObject,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  CSSProperties,
} from "react";
import Backend from "./components/Login/Backend";
// common interfaces

///// UTIL

// For passing on setState functions, which can either take a value or a function
// export interface SetState<Type> {
//   (value: Type): void;
//   (value: (value: Type) => Type): void;
// }
// !! apparently this already exists as Dispatch<SetStateAction<string>>
//    where Dispatch<function> just says return value is voi

///// CONVENIENCE

// shorthand for the many setstate props being passed around
export type SetState<Type> = Dispatch<SetStateAction<Type>>;

// shorthand for the fullscreennode
export type FullScreenNode = MutableRefObject<HTMLDivElement | null>;

///// ANNOTATIONS
export type Span = [number, number];
export type Edge = [number, number];

export type Status = "DONE" | "IN_PROGRESS";

export interface Annotation {
  type?: "field" | "span" | "relation";
  id?: string;
  variable: string;
  value?: string | number;
  field?: string;
  offset?: number;
  length?: number;
  fromId?: string;
  toId?: string;

  index?: number;
  text?: string;
  positions?: Set<number>;
  span?: Span;

  color?: string;
  comment?: string;

  select?: () => void;
}

export interface RelationAnnotation {
  type: "relation";
  id: string;
  variable: string;
  value: string;
  fromId: string;
  toId: string;

  // this stuff is just used internally
  color?: string;
  edge?: Edge;
  from?: Annotation;
  to?: Annotation;

  select?: () => void;
}

export interface AnnotationLibrary {
  annotations: AnnotationDictionary;
  byToken: TokenAnnotations;
  codeHistory: CodeHistory;
  unitId: string;
}
export type AnnotationDictionary = Record<AnnotationID, Annotation>;
export type TokenAnnotations = Record<number, AnnotationID[]>;
export type AnnotationID = string;

////// LOGIN

/**
 * An active session on a server. (should be hooked up to a react-query)
 */
export interface ActiveSession {
  /** A unique key for a session, consisting of user_id @ host */
  key: string;
  /** The url of a host server */
  host: string;
  /** A valid token for the host server */
  token: string;
}

/**
 * For keeping multiple sessions in local storage. Keys are "user_id @ host",
 * and the values are Session objects
 */
export interface Sessions {
  [token: string]: Session;
}

/** Information about a session */
export interface Session {
  host: string;
  user_id: number;
  token: string;
  email: string;
  name: string;
  restricted_job: number;
  restricted_job_label: string;
}

/** Annotations, but quickly accessible by their (unique) variable + '.' + value
 */
export interface AnnotationMap {
  [key: string]: Annotation;
}

/** All tokenAnnotations quickly accessible by token index
 */
export interface SpanAnnotations {
  [index: number | string]: AnnotationMap;
}

/** Annotations that only have a field (or empty field for entire document) */
export interface FieldAnnotations {
  [field: string]: AnnotationMap;
}

// export interface RelationAnnotations {
//   [from: string]: {
//     [to: string]: AnnotationMap;
//   };
// }

///// CODEBOOK

/** The codebook after the raw codebook has been processed  */
export interface CodeBook {
  type: "annotate" | "questions";
  variables?: Variable[];
  questions?: Question[];
  settings?: {
    instruction?: string;
    auto_instruction?: boolean;
    no_table?: boolean;
    text_window_size?: number | string;
  };
}

/** The codebook in the JSON input format. */
export interface RawCodeBook {
  type: "annotate" | "questions";
  variables?: any;
  questions?: any;
  settings?: {
    no_table?: boolean;
  };
}

///// QUESTIONS MODE

export interface Question {
  name: string;
  type: QuestionType;
  question?: string;
  instruction?: string;
  codes?: Code[];
  items?: QuestionItem[];
  vertical?: boolean;
  same_size?: boolean;
  swipeOptions?: SwipeOptions;
  options?: AnswerOption[];
  fields?: string[];
  /** An array of variable names. If given, unit annotations of this variable are
   * highlighted when this question is asked
   */
  showAnnotations?: string[];
  /** An array of variable names. If given, this question will be asked for each
   * individual annotation of this variable.
   */
  perAnnotation?: string[];
  /** If true, than each annotation in perAnnotation is focussed on */
  focusAnnotations: boolean;
  /** An array of strings that match field names. A name can also refer to a
   * numbered field, so that 'comment' would e.g., match 'comment.1', 'comment.2', etc.
   */
  perField?: string[];
  /** This is not to be passed via the codebook, but is automatically generated if perAnnotation is used.
   * The annotatino can then be highlighted, and the field, offset and length are stored in the answer
   */
  annotation?: Annotation;
}

export interface Transition {
  direction?: "left" | "right" | "up";
  color?: string;
}

export type QuestionType =
  | "search code"
  | "select code"
  | "scale"
  | "annotinder"
  | "confirm"
  | "inputs";

export interface QuestionItem {
  name: string;
  label?: string;
  type?: QuestionItemType;
  min?: number;
  max?: number;
  rows?: number;
  optional?: boolean;
  autocomplete?: string;
  ref?: RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

export type QuestionItemType = "email" | "number" | "textarea" | "text";

// an intermediate format that maps annotations to questions in 'questions' mode
export interface Answer {
  variable: string;
  items: AnswerItem[];
  length?: number;
  field?: string;
  offset?: number;
  makes_irrelevant?: string[];
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
  /** The color (e.g., for button display) */
  color: string;
  /** If the options are rendered as buttons, the ref enables navigation */
  tree?: string[];
  /** An array with names of questions (or all "REMAINING" question) that become irrelevant if this options is chosen */
  makes_irrelevant?: string[];
  /** Like makes_irrelevant, but the questions become irrelevant if this option is NOT chosen */
  required_for?: string[];
  ref?: RefObject<HTMLElement>;
}

/** An object that maps an AnswerOption to left, right and up swipes */
export type Swipes = "left" | "right" | "up";
export interface SwipeOptions {
  left: AnswerOption;
  right: AnswerOption;
  up: AnswerOption;
}

/** the refs to html elements used in swipeControl */
export interface SwipeRefs {
  text: RefObject<HTMLElement>;
  box: RefObject<HTMLElement>;
  code: RefObject<HTMLElement>;
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
  /** Optionally, transition parameters */
  transition?: Transition;
}

///// ANNOTATE MODE

export interface Variable {
  name: string;
  type?: VariableType; // if missing, defaults to "span"
  codes: Code[];
  relations?: Relation[];
  instruction: string;
  buttonMode?: "all" | "recent";
  searchBox?: boolean;
  multiple?: boolean;
  editMode?: boolean;
  onlyImported?: boolean;
  codeMap?: CodeMap;
  validFrom?: ValidRelation;
  validTo?: ValidRelation;
}

export interface Relation {
  codes?: string[];
  from?: CodeRelation;
  to?: CodeRelation;
}

// for fast lookup of relation codes, indexed as: variable -> value -> relation_code_value -> relation_code_object
//export type ValidRelation = Record<string, Record<string, Record<string, Code>>>;

export interface ValidRelation {
  [variable: string]: {
    [value: string]: {
      [relationId: number]: Code[];
    };
  };
}

// for fast lookup of tokens in relation selection mode
export type ValidTokenRelations = Record<number, Record<string, Record<string, boolean>>>;
export type ValidTokenDestinations = Record<number, boolean>;

export type VariableType = "span" | "relation";

/** This one's intentionally flexible, because the codeselector popup handles multiple types of selections */
export interface CodeSelectorValue {
  id?: AnnotationID;
  annotation?: Annotation;
  variable?: string;
  span?: Span;
  value?: string | number | Code;
  code?: Code;
  relationOption?: RelationOption;
  delete?: boolean;
  cancel?: boolean;
}

export interface RelationOption {
  relations: Code[];
  from: Annotation;
  to: Annotation;
}

/** This one's intentionally flexible, because the codeselector popup handles multiple types of selections */
export interface CodeSelectorOption {
  /** The value returned by the dropbox/buttonselection */
  value: CodeSelectorValue;
  /** label shown in buttonselection */
  label?: string | number;
  /** color of button */
  color?: string;
  /** text shown as a tag attached to the button */
  tag?: string | number;
  /** used in buttons to set text color */
  textColor?: string;
  /** If the options are rendered as buttons, the ref enables navigation */
  ref?: RefObject<HTMLElement>;
  /** A string for looking up the option in text search */
  queryText?: string;
}

export interface CodeSelectorDropdownOption {
  /** Dropdown doesn't allow objects as values, so we use codes as values, and later find the full value */
  value: string;
  /** After getting the selected value, we can return the actual value object */
  fullvalue?: CodeSelectorValue;
  /** Used in dropdown for searching string match */
  text?: string;
  /** Used in dropdown to render label */
  content?: ReactElement;
}

export type TokenSelection = [number, number] | [];

/** used to manage keyboard navigation */
export interface Mover {
  position: number;
  startposition: number;
  ntokens: number;
  counter: number;
}

export type Arrowkeys = "ArrowRight" | "ArrowLeft" | "ArrowUp" | "ArrowDown";

///// CONDITIONALS

export interface Conditional {
  /** The variable name */
  variable: string;
  /** Annotation values and (optionally) positions */
  conditions: Condition[];
  /** Action if conditions are successful */
  onSuccess?: "applaud";
  /** Action if conditions failed */
  onFail?: "retry" | "block";
  /** The damage to the coder's health if conditions failed. */
  damage?: number;
  /** A markdown string for a message to display if conditions failed */
  message?: string;
}

export interface Condition {
  /** The value to compare the annotation value to. See 'operator' for comparison */
  value: string | number;
  /** The operator to compare the annotation value to the gold value. Default is == */
  operator?: "==" | "<=" | "<" | ">=" | ">" | "!=";
  /** If given, annotation needs to have this field */
  field?: string;
  /** If given, annotation needs to have this offset */
  offset?: number;
  /** If given, annotation needs to have this length */
  length?: number;
  /** The damage to the coder's health if this specific condition failed. (adds to damage specified in Conditional) */
  damage?: number;
  /** An additional markdown string for a message to display if this specific condition failed.
   * These are below the Conditional message.
   */
  submessage?: string;
}

export interface ConditionReport {
  // A record where keys are variables and values are objects with results of conditions
  evaluation: { [key: string]: Action };
  damage: {
    damage?: number;
    game_over?: boolean;
    max_damage?: number;
  };
  reportSuccess?: boolean;
}

export interface Action {
  /** action to perform. This is determined based on the unit type and whether condition is satisfied.     */
  action?: ConditionalAction;
  /** Message to display */
  message?: string;
  submessages?: string[];
  correct?: Annotation[];
  incorrect?: Annotation[];
}

export type ConditionalAction = "retry" | "block" | "applaud";

///// JOBSERVER

export interface HostInfo {
  host?: string;
  oauthClients?: OauthClients;
  user?: HostUserInfo;
}

export interface HostUserInfo {
  user_id: number;
  name: string;
  email: string;
  is_admin: boolean;
  has_password: boolean;
  restricted_job: number;
  restricted_job_label: string;
}

export interface OauthClients {
  github?: { client_id: string };
}

/**
 * A class providing everthing needed to run the Annotator component.
 * In particular, it needs to have a codebook and progress
 */
export interface JobServer {
  codebook: CodeBook;
  progress: Progress;
  return_link?: string;
  job_id?: string;
  setJobServer?: SetState<JobServer>;
  backend?: Backend;
  demodata?: DemoData;

  init: () => void;
  getUnit: (i: number) => Promise<RawUnit>;
  postAnnotations: (
    unitId: string,
    annotation: Annotation[],
    status: Status
  ) => Promise<ConditionReport>;
  getDebriefing?: () => Promise<Debriefing>;
}

export interface DemoData {
  units?: RawUnit[];
}

/**
 * An object containing information relevant for codingjob navigation
 */
export interface Progress {
  /** Total number of items a coder can coder in this job */
  n_total: number;
  /** Number of items that have been coded.  */
  n_coded: number;
  /** Should the coder be able to go back to already coded units? */
  seek_backwards?: boolean;
  /** Should the coder be able to move forward beyond currently coded units? */
  seek_forwards?: boolean;
}

///// UNIT DATA

export type UnitType = "pre" | "train" | "test" | "unit" | "post";

/** A unit after it has been prepared by the jobServer. This is for internal use */
export interface Unit {
  unitId: string; // this is the backend id, not the external id
  unit: UnitContent;
  jobServer?: any;
  status: UnitStatus;
  report?: ConditionReport;
}

export interface UnitContent {
  textFields?: TextField[];
  tokens?: Token[];
  imageFields?: ImageField[];
  markdownFields?: MarkdownField[];
  metaFields?: MetaField[];
  annotations?: Annotation[];
  importedAnnotations?: Annotation[];
  codebook?: CodeBook;
  variables?: UnitVariables;
  grid?: FieldGrid;
}

/**
 * This function gets a unit from the server.
 * Use index -1 to tell the backend to decide what unit comes next  */
export type SetUnitIndex = (index: number) => void;

/** Units can have an object of variables, where keys are the variable names and values are pieces of text.
 *  These can be used in questions like: "is this text about [variable]"?.
 */
export interface UnitVariables {
  [key: string]: string;
}

/** A unit as it can be served by the backend.
 * Note that some parts (conditionals, damage) will normally not be visible to the frontend, but are included
 * here for jobserverdemo
 */
export interface RawUnit {
  index: number;
  status: UnitStatus;
  id: string; // this is the backend id, not the external id
  external_id?: string;
  unit: RawUnitContent;
  type: UnitType;
  conditionals?: Conditional[];
  damage?: number;
  report?: ConditionReport;
  annotations?: Annotation[];
  annotation?: Annotation[]; // deprecated in favor of plural 'annotations'
}

export interface RawUnitContent {
  text_fields?: TextField[];
  tokens?: RawToken[] | RawTokenColumn;
  image_fields?: ImageField[];
  markdown_fields?: MarkdownField[];
  meta_fields?: MetaField[];
  importedAnnotations?: Annotation[]; // deprecated
  annotations: Annotation[];
  codebook?: RawCodeBook;
  variables?: UnitVariables;
  grid?: FieldGridInput;
}

export type UnitStatus = "DONE" | "IN_PROGRESS";

export interface FieldGridInput {
  areas?: string[][];
  rows?: number[];
  columns?: number[];
}

export interface FieldGrid {
  areas?: string;
  columns?: string;
  rows?: string;
}

export interface Field {
  name: string;
  value: string;
  grid_area?: string;
  style?: CSSProperties;
}

export interface TextField extends Field {
  label?: string;
  offset?: number;
  unit_start?: number;
  unit_end?: number;
  context_before?: string;
  context_after?: string;
  paragraphs?: boolean;
}

export interface RenderedText {
  [key: string]: ReactElement[];
}

export interface ImageField extends Field {
  alt?: string;
  base64?: boolean;
  caption?: string;
}

export interface RenderedImages {
  [key: string]: ReactElement;
}

export interface MarkdownField extends Field {}

export interface RenderedMarkdown {
  [key: string]: ReactElement;
}

export interface MetaField {
  name: string;
  value: string | number;
  label: string;
  style?: CSSProperties;
}

///// CODES

export interface Code {
  variable: string;

  code: string;
  parent: string;
  color: string;

  active: boolean;
  activeParent: any;
  folded: boolean;
  children: string[];
  foldToParent: any;
  totalChildren: number;
  totalActiveChildren: number;
  tree?: any;
  /** An array with names of questions (or all "REMAINING" question) that become irrelevant if this options is chosen */
  makes_irrelevant?: string[];
  /** Like makes_irrelevant, but the questions become irrelevant if this option is NOT chosen */
  required_for?: string[];
}

export interface CodeRelation {
  variable: string;
  values?: string[];
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
  //sentence: number;
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
  //sentence?: number;
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
  //sentence?: number[];
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
  textFields?: TextField[];
  metaFields?: MetaField[];
  imageFields?: ImageField[];
  markdownFields?: MarkdownField[];
  grid?: FieldGrid;
}

export interface DocumentSettings {
  editMode: boolean;
}

export interface FieldRefs {
  [field: string]: RefObject<HTMLElement>;
}

export interface VariableValueMap {
  /** Keys are variable names, values are objects in which keys are code-values, and their value is always true.
   *  Used for quick lookup of whether a value is allowed to be used for a given variable
   */
  [key: string]: {
    [key: string]: boolean;
  };
}

export interface CodeHistory {
  /** Keys are variable names, values are arrays of values that the variable has recently been coded with */
  [key: string]: (string | number)[];
}

export interface VariableMap {
  [key: string]: Variable;
}

export interface TriggerSelectorParams {
  index?: number;
  from?: number;
  to?: number;
  fromId?: string;
  toId?: string;
}
export interface TriggerSelector {
  (TriggerSelectorParams): void;
}

///// FULLDATATABLE

export interface TableData {
  rows: RowObj[];
  page: number;
  pages: number;
}

/** An object where keys are column names and values their value for this particular row */
export interface RowObj {
  [key: string]: any;
}

export interface ButtonComponentProps {
  key: string;
  row: RowObj;
  backend: Backend;
  setData: SetState<RowObj[]>;
  style: CSSProperties;
}

///// MANAGE USERS

export interface User {
  name: string;
  admin: boolean;
  password?: string;
}

///// MANAGE JOBS

export interface Job {
  id: string;
  title: string;
  created: string;
  creator: string;
  archived?: boolean;
  restricted?: boolean;
  users?: User[];
  jobset_details?: JobSet[];
  n_total: number;
}

export interface JobSet {
  name: string;
  units?: RawUnit[];
  codebook?: CodeBook;
  n_units?: number;
  rules?: Rules;
}

export interface Rules {
  ruleset: "crowdcoding" | "fixedset";
  [key: string]: any;
}

export interface JobSettings {
  archived?: boolean;
  restricted?: boolean;
}

export interface JobAnnotation {
  jobset: string;
  unit_id: string;
  coder_id: number;
  coder: string;
  annotation: Annotation[];
  status: Status;
}

///// OTHER

export interface Debriefing {
  message?: string;
  link?: string;
  link_text?: string;
  /** The link can contain {user_id}, which will be replaced by the user_id from the backend
   *  This is mainly usefull for redirecting coders to a panel company, which can need their ID to pay them
   */
  user_id?: string;
  /** If True, show QR code for sharing the job with other people */
  qr?: boolean;
}

export interface SessionData {
  seenInstructions: Record<string, boolean>;
}
