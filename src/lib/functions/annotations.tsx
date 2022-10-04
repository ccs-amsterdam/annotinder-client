import { Token, Annotation, SpanAnnotations, FieldAnnotations } from "../types";

export const createId = (annotation: any): string => {
  return annotation.variable + "|" + annotation.value;
};

export const exportSpanAnnotations = (
  annotations: SpanAnnotations,
  tokens: Token[],
  SpanAndText = false
): Annotation[] => {
  // export annotations from the object format (for fast use in the annotator) to array format
  if (!annotations) return [];
  if (Object.keys(annotations).length === 0) return [];
  const uniqueAnnotations = Object.keys(annotations).reduce((un_ann, index) => {
    const ann = annotations[index];
    for (let id of Object.keys(ann)) {
      //const endIndex = if (index === 'unit' ? index : )

      if (index !== "unit") if (ann[id].index !== ann[id].span[0]) continue;

      const ann_obj: Annotation = {
        variable: ann[id].variable,
        value: ann[id].value,
        field: ann[id].field,
        offset: ann[id].offset,
        length: ann[id].length,
      };

      if (SpanAndText) {
        const span = ann[id].span;
        const text = tokens
          .slice(span[0], span[1] + 1)
          .map((t: Token, i: number) => {
            let string = t.text;
            if (i > 0) string = t.pre + string;
            if (i < span[1] - span[0]) string = string + t.post;
            return string;
          })
          .join("");
        ann_obj["text"] = text;
        ann_obj["token_span"] = span;
      }

      un_ann.push(ann_obj);
    }
    return un_ann;
  }, []);
  return uniqueAnnotations;
};

export const exportFieldAnnotations = (fieldAnnotations: FieldAnnotations) => {
  if (!fieldAnnotations) return [];
  if (Object.keys(fieldAnnotations).length === 0) return [];
  const fa: Annotation[] = [];
  for (const field of Object.keys(fieldAnnotations)) {
    for (const key of Object.keys(fieldAnnotations[field])) {
      fa.push({ field, ...fieldAnnotations[field][key] });
    }
  }
  return fa;
};

export const importSpanAnnotations = (
  annotationsArray: Annotation[],
  tokens: Token[],
  currentAnnotations = {}
): SpanAnnotations => {
  if (annotationsArray.length === 0) return { ...currentAnnotations };
  // import span annotations. Uses the offset to match annotations to tokens
  const importedAnnotations = prepareSpanAnnotations(annotationsArray);
  let trackAnnotations: any = {};
  let matchedAnnotations: any = [];

  for (let token of tokens) {
    findMatches(token, importedAnnotations, trackAnnotations, matchedAnnotations);
  }

  const codeCounter: { [key: string]: number } = {};
  const annArray = [];
  for (let matchedAnnotation of matchedAnnotations) {
    if (!codeCounter[matchedAnnotation.id]) codeCounter[matchedAnnotation.id] = 0;
    codeCounter[matchedAnnotation.id]++;
    annArray.push(matchedAnnotation);
  }

  let addAnnotations = [];
  for (let ann of annArray) {
    for (let i = ann.span[0]; i <= ann.span[1]; i++) {
      let newAnnotation = { ...ann };
      newAnnotation.index = i;
      addAnnotations.push(newAnnotation);
    }
  }

  for (let ann of annArray) {
    currentAnnotations = toggleSpanAnnotation(currentAnnotations, ann, false, false);
  }

  return currentAnnotations;
};

export const importFieldAnnotations = (annotationsArray: Annotation[]) => {
  const fieldAnnotations: FieldAnnotations = {};
  for (let a of annotationsArray || []) {
    const field = a.field || "";
    if (a.offset == null) {
      if (!fieldAnnotations[field]) fieldAnnotations[field] = {};
      const key = a.variable + "." + a.value;
      fieldAnnotations[field][key] = {
        variable: a.variable,
        value: a.value,
        color: a.color,
      };
    }
  }
  return fieldAnnotations;
};

