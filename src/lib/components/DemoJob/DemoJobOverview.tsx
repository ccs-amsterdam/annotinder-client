import React, { useCallback } from "react";
import { Button, ButtonGroup } from "../../styled/StyledSemantic";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../functions/copyToClipboard";
import styled from "styled-components";
import GridList from "../Common/components/GridList/GridList";
import { DataPoint, GridItemTemplate } from "../Common/components/GridList/GridListTypes";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 450px;
  max-width: 100%;
  margin: auto;

  .Header {
    margin: auto;
    text-align: center;
  }
`;

const DemoJobOverview = () => {
  const setDetail = useCallback(async (datapoint: DataPoint) => {
    return (
      <div className="Action">
        <h3 style={{ textAlign: "center" }}>Start demo</h3>
        <DemoJobLink units={datapoint.units as string} codebook={datapoint.codebook as string} />
      </div>
    );
  }, []);

  return (
    <StyledDiv>
      <div className="Header">
        <h2>Demo jobs</h2>
        <p>
          This is a list of demo jobs to get a gist of the annotator features. Your annotations will
          not be stored, and will be lost when closing or refreshing the application.
        </p>
      </div>
      <div className="Body">
        <GridList fullData={demo_files} template={template} setDetail={setDetail} />
      </div>
    </StyledDiv>
  );
};

const demo_files: DataPoint[] = [
  { id: "1", label: "General introduction", units: "introduction", codebook: "dummy" },
  {
    id: "2",
    label: "Label",
    units: "sotu",
    codebook: "annotate_sentiment_issue",
  },
  {
    id: "3",
    label: "Argument annotation",
    units: "lancar",
    codebook: "relations",
  },
  {
    id: "4",
    label: "Assisted label",
    units: "actor_identification",
    codebook: "actor_identification",
  },
  {
    id: "5",
    label: "Issue annotinder",
    units: "issue_swiping",
    codebook: "issue_swiping",
  },
  {
    id: "6",
    label: "Stance annotinder",
    units: "stance_swiping",
    codebook: "stance_swiping",
  },
  {
    id: "7",
    label: "Styled units: threads",
    units: "thread_coding",
    codebook: "dummy",
  },
];

const template: GridItemTemplate[] = [
  {
    label: "Demo",
    value: "label",
    style: { fontSize: "1.4rem", fontWeight: "bold" },
  },
];

interface DemoJobLinkProps {
  units: string;
  codebook: string;
}

const DemoJobLink = ({ units, codebook }: DemoJobLinkProps) => {
  if (!units || !codebook) return null;
  const url = `${window.location.origin}/demo?units=${units}&codebook=${codebook}`;

  const onClick = () => {
    window.location.href = url;
  };

  return (
    <div>
      <ButtonGroup>
        <Button primary fluid disabled={!units || !codebook} onClick={onClick}>
          Start Demo
        </Button>
        <Button
          fluid
          secondary
          onClick={() => {
            copyToClipboard(url);
          }}
        >
          Copy link
        </Button>
      </ButtonGroup>
      <br />
      <div style={{ textAlign: "center", width: "100%", maxWidth: "60vw", marginTop: "10px" }}>
        <QRCodeCanvas value={encodeURI(url)} size={150} />
      </div>
      <br />
    </div>
  );
};

export default React.memo(DemoJobOverview);
