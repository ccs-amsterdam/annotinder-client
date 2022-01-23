import React, { useState } from "react";
import { Grid, Header, Icon, Menu, Segment } from "semantic-ui-react";
import JobsTable from "./JobsTable";
import ManageUsers from "./ManageUsers";

export default function HomeAdmin({ backend, loginForm }) {
  const [menuItem, setMenuItem] = useState("coderView");
  const [users, setUsers] = useState([]);

  const renderItem = () => {
    switch (menuItem) {
      case "coderView":
        return <CoderView backend={backend} />;
      case "manageJobs":
        return null;
      case "manageUsers":
        return <ManageUsers backend={backend} users={users} setUsers={setUsers} />;
      default:
        return null;
    }
  };

  return (
    <Grid
      container
      inverted
      textAlign="center"
      style={{ marginTop: "20px", height: "calc(100vh - 20px)", width: "100vw" }}
    >
      <Grid.Row style={{ height: "100px" }}>
        <Grid.Column style={{ height: "100%" }}>
          <Header>
            <Icon name="home" />
            {backend.host}
          </Header>
          {loginForm}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row style={{ height: "calc(100% - 100px)" }}>
        <Grid.Column style={{ height: "100%" }} width="16">
          <Menu attached="top" tabular>
            <Menu.Item
              name="Coder view"
              active={menuItem === "coderView"}
              onClick={() => setMenuItem("coderView")}
            />
            {/* <Menu.Item
              name="Manage jobs"
              active={menuItem === "manageJobs"}
              onClick={() => setMenuItem("manageJobs")}
            /> */}
            <Menu.Item
              name="Manage users"
              active={menuItem === "manageUsers"}
              onClick={() => setMenuItem("manageUsers")}
            />
          </Menu>
          <Segment style={{ height: "95%", overflow: "auto" }} attached="bottom">
            {renderItem()}
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

const CoderView = ({ backend }) => {
  return (
    <Grid textAlign="center" style={{ height: "100%" }}>
      <Grid.Column width="8">
        <Header>Coding jobs</Header>
        <JobsTable backend={backend} />
      </Grid.Column>
    </Grid>
  );
};
