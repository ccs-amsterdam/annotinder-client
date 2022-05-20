import React, { useState, useEffect } from "react";
import {
  Grid,
  Header,
  Button,
  Icon,
  Checkbox,
  Table,
  Dropdown,
  Container,
  Portal,
  Segment,
} from "semantic-ui-react";
import { useCSVDownloader } from "react-papaparse";
import JobsTable from "./JobsTable";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../../functions/copyToClipboard";

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
          <Table.Row key="id">
            <Table.Cell key="name" width="8" style={leftColStyle}>
              ID
            </Table.Cell>
            <Table.Cell key="value" width="8">
              {job?.id}
            </Table.Cell>
          </Table.Row>
          <Table.Row key="units">
            <Table.Cell key="name" style={leftColStyle}>
              Units
            </Table.Cell>
            <Table.Cell key="value">{job?.n_total}</Table.Cell>
          </Table.Row>

          {job?.jobset_details?.map((js, i) => {
            return (
              <Table.Row key={"set" + i}>
                <Table.Cell key="name" style={leftColStyle}>
                  {i === 0 ? "Job sets" : ""}
                </Table.Cell>
                <Table.Cell key="value">
                  {js.name} <i>({js.n_units} units</i>)
                </Table.Cell>
              </Table.Row>
            );
          })}
          <Table.Row key="ruleset">
            <Table.Cell key="name" style={leftColStyle}>
              Rule set
            </Table.Cell>
            <Table.Cell key="value">{job?.rules?.ruleset}</Table.Cell>
          </Table.Row>

          <Table.Row key="archived">
            <Table.Cell key="name" style={leftColStyle}>
              Archived
            </Table.Cell>
            <Table.Cell key="value">
              <Checkbox
                toggle
                checked={job.archived}
                onChange={() =>
                  setJobSettings(job.id, backend, { archived: !job.archived }, setJobs, setJob)
                }
              />
            </Table.Cell>
          </Table.Row>
          <Table.Row key="restricted">
            <Table.Cell key="name" style={leftColStyle}>
              Restricted
            </Table.Cell>
            <Table.Cell key="value">
              <Checkbox
                toggle
                checked={job.restricted}
                onChange={() =>
                  setJobSettings(job.id, backend, { restricted: !job.restricted }, setJobs, setJob)
                }
              />
            </Table.Cell>
          </Table.Row>
          <Table.Row key="jobusers">
            <JobUsers backend={backend} job={job} />
          </Table.Row>
          <Table.Row key="unregistered">
            <Table.Cell key="name" style={leftColStyle}>
              Unregistered coder
            </Table.Cell>
            <Table.Cell key="value">
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
            setSelection(d.value as string[]);
          }}
          options={options}
          style={{ width: "100%" }}
        />
        <Button icon="save" disabled={!changed} primary onClick={onSave} />
      </div>
      {changed ? (
        <span style={{ float: "right", color: "orange" }}>
          <i>Click save icon to confirm changes</i>
        </span>
      ) : null}
    </Table.Cell>
  );
};

const AnnotationProgress = ({ job, annotations }) => {
  if (!annotations?.progress) return null;
  return (
    <div style={{ marginTop: "20px", height: "100%" }}>
      <LabeledProgress
        key={"total"}
        label={"Total units finished"}
        value={annotations.totalProgress}
        total={job.n_total}
        bold={true}
      />
      <br />
      {Object.entries(annotations.progress).map(([key, value]) => {
        return <LabeledProgress key={key} label={key} value={value} total={job.n_total} />;
      })}
    </div>
  );
};

const LabeledProgress = ({ label, value, total, bold = false }) => {
  return (
    <div style={{ display: "flex", fontWeight: bold ? "bold" : "normal" }}>
      <span
        title={label}
        style={{
          width: "40%",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {label}
      </span>{" "}
      <div style={{ width: "40%" }}>
        <progress value={value} max={total} style={{ width: "100%" }} />
      </div>
      <span style={{ textAlign: "right", width: "20%", fontSize: "0.8em" }}>
        <sup>{value}</sup>/<sub>{total}</sub>
      </span>
    </div>
  );
};

const JobTokenButton = ({ jobId, backend, style = {} }) => {
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
    <Portal
      on="click"
      onOpen={() => setOpen(true)}
      hoverable
      mouseLeaveDelay={9999999}
      trigger={<Button style={{ padding: "5px", ...style }}>Get Job Token</Button>}
    >
      <Segment
        style={{
          bottom: "25%",
          left: "25%",
          position: "fixed",
          minWidth: "50%",
          zIndex: 1000,
          background: "#dfeffb",
          border: "1px solid #136bae",
        }}
      >
        <Header textAlign="center" style={{ fontSize: "1.5em" }}>
          Create job coder
        </Header>
        <div style={{ textAlign: "center" }}>
          <QRCodeCanvas value={encodeURI(link?.qrUrl)} size={256} />
        </div>
        <br />

        <Button
          fluid
          secondary
          onClick={() => {
            copyToClipboard(link?.url);
          }}
        >
          Copy link
        </Button>
      </Segment>
    </Portal>
  );
};
