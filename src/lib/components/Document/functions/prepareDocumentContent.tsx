import { importTokens, importTokenAnnotations, parseTokens } from "../../../functions/tokens";
import { importSpanAnnotations } from "../../../functions/annotations";
import { Doc, SpanAnnotations, Unit } from "../../../types";

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
  if (!d.markdown_field) d.markdown_field = null;

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
    markdown_field: d.markdown_field,
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
