import { Token, TextField, MetaField, ImageField, Code, CodeMap } from "../../types";

export interface Doc {
  /** A processed version of a Unit, for use in the Document component */
  tokens: Token[];
  text_fields: TextField[];
  meta_fields: MetaField[];
  image_fields: ImageField[];
  markdown_field: string;
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
