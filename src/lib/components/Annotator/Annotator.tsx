import React, { useState, useEffect, useCallback, ReactElement } from "react";
import AnnotateUnit from "./components/AnnotateUnit";
import FullScreenWindow from "./components/FullScreenWindow";
import JobController from "./components/JobController";
import { SetState, JobServer, Unit, SetUnitIndex, RawUnit, UnitContent } from "../../types";
import processUnitContent from "../../functions/processUnitContent";
import { StyledSegment } from "../../styled/StyledSemantic";

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
  authForm?: ReactElement;
}

const Annotator = ({
  jobServer,
  askFullScreen = false,
  cantLeave = false,
  authForm,
}: AnnotatorProps) => {
  const [indexedUnit, setIndexedUnit] = useState<IndexedUnit>({ unit: null, index: -1 });
  const [unitProgress, setUnitProgress] = useState(jobServer.progress.n_coded);

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
          codebook={indexedUnit?.unit?.unit?.codebook || jobServer?.codebook}
          unitIndex={indexedUnit?.index}
          setUnitIndex={setUnitIndex}
          unitProgress={unitProgress}
          fullScreenButton={fullScreenButton}
          fullScreenNode={fullScreenNode}
          cantLeave={cantLeave}
          authForm={authForm}
        >
          <StyledSegment style={{ height: "100%", padding: "0", margin: "0" }}>
            <AnnotateUnit
              jobServer={jobServer}
              unit={indexedUnit?.unit}
              unitIndex={indexedUnit?.index}
              setUnitIndex={setUnitIndex}
              fullScreenNode={fullScreenNode}
            />
          </StyledSegment>
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
  console.log(jobServer.progress.n_total);
  if (unitIndex >= jobServer.progress.n_total) return { unit: null, index: unitIndex };

  const rawUnit: RawUnit = await jobServer.getUnit(unitIndex);
  if (rawUnit.id == null) return { unit: null, index: rawUnit?.index ?? unitIndex };

  const unitContent: UnitContent = processUnitContent(rawUnit);

  let unit: Unit = {
    jobServer,
    unitId: rawUnit.id,
    status: rawUnit.status,
    report: rawUnit.report,
    unit: unitContent,
  };

  return { unit, index: rawUnit.index ?? unitIndex };
};

export default React.memo(Annotator);
