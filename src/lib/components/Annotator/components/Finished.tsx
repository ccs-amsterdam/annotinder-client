import { useState, useEffect, CSSProperties } from "react";
import { Loader } from "semantic-ui-react";
import { QRCodeCanvas } from "qrcode.react";
import copyToClipboard from "../../../functions/copyToClipboard";
import Backend from "../../Login/Backend";
import { Debriefing, JobServer } from "../../../types";
import { useQuery } from "@tanstack/react-query";
import Markdown from "../../Common/components/Markdown";
import styled from "styled-components";
import { FaFlagCheckered } from "react-icons/fa";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
  padding: 2rem;
  line-height: 1.5em;

  font-size: 1.7rem;

  .Message {
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: center;
  }

  p {
    text-align: left;
    max-width: 30em;
  }

  svg {
    color: var(--primary-text);
    font-size: 8rem;
    margin-bottom: 2rem;
  }

  a {
    color: var(--primary-text);
    text-decoration: underline;
    font-size: 1.2em;
    width: 100%;
    text-align: center;
    cursor: pointer;
  }
`;

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
      <StyledDiv>
        <Loader size="huge" active style={{ color: "var(--text)" }} />
      </StyledDiv>
    );

  if (debriefing.data) {
    return (
      <StyledDiv>
        <div className="Message">
          <FaFlagCheckered />
          <Markdown>{debriefing.data.message}</Markdown>
        </div>
        <br />
        {debriefing.data.link ? (
          <a
            href={debriefing.data.link.replace("{user_id}", debriefing.data.user_id)}
            rel="noopener noreferrer"
          >
            {debriefing.data.link_text || "Click here!"}
          </a>
        ) : null}
        {debriefing.data.qr ? (
          <JobLink jobId={jobServer.job_id} backend={jobServer.backend} />
        ) : null}
      </StyledDiv>
    );
  }

  return (
    <StyledDiv>
      <FaFlagCheckered />
    </StyledDiv>
  );
};

interface JobLinkProps {
  jobId: string;
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
