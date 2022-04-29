import React, { useState, useEffect } from "react";
import {
  Grid,
  Header,
  Button,
  Icon,
  Checkbox,
  Table,
  Progress,
  Dropdown,
  Container,
  Popup,
} from "semantic-ui-react";
import { useCSVDownloader } from "react-papaparse";
import JobsTable from "./JobsTable";
import QRCode from "react-qr-code";

export default function ManageJobs({ backend }) {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);

  return (
    <Grid stackable textAlign="center" style={{ height: "100%" }}>
      <Grid.Column width="8">
        <Header>Jobs</Header>
        <JobsTable
          backend={backend}
          setJob={setJob}
          jobs={jobs}
          setJobs={setJobs}
          jobId={jobId}
          setJobId={setJobId}
        />
      </Grid.Column>
      <Grid.Column width="4">
        <JobDetails backend={backend} job={job} setJob={setJob} jobId={jobId} setJobs={setJobs} />
      </Grid.Column>
    </Grid>
  );
}

const setJobSettings = async (id, backend, settingsObj, setJobs, setJob) => {
  backend.setJobSettings(id, settingsObj);
  setJobs((jobs) => {
    const i = jobs.findIndex((j) => j.id === Number(id));
    if (i >= 0) jobs[i] = { ...jobs[i], ...settingsObj };
    return [...jobs];
  });
  // setJob is optional because it doesn't work if set via the button in FullDataTable
  if (setJob) setJob((job) => ({ ...job, ...settingsObj }));
};

const leftColStyle = { fontWeight: "bold", textAlign: "right", paddingRight: "15px" };

const JobDetails = ({ backend, job, setJob, jobId, setJobs }) => {
  const { CSVDownloader, Type } = useCSVDownloader();
  const [annotations, setAnnotations] = useState(null);

  useEffect(() => {
    setAnnotations(null);
  }, [jobId]);

  const getAnnotations = async () => {
    const units = await backend.getCodingjobAnnotations(job.id);
    const uniqueUnits = {};
    const progress = {};
    const data = [];
    for (let unit of units) {
      if (!progress[unit.coder]) progress[unit.coder] = 0;
      if (unit.status === "DONE") progress[unit.coder]++;
      uniqueUnits[unit.id] = true;

      for (let ann of unit.annotation) {
        data.push({
          coder: unit.coder,
          unit_id: unit.unit_id,
          unit_status: unit.status,
          ...ann,
        });
      }
    }

    setAnnotations({
      data,
      progress,
      totalProgress: Object.keys(uniqueUnits).length,
    });
  };

  if (!job) return null;

  return (
    <Container style={{ height: "100%", textAlign: "left" }}>
      <Header textAlign="center">{job.title}</Header>

      <Table
        singleLine
        unstackable
        size="small"
        basic="very"
        structured
        compact="very"
        style={{ paddingLeft: "", textAlign: "left" }}
      >
        <Table.Body>
          <Table.Row>
            <Table.Cell width="8" style={leftColStyle}>
              ID
            </Table.Cell>
            <Table.Cell width="8">{job?.id}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell style={leftColStyle}>Units</Table.Cell>
            <Table.Cell>{job?.n_total}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell style={leftColStyle}>Task type</Table.Cell>
            <Table.Cell>{job?.codebook?.type}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell style={leftColStyle}>Rule set</Table.Cell>
            <Table.Cell>{job?.rules?.ruleset}</Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell style={leftColStyle}>Archived</Table.Cell>
            <Table.Cell>
              <Checkbox
                toggle
                checked={job.archived}
                onChange={() =>
                  setJobSettings(job.id, backend, { archived: !job.archived }, setJobs, setJob)
                }
              />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell style={leftColStyle}>Restricted</Table.Cell>
            <Table.Cell>
              <Checkbox
                toggle
                checked={job.restricted}
                onChange={() =>
                  setJobSettings(job.id, backend, { restricted: !job.restricted }, setJobs, setJob)
                }
              />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <JobUsers backend={backend} job={job} />
          </Table.Row>
          <Table.Row>
            <Table.Cell style={leftColStyle}>Unregistered coder</Table.Cell>
            <Table.Cell>
              <JobTokenButton jobId={jobId} backend={backend} />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      {annotations?.data ? (
        <CSVDownloader
          type={Type.Button}
          filename={`annotations_${job?.id}_${job?.title}.csv`}
          data={annotations?.data}
          style={{ cursor: "pointer", border: "0", padding: "0", width: "100%" }}
        >
          <Button
            fluid
            loading={!annotations?.data}
            disabled={annotations?.data.length === 0}
            primary
            content={
              annotations?.data.length > 0 ? "Download annotations" : "There are no annotations :("
            }
            icon="download"
            labelPosition="left"
          />
        </CSVDownloader>
      ) : (
        <Button fluid onClick={getAnnotations} disabled={annotations !== null}>
          <Icon name="list" />
          Get annotations
        </Button>
      )}

      <AnnotationProgress job={job} annotations={annotations} />
    </Container>
  );
};

