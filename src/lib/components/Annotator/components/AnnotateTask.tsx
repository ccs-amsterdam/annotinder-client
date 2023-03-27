import React, { useState, useEffect } from "react";
import AnnotationList from "./AnnotationList";
import Document from "../../Document/Document";
import AnnotateTaskManual from "./AnnotateTaskManual";

import {
  Annotation,
  FullScreenNode,
  Unit,
  VariableMap,
  CodeBook,
  SessionData,
  TriggerSelector,
} from "../../../types";
import Instructions from "./Instructions";
import styled from "styled-components";
import { FaStepForward } from "react-icons/fa";

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
      padding-left: 2rem;
      height: 35px;
      color: var(--text-inversed-fixed);
      background: var(--primary-dark);
      border-radius: 2px;
      align-items: center;

      button {
        border-top-right-radius: 2px !important;
        border-bottom-right-radius: 2px !important;
      }
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
  const [selectors, setSelectors] = useState<Record<string, TriggerSelector>>({});

  if (!unit || codebook?.variables === null) return null;

  return (
    <AnnotateGrid>
      <div className="documentContainer">
        <div className="document">
          <Document
            unit={unit}
            annotations={unit.unit.annotations}
            settings={codebook?.settings}
            variables={codebook?.variables}
            onChangeAnnotations={onChangeAnnotations}
            returnVariableMap={setVariableMap}
            returnSelectors={setSelectors}
            blockEvents={blockEvents}
            bodyStyle={BODYSTYLE}
          />
        </div>
        <div className="bottomBar">
          <Instructions
            instruction={codebook?.settings?.instruction}
            autoInstruction={codebook?.settings?.auto_instruction || false}
            sessionData={sessionData}
          />
          <AnnotateTaskManual fullScreenNode={fullScreenNode} />
          <NextUnitButton unit={unit} annotations={annotations} nextUnit={nextUnit} />
        </div>
      </div>
      <div className="annotationList">
        <div style={{}}>
          <AnnotationList
            variableMap={variableMap}
            annotations={annotations}
            selectors={selectors}
          />
        </div>
      </div>
    </AnnotateGrid>
  );
};

const useAnnotations = (
  unit: Unit
): [Annotation[], (unitId: string, value: Annotation[]) => void] => {
  // simple hook for onChangeAnnotations that posts to server and returns state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    if (!unit) {
      setAnnotations([]);
      return;
    }
  }, [unit, setAnnotations]);

  const onChangeAnnotations = React.useCallback(
    (unitId: string, newAnnotations: Annotation[]) => {
      if (unit.unitId !== unitId) return;
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
  return JSON.stringify(old) !== JSON.stringify(current);
};

const getCleanAnnotations = (annotations: Annotation[]) => {
  return annotations.map((na) => {
    const a: Annotation = {
      type: na.type,
      id: na.id,
      variable: na.variable,
      value: na.value,
      field: na.field,
      offset: na.offset,
      length: na.length,
      color: na.color,
      text: na.text,
      fromId: na.fromId,
      toId: na.toId,
    };
    return a;
  });
};

interface NextUnitButtonProps {
  unit: Unit;
  annotations: Annotation[];
  nextUnit: () => void;
}

const NextUnitButtonStyle = styled.button`
  background: var(--primary);
  color: white;
  flex: 1 1 auto;
  border: none;
  margin-left: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.7rem;
  cursor: pointer;
  height: 100%;
  transition: background-color 0.1s;

  &:hover {
    background: var(--secondary);
    color: black;
  }
  &:disabled {
    background: var(--primary);
    color: grey;
    cursor: not-allowed;
  }

  svg {
    font-size: 2rem;
  }
`;

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
    <NextUnitButtonStyle onClick={onNext} disabled={tempDisable !== "ready"}>
      <div>
        <FaStepForward />
      </div>
      <div>Go to next unit</div>
    </NextUnitButtonStyle>
  );
};

export default React.memo(AnnotateTask);
