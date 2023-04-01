import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import JobServerDemo from "./classes/JobServerDemo";
import Annotator from "../Annotator/Annotator";
import { Button, ButtonGroup } from "../../styled/StyledSemantic";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../functions/copyToClipboard";
import { SetState } from "../../types";
import styled from "styled-components";
import GridList from "../Common/components/GridList/GridList";
import { DataPoint, GridItemTemplate } from "../Common/components/GridList/GridListTypes";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;

  .Header {
    margin: auto;
    max-width: 700px;
    text-align: center;
  }
`;

const DemoJobOverview = () => {
  const [job, setJob] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let codebook = searchParams.get("codebook");
    let units = searchParams.get("units");
    if (!codebook || !units) {
      return setJob(null);
    }
    getJobServer(units, codebook, setJob);
  }, [searchParams]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const msg = "If you leave now, any changes made in the current unit will not be saved."; // most browsers actually show default message
      e.returnValue = msg;
      return msg;
    };

    if (job != null) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [job]);

  if (job === null) return <DemoSelector />;
  return <Annotator jobServer={job} askFullScreen />;
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
    label: "Label & Relation",
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

const DemoSelector = () => {
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

const template: GridItemTemplate[] = [
  {
    label: "Demo",
    value: "label",
    style: { fontSize: "1.4rem", fontWeight: "bold" },
  },
];

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getJobServer = async (
  units_file: string,
  codebook_file: string,
  setJob: SetState<JobServerDemo>
) => {
  try {
    const units_res = await fetch(getFileName(units_file, "units"), { headers });
    let units = await units_res.json();
    if (typeof units !== "object") units = JSON.parse(units);

    const codebook_res = await fetch(getFileName(codebook_file, "codebook"), { headers });
    let codebook = await codebook_res.json();
    if (typeof codebook !== "object") codebook = JSON.parse(codebook);

    setJob(new JobServerDemo(codebook, units));
  } catch (e) {
    setJob(null);
    console.error(e);
  }
};

const getFileName = (filename: string, what: string) => {
  if (filename.toLowerCase().includes(".json")) {
    // if .json in name, assume its a full path
    return filename;
  }
  return `${what}/${filename}.json`;
};

interface DemoJobLinkProps {
  units: string;
  codebook: string;
}

const DemoJobLink = ({ units, codebook }: DemoJobLinkProps) => {
  if (!units || !codebook) return null;
  const url = `${
    window.location.origin + window.location.pathname
  }demo?units=${units}&codebook=${codebook}`;

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
