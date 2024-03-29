import { useState, useEffect, CSSProperties } from "react";
import { Checkbox, Dropdown, Container, Portal, Segment } from "semantic-ui-react";
import { StyledButton, StyledTable, Button } from "../../../styled/StyledSemantic";
import { useCSVDownloader } from "react-papaparse";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../../functions/copyToClipboard";
import Backend from "../../Login/Backend";
import { Job, User, SetState } from "../../../types";
import { FaList } from "react-icons/fa";
import { Loader } from "../../../styled/Styled";

const leftColStyle = { fontWeight: "bold", textAlign: "right", paddingRight: "15px" };

interface AnnotationData {
  data: any;
  progress: Record<string, Record<string, number>>;
  totalProgress: number;
}

interface JobDetailsProps {
  backend: Backend;
  jobId: string;
  setJobs: SetState<Job[]>;
}

const JobDetails = ({ backend, jobId, setJobs }: JobDetailsProps) => {
  const [job, setJob] = useState<Job>(null);
  const { CSVDownloader, Type } = useCSVDownloader();
  const [annotations, setAnnotations] = useState<AnnotationData>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    setAnnotations(null);
    backend.getCodingjobDetails(jobId).then(setJob).catch(console.error);
  }, [backend, jobId]);

  const getAnnotations = async () => {
    setLoading(true);
    const units = await backend.getCodingjobAnnotations(job.id);
    setLoading(false);
    const uniqueUnits: Record<string, boolean> = {};
    const progress: Record<string, Record<string, number>> = {};
    const data = [];
    const dataColumns = new Set<string>();
    for (let unit of units) {
      const coder = unit.coder_id + ". " + unit.coder;
      if (!progress[unit.jobset]) progress[unit.jobset] = {};
      if (!progress[unit.jobset][coder]) progress[unit.jobset][coder] = 0;
      if (unit.status === "DONE") progress[unit.jobset][coder]++;
      uniqueUnits[unit.unit_id] = true;

      for (let ann of unit.annotation) {
        ann.field = ann.field || "";
        data.push({
          coder_id: unit.coder_id,
          coder: unit.coder,
          jobset: unit.jobset,
          unit_id: unit.unit_id,
          unit_status: unit.status,
          ...ann,
        });
        for (let columnname of Object.keys(ann)) {
          dataColumns.add(columnname);
        }
      }
    }

    for (let annotation of data) {
      for (let columnname of dataColumns) {
        if (!annotation[columnname]) annotation[columnname] = "";
      }
    }

    setAnnotations({
      data,
      progress,
      totalProgress: Object.keys(uniqueUnits).length,
    });
  };

  if (!job)
    return (
      <div>
        <Loader active={true} background="none" blur={0} />
      </div>
    );

  return (
    <Container style={{ height: "100%", textAlign: "left" }}>
      <StyledTable
        singleLine
        unstackable
        size="small"
        basic="very"
        structured
        compact="very"
        style={{ paddingLeft: "", textAlign: "left" }}
      >
        <StyledTable.Body>
          <StyledTable.Row key="id">
            <StyledTable.Cell key="name" width="8" style={leftColStyle}>
              ID
            </StyledTable.Cell>
            <StyledTable.Cell key="value" width="8">
              {job?.id}
            </StyledTable.Cell>
          </StyledTable.Row>
          <StyledTable.Row key="units">
            <StyledTable.Cell key="name" style={leftColStyle}>
              Units
            </StyledTable.Cell>
            <StyledTable.Cell key="value">{job?.n_total}</StyledTable.Cell>
          </StyledTable.Row>

          <StyledTable.Row key={"sets"}>
            <StyledTable.Cell key="name" style={leftColStyle}>
              Job sets
            </StyledTable.Cell>
            <StyledTable.Cell key="value">
              <div style={{ overflow: "auto", maxHeight: "100px" }}>
                {job?.jobset_details?.map((js, i) => {
                  return (
                    <p key={"value" + i} style={{ margin: 0 }}>
                      {js.name} <i>({js.n_units + ", " + js.rules.ruleset}</i>)
                    </p>
                  );
                })}
              </div>
            </StyledTable.Cell>
          </StyledTable.Row>

          <StyledTable.Row key="archived">
            <StyledTable.Cell key="name" style={leftColStyle}>
              Archived
            </StyledTable.Cell>
            <StyledTable.Cell key="value">
              <Checkbox
                toggle
                checked={job.archived}
                onChange={() =>
                  setJobSettings(job.id, backend, { archived: !job.archived }, setJobs, setJob)
                }
              />
            </StyledTable.Cell>
          </StyledTable.Row>
          <StyledTable.Row key="restricted">
            <StyledTable.Cell key="name" style={leftColStyle}>
              Restricted
            </StyledTable.Cell>
            <StyledTable.Cell key="value">
              <Checkbox
                toggle
                checked={job.restricted}
                onChange={() =>
                  setJobSettings(job.id, backend, { restricted: !job.restricted }, setJobs, setJob)
                }
              />
            </StyledTable.Cell>
          </StyledTable.Row>
          <StyledTable.Row key="jobusers">
            <JobUsers backend={backend} job={job} />
          </StyledTable.Row>
          <StyledTable.Row key="unregistered">
            <StyledTable.Cell key="name" style={leftColStyle}>
              Unregistered coder
            </StyledTable.Cell>
            <StyledTable.Cell key="value">
              <JobTokenButton jobId={jobId} backend={backend} />
            </StyledTable.Cell>
          </StyledTable.Row>
        </StyledTable.Body>
      </StyledTable>

      {annotations?.data ? (
        <CSVDownloader
          type={Type.Button}
          filename={`annotations_${job?.id}_${job?.title}.csv`}
          data={annotations?.data}
          style={{ display: "flex", cursor: "pointer", border: "0", padding: "0", width: "100%" }}
        >
          <StyledButton fluid disabled={annotations?.data.length === 0 || loading} primary>
            {annotations?.data.length > 0 ? "Download annotations" : "There are no annotations :("}
          </StyledButton>
        </CSVDownloader>
      ) : (
        <StyledButton fluid onClick={getAnnotations} disabled={annotations !== null || loading}>
          <FaList />
          Get annotations
        </StyledButton>
      )}

      <AnnotationProgress job={job} annotations={annotations} />
    </Container>
  );
};

