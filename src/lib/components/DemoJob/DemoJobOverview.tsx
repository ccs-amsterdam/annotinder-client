import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import JobServerDemo from "./classes/JobServerDemo";
import Annotator from "../Annotator/Annotator";
import { Grid, Menu, Icon } from "semantic-ui-react";
import { StyledButton } from "../../styled/StyledSemantic";
import FullDataTable from "../AnnotatorClient/components/FullDataTable";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../functions/copyToClipboard";
import { SetState } from "../../types";

const DemoJobOverview = () => {
  const [job, setJob] = useState(null);
  const [searchParams] = useSearchParams();
  console.log("wtf");
  useEffect(() => {
    let codebook = searchParams.get("codebook");
    let units = searchParams.get("units");
    if (!codebook || !units) return setJob(null);
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
  return <Annotator jobServer={job} />;
};

interface DemoFile {
  label: string;
  units: string;
  codebook: string;
}

const demo_files: DemoFile[] = [
  {
    label: "Annotate sentiment and issues in SOTU",
    units: "sotu",
    codebook: "annotate_sentiment_issue",
  },
  { label: "Introduction to the CCS Annotator", units: "introduction", codebook: "dummy" },
  {
    label: "Assisted actor identification",
    units: "actor_identification",
    codebook: "actor_identification",
  },
  {
    label: "Issue annotinder",
    units: "issue_swiping",
    codebook: "issue_swiping",
  },
  {
    label: "Stance annotinder",
    units: "stance_swiping",
    codebook: "stance_swiping",
  },
  {
    label: "Coding of threads",
    units: "thread_coding",
    codebook: "dummy",
  },
];

const columns = [{ name: "label", label: "Select unit set" }];

const DemoSelector = () => {
  const [demo, setDemo] = useState<DemoFile>(demo_files[0]);
  const navigate = useNavigate();

  return (
    <div>
      <Menu pointing secondary style={{ marginBottom: "10px" }}>
        <Menu.Item position="right" onClick={() => navigate("/")}>
          <Icon name="user" style={{ cursor: "pointer" }} />
        </Menu.Item>
      </Menu>

      <Grid stackable centered container style={{ marginTop: "30px" }}>
        <Grid.Row>
          <Grid.Column textAlign="center" width="8">
            <h2>Demo jobs</h2>
            <p>
              This is a list of demo jobs to get a gist of the annotator features. Your annotations
              will not be stored, and will be lost when closing or refreshing the application.
            </p>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width="8">
            <h3 style={{ textAlign: "center" }}>Select a demo</h3>
            <FullDataTable
              fullData={demo_files}
              columns={columns}
              onClick={(row: DemoFile) => setDemo(row)}
              isActive={(row) => row.label === demo.label}
            />
          </Grid.Column>
          <Grid.Column width="8">
            <h3 style={{ textAlign: "center" }}>Start demo</h3>

            <DemoJobLink units={demo.units} codebook={demo.codebook} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

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
  const [, setSearchParams] = useSearchParams();
  if (!units || !codebook) return null;
  const url = `${
    window.location.origin + window.location.pathname
  }demo?units=${units}&codebook=${codebook}`;

  const onClick = () => {
    setSearchParams({ units, codebook });
  };

  return (
    <div>
      <StyledButton.Group fluid>
        <StyledButton primary disabled={!units || !codebook} onClick={onClick}>
          Start Demo
        </StyledButton>
        <StyledButton
          secondary
          onClick={() => {
            copyToClipboard(url);
          }}
        >
          Copy link
        </StyledButton>
      </StyledButton.Group>
      <br />
      <div style={{ textAlign: "center", width: "100%", marginTop: "10px" }}>
        <QRCodeCanvas value={encodeURI(url)} size={300} />
      </div>
      <br />
    </div>
  );
};

export default React.memo(DemoJobOverview);
