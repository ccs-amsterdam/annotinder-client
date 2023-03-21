import {
  Annotation,
  Code,
  CodeHistory,
  SpanAnnotations,
  RelationAnnotations,
  FieldAnnotations,
  SetState,
} from "../../../types";
import { toggleSpanAnnotation, toggleRelationAnnotation, createSpanId } from "./annotations";

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

  async updateSpanAnnotations(annotation: Annotation, rm: boolean, keep_empty: boolean = false) {
    let newSpanAnnotations: SpanAnnotations;
    // first retrieve the spanAnnotations state without updating
    await this.setSpanAnnotations((spanAnnotations) => {
      newSpanAnnotations = toggleSpanAnnotation(spanAnnotations, annotation, rm, keep_empty);
      return spanAnnotations;
    });

    if (!rm)
      this.setCodeHistory((codeHistory: CodeHistory) =>
        updateCodeHistory(codeHistory, annotation.variable, annotation.value)
      );

    this.setRelationAnnotations((relationAnnotations) =>
      syncRelationsToSpans(newSpanAnnotations, relationAnnotations)
    );

    this.setSpanAnnotations({ ...newSpanAnnotations });
  }

  async updateRelationAnnotations(from: Annotation, to: Annotation, relation: Code, rm: boolean) {
    let newRelationAnnotations: RelationAnnotations;
    this.setRelationAnnotations((relationAnnotations) => {
      newRelationAnnotations = toggleRelationAnnotation(
        relationAnnotations,
        from,
        to,
        relation,
        rm
      );

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

function spanAnnotationNodeLookup(annotations: SpanAnnotations) {
  const spanLookup: Record<string, Annotation> = {};

  for (const positionAnnotations of Object.values(annotations)) {
    for (const ann of Object.values(positionAnnotations)) {
      if (ann.index !== ann.span[0]) continue; // relations are only included on first token of span
      spanLookup[createSpanId(ann)] = ann;
    }
  }
  return spanLookup;
}
