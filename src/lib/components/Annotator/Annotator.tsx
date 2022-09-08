import React, { useState, useEffect, useCallback } from "react";
import { Segment } from "semantic-ui-react";
import AnnotateUnit from "./components/AnnotateUnit";
import FullScreenWindow from "./components/FullScreenWindow";
import "./annotatorStyle.css";
import JobController from "./components/JobController";
import { SetState, JobServer, Unit, SetUnitIndex, BackendUnit } from "../../types";
import { importCodebook } from "../../functions/codebook";

/**
 * Keep unit and index in same state to guarantee that they're synchronized
 */
interface IndexedUnit {
  unit: Unit;
  index: number;
  error?: boolean;
}

/**
 * Render an annotator for the provided jobServer class
 */
interface AnnotatorProps {
  jobServer: JobServer;
  askFullScreen?: boolean;
  cantLeave?: boolean;
}

const Annotator = ({ jobServer, askFullScreen = false, cantLeave = false }: AnnotatorProps) => {
  const [indexedUnit, setIndexedUnit] = useState<IndexedUnit>({ unit: null, index: -1 });
  const [unitProgress, setUnitProgress] = useState(0);

  const setUnitIndex: SetUnitIndex = useCallback(
    (index) => updateIndexedUnit(jobServer, index, setIndexedUnit, setUnitProgress),
    [jobServer]
  );

  useEffect(() => {
    // reset index when jobServer changes.
    // -1 tells backend to determine what the next unit is.
    setUnitIndex(-1);
  }, [jobServer, setUnitIndex]);

  return (
    <FullScreenWindow askFullScreen={askFullScreen}>
      {(fullScreenNode, fullScreenButton) => (
        // FullScreenWindow passes on the fullScreenNode needed to mount popups, and a fullScreenButton to handle on/off
        <JobController
          jobServer={jobServer}
          unitIndex={indexedUnit?.index}
          setUnitIndex={setUnitIndex}
          unitProgress={unitProgress}
          fullScreenButton={fullScreenButton}
          fullScreenNode={fullScreenNode}
          cantLeave={cantLeave}
        >
          <Segment basic style={{ height: "100%", padding: "0", margin: "0" }}>
            <AnnotateUnit
              jobServer={jobServer}
              unit={indexedUnit?.unit}
              unitIndex={indexedUnit?.index}
              setUnitIndex={setUnitIndex}
              fullScreenNode={fullScreenNode}
            />
          </Segment>
        </JobController>
      )}
    </FullScreenWindow>
  );
};

const updateIndexedUnit = async (
  jobServer: any,
  index: number,
  setIndexedUnit: SetState<IndexedUnit>,
  setUnitProgress: SetState<number>
) => {
  if (!jobServer || index === null) return;

  try {
    const indexedUnit = await getIndexedUnit(jobServer, index);
    setIndexedUnit(indexedUnit);
    setUnitProgress((unitProgress: number) => {
      if (index === -1) {
        // on jobserver change, reset unitProgress to progress.n_coded
        return jobServer.progress.n_coded;
      } else {
        return Math.max(unitProgress, indexedUnit.index);
      }
    });
  } catch (e) {
    console.error(e);
    setIndexedUnit({ unit: null, index: -1, error: true });
  }
};

const getIndexedUnit = async (jobServer: any, unitIndex: number): Promise<IndexedUnit> => {
  if (unitIndex >= jobServer.progress.n_total) return { unit: null, index: unitIndex };

  const backendunit: BackendUnit = await jobServer.getUnit(unitIndex);
  if (backendunit.id == null) return { unit: null, index: backendunit?.index ?? unitIndex };

  if (!backendunit.unit.variables) backendunit.unit.variables = {};
  for (let a of backendunit.unit.importedAnnotations || []) {
    if (!backendunit.unit.variables[a.variable]) {
      backendunit.unit.variables[a.variable] = String(a.value);
    } else {
      backendunit.unit.variables[a.variable] += `, ${a.value}`;
    }
  }

  if (backendunit.unit.codebook)
    backendunit.unit.codebook = importCodebook(backendunit.unit.codebook);

  const unit: Unit = {
    jobServer,
    unitId: backendunit.id,
    annotations: backendunit.annotation,
    status: backendunit.status,
    report: backendunit.report,
    ...backendunit.unit,
  };
  return { unit, index: backendunit.index ?? unitIndex };
};

export default React.memo(Annotator);
