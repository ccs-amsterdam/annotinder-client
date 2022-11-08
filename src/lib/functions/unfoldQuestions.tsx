import { CodeBook, Question, Unit } from "../types";

/**
 * Codebooks can indicate that certain questions need to be asked
 * multiple times, e.g., per annotation. If so, the questions
 * need to be 'unfolded'.
 *
 * @param codebook
 * @param unit
 * @returns
 */
export default function unfoldQuestions(codebook: CodeBook, unit: Unit): Question[] {
  if (!codebook) return null;

  let needsUnfold = false;
  for (let question of codebook.questions) {
    if (question.perAnnotation && unit.unit.importedAnnotations) needsUnfold = true;
    if (question.perField) needsUnfold = true;
  }
  if (!needsUnfold) return codebook.questions;

  const questions = [];
  for (let question of codebook.questions) {
    if (!question.perAnnotation && !question.perField) {
      questions.push(question);
      continue;
    }

    // perAnnotation
    const duplicate: Record<string, boolean> = {};
    for (let a of unit.unit.importedAnnotations || []) {
      if (!question.perAnnotation.includes(a.variable)) continue;

      const aSerial: string =
        a.field + "." + a.variable + "." + a.value + "." + a.offset + "." + a.length;
      if (duplicate[aSerial]) continue;
      duplicate[aSerial] = true;

      const q = { ...question, annotation: a };
      if (question.focusAnnotations) q.fields = [a.field];
      questions.push(q);
    }

    // perField
    if (question.perField) {
      if (!Array.isArray(question.perField)) question.perField = [question.perField];

      const fields = new Set([]);
      for (let f of unit.unit.text_fields || []) fields.add(f.name);
      for (let f of unit.unit.markdown_fields || []) fields.add(f.name);
      for (let f of unit.unit.image_fields || []) fields.add(f.name);

      for (let field of Array.from(fields)) {
        // perField can match on both the exact field and field ignoring any \.[0-9]+ extension.
        // this allows e.g., matching 'comment' on fields 'comment.1','comment.2', etc.
        const fieldWithoutNr = field.replace(/[.][0-9]+$/, "");
        if (question.perField.includes(fieldWithoutNr) || question.perField.includes(field)) {
          questions.push({ ...question, fields: [field] });
        }
      }
    }
  }
  return questions;
}
