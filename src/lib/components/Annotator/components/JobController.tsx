import React, { ReactElement, useState } from "react";
import { Icon } from "semantic-ui-react";

import { useNavigate } from "react-router-dom";
import IndexController from "./IndexController";
import Finished from "./Finished";
import { CodeBook, FullScreenNode, JobServer, SetState } from "../../../types";
import { Button } from "../../../styled/StyledSemantic";
import { DarkModeButton, FontSizeButton } from "../../Common/Theme";
import MenuButtonGroup from "./MenuButtonGroup";
import styled from "styled-components";
import Modal from "../../Common/Modal";
import { FaWindowClose } from "react-icons/fa";

interface JobControllerProps {
  children: ReactElement;
  jobServer: JobServer;
  codebook: CodeBook;
  unitIndex: number;
  setUnitIndex: SetState<number>;
  unitProgress: number;
  fullScreenButton: ReactElement;
  fullScreenNode: FullScreenNode;
  cantLeave: boolean;
  authForm?: ReactElement;
  health?: any;
}

const StyledWrapper = styled.div<{ maxWidth: string; maxHeight: string }>`
  max-height: ${(p) => p.maxHeight};
  margin: 0 auto;
  height: 100%;
  width: 100%;
  background: var(--background);
  display: flex;
  flex-direction: column;

  .Menubar {
    height: 40px;
    width: 100;
    padding: 3px 5px 0px 5px;
    display: flex;
    justify-content: space-between;
    background: var(--background);
    color: var(--primary-text);
    //border-bottom: 3px double var(--background-fixed);
    font-size: 2rem;
    position: relative;
    z-index: 9000;

    .InnerMenuBar {
      margin: 0 auto;
      width: 100%;
      max-width: ${(p) => p.maxWidth};
      display: flex;
    }

    .IndexController {
      flex: 1 1 auto;
      padding-top: 4px;
      padding-right: 10px;
    }
  }
  .Annotator {
    margin: 0 auto;
    width: 100%;
    max-width: ${(p) => p.maxWidth};
    height: calc(100% - 40px);
  }
`;

/**
 * Render an annotator for the provided jobServer class
 *
 * @param {*} jobServer  A jobServer class
 */
const JobController = ({
  children,
  jobServer,
  codebook,
  unitIndex,
  setUnitIndex,
  unitProgress,
  fullScreenButton,
  fullScreenNode,
  cantLeave,
  authForm,
  health,
}: JobControllerProps) => {
  const [maxHeight, maxWidth] = getMaxWindowSize(codebook);
  const [openExitModal, setOpenExitModal] = useState(false);

  return (
    <StyledWrapper maxHeight={maxHeight} maxWidth={maxWidth}>
      <div className="Menubar">
        <div className="InnerMenuBar">
          <div className="IndexController">
            <IndexController
              n={jobServer?.progress?.n_total}
              progressN={unitProgress}
              index={unitIndex}
              setIndex={setUnitIndex}
              canGoBack={jobServer?.progress?.seek_backwards}
              canGoForward={jobServer?.progress?.seek_forwards}
            />
          </div>
          <HeartContainer damage={health?.damage} maxDamage={health?.maxDamage} />
          <div>
            <MenuButtonGroup>
              <FontSizeButton />
              <DarkModeButton />
              {fullScreenButton}
              {!cantLeave && <FaWindowClose onClick={() => setOpenExitModal(!openExitModal)} />}
            </MenuButtonGroup>
          </div>
        </div>
      </div>
      <div className="Annotator">
        {unitIndex < jobServer?.progress?.n_total ? children : <Finished jobServer={jobServer} />}
      </div>
      <Modal open={openExitModal} setOpen={setOpenExitModal}>
        <div style={{ display: "flex", minWidth: "150px", minHeight: "50px" }}>
          {jobServer?.return_link ? (
            <BackToOverview jobServer={jobServer} setOpen={setOpenExitModal} />
          ) : (
            authForm
          )}
        </div>
      </Modal>
    </StyledWrapper>
  );
};

const BackToOverviewStyle = styled.div`
  font-size: 1.6rem;
  text-align: center;
  .buttons {
    display: flex;
    gap: 1rem;
  }
`;

const BackToOverview = (props: { jobServer: JobServer; setOpen: (open: boolean) => void }) => {
  const navigate = useNavigate();
  if (!props.jobServer?.return_link) return null;
  return (
    <BackToOverviewStyle>
      <h3>Do you want to leave the current session?</h3>
      <div className="buttons">
        <Button
          fluid
          primary
          onClick={() => {
            navigate(props.jobServer.return_link);
          }}
        >
          Leave
        </Button>
        <Button fluid secondary onClick={() => props.setOpen(false)}>
          Stay
        </Button>
      </div>
    </BackToOverviewStyle>
  );
};

const getMaxWindowSize = (codebook: CodeBook) => {
  switch (codebook?.type) {
    case "questions":
      return ["100%", "1000px"];
    case "annotate":
      return ["100%", "2000px"];
    default:
      return ["100%", "100%"];
  }
};

const HeartContainer = ({
  damage,
  maxDamage,
  hearts = 5,
}: {
  damage: number;
  maxDamage: number;
  hearts?: number;
}) => {
  if (damage == null || maxDamage == null) return null;
  const healthPct = (100 * (maxDamage - damage)) / maxDamage;

  return (
    <div
      className="test"
      style={{
        paddingTop: "5px",
        height: "100%",
        color: "black",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <span>{Math.ceil(healthPct)}%</span>
      <Icon
        size="large"
        name="heart"
        style={{
          margin: "0px 3px",
          color: "transparent",
          background: `linear-gradient(to top, red ${healthPct}%, #000000aa ${healthPct}% 100%, #000000aa 100%)`,
        }}
      />
    </div>
  );
};

export default React.memo(JobController);
