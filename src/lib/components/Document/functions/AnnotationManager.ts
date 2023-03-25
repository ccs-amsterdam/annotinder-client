import {
  Annotation,
  Span,
  Code,
  Unit,
  CodeHistory,
  AnnotationMap,
  AnnotationDictionary,
  SetState,
  AnnotationID,
  Token,
  AnnotationLibrary,
  VariableValueMap,
  TokenAnnotations,
} from "../../../types";

export default class AnnotationManager {
  setAnnotationLib: SetState<AnnotationLibrary>;

  constructor(setAnnotationLib: SetState<AnnotationLibrary>) {
    this.setAnnotationLib = setAnnotationLib;
  }

  addAnnotation(annotation: Annotation) {
    this.setAnnotationLib((annotationLib) => {
      annotation.id = createId();
      annotation.positions = getTokenPositions(annotationLib.annotations, annotation);
      annotationLib.annotations[annotation.id] = annotation;
      annotationLib.codeHistory = updateCodeHistory(annotationLib.codeHistory, annotation);

      addToTokenDictionary(annotationLib.byToken, annotation);
      return { ...annotationLib };
    });
  }

  rmAnnotation(id: AnnotationID, keep_empty: boolean = false) {
    this.setAnnotationLib((annotationLib) => {
      if (!annotationLib?.annotations?.[id]) return annotationLib;
      if (keep_empty) {
        annotationLib.annotations[id].value = "EMPTY";
      } else {
        delete annotationLib.annotations[id];
      }
      annotationLib.annotations = rmBrokenRelations(annotationLib.annotations);
      annotationLib.byToken = newTokenDictionary(annotationLib.annotations);
      return { ...annotationLib };
    });
  }

  createSpanAnnotation(code: Code, from: number, to: number, tokens: Token[]) {
    const annotation: Annotation = {
      type: "span",
      variable: code.variable,
      value: code.code,
      color: code.color,
      span: [from, to],
      offset: tokens[from].offset,
      length: tokens[to].length + tokens[to].offset - tokens[from].offset,
      field: tokens[from].field,
      text: getSpanText([from, to], tokens),
    };
    this.addAnnotation(annotation);
  }

  createRelationAnnotation(code: Code, from: Annotation, to: Annotation) {
    const annotation: Annotation = {
      type: "relation",
      variable: code.variable,
      value: code.code,
      color: code.color,
      fromId: from.id,
      toId: to.id,
    };
    this.addAnnotation(annotation);
  }
}

export function createAnnotationLibrary(unit: Unit): AnnotationLibrary {
  let annotationCopy = unit?.unit?.annotations || [];
  annotationCopy = annotationCopy.map((a) => ({ ...a }));
  const annotationArray = addTokenIndices(annotationCopy, unit.unit.tokens);
  const annotations: AnnotationDictionary = {};
  for (let a of annotationArray) {
    if (a.id == null) a.id = createId();
    annotations[a.id] = a;
  }

  for (let a of Object.values(annotations) || []) {
    a.positions = getTokenPositions(annotations, a);
  }

  return {
    annotations,
    byToken: newTokenDictionary(annotations),
    codeHistory: initializeCodeHistory(annotationCopy),
  };
}

function newTokenDictionary(annotations: AnnotationDictionary) {
  const byToken: TokenAnnotations = {};
  for (let annotation of Object.values(annotations)) {
    addToTokenDictionary(byToken, annotation);
  }
  return byToken;
}

function addToTokenDictionary(byToken: TokenAnnotations, annotation: Annotation) {
  if (!annotation.positions) return;
  annotation.positions.forEach((i) => {
    if (!byToken[i]) byToken[i] = [];
    byToken[i].push(annotation.id);
  });
}

function updateCodeHistory(codeHistory: CodeHistory, annotation: Annotation) {
  const { variable, value } = annotation;
  if (!codeHistory?.[variable]) codeHistory[variable] = [];
  return {
    ...codeHistory,
    [variable]: [value, ...codeHistory[variable].filter((v: string) => v !== value)],
  };
}

function rmBrokenRelations(annDict: AnnotationDictionary) {
  const nBefore = Object.keys(annDict).length;
  for (let a of Object.values(annDict)) {
    if (a.type !== "relation") continue;
    if (!annDict[a.fromId] || !annDict[a.toId]) delete annDict[a.id];
  }

  // if relations were removed, we need to repeat the procedure to see
  // if other relations refered to the now missing ones
  if (Object.keys(annDict).length < nBefore) return rmBrokenRelations(annDict);

  return annDict;
}

/**
 * Uses the annotation offset and length to find the token indices for span annotations
 */
export const addTokenIndices = (annotations: Annotation[], tokens: Token[]) => {
  const annMap: AnnotationMap = {};

  // first add the span token indices, and simultaneously create an annotation map
  for (let a of annotations || []) {
    if (a.type === "span") {
      a.span = [
        getIndexFromOffset(tokens, a.field, a.offset),
        getIndexFromOffset(tokens, a.field, a.offset + a.length - 1),
      ];
    }
    annMap[a.id] = a;
  }

  return annotations;
};

function getIndexFromOffset(tokens: Token[], field: string, offset: number) {
  for (let token of tokens) {
    if (token.field !== field) continue;
    if (token.offset + token.length > offset) return token.index;
  }
  return null;
}

const initializeCodeHistory = (annotations: Annotation[]): CodeHistory => {
  const vvh: VariableValueMap = {};

  for (let annotation of annotations) {
    if (!vvh[annotation.variable]) {
      vvh[annotation.variable] = { [annotation.value]: true };
    } else {
      vvh[annotation.variable][annotation.value] = true;
    }
  }

  const codeHistory: CodeHistory = {};
  for (let variable of Object.keys(vvh)) {
    codeHistory[variable] = Object.keys(vvh[variable]);
  }

  return codeHistory;
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

function getTokenPositions(
  annotations: AnnotationDictionary,
  annotation: Annotation,
  positions: Set<number> = new Set()
) {
  if (!positions) positions = new Set<number>();

  if (annotation.type === "span") {
    for (let i = annotation.span[0]; i <= annotation.span[1]; i++) {
      positions.add(i);
    }
  }
  if (annotation.type === "relation") {
    // recursively get the spans, and add the annotationId there
    getTokenPositions(annotations, annotations[annotation.fromId], positions);
    getTokenPositions(annotations, annotations[annotation.toId], positions);
  }
  return positions;
}

const createId = () => {
  return Date.now().toString();
};
