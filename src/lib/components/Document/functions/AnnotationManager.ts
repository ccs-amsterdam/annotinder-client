import {
  Annotation,
  Code,
  CodeHistory,
  SpanAnnotations,
  AnnotationMap,
  RelationAnnotation,
  FieldAnnotations,
  SetState,
} from "../../../types";
import { toggleSpanAnnotation, toggleRelationAnnotation } from "./annotations";

export default class AnnotationManager {
  setSpanAnnotations: SetState<SpanAnnotations>;
  setRelationAnnotations: SetState<RelationAnnotation[]>;
  setFieldAnnotations: SetState<FieldAnnotations>;
  setCodeHistory: SetState<CodeHistory>;

  constructor(
    setSpanAnnotations: SetState<SpanAnnotations>,
    setRelationAnnotations: SetState<RelationAnnotation[]>,
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
        let newRelationAnnotations = rmMissingSpanFromRelations(
          newSpanAnnotations,
          relationAnnotations
        );
        return [...newRelationAnnotations];
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
      newRelationAnnotations = rmMissingRelationFromRelations(newRelationAnnotations);
      return [...newRelationAnnotations];
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

function rmMissingSpanFromRelations(
  spanAnnotations: SpanAnnotations,
  relationAnnotations: RelationAnnotation[]
): RelationAnnotation[] {
  if (!spanAnnotations || !relationAnnotations) return [];
  const spanAnn = spanAnnotationNodeLookup(spanAnnotations);

  relationAnnotations = relationAnnotations.filter((relation) => {
    if (relation.from.type === "span" && !spanAnn[relation.from.id]) return false;
    if (relation.to.type === "span" && !spanAnn[relation.to.id]) return false;
    return true;
  });

  return rmMissingRelationFromRelations(relationAnnotations);
}

/**
 * Removes relations if they refer to relations that have been removed.
 *
 */
function rmMissingRelationFromRelations(
  relationAnnotations: RelationAnnotation[]
): RelationAnnotation[] {
  const relMap: AnnotationMap = {};
  for (let ra of relationAnnotations) relMap[ra.id] = ra;

  const nBefore = relationAnnotations.length;
  relationAnnotations = relationAnnotations.filter((ra) => {
    const missingFrom = ra.from.type === "relation" && !relMap[ra.fromId];
    const missingTo = ra.to.type === "relation" && !relMap[ra.toId];
    return !missingFrom && !missingTo;
  });

  // if relations were removed, we need to repeat the procedure to see
  // if other relations refered to the now missing ones
  if (relationAnnotations.length < nBefore)
    return rmMissingRelationFromRelations(relationAnnotations);

  return relationAnnotations;
}

function spanAnnotationNodeLookup(annotations: SpanAnnotations) {
  const spanLookup: Record<string, boolean> = {};

  for (const positionAnnotations of Object.values(annotations)) {
    for (const ann of Object.values(positionAnnotations)) {
      if (ann.index !== ann.span[0]) continue;
      spanLookup[ann.id] = true;
    }
  }
  return spanLookup;
}
