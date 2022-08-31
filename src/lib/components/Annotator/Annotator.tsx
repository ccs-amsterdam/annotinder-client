import React, { useState, useEffect, useCallback } from "react";
import { Segment } from "semantic-ui-react";
import AnnotateUnit from "./components/AnnotateUnit";
import FullScreenWindow from "./components/FullScreenWindow";
import "./annotatorStyle.css";
import JobController from "./components/JobController";
import { JobServer, Unit, SetUnitIndex } from "../../types";
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
    (index) => {
      if (!jobServer || index === null) return;

      getIndexedUnit(jobServer, index)
        .then((indexedUnit) => {
          setIndexedUnit(indexedUnit);

          setUnitProgress((unitProgress: number) => {
            if (index === -1) {
              // on jobserver change, reset unitProgress to first loaded unit
              return indexedUnit.index;
            } else {
              return Math.max(unitProgress, indexedUnit.index);
            }
          });
        })
        .catch((e) => {
          console.error(e);
          setIndexedUnit({ unit: null, index: -1, error: true });
        });
    },
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

const getIndexedUnit = async (jobServer: any, unitIndex: number): Promise<IndexedUnit> => {
  if (unitIndex >= jobServer.progress.n_total) return { unit: null, index: unitIndex };

  const unit = await jobServer.getUnit(unitIndex);
  if (unit.id == null) return { unit: null, index: unit?.index ?? unitIndex };

  if (!unit.unit.variables) unit.unit.variables = {};
  for (let a of unit.unit.importedAnnotations || []) {
    if (!unit.unit.variables[a.variable]) {
      unit.unit.variables[a.variable] = a.value;
    } else {
      unit.unit.variables[a.variable] += `, ${a.value}`;
    }
  }

  const u = {
    jobServer,
    //unitIndex: unit.index ?? unitIndex, // unit can (should?) return an index to keep it fully controlled
    unitId: unit.id,
    annotations: unit.annotation,
    status: unit.status,
    report: unit.report,
    text_fields: unit.unit.text_fields,
    meta_fields: unit.unit.meta_fields,
    image_fields: unit.unit.image_fields,
    markdown_fields: unit.unit.markdown_fields,
    grid: unit.unit.grid,
    importedAnnotations: unit.unit.importedAnnotations,
    settings: unit.unit.settings,
    variables: unit.unit.variables,
    codebook: unit.unit.codebook ? importCodebook(unit.unit.codebook) : undefined,
  };
  return { unit: u, index: unit.index ?? unitIndex };
};

export default React.memo(Annotator);
