import { Unit } from "../types";

/**
 * If the value of a field (text field, markdown field, image field) is an array,
 * unfold it into numbered fields. So a field named comment would for instance become
 * comment.1, comment.2, etc.
 *
 * @param unit
 * @returns
 */
export default function unfoldFields(unit: Unit): Unit {
  unit.text_fields = unfold(unit.text_fields, unit.grid);
  unit.image_fields = unfold(unit.image_fields, unit.grid);
  unit.markdown_fields = unfold(unit.markdown_fields, unit.grid);

  return unit;
}

function unfold(fields, grid) {
  const newFields = [];
  for (let f of fields || []) {
    // if not array or array of length 1, keep same
    if (!Array.isArray(f.value)) {
      newFields.push(f);
      continue;
    }
    if (f.value.length === 1) {
      f.value = f.value[0];
      newFields.push(f);
      continue;
    }

    // if array, unfold
    for (let i = 0; i < f.value.length; i++) {
      const name = `${f.name}.${i + 1}`;
      const value: string = f.value[i];
      newFields.push({ ...f, name, value });
    }
    grid = unfoldGrid(grid, f.name, f.value.length);
  }
  return newFields;
}

function unfoldGrid(grid, value, times) {
  if (!grid.areas) return grid;
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
