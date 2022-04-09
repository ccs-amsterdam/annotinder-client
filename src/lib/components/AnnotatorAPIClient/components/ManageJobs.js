import React, { useState, useEffect } from "react";
import FullDataTable from "./FullDataTable";
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
} from "semantic-ui-react";
import { useCSVDownloader } from "react-papaparse";

const columns = [
  { name: "id", title: true, width: 2 },
  { name: "title", title: true, width: 6 },
  { name: "created", title: true, date: true, width: 6 },
];

export default function ManageJobs({ backend }) {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    getAllJobs(backend, setJobs);
  }, [backend]);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      if (jobs && jobs.length > 0) setJobId(jobs[0].id);
      return;
    }
    backend
      .getCodingjobDetails(jobId)
      .then(setJob)
      .catch((e) => {
        console.error(e);
        setJob(null);
      });
  }, [jobs, jobId, backend, setJob]);

  const onClick = async (job) => {
    setJobId(job.id);
  };

  return (
    <Grid stackable textAlign="center" style={{ height: "100%" }}>
      <Grid.Column width="6">
        <Header>Jobs</Header>
        <FullDataTable
          fullData={jobs}
          setFullData={setJobs}
          buttons={ArchiveButton}
          columns={columns}
          onClick={onClick}
          backend={backend}
        />
      </Grid.Column>
      <Grid.Column width="4">
        <JobDetails backend={backend} job={job} jobId={jobId} setJobs={setJobs} />
      </Grid.Column>
    </Grid>
  );
}

const setJobSettings = async (id, backend, settingsObj, setData) => {
  const newSettings = await backend.setJobSettings(id, settingsObj);
  setData((jobs) => {
    const i = jobs.findIndex((j) => j.id === Number(id));
    if (i >= 0) jobs[i] = { ...jobs[i], ...newSettings.data };
    return [...jobs];
  });
};

const ArchiveButton = ({ row, backend, setData, style }) => {
  if (!backend) return null;

  return (
    <Button
      icon={row.archived ? "eye slash" : "eye"}
      onClick={(e, d) => {
        //toggleJobArchived(row.id, backend, setData);
        setJobSettings(row.id, backend, { archived: !row.archived }, setData);
      }}
      style={{ padding: "5px", background: row.archived ? "#f76969" : "", ...style }}
    />
  );
};

const getAllJobs = (backend, setJobs) => {
  backend
    .getAllJobs()
    .then((jobs) => {
      setJobs(jobs.jobs || []);
    })
    .catch((e) => {
      console.error(e);
      setJobs([]);
    });
};

const leftColStyle = { fontWeight: "bold" };

const JobDetails = ({ backend, job, jobId, setJobs }) => {
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
        style={{ paddingLeft: "" }}
      >
        <Table.Body>
          <Table.Row>
            <Table.Cell width="8" style={leftColStyle}>
              ID
            </Table.Cell>
            <Table.Cell>{job?.id}</Table.Cell>
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
                  setJobSettings(job.id, backend, { archived: !job.archived }, setJobs)
                }
              />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell style={leftColStyle}>Restricted Access</Table.Cell>
            <Table.Cell>
              <Checkbox
                toggle
                checked={job.restricted}
                onChange={() =>
                  setJobSettings(job.id, backend, { restricted: !job.restricted }, setJobs)
                }
              />
            </Table.Cell>
          </Table.Row>
          <JobUsers backend={backend} job={job} />
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
    <Table.Row>
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
    </Table.Row>
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
