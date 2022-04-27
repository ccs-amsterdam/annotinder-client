import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import JobServerDemo from "./classes/JobServerDemo";
import Annotator from "../Annotator/Annotator";
import { Button, Grid, Header, Menu, Icon } from "semantic-ui-react";
import FullDataTable from "../AnnotatorAPIClient/components/FullDataTable";

const DemoJobOverview = () => {
  const [job, setJob] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let codebook = searchParams.get("codebook");
    let units = searchParams.get("units");
    if (!codebook || !units) return setJob(null);
    getJobServer(units, codebook, setJob);
  }, [searchParams]);

  if (job === null) return <DemoSelector />;
  return <Annotator jobServer={job} />;
};

const unit_files = [
  { label: "State of the union speeches", filename: "sotu" },
  { label: "State of the union paragraphs", filename: "sotu_par" },
  { label: "Units with actor annotations", filename: "actor_annotation" },
  { label: "Political images", filename: "images" },
];
const codebook_files = [
  { label: "Annotate sentiment", filename: "sentimentAnnotation" },
  { label: "sentiment questions", filename: "sentimentQuestion" },
  {
    label: "Edit actor annotations (requires units with actor annotations)",
    filename: "actor_annotation",
  },
  { label: "Political Image swiping", filename: "politicalImageSwipe" },
];
const unitColumns = [{ name: "label", label: "Select unit set" }];
const codebookColumns = [{ name: "label", label: "Select codebook" }];

const DemoSelector = () => {
  const [, setSearchParams] = useSearchParams();
  const [units, setUnits] = useState(unit_files[0].filename);
  const [codebook, setCodebook] = useState(codebook_files[0].filename);
  const navigate = useNavigate();

  const onClick = () => {
    setSearchParams({ units, codebook });
  };

  return (
    <div>
      <Menu pointing secondary style={{ marginBottom: "10px" }}>
        <Menu.Item position="right" onClick={() => navigate("/")}>
          <Icon name="user" style={{ cursor: "pointer" }} />
        </Menu.Item>
      </Menu>
      <Grid centered container style={{ marginTop: "30px" }}>
        <Grid.Row>
          <Grid.Column textAlign="center" width="6">
            <Header as="h2">Select a demo job</Header>
            <p>
              Pick a unit set and codebook, and click start to fire up a demo job. Note that your
              annotations will not be stored, and will be lost when closing or refreshing the
              application.
            </p>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width="6">
            <Header textAlign="center">Units</Header>
            <FullDataTable
              fullData={unit_files}
              columns={unitColumns}
              onClick={(row) => setUnits(row.filename)}
              isActive={(row) => row.filename === units}
            />
          </Grid.Column>
          <Grid.Column width="6">
            <Header textAlign="center">Codebook</Header>
            <FullDataTable
              fullData={codebook_files}
              columns={codebookColumns}
              onClick={(row) => setCodebook(row.filename)}
              isActive={(row) => row.filename === codebook}
            />{" "}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width="12">
            <Button primary fluid disabled={!units || !codebook} onClick={onClick}>
              Start Demo Job
            </Button>
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

const getJobServer = async (units_file, codebook_file, setJob) => {
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

const getFileName = (filename, what) => {
  if (filename.toLowerCase().includes(".json")) {
    // if .json in name, assume its a full path
    return filename;
  }
  return `${what}/${filename}.json`;
};

export default React.memo(DemoJobOverview);