export const toggleSpanAnnotation = (
  annotations: SpanAnnotations,
  newAnnotation: Annotation,
  rm: boolean,
  keep_empty: boolean
): SpanAnnotations => {
  // Add span annotations in a way that prevents double assignments of the same value to the same token
  const id = createId(newAnnotation);
  const newSpan = newAnnotation.span;

  for (let index = newSpan[0]; index <= newSpan[1]; index++) {
    // Check if there exists an annotation with the same variable+value at this position and if so delete it
    if (annotations[index]) {
      if (annotations[index][id]) {
        // if an annotation with the same id exists, iterating over it's span to remove entirely
        const old = annotations[index][id];
        const oldSpan = old.span;
        for (let i = oldSpan[0]; i <= oldSpan[1]; i++) {
          // since we go from the span, we are actually certain the annotation exists at these indices
          // but we just double check for stability
          if (annotations[i]) {
            if (annotations[i][id]) {
              if (i < newSpan[0] || i > newSpan[1]) {
                // if the old annotation is outside of the new annotation span, don't delete this part, but
                // update it's span to exclude the part covered by the new annotation
                if (i > newSpan[1]) annotations[i][id].span[0] = newSpan[1] + 1;
                if (i < newSpan[0]) annotations[i][id].span[1] = newSpan[0] - 1;
                continue;
              }

              if (
                keep_empty &&
                Object.values(annotations[i]).filter((a) => a.variable === old.variable).length ===
                  1
              ) {
                // if keep_empty, don't remove the annotation, but replace it with value "EMPTY"
                // (note that we still remove the old value below)
                annotations[i][createId({ variable: old.variable, value: "EMPTY" })] = {
                  ...annotations[i][id],
                  value: "EMPTY",
                };
              }
              delete annotations[i][id];
              if (Object.keys(annotations[i]).length === 0) {
                // if there are no annotations for this position left, delete the entry
                delete annotations[i];
              }
            }
          }
        }
      }
    }

    if (!rm) {
      // add the annotation
      if (!annotations[index]) annotations[index] = {};
      delete annotations[index][createId({ ...newAnnotation, value: "EMPTY" })];

      annotations[index][id] = {
        index: index,
        variable: newAnnotation.variable,
        span: [newAnnotation.span[0], newAnnotation.span[1]],
        length: newAnnotation.length,
        value: newAnnotation.value,
        field: newAnnotation.field,
        offset: newAnnotation.offset,
        color: newAnnotation.color,
      };
    }
  }

  return annotations;
};

const prepareSpanAnnotations = (annotations: Annotation[]): SpanAnnotations => {
  if (!annotations) return {};
  // create an object where the key is a field+offset, and the
  // value is an array that tells which ids (variable|value) start and end there
  // used in Tokens for matching to token indices
  return annotations.reduce((obj, ann) => {
    // annotations are only span annotations if they have a field, offset and length
    if (ann.field == null || ann.offset == null || ann.length == null) return obj;

    if (!obj[ann.field]) obj[ann.field] = {};
    if (!obj[ann.field][ann.offset]) obj[ann.field][ann.offset] = { start: [], end: [] };
    if (!obj[ann.field][ann.offset + ann.length - 1])
      obj[ann.field][ann.offset + ann.length - 1] = { start: [], end: [] };
    obj[ann.field][ann.offset].start.push(ann); // for the starting point the full annotation is given, so that we have all the information
    obj[ann.field][ann.offset + ann.length - 1].end.push(createId(ann)); // for the ending point we just need to know the id
    return obj;
  }, {} as any);
};

const findMatches = (
  token: Token,
  importedAnnotations: any,
  trackAnnotations: any,
  matchedAnnotations: any
) => {
  const start = token.offset;
  const end = token.offset + token.length + token.post.length - 1;
  if (!importedAnnotations[token.field]) return;
  const fieldAnnotations = importedAnnotations[token.field];

  for (let i = start; i <= end; i++) {
    if (fieldAnnotations[i]) {
      for (let annotation of fieldAnnotations[i].start) {
        const id = createId(annotation);

        trackAnnotations[id] = {
          ...token,
          id,
          variable: annotation.variable,
          value: annotation.value,
          offset: annotation.offset,
          length: null,
          span: [token.index],
          color: annotation.color,
        };
      }

      for (let id of fieldAnnotations[i].end) {
        if (!trackAnnotations[id]) continue;
        trackAnnotations[id].span.push(token.index);
        trackAnnotations[id].length = token.offset + token.length - trackAnnotations[id].offset;
        matchedAnnotations.push(trackAnnotations[id]);
        delete trackAnnotations[id];
      }
    }
  }
};
