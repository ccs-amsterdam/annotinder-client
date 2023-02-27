import { useState, useCallback, ReactElement, useMemo, useEffect } from "react";
import useWatchChange from "../../../hooks/useWatchChange";
import {
  UnitStates,
  Span,
  TriggerSelectionPopup,
  Variable,
  Code,
  Annotation,
  AnnotationMap,
  CodeSelectorOption,
  CodeSelectorValue,
  ValidRelation,
} from "../../../types";
import { createId, toggleRelationAnnotation } from "../functions/annotations";
import AnnotationPortal from "./AnnotationPortal";
import PopupSelection from "./PopupSelection";

interface EdgeOption {
  validRelations: Record<string, boolean>;
  from: Annotation;
  to: Annotation;
}

const useRelationSelector = (
  unitStates: UnitStates,
  variable: Variable
): [ReactElement, TriggerSelectionPopup, boolean] => {
  const [open, setOpen] = useState(false);
  const [positionRef, setPositionRef] = useState<any>(null);

  const [relationOptions, setRelationOptions] = useState<Code[]>();
  const [relation, setRelation] = useState<Code>(null);
  const [edgeOptions, setEdgeOptions] = useState<EdgeOption[]>();

  const tokens = unitStates.doc.tokens;
  const annotations = unitStates.spanAnnotations;

  const triggerFunction = useCallback(
    (index: number, span: Span) => {
      const [from, to] = [annotations[span[0]], annotations[span[1]]];

      const { relationOptions, edgeOptions } = getOptions(
        from,
        to,
        variable.validFrom,
        variable.validTo
      );

      if (relationOptions.length === 0) return;
      if (relationOptions.length === 1) {
        const relation = relationOptions[0];
        setRelation(relation);
      } else {
        setRelation(null);
        setRelationOptions(relationOptions);
      }
      setEdgeOptions(edgeOptions);
      setPositionRef(tokens?.[span?.[1]]?.ref);
      setOpen(true);
    },
    [tokens, variable, annotations, setRelationOptions, setEdgeOptions]
  );

  if (useWatchChange([tokens, variable])) setOpen(false);

  const popup = (
    <AnnotationPortal open={open} setOpen={setOpen} positionRef={positionRef}>
      {relation === null ? (
        <SelectRelationPage
          relationOptions={relationOptions}
          setRelation={setRelation}
          setOpen={setOpen}
        />
      ) : (
        <SelectEdgePage
          unitStates={unitStates}
          relation={relation}
          edgeOptions={edgeOptions}
          setOpen={setOpen}
        />
      )}
    </AnnotationPortal>
  );

  return [popup, triggerFunction, open];
};

interface SelectRelationPageProps {
  relationOptions: Code[];
  setRelation: (relation: Code) => void;
  setOpen: (open: boolean) => void;
}

const SelectRelationPage = ({ relationOptions, setRelation, setOpen }: SelectRelationPageProps) => {
  const onSelect = useCallback(
    (value: CodeSelectorValue, ctrlKey: boolean) => {
      if (value.cancel) setOpen(false);
      setRelation(value.value as Code);
    },
    [setRelation, setOpen]
  );

  if (!relationOptions) return null;
  const options: CodeSelectorOption[] = relationOptions.map((o) => ({
    value: { value: o },
    label: o.code,
    color: o.color,
  }));
  return <PopupSelection header={"Select relation type"} options={options} onSelect={onSelect} />;
};

interface SelectEdgePageProps {
  unitStates: UnitStates;
  relation: Code;
  edgeOptions: EdgeOption[];
  setOpen: (open: boolean) => void;
}

const SelectEdgePage = ({ unitStates, relation, edgeOptions, setOpen }: SelectEdgePageProps) => {
  const onSelect = useCallback(
    (value: CodeSelectorValue, ctrlKey: boolean) => {
      if (value.cancel) setOpen(false);

      const annotations = toggleRelationAnnotation(
        unitStates.spanAnnotations,
        value.relation.from,
        value.relation.to,
        relation,
        value.delete
      );
      unitStates.setSpanAnnotations({ ...annotations });
      setOpen(false);
    },
    [setOpen, unitStates, relation]
  );

  const options = useMemo(() => {
    if (!edgeOptions) return null;
    const validOptions = edgeOptions.filter((o) => o.validRelations[relation.code]);
    const options = validOptions.map((o) => {
      const from = o.from;
      const to = o.to;
      const label = `${from.value} 🠪 ${to.value}`;

      // check if relation already exists
      const firstFromToken = unitStates.spanAnnotations[from.span[0]];
      const parents = firstFromToken[createId(from)]?.parents;
      const deleteRelation =
        parents &&
        parents.some(
          (p) =>
            p.variable === to.variable &&
            p.value === to.value &&
            p.offset === to.offset &&
            p.relationVariable === relation.variable &&
            p.relationValue === relation.code
        );

      return {
        value: { relation: { from, to }, delete: deleteRelation },
        label,
        color: "white",
      };
    });

    return options;
  }, [edgeOptions, relation, unitStates.spanAnnotations]);

  useEffect(() => {
    if (options.length === 1 && !options[0].value.delete) {
      onSelect(options[0].value, false);
    }
  }, [options, onSelect]);

  if (!options) return null;

  return (
    <PopupSelection
      header={`Assign "${relation.code}" relation`}
      options={options}
      onSelect={onSelect}
    />
  );
};

function getOptions(
  from: AnnotationMap,
  to: AnnotationMap,
  validFrom: ValidRelation,
  validTo: ValidRelation
) {
  const relationOptionsSet: Set<Code> = new Set();
  const edgeOptions: EdgeOption[] = [];

  for (let f of Object.values(from)) {
    const fromCodes = validFrom?.[f.variable]?.["*"] || validFrom?.[f.variable]?.[f.value] || null;
    if (!fromCodes) continue;

    for (let t of Object.values(to)) {
      const toCodes = validTo?.[t.variable]?.["*"] || validTo?.[t.variable]?.[t.value] || null;
      if (!toCodes) continue;

      const relationsLookup: Record<string, boolean> = {};
      for (let fromCode of Object.keys(fromCodes)) {
        if (!toCodes[fromCode]) continue;
        relationsLookup[fromCode] = true;
        relationOptionsSet.add(fromCodes[fromCode]);
      }
      edgeOptions.push({
        validRelations: relationsLookup,
        from: f,
        to: t,
      });
    }
  }

  const relationOptions: Code[] = Array.from(relationOptionsSet);
  return { relationOptions, edgeOptions };
}

export default useRelationSelector;
