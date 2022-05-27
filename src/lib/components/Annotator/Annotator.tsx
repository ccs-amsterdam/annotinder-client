import React, { useState, useEffect } from "react";
import { Dimmer, Loader, Segment } from "semantic-ui-react";
import AnnotateUnit from "./components/AnnotateUnit";
import FullScreenWindow from "./components/FullScreenWindow";
import "./annotatorStyle.css";
import JobController from "./components/JobController";
import { Unit } from "../../types";

/**
 * Render an annotator for the provided jobServer class
 *
 * @param {*} jobServer  A jobServer class
 */
const Annotator = ({ jobServer, askFullScreen = false }) => {
  const [unitIndex, setUnitIndex] = useState(-1);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // on start (or jobserver changes), unitIndex based on progress
    setUnitIndex(jobServer?.progress?.n_coded);
  }, [jobServer, setUnitIndex]);

  useEffect(() => {
    // When unitIndex changes, get the unit
    if (!jobServer || unitIndex === null) return;
    setLoading(true);
    getUnit(jobServer, unitIndex, setUnit, setUnitIndex).then(() => setLoading(false));
  }, [unitIndex, jobServer, setUnitIndex, setUnit, setLoading]);

  return (
    <FullScreenWindow askFullScreen={askFullScreen}>
      {(fullScreenNode, fullScreenButton) => (
        // FullScreenWindow passes on the fullScreenNode needed to mount popups, and a fullScreenButton to handle on/off
        <JobController
          jobServer={jobServer}
          unitIndex={unitIndex}
          setUnitIndex={setUnitIndex}
          fullScreenButton={fullScreenButton}
          fullScreenNode={fullScreenNode}
        >
          <Segment basic style={{ height: "100%", padding: "0", margin: "0" }}>
            <Dimmer inverted active={loading}>
              <Loader />
            </Dimmer>
            <AnnotateUnit
              unit={unit}
              jobServer={jobServer}
              unitIndex={unitIndex}
              setUnitIndex={setUnitIndex}
              fullScreenNode={fullScreenNode}
            />
          </Segment>
        </JobController>
      )}
    </FullScreenWindow>
  );
};

const getUnit = async (
  jobServer: any,
  unitIndex: number,
  setUnit: (value: Unit) => void,
  setUnitIndex: (value: number) => void
) => {
  if (unitIndex < 0 || unitIndex >= jobServer.progress.n_total) return;

  try {
    const unit = await jobServer.getUnit(unitIndex);

    // if backend gives the unit index, ensure that connection to unitIndex is fully controlled
    // (in case the frontend accidentally asks for a unitIndex it doesn't yet have access to)
    // NOTE THAT THIS RELIES ON REACT 18 FOR BATCHING STATE UPDATES
    if (unit.index && unitIndex !== unit.index) setUnitIndex(unit.index);

    console.log(unit);
    setUnit({
      jobServer,
      unitIndex: unit.index || unitIndex, // unit can (should?) return an index to keep it fully controlled
      unitId: unit.id,
      annotations: unit.annotation,
      status: unit.status,
      ...unit.unit,
    });
  } catch (e) {
    console.log(e);
    setUnit(null);
  }
};

export default React.memo(Annotator);