interface JobUsersProps {
  backend: Backend;
  job: Job;
}

const JobUsers = ({ backend, job }: JobUsersProps) => {
  const [options, setOptions] = useState([]);
  const [selection, setSelection] = useState([]);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    backend
      .getUsers()
      .then((users: User[]) => {
        const options = users.map((u) => ({ key: u.name, value: u.name, text: u.name }));
        setOptions(options);
      })
      .catch((e: Error) => setOptions([]));
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
    <StyledTable.Cell colSpan="2" style={{ border: "none" }}>
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
        <StyledButton disabled={!changed} primary onClick={onSave} />
      </div>
      {changed ? (
        <span style={{ float: "right", color: "var(--orange)" }}>
          <i>Click save icon to confirm changes</i>
        </span>
      ) : null}
    </StyledTable.Cell>
  );
};

interface AnnotationProgressProps {
  job: any;
  annotations: AnnotationData;
}

const AnnotationProgress = ({ job, annotations }: AnnotationProgressProps) => {
  const { CSVDownloader, Type } = useCSVDownloader();
  if (!annotations?.progress) return null;

  const data: Record<string, { jobset: string; total: number; n: number }> = {};
  for (const jobset of Object.keys(annotations.progress)) {
    const details = job.jobset_details.find((jd: any) => jd.name === jobset);
    const total = details?.n_units || 0;
    for (const coder of Object.keys(annotations.progress[jobset])) {
      if (!data[coder]) data[coder] = { jobset, total, n: 0 };
      data[coder].n += annotations.progress[jobset][coder];
    }
  }

  const summaryCSV = [];
  let totalAnnotations = 0;
  let finishedJobsets = new Set([]);
  let codersStarted = Object.keys(data).length;
  let codersFinished = 0;
  for (const [coder, values] of Object.entries(data)) {
    totalAnnotations += values.n;
    const [coder_id, coder_label] = coder.split(/\.(.*)/s);
    summaryCSV.push({
      coder_id,
      coder_label,
      jobset: values.jobset,
      done: values.n,
      total: values.total,
    });
    if (values.n === values.total) {
      codersFinished += 1;
      finishedJobsets.add(values.jobset);
    }
  }
  let jobsetsStarted = Object.keys(annotations.progress).length;
  let jobsetsFinished = finishedJobsets.size;

  return (
    <div style={{ marginTop: "20px", height: "100%" }}>
      <ul>
        <li>{totalAnnotations} Annotations</li>
        <li>
          {jobsetsStarted} / {job.jobset_details.length} jobset{jobsetsStarted !== 1 ? "s" : ""}{" "}
          started, {jobsetsFinished} finished (by at least one coder)
        </li>
        <li>
          {codersStarted} session{codersStarted !== 1 ? "s" : ""} started, {codersFinished} finished
        </li>
      </ul>

      <CSVDownloader
        type={Type.Button}
        filename={`progress_${job?.id}_${job?.title}.csv`}
        data={summaryCSV}
        style={{ display: "flex", cursor: "pointer", border: "0", padding: "0", width: "100%" }}
      >
        <StyledButton fluid disabled={annotations?.data.length === 0} secondary>
          {annotations?.data.length > 0
            ? "Download progress summary"
            : "There are no annotations :("}
        </StyledButton>
      </CSVDownloader>
      <br />
      <br />
      <LabeledProgress
        key={"total"}
        label={"Units coded (at least once)"}
        value={annotations.totalProgress}
        total={job.n_total}
        bold={true}
      />
      <br />
      {Object.entries(data).map(([coder, values]) => {
        return <LabeledProgress key={coder} label={coder} value={values.n} total={values.total} />;
      })}
    </div>
  );
};

