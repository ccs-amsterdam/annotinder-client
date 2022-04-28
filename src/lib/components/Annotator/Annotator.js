import React, { useState, useEffect } from "react";
import { Icon, Grid, Header, Dimmer, Loader, Segment, Popup, Button } from "semantic-ui-react";
import DownloadAnnotations from "./components/DownloadAnnotations";
import IndexController from "./components/IndexController";
import Task from "./components/Task";
import FullScreenWindow from "./components/FullScreenWindow";
import "./annotatorStyle.css";
import useLocalStorage from "lib/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

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

  const content = (fullScreenNode) => {
    if (unitIndex < 0) return null;
    if (unitIndex === null) return <Finished jobServer={jobServer} />;
    return (
      <Task
        unit={preparedUnit}
        setUnitIndex={setUnitIndex}
        fullScreenNode={fullScreenNode}
        nextDelay={jobServer?.progress?.next_delay}
      />
    );
  };
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
            border: "1px solid white",
          }}
        >
          <div
            style={{
              height: "45px",
              width: "100%",
              padding: "5px 14px 5px 14px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                flex: "1 1 auto",
                paddingTop: "3px",
                paddingRight: "16px",
              }}
            >
              <IndexController
                n={jobServer?.progress?.n_total}
                nCoded={jobServer?.progress?.n_coded || 0}
                index={unitIndex}
                setIndex={setUnitIndex}
                canGoBack={jobServer?.progress?.seek_backwards}
                canGoForward={jobServer?.progress?.seek_forwards}
              />
            </div>
            <div>
              <div>
                {fullScreenButton}

                <UserButton jobServer={jobServer} />
              </div>
            </div>
          </div>
          <Segment basic style={{ height: "calc(100% - 45px)", padding: "0", margin: "0" }}>
            <Dimmer inverted active={loading}>
              <Loader />
            </Dimmer>
            {content(fullScreenNode)}
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
      console.error(e);
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

const Finished = ({ jobServer }) => {
  if (!jobServer) return null;

  if (!jobServer.getAllAnnotations) {
    return (
      <Grid container centered verticalAlign="middle" style={{ margin: "0", padding: "0" }}>
        <Grid.Row style={{ marginTop: "40%", width: "100%", height: "100%" }}>
          <div>
            <Icon name="flag checkered" size="huge" style={{ transform: "scale(5)" }} />
          </div>
        </Grid.Row>
      </Grid>
    );
  } else {
    return (
      <Grid container centered verticalAlign="middle" style={{ margin: "0", padding: "0" }}>
        <Grid.Row style={{ marginTop: "40%", width: "100%", height: "100%" }}>
          <Grid.Column width={4}>
            <Icon name="flag checkered" size="huge" />
          </Grid.Column>
          <Grid.Column width={8}>
            <Header>You finished the codingjob!</Header>
            <p>Please download your results (and send them to whoever gave you this job). </p>
            <DownloadAnnotations jobServer={jobServer} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
};

const UserButton = ({ jobServer }) => {
  const [auth, setAuth] = useLocalStorage("auth", {});
  const navigate = useNavigate();

  return (
    <Popup
      wide
      position="bottom right"
      on="click"
      trigger={<Icon name="cancel" size="big" style={{ cursor: "pointer" }} />}
    >
      <Popup.Content>
        <Button.Group vertical fluid>
          {jobServer?.hasHome ? (
            <Button primary icon="home" content="Back to overview" onClick={() => navigate("/")} />
          ) : null}
          <Button
            secondary
            icon="user"
            content="Log out"
            style={{ marginTop: "0" }}
            onClick={() => {
              console.log("test");
              console.log(auth.host, auth[auth.host + "__token__"]);
              setAuth({ ...auth, [auth.host + "__token__"]: null });
              window.location.reload("/");
            }}
          />
        </Button.Group>
      </Popup.Content>
    </Popup>
  );
};

export default Annotator;
