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

export const createRelationNodeId = (annotation: any): string => {
  return (
    annotation.field + "|" + annotation.offset + "|" + annotation.variable + "|" + annotation.value
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

      //   if (ann[id].parents)
      //     ann_obj["parents"] = ann[id].parents.map((p) => {
      //       const parent = {
      //         field: p.field,
      //         variable: p.variable,
      //         value: p.value,
      //         offset: p.offset,
      //         relationVariable: p.relationVariable,
      //         relationValue: p.relationValue,
      //         //relationColor: p.relationColor,
      //         //color: p.color,
      //       };

      //       if (SpanAndText) {
      //         const span = p.span;
      //         const text = tokens
      //           .slice(span[0], span[1] + 1)
      //           .map((t: Token, i: number) => {
      //             let string = t.text;
      //             if (i > 0) string = t.pre + string;
      //             if (i < span[1] - span[0]) string = string + t.post;
      //             return string;
      //           })
      //           .join("");
      //         parent["text"] = text;
      //         parent["span"] = span;
      //       }
      //       return parent;
      //     });

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
          ann.from.span = relation.from.span;
          ann.from.text = getSpanText(relation.from.span, tokens);
          ann.to.span = relation.to.span;
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

export const importRelationAnnotations = (annotationsArray: Annotation[]) => {
  const relationAnnotations: RelationAnnotations = {};
  for (let a of annotationsArray || []) {
    if (a.type !== "relation") continue;
    const fromId = createRelationNodeId(a.from);
    const toId = createRelationNodeId(a.to);
    const relationId = createId(a);

    if (!relationAnnotations[fromId]) relationAnnotations[fromId] = {};
    if (!relationAnnotations[fromId][toId]) relationAnnotations[fromId][toId] = {};
    relationAnnotations[fromId][toId][relationId] = a;
  }
  return relationAnnotations;
};

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
        const oldSpan = old.span;
        for (let i = oldSpan[0]; i <= oldSpan[1]; i++) {
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

export const syncRelationsToSpans = (
  spanAnnotations: SpanAnnotations,
  relationAnnotations: RelationAnnotations
): RelationAnnotations => {
  if (!spanAnnotations || !relationAnnotations) return {};
  const spanAnn = spanAnnotationNodeLookup(spanAnnotations);

  for (let fromId of Object.keys(relationAnnotations)) {
    if (!spanAnn[fromId]) {
      delete relationAnnotations[fromId];
      continue;
    }
    for (let toId of Object.keys(relationAnnotations[fromId])) {
      if (!spanAnn[toId]) {
        delete relationAnnotations[fromId][toId];
        continue;
      }

      for (let a of Object.values(relationAnnotations[fromId][toId])) {
        a.from = spanAnn[fromId];
        a.to = spanAnn[toId];
      }
    }
  }

  return relationAnnotations;
};

export const syncSpansToRelations = (
  spanAnnotations: SpanAnnotations,
  relationAnnotations: RelationAnnotations
): RelationAnnotations => {
  if (!spanAnnotations || !relationAnnotations) return {};
  const spanAnn = spanAnnotationNodeLookup(spanAnnotations);

  for (let fromId of Object.keys(relationAnnotations)) {
    if (!spanAnn[fromId]) {
      delete relationAnnotations[fromId];
      continue;
    }
    for (let toId of Object.keys(relationAnnotations[fromId])) {
      if (!spanAnn[toId]) {
        delete relationAnnotations[fromId][toId];
        continue;
      }

      for (let a of Object.values(relationAnnotations[fromId][toId])) {
        a.from = spanAnn[fromId];
        a.to = spanAnn[toId];
      }
    }
  }

  return relationAnnotations;
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
  //annotations: SpanAnnotations,
  from: Annotation,
  to: Annotation,
  relation: Code,
  rm: boolean
) => {
  const fromId = createRelationNodeId(from);
  const toId = createRelationNodeId(to);
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
  const fromId = createRelationNodeId(from);
  const toId = createRelationNodeId(to);

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

const spanAnnotationNodeLookup = (annotations: SpanAnnotations) => {
  const spanLookup: Record<string, Annotation> = {};

  for (const positionAnnotations of Object.values(annotations)) {
    for (const ann of Object.values(positionAnnotations)) {
      if (ann.index !== ann.span[0]) continue; // relations are only included on first token of span
      spanLookup[createRelationNodeId(ann)] = ann;
    }
  }
  return spanLookup;
};

const prepareSpanAnnotations = (annotations: Annotation[]): SpanAnnotations => {
  if (!annotations) return {};
  // create an object where the key is a field+offset, and the
  // value is an array that tells which ids (variable|value) start and end there
  // used in Tokens for matching to token indices
  return annotations.reduce((obj, ann) => {
    // annotations are only span annotations if they have a field, offset and length
    if (ann.type !== "span") return obj;
    //if (ann.field == null || ann.offset == null || ann.length == null) return obj;

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
          parents: annotation.parents,
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
