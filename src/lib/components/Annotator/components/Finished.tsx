import React, { useState, useEffect } from "react";
import { Button, Grid, Header, Icon } from "semantic-ui-react";
import DownloadAnnotations from "./DownloadAnnotations";

const Finished = ({ jobServer }) => {
  const [debriefing, setDebriefing] = useState(null);

  useEffect(() => {
    if (!jobServer?.backend) return;
    jobServer.backend
      .getDebriefing(jobServer.job_id)
      .then((data) => {
        setDebriefing(data);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [jobServer]);

  if (!jobServer) return null;
  if (debriefing) {
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
              <Icon
                name="flag checkered"
                size="huge"
                style={{ transform: "scale(2)", marginBottom: "50px" }}
              />
            </div>
          </Grid.Row>
          <Grid.Row>
            <Header>{debriefing.message}</Header>
            {debriefing.link ? (
              <Button
                as="a"
                href={debriefing.link.replace("{user_id}", debriefing.user_id)}
                rel="noopener noreferrer"
                primary
                content={debriefing.link_text || "Click here!"}
              />
            ) : null}
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  } else if (!jobServer.getAllAnnotations) {
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
  } else {
    return (
      <Grid container centered verticalAlign="middle" style={{ margin: "0", padding: "0" }}>
        <Grid.Row style={{ marginTop: "40%", width: "100%", height: "100%" }}>
          <Grid.Column width={4}>
            <Icon name="flag checkered" size="huge" />
          </Grid.Column>
          <Grid.Column width={8}>
            <Header>You finished the codingjob!</Header>
            <p>Please download your results (and send them to whoever gave you this job). </p>
            <DownloadAnnotations jobServer={jobServer} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
};

export default Finished;
