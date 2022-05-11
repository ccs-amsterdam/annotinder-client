import React, { useState, useEffect } from "react";
import { Dimmer, Loader, Segment } from "semantic-ui-react";
import Unit from "./components/Unit";
import FullScreenWindow from "./components/FullScreenWindow";
import "./annotatorStyle.css";
import HeaderBar from "./components/HeaderBar";

/**
 * Render an annotator for the provided jobServer class
 *
 * @param {*} jobServer  A jobServer class
 */
const Annotator = ({ jobServer, askFullScreen }) => {
  const [unitIndex, setUnitIndex] = useState(-1);
  const [preparedUnit, setPreparedUnit] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // on start (or jobserver changes), unitIndex based on progress
    setUnitIndex(jobServer?.progress?.n_coded);
  }, [jobServer, setUnitIndex]);

  useEffect(() => {
    // When unitIndex changes, get the unit
    if (!jobServer || unitIndex === null) return;
    setLoading(true);
    getUnit(jobServer, unitIndex, setPreparedUnit, setUnitIndex).then(() => setLoading(false));
  }, [unitIndex, jobServer, setUnitIndex, setPreparedUnit, setLoading]);

  const [maxHeight, maxWidth] = getWindowSize(jobServer);

  return (
    <FullScreenWindow askFullScreen={askFullScreen}>
      {(fullScreenNode, fullScreenButton) => (
        // FullScreenWindow passes on the fullScreenNode needed to mount popups, and a fullScreenButton to handle on/off
        <div
          style={{
            maxWidth,
            maxHeight,
            background: "white",
            margin: "0 auto",
            padding: "0",
            height: "100%",
            width: "100%",
          }}
        >
          <HeaderBar
            jobServer={jobServer}
            unitIndex={unitIndex}
            setUnitIndex={setUnitIndex}
            fullScreenButton={fullScreenButton}
            fullScreenNode={fullScreenNode}
            height={"45px"}
          />
          <Segment basic style={{ height: "calc(100% - 45px)", padding: "0", margin: "0" }}>
            <Dimmer inverted active={loading}>
              <Loader />
            </Dimmer>
            <Unit
              unit={preparedUnit}
              jobServer={jobServer}
              unitIndex={unitIndex}
              setUnitIndex={setUnitIndex}
              fullScreenButton={fullScreenButton}
              fullScreenNode={fullScreenNode}
              nextDelay={jobServer?.progress?.next_delay}
            />
          </Segment>
        </div>
      )}
    </FullScreenWindow>
  );
};

const getUnit = async (jobServer, unitIndex, setPreparedUnit, setUnitIndex) => {
  if (unitIndex < 0) return;
  try {
    const unit = await jobServer.getUnit(unitIndex);

    // if backend gives the unit index, ensure that connection to unitIndex is fully controlled
    // (in case the frontend accidentally asks for a unitIndex it doesn't yet have access to)
    // NOTE THAT THIS RELIES ON REACT 18 FOR BATCHING STATE UPDATES
    if (unit.index && unitIndex !== unit.index) setUnitIndex(unit.index);

    setPreparedUnit({
      jobServer,
      unitIndex: unit.index || unitIndex, // unit can (should?) return an index to keep it fully controlled
      unitId: unit.id,
      annotations: unit.annotation,
      status: unit.status,
      ...unit.unit,
    });
  } catch (e) {
    if (e.response?.status === 404) {
      setUnitIndex(null);
    } else {
      // currently 404 indicates that job is done (no more units left)
      // should probably changes this because it 404 just feels bad
      // console.error(e);
    }
    setPreparedUnit(null);
  }
};

const getWindowSize = (jobServer) => {
  switch (jobServer?.codebook?.type) {
    case "questions":
      return ["1200px", "1000px"];
    case "annotate":
      return ["2000px", "2000px"];
    default:
      return ["100%", "100%"];
  }
};

export default React.memo(Annotator);
