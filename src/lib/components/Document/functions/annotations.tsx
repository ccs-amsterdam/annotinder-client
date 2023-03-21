import {
  Code,
  Token,
  Annotation,
  SpanAnnotations,
  FieldAnnotations,
  RelationAnnotations,
  Span,
} from "../../../types";

export const createId = (annotation: any): string => {
  return annotation.variable + "|" + annotation.value;
};

export const createSpanId = (annotation: any): string => {
  return (
    annotation.variable + "=" + annotation.value + "@" + annotation.field + "#" + annotation.offset
  );
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
      if (index !== "unit") if (ann[id].index !== ann[id].span[0]) continue;

      const ann_obj: Annotation = {
        type: "span",
        variable: ann[id].variable,
        value: ann[id].value,
        field: ann[id].field,
        offset: ann[id].offset,
        length: ann[id].length,
        //color: ann[id].color,
      };

      if (SpanAndText) {
        const span = ann[id].span;
        const text = getSpanText(span, tokens);
        ann_obj["text"] = text;
        ann_obj["token_span"] = span;
      }

      un_ann.push(ann_obj);
    }
    return un_ann;
  }, []);
  return uniqueAnnotations;
};

export const exportRelationAnnotations = (
  relationAnnotations: RelationAnnotations,
  tokens: Token[],
  spanAndText = false
) => {
  if (!relationAnnotations) return [];
  const ra: Annotation[] = [];
  for (const from of Object.values(relationAnnotations)) {
    for (const to of Object.values(from)) {
      for (const relation of Object.values(to)) {
        const ann: Annotation = {
          type: "relation",
          field: relation.field,
          variable: relation.variable,
          value: relation.value,
          from: {
            field: relation.from.field,
            variable: relation.from.variable,
            value: relation.from.value,
            offset: relation.from.offset,
            length: relation.from.length,
          },
          to: {
            field: relation.to.field,
            variable: relation.to.variable,
            value: relation.to.value,
            offset: relation.to.offset,
            length: relation.to.length,
          },
        };
        if (spanAndText) {
          ann.from.token_span = relation.from.span;
          ann.from.text = getSpanText(relation.from.span, tokens);
          ann.to.token_span = relation.to.span;
          ann.to.text = getSpanText(relation.to.span, tokens);
        }

        ra.push(ann);
      }
    }
  }
  return ra;
};

export const exportFieldAnnotations = (fieldAnnotations: FieldAnnotations) => {
  if (!fieldAnnotations) return [];
  if (Object.keys(fieldAnnotations).length === 0) return [];
  const fa: Annotation[] = [];
  for (const field of Object.keys(fieldAnnotations)) {
    for (const key of Object.keys(fieldAnnotations[field])) {
      fa.push({ type: "field", field, ...fieldAnnotations[field][key] });
    }
  }
  return fa;
};

/**
 * Adds the token indices, and then transforms the annotations into a format that is fast to use in the annotator.
 */
export const importSpanAnnotations = (
  annotationsArray: Annotation[],
  tokens: Token[]
): SpanAnnotations => {
  let spanAnnotations: SpanAnnotations = {};
  for (let a of annotationsArray || []) {
    if (a.type !== "span") continue;

    a.span = [
      getIndexFromOffset(tokens, a.field, a.offset),
      getIndexFromOffset(tokens, a.field, a.offset + a.length - 1),
    ];
    if (a.span[0] == null || a.span[1] == null) continue;

    const id = createId(a);
    for (let i = a.span[0]; i <= a.span[1]; i++) {
      if (!spanAnnotations[i]) spanAnnotations[i] = {};
      spanAnnotations[i][id] = { ...a, index: i };
    }
  }

  return spanAnnotations;
};

/**
 * Adds the token indices to the from/to nodes, and then transforms the relation annotations into a format that is fast to use in the annotator.
 */
export const importRelationAnnotations = (annotationsArray: Annotation[], tokens: Token[]) => {
  const relationAnnotations: RelationAnnotations = {};

  for (let a of annotationsArray || []) {
    if (a.type !== "relation") continue;
    if (a.from?.offset == null || a.to?.offset == null) continue;

    a.from = getSpanAnnotationFromOffset(
      annotationsArray,
      a.from.field,
      a.from.offset,
      a.from.variable,
      a.from.value
    );
    a.to = getSpanAnnotationFromOffset(
      annotationsArray,
      a.to.field,
      a.to.offset,
      a.to.variable,
      a.to.value
    );

    const fromId = createSpanId(a.from);
    const toId = createSpanId(a.to);
    const relationId = createId(a);

    if (!relationAnnotations[fromId]) relationAnnotations[fromId] = {};
    if (!relationAnnotations[fromId][toId]) relationAnnotations[fromId][toId] = {};
    relationAnnotations[fromId][toId][relationId] = a;
  }
  return relationAnnotations;
};

/**
 * transforms the field annotations into a format that is fast to use in the annotator.
 */
