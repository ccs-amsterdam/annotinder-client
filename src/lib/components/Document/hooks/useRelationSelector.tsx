import { useState, useCallback, ReactElement, useMemo, useEffect } from "react";
import standardizeColor from "../../../functions/standardizeColor";
import useWatchChange from "../../../hooks/useWatchChange";
import {
  UnitStates,
  Variable,
  Code,
  RelationAnnotation,
  RelationOption,
  Annotation,
  CodeSelectorOption,
  CodeSelectorValue,
  TriggerSelector,
  TriggerSelectorParams,
} from "../../../types";
import { getRelationMap } from "../functions/annotations";
import AnnotationPortal from "../components/AnnotationPortal";
import PopupSelection from "../components/PopupSelection";

const useRelationSelector = (
  unitStates: UnitStates,
  variable: Variable
): [ReactElement, TriggerSelector, boolean] => {
  const [open, setOpen] = useState(false);
  const [positionRef, setPositionRef] = useState<any>(null);

  const [edge, setEdge] = useState<RelationOption>(null);
  const [edgeOptions, setEdgeOptions] = useState<CodeSelectorOption[]>();

  const tokens = unitStates.doc.tokens;
  const spanAnnotations = unitStates.spanAnnotations;
  const relationAnnotations = unitStates.relationAnnotations;

  const triggerFunction = useCallback(
    (selection: TriggerSelectorParams) => {
      if (!selection?.from || !selection?.to) return;
      const [fromMap, toMap] = [spanAnnotations[selection.from], spanAnnotations[selection.to]];
      if (!fromMap || !toMap) return;
      let [fromAnn, toAnn] = [Object.values(fromMap), Object.values(toMap)];

      fromAnn = addRelationAnnotations(fromAnn, relationAnnotations);
      toAnn = addRelationAnnotations(toAnn, relationAnnotations);

      let edgeOptions = getOptions(fromAnn, toAnn, variable);
      if (selection.fromId && selection.toId) {
        edgeOptions = edgeOptions.filter((option) => {
          const { from, to } = option?.value?.relationOption;
          return from?.id === selection.fromId && to?.id === selection.toId;
        });
      }

      if (edgeOptions.length === 0) return;
      if (edgeOptions.length === 1) {
        const edge = edgeOptions[0];
        setEdge(edge.value.relationOption as RelationOption);
      } else {
        setEdge(null);
        setEdgeOptions(edgeOptions);
      }
      setPositionRef(tokens?.[selection.to]?.ref);
      setOpen(true);
    },
    [tokens, variable, spanAnnotations, relationAnnotations, setEdgeOptions]
  );

  if (useWatchChange([tokens, variable])) setOpen(false);

  const popup = (
    <AnnotationPortal open={open} setOpen={setOpen} positionRef={positionRef} minY={30}>
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

      unitStates.annotationManager.updateRelationAnnotations(
        edge.from,
        edge.to,
        value.value as Code,
        value.delete
      );
      setOpen(false);
    },
    [setOpen, edge, unitStates]
  );

  const options: CodeSelectorOption[] = useMemo(() => {
    if (!edge) return null;

    const relations = getRelationMap(unitStates.relationAnnotations, edge.from, edge.to);
    const options = edge.relations.map((code) => {
      const isNew = !relations[code.variable + "|" + code.code];
      return {
        value: { value: code, delete: !isNew },
        label: code.code,
        color: standardizeColor(code.color, "50"),
      };
    });

    return options;
  }, [edge, unitStates.relationAnnotations]);

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

function addRelationAnnotations(
  annotations: Annotation[],
  relationAnnotations: RelationAnnotation[]
) {
  if (!relationAnnotations) return annotations;

  const addAnnotations: Annotation[] = [];
  for (let relation of relationAnnotations) {
    for (let annotation of annotations) {
      if (annotation.id === relation.fromId || annotation.id === relation.toId)
        addAnnotations.push(relation as Annotation);
    }
  }
  return [...annotations, ...addAnnotations];
}

function getOptions(from: Annotation[], to: Annotation[], variable: Variable) {
  const edgeRelations: Record<string, CodeSelectorValue> = {};
  const validFrom = variable.validFrom;
  const validTo = variable.validTo;

  for (let f of from) {
    const fromRelations =
      validFrom?.[f.variable]?.["*"] || validFrom?.[f.variable]?.[f.value] || null;
    if (!fromRelations) continue;

    for (let t of to) {
      if (f.id === t.id) continue;

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
