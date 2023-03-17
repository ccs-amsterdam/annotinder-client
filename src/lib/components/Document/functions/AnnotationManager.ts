import {
  Annotation,
  Code,
  CodeHistory,
  SpanAnnotations,
  RelationAnnotations,
  FieldAnnotations,
  SetState,
} from "../../../types";
import {
  syncRelationsToSpans,
  toggleSpanAnnotation,
  toggleRelationAnnotation,
} from "./annotations";

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

      this.setRelationAnnotations((relationAnnotations) =>
        syncRelationsToSpans(newSpanAnnotations, relationAnnotations)
      );

      this.setCodeHistory((codeHistory: CodeHistory) => {
        if (!codeHistory?.[annotation.variable]) codeHistory[annotation.variable] = [];
        return {
          ...codeHistory,
          [annotation.variable]: [
            annotation.value,
            ...codeHistory[annotation.variable].filter((v: string) => v !== annotation.value),
          ],
        };
      });

      return { ...newSpanAnnotations };
    });
  }

  updateRelationAnnotations(from: Annotation, to: Annotation, relation: Code, rm: boolean) {
    this.setRelationAnnotations((relationAnnotations) => {
      const newRelationAnnotations = toggleRelationAnnotation(
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
