import { useMemo } from "react";
import standardizeColor from "../../../functions/standardizeColor";
import { getColor } from "../../../functions/tokenDesign";
import { RelationAnnotations, Token, VariableMap, Span } from "../../../types";
import Arrow from "./Arrow";

interface Props {
  tokens: Token[];
  annotations: RelationAnnotations;
  showValues: VariableMap;
  triggerSelectionPopup: (index: number, span: Span) => void;
}

const RelationArrows = ({ tokens, annotations, showValues, triggerSelectionPopup }: Props) => {
  const arrows = useMemo(() => {
    const arrows = [];
    if (!annotations) return arrows;
    for (let from of Object.values(annotations)) {
      for (let to of Object.values(from)) {
        for (let r of Object.values(to)) {
          if (!r || !r.from || !r.to) continue;
          const ann = r.from;
          const parent = r.to;
          const id = `${ann.variable}|${ann.value}|${ann.span[0]} - ${r.variable}|${r.value} - ${parent.variable}|${parent.value}|${parent.span[0]}`;

          let [from, to] = [ann.span[0], parent.span[0]];
          let [fromEnd, toEnd] = [ann.span[1], parent.span[1]];

          const relationCodeMap = showValues[r.variable]?.codeMap;
          if (!relationCodeMap) continue;
          const fromCodeMap = showValues[ann.variable]?.codeMap;
          const toCodeMap = showValues[parent.variable]?.codeMap;

          arrows.push({
            id,
            tokenSelection: [from, to],
            tokenSelectionEnd: [fromEnd, toEnd],
            relation: r.value,
            edgeColor: standardizeColor(r.color, "50") || getColor(r.value, relationCodeMap),
            fromColor: standardizeColor(ann.color, "50") || getColor(ann.value, fromCodeMap),
            toColor: standardizeColor(parent.color, "50") || getColor(parent.value, toCodeMap),
          });
        }
      }
    }
    return arrows;
  }, [annotations, showValues]);

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