export const importFieldAnnotations = (annotationsArray: Annotation[]) => {
  const fieldAnnotations: FieldAnnotations = {};
  for (let a of annotationsArray || []) {
    const field = a.field || "";
    if (a.type === "field") {
      if (!fieldAnnotations[field]) fieldAnnotations[field] = {};
      const key = a.variable + "." + a.value;
      fieldAnnotations[field][key] = {
        type: "field",
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
        // first, delete any relations to this annotations
        // if the new annotation overlaps with an existing annotations, loop over the existing annotation to remove it entirely
        const old = annotations[index][id];
        for (let i = old.span[0]; i <= old.span[1]; i++) {
          // since we go from the span, we are actually certain the annotation exists at these indices
          // but we just double check for stability
          if (annotations[i]) {
            if (annotations[i][id]) {
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
        type: "span",
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

  //if (update_relations) return updateRelations(annotations);
  return annotations;
};

/**
 * Relations are stored in the 'parent' field of the child annotation
 * (i.e. the relation is directed towards the parent).
 *
 * We only store the relation in the first annotation of the span. Note that
 * this annotation is also the only one that's used to export annotations
 */
export const toggleRelationAnnotation = (
  annotations: RelationAnnotations,
  from: Annotation,
  to: Annotation,
  relation: Code,
  rm: boolean
) => {
  const fromId = createSpanId(from);
  const toId = createSpanId(to);
  const relationId = relation.variable + "|" + relation.code;

  if (!annotations[fromId]) annotations[fromId] = {};
  if (!annotations[fromId][toId]) annotations[fromId][toId] = {};

  if (!rm) {
    annotations[fromId][toId][relationId] = {
      type: "relation",
      variable: relation.variable,
      value: relation.code,
      color: relation.color,
      from,
      to,
    };
  } else {
    if (annotations[fromId][toId][relationId]) delete annotations[fromId][toId][relationId];
  }

  if (!annotations[fromId][toId]) delete annotations[fromId][toId];
  if (!annotations[fromId]) delete annotations[fromId];

  return annotations;
};

export const getRelations = (
  annotations: RelationAnnotations,
  from: Annotation,
  to: Annotation
) => {
  const fromId = createSpanId(from);
  const toId = createSpanId(to);

  if (annotations[fromId] && annotations[fromId][toId]) {
    return annotations[fromId][toId];
  }
  return {};
};

const getSpanText = (span: Span, tokens: Token[]) => {
  const text = tokens
    .slice(span[0], span[1] + 1)
    .map((t: Token, i: number) => {
      let string = t.text;
      if (i > 0) string = t.pre + string;
      if (i < span[1] - span[0]) string = string + t.post;
      return string;
    })
    .join("");
  return text;
};

export const importTokenSpanAnnotations = (tokens: Token[]) => {
  // returns annotations
  if (tokens.length === 0) return [];
  let annotations: any = [];
  let codeTracker: any = {};
  let field = tokens[0].field;
  for (let i = 0; i < tokens.length; i++) {
    if (!tokens[i].annotations) {
      for (let annotation of Object.values(codeTracker)) annotations.push(annotation);
      codeTracker = {};
      continue;
    }

    let annotationDict: any = {};
    for (let annotation of tokens[i].annotations) {
      if (annotation.value === "") continue; // Whether to skip should be a parameter when importing

      annotationDict[annotation.name] = annotation.value;

      const prevTokenPost = i > 0 ? tokens[i - 1].post : "";
      if (codeTracker[annotation.name] == null)
        codeTracker[annotation.name] = {
          type: "span",
          index: i,
          variable: annotation.name,
          value: annotation.value,
          offset: tokens[i].offset,
          text: tokens[i].text,
          field: tokens[i].field,
          length: tokens[i].length,
        };
      if (codeTracker[annotation.name].value === annotation.value) {
        codeTracker[annotation.name].length =
          tokens[i].offset + tokens[i].length - codeTracker[annotation.name].offset;
        codeTracker[annotation.name].text += prevTokenPost + tokens[i].pre + tokens[i].post;
      }
    }

    for (let key of Object.keys(codeTracker)) {
      if (annotationDict[key] == null) {
        annotations.push(codeTracker[key]);
        delete codeTracker[key];
        continue;
      }
      if (annotationDict[key] !== codeTracker[key].value) {
        annotations.push(codeTracker[key]);
        codeTracker[key] = {
          type: "span",
          index: i,
          variable: key,
          value: annotationDict[key],
          offset: tokens[i].offset,
          text: tokens[i].text,
          field: tokens[i].field,
          length: tokens[i].length,
        };
      }
    }

    if (i < tokens.length - 1 && tokens[i + 1].field !== field) {
      for (let annotation of Object.values(codeTracker)) annotations.push(annotation);
      codeTracker = {};
      field = tokens[i].field;
      continue;
    }
  }

  for (let annotation of Object.values(codeTracker)) annotations.push(annotation);

  return annotations;
};

function getIndexFromOffset(tokens: Token[], field: string, offset: number) {
  for (let token of tokens) {
    if (token.field !== field) continue;
    if (token.offset + token.length > offset) return token.index;
  }
  return null;
}

function getSpanAnnotationFromOffset(
  annotations: Annotation[],
  field: string,
  offset: number,
  variable: string,
  value: string | number
) {
  for (let annotation of annotations) {
    if (annotation.type !== "span")
      if (
        annotation.field !== field ||
        annotation.variable !== variable ||
        annotation.value !== value
      )
        continue;
    if (annotation.offset + annotation.length > offset) return annotation;
  }
  return null;
}
