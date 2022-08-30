import { importTokens, importTokenAnnotations, parseTokens } from "../../../functions/tokens";
import { importSpanAnnotations } from "../../../functions/annotations";
import { Doc, ImageField, MarkdownField, SpanAnnotations, TextField, Unit } from "../../../types";

/**
 *
 * @param unit
 * @param codes This is
 * @returns
 */
export const getDocAndAnnotations = (unit: Unit): [Doc, SpanAnnotations] => {
  // d is an intermediate object to do some processing on the Unit and extract the document and annotations
  const d: any = { ...unit };

  if (!d.text_fields) {
    d.text_fields = d.text ? [{ name: "text", value: d.text }] : [];
  }
  if (!d.image_fields) {
    d.image_fields = d.image ? [{ name: "image", value: d.image }] : [];
  }
  if (!d.meta_fields) d.meta_fields = [];
  if (!d.markdown_fields) d.markdown_fields = [];

  if (d.grid?.areas) {
    // areas should be an array of arrays of the same length, where all values are strings.
    // there is some leeway (inner array can be a single string, and if inner arrays do not have same length, last value is repeated).
    // this is then used to create the grid-template-areas
    let template = [];
    let ncolumns = 1;
    for (let row of d.grid.areas) {
      // first get max row length (= n columns)
      if (Array.isArray(row)) ncolumns = Math.max(ncolumns, row.length);
    }

    const used_columns = new Set([]);
    for (let row of d.grid.areas) {
      if (!Array.isArray(row)) row = [row];
      const row_columns = [];
      for (let i = 0; i < ncolumns; i++) {
        const column = row[i] ?? row[row.length - 1];
        used_columns.add(column);
        row_columns.push(column);
      }
      template.push(`"${row_columns.join(" ")}"`);
    }

    // rm all fields that are not in the template
    d.text_fields = d.text_fields.filter((f: TextField) => used_columns.has(f.name));
    d.image_fields = d.image_fields.filter((f: ImageField) => used_columns.has(f.name));
    d.markdown_fields = d.markdown_fields.filter((f: MarkdownField) => used_columns.has(f.name));

    d.grid = {
      ...d.grid,
      areas: template.join(" "),
    };
  }

  if (d.tokens) {
    d.importedTokens = true;
    d.tokens = importTokens(d.tokens);
  } else {
    d.importedTokens = false;
    d.tokens = parseTokens([...d.text_fields]);
  }

  const doc: Doc = {
    tokens: d.tokens,
    text_fields: d.text_fields,
    meta_fields: d.meta_fields,
    image_fields: d.image_fields,
    markdown_fields: d.markdown_fields,
    grid: d?.grid,
  };

  // ImportSpanAnnotations transforms the array format annotations to an object format.
  // More importantly, it matches the annotations to token indices (based on the char offset)
  let annotations: SpanAnnotations = {};
  if (d.annotations) annotations = importSpanAnnotations([...d.annotations], d.tokens);

  const tokenAnnotations = importTokenAnnotations(d.tokens);
  if (tokenAnnotations.length > 0)
    annotations = importSpanAnnotations(tokenAnnotations, d.tokens, annotations);

  return [doc, annotations];
};
