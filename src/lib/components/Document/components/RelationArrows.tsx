import { useMemo } from "react";
import standardizeColor from "../../../functions/standardizeColor";
import { getColor } from "../../../functions/tokenDesign";
import {
  Token,
  VariableMap,
  Span,
  TriggerSelector,
  AnnotationLibrary,
  AnnotationDictionary,
  AnnotationID,
} from "../../../types";
import Arrow from "./Arrow";

interface Props {
  tokens: Token[];
  annotationLib: AnnotationLibrary;
  showValues: VariableMap;
  triggerSelector: TriggerSelector;
}

const RelationArrows = ({ tokens, annotationLib, showValues, triggerSelector }: Props) => {
  const arrows = useMemo(() => {
    const arrows = [];
    for (let r of Object.values(annotationLib.annotations)) {
      if (r.type !== "relation") continue;
      const fromAnnotation = annotationLib.annotations[r.fromId];
      const toAnnotation = annotationLib.annotations[r.toId];
      if (!fromAnnotation || !toAnnotation) continue;

      let [from, fromEnd] = getAnnotationSpan(annotationLib.annotations, r.fromId);
      let [to, toEnd] = getAnnotationSpan(annotationLib.annotations, r.toId);
      if (from == null || fromEnd == null || to == null || toEnd == null) continue;

      arrows.push({
        id: r.id,
        tokenSelection: [from, to],
        tokenSelectionEnd: [fromEnd, toEnd],
        relation: r.value,
        edgeColor: standardizeColor(r.color, "90"),
        fromColor: standardizeColor(fromAnnotation.color, "90"),
        toColor: standardizeColor(toAnnotation.color, "90"),
      });
    }

    return arrows;
  }, [annotationLib, showValues]);

  const usedPositions: Record<string, number> = {};

  return (
    <>
      {arrows.map((arrowProps, i) => (
        <Arrow
          key={arrowProps.id}
          tokens={tokens}
          onClick={() =>
            triggerSelector({
              from: arrowProps.tokenSelection[0],
              to: arrowProps.tokenSelection[1],
            })
          }
          {...arrowProps}
          usedPositions={usedPositions}
        />
      ))}
    </>
  );
};

function getAnnotationSpan(annDict: AnnotationDictionary, id: AnnotationID) {
  const ann = annDict[id];
  if (!ann) return null;
  if (ann.type === "relation") {
    const fromSpan = getAnnotationSpan(annDict, ann.fromId);
    const toSpan = getAnnotationSpan(annDict, ann.toId);
    return [fromSpan?.[0], toSpan?.[1]];
  }
  return ann.span;
}

export default RelationArrows;
