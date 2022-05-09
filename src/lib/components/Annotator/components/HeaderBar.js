import React from "react";
import { Popup, Button } from "semantic-ui-react";

import { useNavigate } from "react-router-dom";
import useLocalStorage from "../../../hooks/useLocalStorage";
import IndexController from "./IndexController";

/**
 * Render an annotator for the provided jobServer class
 *
 * @param {*} jobServer  A jobServer class
 */
const HeaderBar = ({
  jobServer,
  fullScreenButton,
  fullScreenNode,
  unitIndex,
  setUnitIndex,
  height,
}) => {
  return (
    <div
      style={{
        height,
        width: "100%",
        padding: "5px 5px 0px 5px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          flex: "1 1 auto",
          paddingTop: "3px",
          paddingRight: "10px",
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
          <Button.Group>
            {fullScreenButton}
            <UserButton fullScreenNode={fullScreenNode} jobServer={jobServer} />
          </Button.Group>
        </div>
      </div>
    </div>
  );
};

const UserButton = ({ fullScreenNode, jobServer }) => {
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
                window.location.reload("/");
              }}
            />
          ) : null}
        </Button.Group>
      </Popup.Content>
    </Popup>
  );
};

const BackToOverview = ({ jobServer }) => {
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

export default React.memo(HeaderBar);
