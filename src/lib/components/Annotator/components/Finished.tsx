import { useState, useEffect, CSSProperties } from "react";
import { Grid, Icon, Loader } from "semantic-ui-react";
import { QRCodeCanvas } from "qrcode.react";
import copyToClipboard from "../../../functions/copyToClipboard";
import Backend from "../../Login/Backend";
import { Debriefing, JobServer } from "../../../types";
import Markdown from "../../Common/Markdown";
import { StyledButton } from "../../../styled/StyledSemantic";
import { useQuery } from "@tanstack/react-query";

interface FinishedProps {
  jobServer: JobServer;
}

const Finished = ({ jobServer }: FinishedProps) => {
  const debriefing = useQuery<Debriefing>(
    ["debriefing"],
    () => {
      if (!jobServer?.backend) return null;
      return jobServer.getDebriefing();
    },
    {
      enabled: !!jobServer,
    }
  );

  if (!jobServer) return null;

  if (debriefing.isFetching)
    return (
      <div style={{ height: "100%", position: "relative" }}>
        <Loader size="huge" active style={{ color: "var(--text)" }} />
      </div>
    );

  if (debriefing.data) {
    return (
      <Grid
        container
        centered
        verticalAlign="middle"
        style={{ margin: "0", padding: "0", height: "100%" }}
      >
        <Grid.Column textAlign="center">
          <Grid.Row style={{ width: "100%" }}>
            <div>
              <Icon name="flag checkered" size="huge" style={{ marginBottom: "50px" }} />
            </div>
          </Grid.Row>
          <Grid.Row>
            <Markdown>{debriefing.data.message}</Markdown>
            <br />
            {debriefing.data.link ? (
              <a
                href={debriefing.data.link.replace("{user_id}", debriefing.data.user_id)}
                rel="noopener noreferrer"
              >
                {" "}
                <br />
                <StyledButton
                  primary
                  size="huge"
                  content={debriefing.data.link_text || "Click here!"}
                />
              </a>
            ) : null}
            {debriefing.data.qr ? (
              <JobLink jobId={jobServer.job_id} backend={jobServer.backend} />
            ) : null}
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
  return (
    <Grid
      container
      centered
      verticalAlign="middle"
      style={{ margin: "0", padding: "0", height: "100%" }}
    >
      <Grid.Column textAlign="center">
        <Grid.Row style={{ width: "100%" }}>
          <div>
            <Icon name="flag checkered" size="huge" style={{ transform: "scale(2)" }} />
          </div>
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
};

interface JobLinkProps {
  jobId: number;
  backend: Backend;
  style?: CSSProperties;
}

const JobLink = ({ jobId, backend, style = {} }: JobLinkProps) => {
  const [link, setLink] = useState(null);
  useEffect(() => {
    // to just load this if it's being requested
    backend
      .getJobToken(jobId)
      .then((token: string) => {
        const qrhost = backend.host.replace(":", "%colon%");
        setLink({
          url: `${window.location.origin + window.location.pathname}guest/?host=${
            backend.host
          }&jobtoken=${token}`,
          qrUrl: `${
            window.location.origin + window.location.pathname
          }guest/?host=${qrhost}&jobtoken=${token}`,
        });
      })
      .catch((e: Error) => {
        console.error(e);
      });
  }, [backend, jobId]);

  if (!link) return null;

  return (
    <div style={{ paddingTop: "15px" }}>
      <h2
        onClick={() => {
          copyToClipboard(link?.url);
          setTimeout(() => alert("copied link!"), 50);
        }}
        style={{ color: "var(--primary)", cursor: "copy" }}
      >
        Share this job with others!
      </h2>
      <div style={{ textAlign: "center" }}>
        <QRCodeCanvas value={encodeURI(link?.qrUrl)} size={256} />
      </div>
      <br />
    </div>
  );
};

export default Finished;
