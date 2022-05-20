import { ReactElement } from "react";
// common interfaces

///// CONVENIENCE

// For passing on setState functions, which can either take a value or a function
export interface SetState<Type> {
  (value: Type): void;
  (state: (value: Type) => Type): void;
}

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
  id?: string;
}

// {token_index: {variable+value: {SpanAnnotation}}}
// note that js doesn't distinguish between '2' and 2 as a key
export interface SpanAnnotations {
  [key: number | string]: {
    [key: string]: Annotation;
  };
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
  offset: number;
  length: number;
  paragraph: number;
  sentence: number;
  index: number;
  text: string;
  pre: string;
  post: string;
  codingUnit: boolean;
  annotations: any;
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
  text?: string;
  token?: string;
  offset?: number;
  length?: number;
  start?: number;
  end?: number;
  pre?: string;
  post?: string;
  space?: string;
  codingUnit?: boolean;
  annotations?: any;
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
  start?: number;
  end?: number;
  pre?: string[];
  post?: string[];
  space?: string;
  codingUnit?: boolean;
  annotations?: any;
}
