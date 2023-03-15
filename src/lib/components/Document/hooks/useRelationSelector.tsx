import { useState, useCallback, ReactElement, useMemo, useEffect } from "react";
import standardizeColor from "../../../functions/standardizeColor";
import useWatchChange from "../../../hooks/useWatchChange";
import {
  UnitStates,
  Span,
  TriggerSelectionPopup,
  Variable,
  Code,
  RelationOption,
  AnnotationMap,
  CodeSelectorOption,
  CodeSelectorValue,
} from "../../../types";
import { createId, toggleRelationAnnotation } from "../functions/annotations";
import AnnotationPortal from "../components/AnnotationPortal";
import PopupSelection from "../components/PopupSelection";

const useRelationSelector = (
  unitStates: UnitStates,
  variable: Variable
): [ReactElement, TriggerSelectionPopup, boolean] => {
  const [open, setOpen] = useState(false);
  const [positionRef, setPositionRef] = useState<any>(null);

  const [edge, setEdge] = useState<RelationOption>(null);
  const [edgeOptions, setEdgeOptions] = useState<CodeSelectorOption[]>();

  const tokens = unitStates.doc.tokens;
  const annotations = unitStates.spanAnnotations;

  const triggerFunction = useCallback(
    (index: number, span: Span) => {
      const [from, to] = [annotations[span[0]], annotations[span[1]]];
      if (!from || !to) return;

      const edgeOptions = getOptions(from, to, variable);
      if (edgeOptions.length === 0) return;
      if (edgeOptions.length === 1) {
        const edge = edgeOptions[0];
        setEdge(edge.value.relationOption as RelationOption);
      } else {
        setEdge(null);
        setEdgeOptions(edgeOptions);
      }
      setPositionRef(tokens?.[span?.[1]]?.ref);
      setOpen(true);
    },
    [tokens, variable, annotations, setEdgeOptions]
  );

  if (useWatchChange([tokens, variable])) setOpen(false);

  const popup = (
    <AnnotationPortal open={open} setOpen={setOpen} positionRef={positionRef}>
      {edge === null ? (
        <SelectEdgePage edgeOptions={edgeOptions} setEdge={setEdge} setOpen={setOpen} />
      ) : (
        <SelectRelationPage edge={edge} unitStates={unitStates} setOpen={setOpen} />
      )}
    </AnnotationPortal>
  );

  return [popup, triggerFunction, open];
};

interface SelectEdgePageProps {
  edgeOptions: CodeSelectorOption[];
  setEdge: (edge: RelationOption) => void;
  setOpen: (open: boolean) => void;
}

const SelectEdgePage = ({ edgeOptions, setEdge, setOpen }: SelectEdgePageProps) => {
  const onSelect = useCallback(
    (value: CodeSelectorValue, ctrlKey: boolean) => {
      if (value.cancel) setOpen(false);
      setEdge(value.relationOption as RelationOption);
    },
    [setEdge, setOpen]
  );

  return (
    <PopupSelection
      header={`Select pair of annotations`}
      options={edgeOptions}
      onSelect={onSelect}
    />
  );
};

interface SelectRelationPageProps {
  edge: RelationOption;
  unitStates: UnitStates;
  setOpen: (open: boolean) => void;
}

const SelectRelationPage = ({ edge, unitStates, setOpen }: SelectRelationPageProps) => {
  const onSelect = useCallback(
    (value: CodeSelectorValue, ctrlKey: boolean) => {
      if (value.cancel) {
        setOpen(false);
        return;
      }
      const annotations = toggleRelationAnnotation(
        unitStates.spanAnnotations,
        edge.from,
        edge.to,
        value.value as Code,
        value.delete
      );
      unitStates.setSpanAnnotations({ ...annotations });
      setOpen(false);
    },
    [setOpen, edge, unitStates]
  );

  const options: CodeSelectorOption[] = useMemo(() => {
    if (!edge) return null;

    const options = edge.relations.map((code) => {
      const firstFromToken = unitStates.spanAnnotations[edge.from.span[0]];
      const parents = firstFromToken[createId(edge.from)]?.parents;
      const deleteRelation = parents?.some(
        (p) =>
          p.variable === edge.to.variable &&
          p.value === edge.to.value &&
          p.offset === edge.to.offset &&
          p.relationVariable === code.variable &&
          p.relationValue === code.code
      );

      return {
        value: { value: code, delete: deleteRelation },
        label: code.code,
        color: standardizeColor(code.color, "50"),
      };
    });

    return options;
  }, [edge, unitStates.spanAnnotations]);

  useEffect(() => {
    if (options.length === 0) return setOpen(false);
    if (options.length === 1 && !options[0].value.delete) {
      onSelect(options[0].value, false);
    }
  }, [options, onSelect, setOpen]);

  if (!options) return null;
  return (
    <PopupSelection
      header={`${edge.from.value} → ${edge.to.value}`}
      options={options}
      onSelect={onSelect}
    />
  );
};

function getOptions(from: AnnotationMap, to: AnnotationMap, variable: Variable) {
  const edgeRelations: Record<string, CodeSelectorValue> = {};
  const validFrom = variable.validFrom;
  const validTo = variable.validTo;

  for (let f of Object.values(from)) {
    const fromRelations =
      validFrom?.[f.variable]?.["*"] || validFrom?.[f.variable]?.[f.value] || null;
    if (!fromRelations) continue;

    for (let t of Object.values(to)) {
      const toRelations = validTo?.[t.variable]?.["*"] || validTo?.[t.variable]?.[t.value] || null;
      if (!toRelations) continue;

      const relations: Code[] = [];
      for (let fromRelationId of Object.keys(fromRelations)) {
        if (!toRelations[fromRelationId]) continue;
        for (let code of fromRelations[fromRelationId]) relations.push(code);
      }
      if (relations.length === 0) continue;

      const key = `${f.variable}:${f.value}:${t.variable}:${t.value}`;

      if (!edgeRelations[key]) {
        edgeRelations[key] = {
          relationOption: { relations, from: f, to: t },
        };
      } else {
        edgeRelations[key].relationOption.relations = [
          ...edgeRelations[key].relationOption.relations,
          ...relations,
        ];
      }
    }
  }

  const edgeOptions: CodeSelectorOption[] = Object.values(edgeRelations).map((value) => ({
    label: `${value.relationOption.from.value} → ${value.relationOption.to.value}`,
    color: "var(--primary-light)",
    value,
  }));
  return edgeOptions;
}

export default useRelationSelector;
