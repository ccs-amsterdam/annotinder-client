import React, { ReactElement, useEffect, useState } from "react";
import { Popup, Button } from "semantic-ui-react";

import { useNavigate } from "react-router-dom";
import useLocalStorage from "../../../hooks/useLocalStorage";
import IndexController from "./IndexController";
import Finished from "./Finished";
import { FullScreenNode, JobServer, SetState } from "../../../types";

interface JobControllerProps {
  children: ReactElement;
  jobServer: JobServer;
  fullScreenButton: ReactElement;
  fullScreenNode: FullScreenNode;
  unitIndex: number;
  setUnitIndex: SetState<number>;
}

/**
 * Render an annotator for the provided jobServer class
 *
 * @param {*} jobServer  A jobServer class
 */
const JobController = ({
  children,
  jobServer,
  fullScreenButton,
  fullScreenNode,
  unitIndex,
  setUnitIndex,
}: JobControllerProps) => {
  const [maxHeight, maxWidth] = getWindowSize(jobServer);
  const [maxN, setMaxN] = useState(0);

  useEffect(() => {
    setMaxN((maxN: number) => {
      const nCoded = jobServer?.progress?.n_coded || 0;
      const max = Math.max(maxN, unitIndex, nCoded);
      if (jobServer?.progress?.n_coded != null) jobServer.progress.n_coded = max;
      return max;
    });
  }, [unitIndex, jobServer]);

  return (
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
      <div
        style={{
          height: "45px",
          width: "100%",
          padding: "0px 5px 0px 5px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            flex: "1 1 auto",
            paddingTop: "4px",
            paddingRight: "10px",
          }}
        >
          <IndexController
            n={jobServer?.progress?.n_total}
            maxN={maxN}
            index={unitIndex}
            setIndex={setUnitIndex}
            canGoBack={jobServer?.progress?.seek_backwards}
            canGoForward={jobServer?.progress?.seek_forwards}
          />
        </div>
        <div>
          <div>
            <Button.Group>
              {fullScreenButton}
              <UserButton fullScreenNode={fullScreenNode} jobServer={jobServer} />
            </Button.Group>
          </div>
        </div>
      </div>
      <div style={{ height: "calc(100% - 45px)" }}>
        {unitIndex < jobServer?.progress?.n_total ? children : <Finished jobServer={jobServer} />}
      </div>
    </div>
  );
};

interface UserButtonProps {
  fullScreenNode: FullScreenNode;
  jobServer: JobServer;
}

const UserButton = ({ fullScreenNode, jobServer }: UserButtonProps) => {
  const [auth, setAuth] = useLocalStorage("auth", {});
  const loggedIn = auth?.host && auth?.[auth?.host + "__token__"];

  return (
    <Popup
      wide
      mountNode={fullScreenNode}
      position="bottom right"
      on="click"
      trigger={
        <Button
          basic
          icon="cancel"
          size="massive"
          style={{ cursor: "pointer", padding: "4px 1px" }}
        />
      }
    >
      <Popup.Content>
        <Button.Group vertical fluid>
          <BackToOverview jobServer={jobServer} />
          {loggedIn ? (
            <Button
              secondary
              icon="user"
              content="Log out"
              style={{ marginTop: "0" }}
              onClick={() => {
                setAuth({ ...auth, [auth.host + "__token__"]: null });
                window.location.reload();
              }}
            />
          ) : null}
        </Button.Group>
      </Popup.Content>
    </Popup>
  );
};

interface BackToOverviewProps {
  jobServer: JobServer;
}

const BackToOverview = ({ jobServer }: BackToOverviewProps) => {
  const navigate = useNavigate();
  if (!jobServer?.return_link) return null;
  return (
    <Button
      primary
      icon="home"
      content="Close job"
      onClick={() => navigate(jobServer.return_link)}
    />
  );
};

const getWindowSize = (jobServer: JobServer) => {
  switch (jobServer?.codebook?.type) {
    case "questions":
      return ["1200px", "1000px"];
    case "annotate":
      return ["2000px", "2000px"];
    default:
      return ["100%", "100%"];
  }
};

export default React.memo(JobController);
