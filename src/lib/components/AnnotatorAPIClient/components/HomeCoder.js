import React from "react";
import { Grid, Header, Icon } from "semantic-ui-react";

import JobsTable from "./JobsTable";

export default function HomeCoder({ backend, loginForm }) {
  return (
    <Grid
      container
      inverted
      textAlign="center"
      style={{ marginTop: "20px", minHeight: "50vh", maxHeight: "800px", width: "100vw" }}
      verticalAlign="middle"
    >
      <Grid.Row>
        <Grid.Column>
          <Header>
            <Icon name="home" />
            {backend.host}
          </Header>
          {loginForm}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width="16" style={{ maxWidth: "500px" }}>
          <Header>Coding jobs</Header>
          <JobsTable backend={backend} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
