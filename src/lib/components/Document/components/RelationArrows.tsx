import { getColor } from "../../../functions/tokenDesign";
import { SpanAnnotations, Token, VariableMap, Span } from "../../../types";
import Arrow from "./Arrow";

interface Props {
  tokens: Token[];
  annotations: SpanAnnotations;
  showValues: VariableMap;
  triggerSelectionPopup: (index: number, span: Span) => void;
}

const RelationArrows = ({ tokens, annotations, showValues, triggerSelectionPopup }: Props) => {
  const arrows = [];

  for (let positionAnnotations of Object.values(annotations)) {
    for (let ann of Object.values(positionAnnotations)) {
      if (ann.span[0] !== ann.index) continue;
      if (!ann.parents) continue;

      for (let parent of ann.parents) {
        let [from, to] = [ann.span[0], parent.span[0]];
        let [fromEnd, toEnd] = [ann.span[1], parent.span[1]];

        const id = `${ann.variable}|${ann.value}|${ann.span[0]} - ${parent.relationVariable}|${parent.relationValue} - ${parent.variable}|${parent.value}|${parent.span[0]}`;

        const relationCodeMap = showValues[parent.relationVariable]?.codeMap;
        if (!relationCodeMap) continue;

        const fromCodeMap = showValues[ann.variable]?.codeMap;
        const toCodeMap = showValues[parent.variable]?.codeMap;

        arrows.push({
          id,
          tokenSelection: [from, to],
          tokenSelectionEnd: [fromEnd, toEnd],
          relation: parent.relationValue,
          edgeColor: parent.relationColor || getColor(parent.relationValue, relationCodeMap),
          fromColor: ann.color || getColor(ann.value, fromCodeMap),
          toColor: parent.color || getColor(parent.value, toCodeMap),
        });
      }
    }
  }

  const usedPositions: Record<string, number> = {};

  return (
    <>
      {arrows.map((arrowProps, i) => (
        <Arrow
          key={arrowProps.id}
          tokens={tokens}
          onClick={() => triggerSelectionPopup(0, arrowProps.tokenSelection)}
          {...arrowProps}
          usedPositions={usedPositions}
        />
      ))}
    </>
  );
};

export default RelationArrows;
