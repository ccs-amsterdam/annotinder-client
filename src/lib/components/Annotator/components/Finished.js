import React from "react";
import { Grid, Header, Icon } from "semantic-ui-react";
import DownloadAnnotations from "./DownloadAnnotations";

const Finished = ({ jobServer }) => {
  if (!jobServer) return null;

  if (!jobServer.getAllAnnotations) {
    return (
      <Grid container centered verticalAlign="middle" style={{ margin: "0", padding: "0" }}>
        <Grid.Row style={{ marginTop: "40%", width: "100%", height: "100%" }}>
          <div>
            <Icon name="flag checkered" size="huge" style={{ transform: "scale(5)" }} />
          </div>
        </Grid.Row>
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
