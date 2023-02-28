import React, { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "semantic-ui-react";
import AnnotationList from "./AnnotationList";
import Document from "../../Document/Document";
import AnnotateTaskManual from "./AnnotateTaskManual";

import {
  Annotation,
  FullScreenNode,
  Unit,
  VariableValueMap,
  VariableMap,
  CodeBook,
  SessionData,
} from "../../../types";
import Instructions from "./Instructions";
import { StyledButton } from "../../../styled/StyledSemantic";
import styled from "styled-components";

const NEXTDELAY = 500;
const BODYSTYLE = {
  paddingTop: "10px",
  paddingBottom: "10px",
};

const AnnotateGrid = styled.div`
  display: grid;
  grid-template-areas: "documentContainer annotationList";
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr;
  height: 100%;
  width: 100%;
  overflow: auto;

  @media screen and (max-width: 700px) {
    grid-template-areas: "annotationList" "documentContainer";
    grid-template-columns: 1fr;
    grid-template-rows: 0% 100%;
    grid-gap: 0;
  }

  & .documentContainer {
    grid-area: documentContainer;
    overflow: auto;
    height: 100%;
    //border-right: 1px solid var(--primary-light);
    /* width */

    .document {
      height: calc(100% - 35px);
      overflow: auto;
    }
    .bottomBar {
      //position: relative;
      //z-index: 100;
      display: flex;
      padding: 0;
      height: 35px;
      color: var(--text-inversed-fixed);
      background: var(--primary-dark);
    }
  }

  & .annotationList {
    grid-area: annotationList;
    overflow: auto;
    //border-bottom: 1px solid;
    //height: 100%;
    position: relative;
    z-index: 1;
  }
`;

interface AnnotateTaskProps {
  unit: Unit;
  codebook: CodeBook;
  nextUnit: () => void;
  fullScreenNode: FullScreenNode;
  sessionData?: SessionData;
  blockEvents?: boolean;
}

const AnnotateTask = ({
  unit,
  codebook,
  nextUnit,
  fullScreenNode,
  sessionData,
  blockEvents = false,
}: AnnotateTaskProps) => {
  const [annotations, onChangeAnnotations] = useAnnotations(unit);
  const [variableMap, setVariableMap] = useState<VariableMap>(null);
  const [tokens, setTokens] = useState(null);

  const restrictedCodes = useMemo(() => {
    const restrictedCodes: VariableValueMap = {};
    for (let v of codebook.variables) {
      if (v.onlyImported) restrictedCodes[v.name] = {};
    }
    for (let a of unit.unit.importedAnnotations || []) {
      if (!restrictedCodes[a.variable]) continue;
      restrictedCodes[a.variable][a.value] = true;
    }
    return restrictedCodes;
  }, [unit, codebook]);

  if (!unit || codebook?.variables === null) return null;

  let ann = unit.unit.annotations;
  if (unit.unit.importedAnnotations && (!ann || ann.length === 0) && unit.status !== "DONE")
    ann = unit.unit.importedAnnotations;

  console.log(variableMap);

  return (
    <AnnotateGrid>
      <div className="documentContainer">
        <div className="document">
          <Document
            unit={unit}
            annotations={ann}
            settings={codebook?.settings}
            variables={codebook?.variables}
            restrictedCodes={restrictedCodes}
            onChangeAnnotations={onChangeAnnotations}
            returnTokens={setTokens}
            returnVariableMap={setVariableMap}
            blockEvents={blockEvents}
            fullScreenNode={fullScreenNode}
            bodyStyle={BODYSTYLE}
          />
        </div>
        <div className="bottomBar">
          <Instructions
            instruction={codebook?.settings?.instruction}
            autoInstruction={codebook?.settings?.auto_instruction || false}
            sessionData={sessionData}
            fullScreenNode={fullScreenNode}
          />
          <AnnotateTaskManual fullScreenNode={fullScreenNode} />
          <NextUnitButton unit={unit} annotations={annotations} nextUnit={nextUnit} />
        </div>
      </div>
      <div className="annotationList">
        <div style={{}}>
          <AnnotationList tokens={tokens} variableMap={variableMap} annotations={annotations} />
        </div>
      </div>
    </AnnotateGrid>
  );
};

const useAnnotations = (unit: Unit): [Annotation[], (value: Annotation[]) => void] => {
  // simple hook for onChangeAnnotations that posts to server and returns state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const safeWrite = useRef(null);
  //const hasChanged = useRef(false);

  useEffect(() => {
    if (!unit) {
      setAnnotations([]);
      return;
    }
    safeWrite.current = unit.unitId;
    //hasChanged.current = false;
    setAnnotations(unit.unit.annotations || []);
    // if (!unit.annotations || unit.annotations.length === 0)
    //   unit.jobServer.postAnnotations(unit.unitId, [], "IN_PROGRESS");
  }, [unit, setAnnotations]);

  const onChangeAnnotations = React.useCallback(
    (newAnnotations: Annotation[]) => {
      if (unit.unitId !== safeWrite.current) return;
      setAnnotations(newAnnotations);
      const cleanAnnotations = getCleanAnnotations(newAnnotations);
      if (!annotationsHaveChanged(unit.unit.annotations || [], cleanAnnotations)) return;
      const newStatus = unit?.status === "DONE" ? "DONE" : "IN_PROGRESS";
      unit.jobServer.postAnnotations(unit.unitId, cleanAnnotations, newStatus);
    },
    [unit]
  );

  return [annotations, onChangeAnnotations];
};

const annotationsHaveChanged = (old: Annotation[], current: Annotation[]) => {
  if (old.length !== current.length) return true;
  const compareOn = ["variable", "value", "field", "offset", "length"];
  for (let i = 0; i < old.length; i++) {
    for (let field of compareOn) {
      if (old[i]?.[field as keyof Annotation] !== current[i]?.[field as keyof Annotation])
        return true;
    }
  }
  return false;
};

const getCleanAnnotations = (annotations: Annotation[]) => {
  return annotations.map((na) => {
    const a: Annotation = {
      variable: na.variable,
      value: na.value,
      field: na.field,
      offset: na.offset,
      length: na.length,
      text: na.text,
    };
    if (na.parents)
      a.parents = na.parents.map((p) => ({
        variable: p.variable,
        value: p.value,
        offset: p.offset,
        relationVariable: p.relationVariable,
        relationValue: p.relationValue,
      }));
    return a;
  });
};

interface NextUnitButtonProps {
  unit: Unit;
  annotations: Annotation[];
  nextUnit: () => void;
}

const NextUnitButton = ({ unit, annotations, nextUnit }: NextUnitButtonProps) => {
  const [tempDisable, setTempDisable] = useState("ready");

  const onNext = () => {
    if (tempDisable !== "ready") return;

    // write DONE status
    setTempDisable("loading");
    unit.jobServer
      .postAnnotations(unit.unitId, getCleanAnnotations(annotations), "DONE")
      .then((res: any) => {
        // wait until post succeeds before moving to next unit, because backend
        // needs to know this unit is done.
        nextUnit();
        setTempDisable("cooldown");
        setTimeout(() => {
          setTempDisable("ready");
        }, NEXTDELAY);
      })
      .catch((e: Error) => {
        console.error(e);
        setTempDisable("ready");
      });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.altKey) && e.keyCode === 13) {
      e.preventDefault();
      onNext();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <StyledButton
      disabled={tempDisable !== "ready"}
      loading={tempDisable === "loading"}
      primary
      fluid
      style={{
        cursor: "pointer",
        borderRadius: "0",
        padding: "5px",
        marginLeft: "30px",
        marginRight: "0px",
      }}
      onClick={onNext}
    >
      <Icon name="play" />
      Go to next unit
    </StyledButton>
  );
};

export default React.memo(AnnotateTask);