interface LabeledProgressProps {
  label: string;
  value: number;
  total: number;
  bold?: boolean;
}

const LabeledProgress = ({ label, value, total, bold = false }: LabeledProgressProps) => {
  return (
    <div style={{ display: "flex", fontWeight: bold ? "bold" : "normal" }}>
      <span
        title={label}
        style={{
          width: "60%",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {label}
      </span>{" "}
      <div style={{ width: "20%" }}>
        <progress value={value} max={total} style={{ width: "100%" }} />
      </div>
      <span style={{ textAlign: "right", width: "20%", fontSize: "0.8em" }}>
        <sup>{value}</sup>/<sub>{total}</sub>
      </span>
    </div>
  );
};

interface JobTokenButtonProps {
  jobId: string;
  backend: Backend;
  style?: CSSProperties;
}

const JobTokenButton = ({ jobId, backend, style = {} }: JobTokenButtonProps) => {
  const [link, setLink] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // to just load this if it's being requested
    if (!open) return;
    backend
      .getJobToken(jobId)
      .then((token: string) => {
        const qrhost = backend.host.replace(":", "%colon%");
        setLink({
          url: `${window.location.origin + window.location.pathname}?host=${
            backend.host
          }&jobtoken=${token}`,
          qrUrl: `${
            window.location.origin + window.location.pathname
          }/?host=${qrhost}&jobtoken=${token}`,
        });
      })
      .catch((e: Error) => {
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
          display: "flex",
          flexDirection: "column",
          background: "white",
          border: "1px solid var(--primary-dark)",
          color: "var(--text-fixed)",
        }}
      >
        <h2>Create job coder</h2>
        <div style={{ textAlign: "center" }}>
          <QRCodeCanvas value={encodeURI(link?.qrUrl)} size={256} />
        </div>
        <br />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            size={2}
            className="primary"
            onClick={() => {
              copyToClipboard(link?.url);
            }}
          >
            Copy link
          </Button>
        </div>
      </Segment>
    </Portal>
  );
};

const setJobSettings = async (
  id: string,
  backend: Backend,
  settingsObj: { archived?: boolean; restricted?: boolean },
  setJobs: SetState<Job[]>,
  setJob: SetState<Job>
) => {
  let backupJob: Job;
  let backupJobs: Job[];

  setJobs((jobs: Job[]) => {
    backupJobs = [...jobs];
    const i = jobs.findIndex((j: Job) => j.id === id);
    if (i >= 0) jobs[i] = { ...jobs[i], ...settingsObj };
    return [...jobs];
  });

  if (setJob)
    setJob((job: Job) => {
      backupJob = { ...job };
      return { ...job, ...settingsObj };
    });

  backend.setJobSettings(id, settingsObj).catch((e) => {
    console.error(e);
    // if backend fails, revert to previous state
    setJobs(backupJobs);
    setJob(backupJob);
  });
};

export default JobDetails;
