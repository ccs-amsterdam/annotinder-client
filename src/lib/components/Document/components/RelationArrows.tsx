import { useMemo } from "react";
import standardizeColor from "../../../functions/standardizeColor";
import { getColor } from "../../../functions/tokenDesign";
import { RelationAnnotation, Token, VariableMap, Span, TriggerSelector } from "../../../types";
import Arrow from "./Arrow";

interface Props {
  tokens: Token[];
  annotations: RelationAnnotation[];
  showValues: VariableMap;
  triggerSelector: TriggerSelector;
}

const RelationArrows = ({ tokens, annotations, showValues, triggerSelector }: Props) => {
  const arrows = useMemo(() => {
    const arrows = [];
    if (!annotations) return arrows;
    for (let r of annotations) {
      if (!r.from || !r.to) continue;

      let [from, fromEnd] = r.from.type === "relation" ? r.from.edge : r.from.span;
      let [to, toEnd] = r.to.type === "relation" ? r.to.edge : r.to.span;

      const relationCodeMap = showValues[r.variable]?.codeMap;
      if (!relationCodeMap) continue;
      const fromCodeMap = showValues[r.from.variable]?.codeMap;
      const toCodeMap = showValues[r.to.variable]?.codeMap;

      arrows.push({
        id: r.id,
        tokenSelection: [from, to],
        tokenSelectionEnd: [fromEnd, toEnd],
        relation: r.value,
        edgeColor: standardizeColor(r.color, "50") || getColor(r.value, relationCodeMap),
        fromColor: standardizeColor(r.from.color, "50") || getColor(r.from.value, fromCodeMap),
        toColor: standardizeColor(r.to.color, "50") || getColor(r.to.value, toCodeMap),
      });
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

export default RelationArrows;