const JobUsers = ({ backend, job }) => {
  const [options, setOptions] = useState([]);
  const [selection, setSelection] = useState([]);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    backend
      .getUsers()
      .then((users) => {
        const options = users.map((u) => ({ key: u.email, value: u.email, text: u.email }));
        setOptions(options);
      })
      .catch((e) => setOptions([]));
  }, [backend, setOptions]);

  useEffect(() => {
    console.log(job);
    setSelection(job?.users || []);
  }, [job, setSelection]);

  const onSave = async () => {
    await backend.setJobUsers(job.id, selection, false);
    setChanged(false);
  };

  if (!job?.restricted) return null;
  // const [allUsers, setAllUsers] = useState([]);
  // const [users, setUsers] = useState([]);

  return (
    <Table.Cell colSpan="2" style={{ border: "none" }}>
      <b>Users with access</b>
      <div style={{ display: "flex" }}>
        <Dropdown
          selection
          multiple
          value={selection}
          onChange={(e, d) => {
            setChanged(true);
            setSelection(d.value);
          }}
          options={options}
          style={{ width: "100%" }}
        />
        <Button icon="save" disabled={!changed} primary onClick={onSave} />
      </div>
      {changed ? (
        <span style={{ float: "right", color: "orange" }}>
          <i>Don't forget to save changes!</i>
        </span>
      ) : null}
    </Table.Cell>
  );
};

const AnnotationProgress = ({ job, annotations }) => {
  if (!annotations?.progress) return null;
  console.log(annotations);
  return (
    <div style={{ marginTop: "20px", height: "100%" }}>
      <LabeledProgress
        key={"total"}
        label={"Total units finished"}
        value={annotations.totalProgress}
        total={job.n_total}
      />
      {Object.entries(annotations.progress).map(([key, value]) => {
        return (
          <LabeledProgress key={key} size="small" label={key} value={value} total={job.n_total} />
        );
      })}
    </div>
  );
};

const LabeledProgress = ({ label, value, total, size }) => {
  return (
    <Progress
      size={size}
      label={label}
      key="total"
      autoSuccess
      value={value}
      total={total}
      progress="ratio"
    />
  );
};

const JobTokenButton = ({ jobId, backend, style }) => {
  const [link, setLink] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // to just load this if it's being requested
    if (!open) return;
    backend
      .getJobToken(jobId)
      .then((token) => {
        const qrhost = backend.host.replace(":", "%colon%");
        setLink({
          url: `${window.location.origin}/ccs-annotator-client/guest/?host=${backend.host}&jobtoken=${token.token}`,
          qrUrl: `${window.location.origin}/ccs-annotator-client/guest/?host=${qrhost}&jobtoken=${token.token}`,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }, [open, backend, jobId]);

  return (
    <Popup
      on="click"
      onOpen={() => setOpen(true)}
      hoverable
      mouseLeaveDelay={9999999}
      trigger={<Button style={{ padding: "5px", ...style }}>Get Job Token</Button>}
    >
      <Header textAlign="center" style={{ fontSize: "1.5em" }}>
        Create job coder
      </Header>
      <QRCode value={encodeURI(link?.qrUrl)} size={256} />
      <br />

      <Button fluid secondary onClick={() => navigator.clipboard.writeText(link?.url)}>
        Copy link
      </Button>
    </Popup>
  );
};
