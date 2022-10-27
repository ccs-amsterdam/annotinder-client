import { importTokens, parseTokens } from "../components/Document/functions/tokens";
import {
  UnitContent,
  RawUnitContent,
  SubField,
  TextField,
  ImageField,
  MarkdownField,
  RawTextField,
  RawImageField,
  RawMarkdownField,
  FieldGrid,
  FieldGridInput,
} from "../types";
import { importCodebook } from "./codebook";

/**
 * If the value of a field (text field, markdown field, image field) is an array,
 * unfold it into numbered fields. So a field named comment would for instance become
 * comment.1, comment.2, etc.
 *
 * @param unit
 * @returns
 */
export default function processUnitContent(ruc: RawUnitContent): UnitContent {
  const content: UnitContent = {
    text_fields: unfold(ruc.text_fields, ruc.grid),
    image_fields: unfold(ruc.image_fields, ruc.grid),
    markdown_fields: unfold(ruc.markdown_fields, ruc.grid),
    meta_fields: ruc.meta_fields || [],
    importedAnnotations: ruc.importedAnnotations,
    codebook: importCodebook(ruc.codebook),
    variables: ruc.variables,
  };

  if (!content.variables && content.importedAnnotations) {
    content.variables = {};
    for (let a of content.importedAnnotations) {
      if (!content.variables[a.variable]) {
        content.variables[a.variable] = String(a.value);
      } else {
        content.variables[a.variable] += `, ${a.value}`;
      }
    }
  }

  content.tokens = ruc.tokens ? importTokens(ruc.tokens) : parseTokens([...content.text_fields]);
  content.grid = prepareGrid(ruc.grid, content);

  return content;
}

type RawField = RawTextField | RawImageField | RawMarkdownField;
type ProcessedField = TextField | ImageField | MarkdownField;

function unfold(fields: RawField[], grid: FieldGridInput): ProcessedField[] {
  const newFields: ProcessedField[] = [];
  if (!fields) return newFields;

  for (let f of fields || []) {
    if (!Array.isArray(f.value)) {
      newFields.push({ ...f, value: String(f.value) });
    } else {
      // if array, unfold
      const values: (string | SubField)[] = f.value;
      for (let i = 0; i < values.length; i++) {
        const name = `${f.name}.${i + 1}`;
        // value in array can either be a string, or an object with
        // {value: 'the value string', style: {}}
        let newField: any;
        let value: string;
        const valueItem: string | SubField = values[i];
        if (typeof valueItem === "object") {
          const subField: SubField = valueItem;
          value = subField.value;
          newField = { ...f, name, value: subField.value };
          if (subField.style) newField.style = subField.style;
        } else {
          value = valueItem;
          newField = { ...f, name, value };
        }

        if (newField.context_before && i > 0) delete newField.context_before;
        if (newField.context_after && i < value.length - 1) delete newField.context_after;
        newFields.push(newField);
      }
      grid = unfoldGrid(grid, f.name, values.length);
    }
  }
  return newFields;
}

function unfoldGrid(grid, value, times) {
  if (!grid?.areas) return grid;

  const newAreas = [];
  const newRowUnits = [];
  for (let i = 0; i < grid.areas.length; i++) {
    let row = grid.areas[i];
    const rowUnit = grid.rows ? grid.rows[i] ?? grid.rows[grid.rows.length - 1] : 1;

    if (!row.includes(value)) {
      newAreas.push(row);
      if (grid.rows) newRowUnits.push(rowUnit);
      continue;
    }
    for (let repeat = 0; repeat < times; repeat++) {
      const newrow = row.map((v) => (v === value ? v + "." + (repeat + 1) : v));
      newAreas.push(newrow);
      newRowUnits.push(rowUnit);
    }
  }
  grid.areas = newAreas;
  if (grid.rows) grid.rows = newRowUnits;
  return grid;
}

function prepareGrid(grid: FieldGridInput, content: UnitContent): FieldGrid {
  // areas should be an array of arrays of the same length, where all values are strings.
  // there is some leeway (inner array can be a single string, and if inner arrays do not have same length, last value is repeated).
  // this is then used to create the grid-template-areas
  const outputGrid: FieldGrid = {};
  if (!grid) return outputGrid;
  let template = [];
  let ncolumns = 1;

  for (let row of grid.areas) {
    // first get max row length (= n columns)
    if (Array.isArray(row)) ncolumns = Math.max(ncolumns, row.length);
  }

  // grid area names have certain conditions that we don't want to think of,
  // so we'll enumerate fields and label them f1, f2, etc.
  const areaNameMap: Record<string, string> = {};

  const used_columns = new Set([]);
  for (let row of grid.areas) {
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
  content.text_fields = content.text_fields.filter((f: TextField) => used_columns.has(f.name));
  content.image_fields = content.image_fields.filter((f: ImageField) => used_columns.has(f.name));
  content.markdown_fields = content.markdown_fields.filter((f: MarkdownField) =>
    used_columns.has(f.name)
  );

  // add area names
  for (let f of content.text_fields) f.grid_area = areaNameMap[f.name];
  for (let f of content.image_fields) f.grid_area = areaNameMap[f.name];
  for (let f of content.markdown_fields) f.grid_area = areaNameMap[f.name];

  if (template.length > 0) outputGrid.areas = template.join(" ");

  // columns and rows are arrays of values for fr units. Transform here into strings, repeating
  // last value if array shorter than number of rows/columns.
  if (grid.rows) {
    let rowString = "";
    for (let i = 0; i < template.length; i++) {
      const value = grid.rows[i] ?? grid.rows[grid.rows.length - 1];
      rowString += value + "fr ";
    }
    outputGrid.rows = rowString.trim();
  }
  if (grid.columns) {
    let colString = "";
    for (let i = 0; i < ncolumns; i++) {
      const value = grid.columns[i] ?? grid.columns[grid.columns.length - 1];
      colString += value + "fr ";
    }
    outputGrid.columns = colString.trim();
  }

  return outputGrid;
}
