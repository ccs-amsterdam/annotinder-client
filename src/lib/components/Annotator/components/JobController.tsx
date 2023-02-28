import React, { ReactElement } from "react";
import { Icon } from "semantic-ui-react";

import { useNavigate } from "react-router-dom";
import IndexController from "./IndexController";
import Finished from "./Finished";
import { CodeBook, FullScreenNode, JobServer, SetState } from "../../../types";
import { CustomButton, StyledButton } from "../../../styled/StyledSemantic";
import { DarkModeButton, FontSizeButton } from "../../Common/Theme";
import MenuPopup from "../../Common/MenuPopup";
import MenuButtonGroup from "./MenuButtonGroup";
import styled from "styled-components";

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
  max-width: ${(p) => p.maxWidth};
  max-height: ${(p) => p.maxHeight};
  margin: 0 auto;
  height: 100%;
  width: 100%;
  background: var(--background);

  .Menubar {
    height: 40px;
    width: 100;
    padding: 3px 5px 0px 5px;
    display: flex;
    justify-content: space-between;
    background: var(--background-inversed-fixed);
    color: var(--text-inversed-fixed);
    //border-bottom: 3px double var(--background-fixed);
    font-size: 2rem;
    position: relative;
    z-index: 9000;

    .IndexController {
      flex: 1 1 auto;
      padding-top: 4px;
      padding-right: 10px;
      width: 100px;
    }
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

  return (
    <StyledWrapper maxHeight={maxHeight} maxWidth={maxWidth}>
      <div className="Menubar">
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
            <FontSizeButton color="white" />
            <DarkModeButton color="white" />
          </MenuButtonGroup>
        </div>
        {fullScreenButton}
        {cantLeave ? null : (
          <UserButton fullScreenNode={fullScreenNode} jobServer={jobServer} authForm={authForm} />
        )}
      </div>
      <div style={{ height: "calc(100% - 40px)" }}>
        {unitIndex < jobServer?.progress?.n_total ? children : <Finished jobServer={jobServer} />}
      </div>
    </StyledWrapper>
  );
};

interface UserButtonProps {
  fullScreenNode: FullScreenNode;
  jobServer: JobServer;
  authForm: ReactElement;
}

const UserButton = ({ fullScreenNode, jobServer, authForm }: UserButtonProps) => {
  //const [searchParams, setSearchParams] = useSearchParams();

  return (
    <MenuPopup
      offsetX={0}
      trigger={
        <StyledButton
          icon="cancel"
          style={{
            background: "transparent",
            color: "var(--text-inversed-fixed)",
            padding: "6px 1px",
            margin: 0,
          }}
        />
      }
    >
      <div style={{ display: "flex", minWidth: "150px", minHeight: "50px" }}>
        {jobServer?.return_link ? <BackToOverview jobServer={jobServer} /> : authForm}
      </div>
    </MenuPopup>
  );
};

interface BackToOverviewProps {
  jobServer: JobServer;
}

const BackToOverview = ({ jobServer }: BackToOverviewProps) => {
  const navigate = useNavigate();
  if (!jobServer?.return_link) return null;
  return (
    <CustomButton className="primary flex" onClick={() => navigate(jobServer.return_link)}>
      Close job
    </CustomButton>
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
