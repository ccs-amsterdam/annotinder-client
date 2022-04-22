import { importTokens, importTokenAnnotations, parseTokens } from "./tokens";
import { importSpanAnnotations } from "./annotations";

export const prepareDocument = (document, codes = {}) => {
  const doc = { ...document };
  if (!doc.text_fields) {
    doc.text_fields = doc.text ? [{ name: "text", value: doc.text }] : [];
  }
  if (!doc.image_fields) {
    doc.image_fields = doc.image ? [{ name: "image", value: doc.image }] : [];
  }
  if (!doc.grid) doc.grid = [];
  if (!doc.meta_fields) doc.meta_fields = [];

  if (doc.tokens) {
    doc.importedTokens = true;
    doc.tokens = importTokens(document.tokens);
  } else {
    doc.importedTokens = false;
    doc.tokens = parseTokens([...doc.text_fields]);
  }

  if (doc.tokens.length > 0) {
    doc.n_paragraphs = doc.tokens[doc.tokens.length - 1].paragraph;
    doc.n_sentences = doc.tokens[doc.tokens.length - 1].sentence;
  } else {
    doc.n_paragraphs = 0;
    doc.n_sentences = 0;
  }
  // ImportSpanAnnotations transforms the array format annotations to an object format.
  // More importantly, it matches the annotations to token indices (based on the char offset)
  if (doc.annotations) {
    doc.annotations = importSpanAnnotations([...doc.annotations], doc.tokens);
  } else doc.annotations = {};

  const tokenAnnotations = importTokenAnnotations(doc.tokens, codes); // also fills codes
  if (tokenAnnotations.length > 0)
    doc.annotations = importSpanAnnotations(tokenAnnotations, doc.tokens, doc.annotations);

  return doc;
};
