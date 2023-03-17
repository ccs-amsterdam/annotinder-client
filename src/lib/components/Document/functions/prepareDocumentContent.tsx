import {
  importFieldAnnotations,
  importSpanAnnotations,
  importRelationAnnotations,
} from "./annotations";
import {
  Doc,
  ImageField,
  MarkdownField,
  SpanAnnotations,
  TextField,
  Unit,
  FieldAnnotations,
  RelationAnnotations,
  Annotation,
  UnitContent,
} from "../../../types";

/**
 * Prepare the document but performing several preprocessing steps.
 */
export const getDoc = (unit: Unit): Doc => {
  // d is an intermediate object to do some processing on the Unit and extract the document and annotations
  let d: UnitContent = { ...unit.unit };

  if (d.grid?.areas) d = prepareGrid(d); // actually updates d internally (by reference)

  const doc: Doc = {
    tokens: d.tokens,
    text_fields: d.text_fields || [],
    meta_fields: d.meta_fields || [],
    image_fields: d.image_fields || [],
    markdown_fields: d.markdown_fields || [],
    grid: d?.grid,
  };

  return doc;
};

export const getAnnotations = (
  doc: Doc,
  annotations: Annotation[]
): [SpanAnnotations, FieldAnnotations, RelationAnnotations] => {
  let spanAnnotations: SpanAnnotations = {};
  //if (d.importedAnnotations)
  //  spanAnnotations = importSpanAnnotations([...d.importedAnnotations], d.tokens, spanAnnotations);
  if (annotations)
    spanAnnotations = importSpanAnnotations([...annotations], doc.tokens, spanAnnotations);

  // const tokenAnnotations = importTokenAnnotations(d.tokens);
  // if (tokenAnnotations.length > 0)
  //   spanAnnotations = importSpanAnnotations(tokenAnnotations, d.tokens, spanAnnotations);

  const fieldAnnotations: FieldAnnotations = importFieldAnnotations(annotations);
  const relationAnnotations: RelationAnnotations = importRelationAnnotations(annotations);

  return [spanAnnotations, fieldAnnotations, relationAnnotations];
};

function prepareGrid(d: any) {
  // areas should be an array of arrays of the same length, where all values are strings.
  // there is some leeway (inner array can be a single string, and if inner arrays do not have same length, last value is repeated).
  // this is then used to create the grid-template-areas
  let template = [];
  let ncolumns = 1;

  for (let row of d.grid.areas) {
    // first get max row length (= n columns)
    if (Array.isArray(row)) ncolumns = Math.max(ncolumns, row.length);
  }

  // grid area names have certain conditions that we don't want to think of,
  // so we'll enumerate fields and label them f1, f2, etc.
  const areaNameMap: Record<string, string> = {};

  const used_columns = new Set([]);
  for (let row of d.grid.areas) {
    if (!Array.isArray(row)) row = [row];
    const row_columns = [];
    for (let i = 0; i < ncolumns; i++) {
      const column = row[i] ?? row[row.length - 1];
      used_columns.add(column);

      if (column === ".") {
        row_columns.push(column);
      } else {
        if (!areaNameMap[column]) areaNameMap[column] = "f" + Object.keys(areaNameMap).length;
        row_columns.push(areaNameMap[column]);
      }
    }
    template.push(`"${row_columns.join(" ")}"`);
  }

  // rm all fields that are not in the template
  d.text_fields = d.text_fields.filter((f: TextField) => used_columns.has(f.name));
  d.image_fields = d.image_fields.filter((f: ImageField) => used_columns.has(f.name));
  d.markdown_fields = d.markdown_fields.filter((f: MarkdownField) => used_columns.has(f.name));

  // add area names
  for (let f of d.text_fields) f.grid_area = areaNameMap[f.name];
  for (let f of d.image_fields) f.grid_area = areaNameMap[f.name];
  for (let f of d.markdown_fields) f.grid_area = areaNameMap[f.name];

  d.grid.areas = template.join(" ");

  // columns and rows are arrays of values for fr units. Transform here into strings, repeating
  // last value if array shorter than number of rows/columns.
  if (d.grid.rows) {
    let rowString = "";
    for (let i = 0; i < template.length; i++) {
      const value = d.grid.rows[i] ?? d.grid.rows[d.grid.rows.length - 1];
      rowString += value + "fr ";
    }
    d.grid.rows = rowString.trim();
  }
  if (d.grid.columns) {
    let colString = "";
    for (let i = 0; i < ncolumns; i++) {
      const value = d.grid.columns[i] ?? d.grid.columns[d.grid.columns.length - 1];
      colString += value + "fr ";
    }
    d.grid.columns = colString.trim();
  }

  return d;
}
