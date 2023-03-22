import {
  Code,
  Token,
  Annotation,
  AnnotationMap,
  SpanAnnotations,
  FieldAnnotations,
  RelationAnnotations,
  Span,
} from "../../../types";

export const createValueId = (annotation: any): string => {
  return annotation.variable + "|" + annotation.value;
};

export const createFieldId = (annotation: any): string => {
  return annotation.variable + "=" + annotation.value + "@" + annotation.field;
};

export const createSpanId = (annotation: any): string => {
  return (
    annotation.variable + "=" + annotation.value + "@" + annotation.field + "#" + annotation.offset
  );
};

export const createRelationId = (annotation: any): string => {
  const fromId = createId(annotation.from);
  const toId = createId(annotation.to);
  return `${fromId}-${annotation.variable}=${annotation.value}-${toId}`;
};

export const createId = (annotation: any): string => {
  if (annotation.type === "span") return createSpanId(annotation);
  if (annotation.type === "field") return createFieldId(annotation);
  if (annotation.type === "relation") return createRelationId(annotation);
  return "";
};

export const exportSpanAnnotations = (
  annotations: SpanAnnotations,
  tokens: Token[]
): Annotation[] => {
  // export annotations from the object format (for fast use in the annotator) to array format
  if (!annotations) return [];
  if (Object.keys(annotations).length === 0) return [];
  const uniqueAnnotations = Object.keys(annotations).reduce((un_ann, index) => {
    const ann = annotations[index];
    for (let id of Object.keys(ann)) {
      if (ann[id].type === "span" && ann[id].index !== ann[id].span[0]) continue;

      const span = ann[id].span;

      const ann_obj: Annotation = {
        type: "span",
        id: createSpanId(ann[id]),
        variable: ann[id].variable,
        value: ann[id].value,
        field: ann[id].field,
        offset: ann[id].offset,
        length: ann[id].length,
        token_span: span,
        text: getSpanText(span, tokens),
      };

      un_ann.push(ann_obj);
    }
    return un_ann;
  }, []);
  return uniqueAnnotations;
};

export const exportRelationAnnotations = (
  relationAnnotations: RelationAnnotations,
  tokens: Token[]
) => {
  if (!relationAnnotations) return [];
  const ra: Annotation[] = [];

  for (const from of Object.values(relationAnnotations)) {
    for (const to of Object.values(from)) {
      for (const relation of Object.values(to)) {
        const fromId = createId(relation.from);
        const toId = createId(relation.to);

        const ann: Annotation = {
          type: "relation",
          id: createId(relation),
          field: relation.field,
          variable: relation.variable,
          value: relation.value,
          fromId,
          toId,
          token_span: getRelationEdge(relation.from, relation.to),
          text: recursiveGetText(relation.from, relation.to, tokens),
        };

        ra.push(ann);
      }
    }
  }
  return ra;
};

function getRelationEdge(from: Annotation, to: Annotation) {
  const fromIndex =
    from.type === "relation" ? getRelationEdge(from.from, from.to)[0] : from.span[0];
  const toIndex = to.type === "relation" ? getRelationEdge(to.from, to.to)[0] : to.span[0];
  return [fromIndex, toIndex];
}

function recursiveGetText(from: Annotation, to: Annotation, tokens: Token[]) {
  const fromText =
    from.type === "relation"
      ? "(" + recursiveGetText(from.from, from.to, tokens) + ")"
      : getSpanText(from.span, tokens);
  const toText =
    to.type === "relation"
      ? "(" + recursiveGetText(to.from, to.to, tokens) + ")"
      : getSpanText(to.span, tokens);
  return fromText + " → " + toText;
}

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
 * Uses the annotation offset and length to find the token indices for span annotations
 */
export const addSpanIndices = (annotations: Annotation[], tokens: Token[]) => {
  for (let a of annotations || []) {
    if (a.type !== "span") continue;

    a.span = [
      getIndexFromOffset(tokens, a.field, a.offset),
      getIndexFromOffset(tokens, a.field, a.offset + a.length - 1),
    ];
  }
  return annotations;
};

/**
 * transforms the annotations into a format that is fast to use in the annotator.
 */
export const importSpanAnnotations = (annotationsArray: Annotation[]): SpanAnnotations => {
  let spanAnnotations: SpanAnnotations = {};
  for (let a of annotationsArray || []) {
    if (a.type !== "span") continue;

    for (let i = a.span[0]; i <= a.span[1]; i++) {
      if (!spanAnnotations[i]) spanAnnotations[i] = {};
      spanAnnotations[i][createValueId(a)] = { ...a, index: i };
    }
  }

  console.log(spanAnnotations);
  return spanAnnotations;
};

/**
 * Recursively nests the span annotations within relation annotations
 */
export const importRelationAnnotations = (annotationsArray: Annotation[]) => {
  const relationAnnotations: RelationAnnotations = {};
  const annotationMap: AnnotationMap = {};
  for (let a of annotationsArray || []) annotationMap[a.id] = a;

  console.log(annotationsArray);
  console.log(annotationMap);
  for (let a of annotationsArray || []) {
    if (a.type !== "relation") continue;

    [a.from, a.to] = getNestedRelations(a.fromId, a.toId, annotationMap);
    if (!a.from || !a.to) continue;
    a.edge = getRelationEdge(a.from, a.to);

    if (!relationAnnotations[a.fromId]) relationAnnotations[a.fromId] = {};
    if (!relationAnnotations[a.fromId][a.toId]) relationAnnotations[a.fromId][a.toId] = {};
    relationAnnotations[a.fromId][a.toId][createValueId(a)] = a;
  }
  return relationAnnotations;
};

function getNestedRelations(fromId: string, toId: string, annotationMap: AnnotationMap) {
  const [from, to] = [annotationMap[fromId], annotationMap[toId]];
  if (!from || !to) return [null, null];
  if (from.type === "relation") {
    [from.from, from.to] = getNestedRelations(from.fromId, from.toId, annotationMap);
    if (!from.from || !from.to) return [null, null];
  }
  if (to.type === "relation") {
    [to.from, to.to] = getNestedRelations(to.fromId, to.toId, annotationMap);
    if (!to.from || !to.to) return [null, null];
  }
  return [from, to];
}

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
  const id = createValueId(newAnnotation);
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
                annotations[i][createValueId({ variable: old.variable, value: "EMPTY" })] = {
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
      delete annotations[index][createValueId({ ...newAnnotation, value: "EMPTY" })];

      annotations[index][id] = {
        type: "span",
        id: createId({ ...newAnnotation, type: "span" }),
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
  const fromId = createId(from);
  const toId = createId(to);
  const relationId = relation.variable + "|" + relation.code;

  if (!annotations[fromId]) annotations[fromId] = {};
  if (!annotations[fromId][toId]) annotations[fromId][toId] = {};

  if (!rm) {
    const r: Annotation = {
      type: "relation",
      variable: relation.variable,
      value: relation.code,
      color: relation.color,
      edge: getRelationEdge(from, to),
      from,
      to,
    };
    r.id = createId(r);
    annotations[fromId][toId][relationId] = r;
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
  const fromId = createId(from);
  const toId = createId(to);

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
