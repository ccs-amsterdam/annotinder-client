import React, { useState, useEffect } from "react";
import FullDataTable from "./FullDataTable";
import { Grid, Header, Button, Icon, Checkbox, Table, Progress } from "semantic-ui-react";
import { useCSVDownloader } from "react-papaparse";

const columns = [
  { name: "id", title: true, width: 2 },
  { name: "title", title: true, width: 9 },
  { name: "created", title: true, date: true, width: 3 },
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
    <Grid textAlign="center" style={{ height: "100%" }}>
      <Grid.Column width="8">
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

const toggleJobArchived = async (id, backend, setData) => {
  const newvalue = await backend.toggleJobArchived(id);
  setData((jobs) => {
    const i = jobs.findIndex((j) => j.id === Number(id));
    if (i >= 0) jobs[i].archived = newvalue.archived;
    return [...jobs];
  });
};

const ArchiveButton = ({ row, backend, setData }) => {
  if (!backend) return null;

  return (
    <Button
      icon={row.archived ? "eye slash" : "eye"}
      onClick={(e, d) => {
        toggleJobArchived(row.id, backend, setData);
      }}
      style={{ padding: "5px", background: row.archived ? "#f76969" : "" }}
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
    console.log(units);
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

  // const onClickProgress = () => {
  //   getAnnotations();
  // };

  // const onClickDownload = async () => {
  //   const ann = annotations?.data || (await getAnnotations());
  // };

  if (!job) return null;

  return (
    <div style={{ marginTop: "30px", height: "100%", textAlign: "left" }}>
      <Header textAlign="center">{job.title}</Header>

      <Table basic="very" compact>
        <Table.Body>
          <Table.Row>
            <Table.Cell>ID</Table.Cell>
            <Table.Cell>{job?.id}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Units</Table.Cell>
            <Table.Cell>{job?.n_total}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Task type</Table.Cell>
            <Table.Cell>{job?.codebook?.type}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Rule set</Table.Cell>
            <Table.Cell>{job?.rules?.ruleset}</Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>Archived</Table.Cell>
            <Table.Cell>
              <Checkbox
                toggle
                checked={job.archived}
                onChange={() => toggleJobArchived(job.id, backend, setJobs)}
              />
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
            primary
            content="Download annotations"
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
    </div>
  );
};

const AnnotationProgress = ({ job, annotations }) => {
  if (!annotations?.progress) return null;
  console.log(annotations);
  return (
    <div style={{ marginTop: "20px", height: "100%" }}>
      <LabeledProgress
        key={"total"}
        label={"Total units coded"}
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
