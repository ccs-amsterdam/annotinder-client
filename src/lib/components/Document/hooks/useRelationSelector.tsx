import { useRef, useState, useCallback, ReactElement, useMemo, useEffect } from "react";
import standardizeColor from "../../../functions/standardizeColor";
import useWatchChange from "../../../hooks/useWatchChange";
import {
  Variable,
  Code,
  RelationOption,
  Annotation,
  CodeSelectorOption,
  CodeSelectorValue,
  TriggerSelector,
  TriggerSelectorParams,
  Doc,
  AnnotationLibrary,
  AnnotationID,
} from "../../../types";
import AnnotationPortal from "../components/AnnotationPortal";
import PopupSelection from "../components/PopupSelection";
import AnnotationManager from "../functions/AnnotationManager";

const useRelationSelector = (
  doc: Doc,
  annotationLib: AnnotationLibrary,
  annotationManager: AnnotationManager,
  variable: Variable
): [ReactElement, TriggerSelector, boolean] => {
  const [open, setOpen] = useState(false);
  const positionRef = useRef<HTMLSpanElement>(null);

  const [edge, setEdge] = useState<RelationOption>(null);
  const [edgeOptions, setEdgeOptions] = useState<CodeSelectorOption[]>();

  const tokens = doc.tokens;

  const triggerFunction = useCallback(
    (selection: TriggerSelectorParams) => {
      const byIndex = !!selection.from || !!selection.to;
      const byId = !!selection.fromId || !!selection.toId;
      if (!byIndex && !byId) return;

      let fromAnn: Annotation[] = [];
      let toAnn: Annotation[] = [];
      if (byIndex) {
        const fromIds = annotationLib.byToken[selection.from] || [];
        const toIds = annotationLib.byToken[selection.to] || [];
        if (fromIds.length === 0 || toIds.length === 0) return;
        fromAnn = fromIds.map((id) => annotationLib.annotations[id]);
        toAnn = toIds.map((id) => annotationLib.annotations[id]);

        const position = selection.to;
        positionRef.current = tokens?.[position]?.ref.current;
      } else {
        fromAnn = [annotationLib.annotations[selection.fromId]];
        toAnn = [annotationLib.annotations[selection.toId]];

        const position = Math.min.apply(fromAnn[0].positions);
        positionRef.current = tokens?.[position]?.ref.current;
      }
      let edgeOptions = getOptions(fromAnn, toAnn, variable);

      if (edgeOptions.length === 0) return;
      if (edgeOptions.length === 1) {
        const edge = edgeOptions[0];
        setEdge(edge.value.relationOption as RelationOption);
      } else {
        setEdge(null);
        setEdgeOptions(edgeOptions);
      }
      setOpen(true);
    },
    [tokens, variable, annotationLib, setEdgeOptions]
  );

  if (useWatchChange([tokens, variable])) setOpen(false);

  const popup = (
    <AnnotationPortal open={open} setOpen={setOpen} positionRef={positionRef} minY={30}>
      {edge === null ? (
        <SelectEdgePage edgeOptions={edgeOptions} setEdge={setEdge} setOpen={setOpen} />
      ) : (
        <SelectRelationPage
          edge={edge}
          annotationLib={annotationLib}
          annotationManager={annotationManager}
          setOpen={setOpen}
        />
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
  annotationLib: AnnotationLibrary;
  annotationManager: AnnotationManager;
  setOpen: (open: boolean) => void;
}

const SelectRelationPage = ({
  edge,
  annotationLib,
  annotationManager,
  setOpen,
}: SelectRelationPageProps) => {
  const onSelect = useCallback(
    (value: CodeSelectorValue, ctrlKey: boolean) => {
      if (value.cancel) {
        setOpen(false);
      } else if (value.delete) {
        annotationManager.rmAnnotation(value.id);
      } else {
        annotationManager.createRelationAnnotation(value.code, edge.from, edge.to);
      }

      if (!ctrlKey) setOpen(false);
    },
    [setOpen, edge, annotationManager]
  );

  const options: CodeSelectorOption[] = useMemo(() => {
    if (!edge) return null;

    const existing: Record<string, AnnotationID> = {};
    for (let annotation of Object.values(annotationLib.annotations)) {
      if (annotation.fromId !== edge.from.id) continue;
      if (annotation.toId !== edge.to.id) continue;
      existing[annotation.variable + "|" + annotation.value] = annotation.id;
    }

    const options = edge.relations.map((code) => {
      const existingId = existing[code.variable + "|" + code.code];
      return {
        value: { code, id: existingId, delete: !!existingId },
        label: code.code,
        color: standardizeColor(code.color, "50"),
      };
    });

    return options;
  }, [edge, annotationLib]);

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
