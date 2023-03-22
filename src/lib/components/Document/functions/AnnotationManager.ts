import {
  Annotation,
  Code,
  CodeHistory,
  SpanAnnotations,
  RelationAnnotations,
  FieldAnnotations,
  SetState,
} from "../../../types";
import { toggleSpanAnnotation, toggleRelationAnnotation, createId } from "./annotations";

export default class AnnotationManager {
  setSpanAnnotations: SetState<SpanAnnotations>;
  setRelationAnnotations: SetState<RelationAnnotations>;
  setFieldAnnotations: SetState<FieldAnnotations>;
  setCodeHistory: SetState<CodeHistory>;

  constructor(
    setSpanAnnotations: SetState<SpanAnnotations>,
    setRelationAnnotations: SetState<RelationAnnotations>,
    setFieldAnnotations: SetState<FieldAnnotations>,
    setCodeHistory: SetState<CodeHistory>
  ) {
    this.setSpanAnnotations = setSpanAnnotations;
    this.setRelationAnnotations = setRelationAnnotations;
    this.setFieldAnnotations = setFieldAnnotations;
    this.setCodeHistory = setCodeHistory;
  }

  updateSpanAnnotations(annotation: Annotation, rm: boolean, keep_empty: boolean = false) {
    this.setSpanAnnotations((spanAnnotations) => {
      const newSpanAnnotations = toggleSpanAnnotation(spanAnnotations, annotation, rm, keep_empty);

      if (!rm)
        this.setCodeHistory((codeHistory: CodeHistory) =>
          updateCodeHistory(codeHistory, annotation.variable, annotation.value)
        );

      this.setRelationAnnotations((relationAnnotations) => {
        let newRelationAnnotations = syncRelationsToSpans(newSpanAnnotations, relationAnnotations);
        newRelationAnnotations = cleanRelationsRecursively(newRelationAnnotations);
        return { ...newRelationAnnotations };
      });

      return { ...newSpanAnnotations };
    });
  }

  updateRelationAnnotations(from: Annotation, to: Annotation, relation: Code, rm: boolean) {
    this.setRelationAnnotations((relationAnnotations) => {
      let newRelationAnnotations = toggleRelationAnnotation(
        relationAnnotations,
        from,
        to,
        relation,
        rm
      );
      newRelationAnnotations = cleanRelationsRecursively(newRelationAnnotations);
      return { ...newRelationAnnotations };
    });
  }
}

function updateCodeHistory(codeHistory: CodeHistory, variable: string, value: string | number) {
  if (!codeHistory?.[variable]) codeHistory[variable] = [];
  return {
    ...codeHistory,
    [variable]: [value, ...codeHistory[variable].filter((v: string) => v !== value)],
  };
}

function syncRelationsToSpans(
  spanAnnotations: SpanAnnotations,
  relationAnnotations: RelationAnnotations
): RelationAnnotations {
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
}

/**
 * If there are nested relations, we need to loop over the relations multiple times
 * to remove all relations
 */
function cleanRelationsRecursively(relationAnnotations: RelationAnnotations) {
  let exists: Record<string, boolean> = {};
  for (let fromKey of Object.keys(relationAnnotations || {})) {
    if (!relationAnnotations[fromKey]) continue;
    for (let toKey of Object.keys(relationAnnotations[fromKey])) {
      exists[fromKey] = true;
      exists[toKey] = true;
    }
  }

  let done = false;
  while (!done) {
    done = true;
    const newExists: Record<string, boolean> = {};
    if (!relationAnnotations) return {};
    for (let fromKey of Object.keys(relationAnnotations)) {
      if (!exists[fromKey]) {
        done = false;
        delete relationAnnotations[fromKey];
        continue;
      }
      for (let toKey of Object.keys(relationAnnotations[fromKey])) {
        if (!exists[toKey]) {
          done = false;
          delete relationAnnotations[fromKey][toKey];
          continue;
        }
        newExists[fromKey] = true;
        newExists[toKey] = true;
      }
    }
    exists = newExists;
  }

  return relationAnnotations;
}

function spanAnnotationNodeLookup(annotations: SpanAnnotations) {
  const spanLookup: Record<string, Annotation> = {};

  for (const positionAnnotations of Object.values(annotations)) {
    for (const ann of Object.values(positionAnnotations)) {
      if (ann.index !== ann.span[0]) continue; // relations are only included on first token of span
      spanLookup[createId(ann)] = ann;
    }
  }
  return spanLookup;
}
