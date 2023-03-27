import { getColor } from "../../../functions/tokenDesign";
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
  VariableMap,
} from "../../../types";
import randomColor from "randomcolor";

export default class AnnotationManager {
  setAnnotationLib: SetState<AnnotationLibrary>;

  constructor(setAnnotationLib: SetState<AnnotationLibrary>) {
    this.setAnnotationLib = setAnnotationLib;
  }

  addAnnotation(annotation: Annotation) {
    this.setAnnotationLib((annotationLib) => {
      annotation.id = createId(annotationLib.annotations);
      annotation.positions = getTokenPositions(annotationLib.annotations, annotation);

      let annotations = { ...annotationLib.annotations };
      annotations[annotation.id] = annotation;
      annotations = rmEmptySpan(annotations, annotation);

      return {
        ...annotationLib,
        annotations,
        codeHistory: updateCodeHistory(annotationLib.codeHistory, annotation),
        byToken: newTokenDictionary(annotations),
      };
    });
  }

  rmAnnotation(id: AnnotationID, keep_empty: boolean = false) {
    this.setAnnotationLib((annotationLib) => {
      let annotations = { ...annotationLib.annotations };

      if (!annotations?.[id]) return annotationLib;
      if (keep_empty) annotations = addEmptySpan(annotations, id);
      delete annotations[id];

      annotations = rmBrokenRelations(annotations);

      return { ...annotationLib, annotations, byToken: newTokenDictionary(annotations) };
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

export function createAnnotationLibrary(
  unit: Unit,
  annotations: Annotation[],
  variableMap: VariableMap
): AnnotationLibrary {
  let annotationArray = annotations || [];
  annotationArray = annotationArray.map((a) => ({ ...a }));

  annotationArray = repairAnnotations(annotationArray, variableMap);
  annotationArray = addTokenIndices(annotationArray, unit.unit.tokens);
  const annotationDict: AnnotationDictionary = {};

  for (let a of annotationArray) {
    if (a.id == null) continue;
    annotationDict[a.id] = a;
  }
  for (let a of annotationArray) {
    if (a.id != null) continue;
    a.id = createId(annotationDict);
    annotationDict[a.id] = a;
  }

  for (let a of Object.values(annotationDict) || []) {
    a.positions = getTokenPositions(annotationDict, a);
  }

  return {
    annotations: annotationDict,
    byToken: newTokenDictionary(annotationDict),
    codeHistory: initializeCodeHistory(annotationArray),
    unitId: unit.unitId,
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
      if (!a.text) a.text = getSpanText(a.span, tokens);
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

function repairAnnotations(annotations: Annotation[], variableMap?: VariableMap) {
  for (let a of Object.values(annotations)) {
    if (!a.type) {
      if (a.offset != null) {
        a.type = "span";
      } else if (a.fromId != null) {
        a.type = "relation";
      } else {
        a.type = "field";
      }
    }

    if (variableMap) {
      const codeMap = variableMap[a.variable].codeMap;
      if (codeMap[a.value]) {
        a.color = getColor(a.value, codeMap);
      }
    }

    if (!a.color) {
      if (!a.color) a.color = randomColor({ seed: a.value, luminosity: "light" });
    }
  }

  return annotations;
}

function addEmptySpan(annotations: AnnotationDictionary, id: AnnotationID) {
  // check if this is the last annotation at this span. If not, don't add empty span
  const annotation = annotations[id];
  if (!annotation) return annotations;

  for (let a of Object.values(annotations)) {
    if (a.id === annotation.id || a.type !== "span") continue;
    if (
      a.field === annotation.field &&
      a.variable === annotation.variable &&
      a.span[0] === annotation.span[0] &&
      a.span[1] === annotation.span[1]
    )
      return annotations;
  }

  const emptyAnnotation = {
    ...annotations[id],
    id: createId(annotations),
    value: "EMPTY",
    color: "grey",
  };
  annotations[emptyAnnotation.id] = emptyAnnotation;
  return annotations;
}

function rmEmptySpan(annotations: AnnotationDictionary, annotation: Annotation) {
  // check if this has the same position as an empty span. If so, remove the empty span
  for (let a of Object.values(annotations)) {
    if (a.value !== "EMPTY") continue;
    if (
      a.field === annotation.field &&
      a.variable === annotation.variable &&
      a.span[0] === annotation.span[0] &&
      a.span[1] === annotation.span[1]
    ) {
      delete annotations[a.id];
    }
  }

  return annotations;
}

function createId(annotations: AnnotationDictionary) {
  // use millisec since 2023 as id, but increment if id already used
  // (which can happen if 2 ids are created on same millisec)
  let i = Date.now() - new Date("2023-01-01").getTime();
  while (annotations[String(i)]) i++;
  return String(i);
}
