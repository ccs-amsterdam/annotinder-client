import React, { useState } from "react";
import { Grid, Header, Icon, Menu, Popup, Segment } from "semantic-ui-react";
import CoderJobsTable from "./CoderJobsTable";
import ManageJobs from "./ManageJobs";
import ManageUsers from "./ManageUsers";

export default function HomeAdmin({ backend, loginForm }) {
  const [menuItem, setMenuItem] = useState("coderView");

  const renderItem = () => {
    switch (menuItem) {
      case "coderView":
        return <CoderView backend={backend} />;
      case "manageJobs":
        return <ManageJobs backend={backend} />;
      case "manageUsers":
        return <ManageUsers backend={backend} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Menu inverted tabular style={{ height: "40px", marginBottom: "10px" }}>
        <Menu.Item
          name="Coder view"
          active={menuItem === "coderView"}
          onClick={() => setMenuItem("coderView")}
        />
        <Menu.Item
          name="Manage jobs"
          active={menuItem === "manageJobs"}
          onClick={() => setMenuItem("manageJobs")}
        />
        <Menu.Item
          name="Manage users"
          active={menuItem === "manageUsers"}
          onClick={() => setMenuItem("manageUsers")}
        />
        <Popup
          wide
          position="bottom right"
          on="click"
          trigger={
            <Menu.Item position="right">
              <Icon name="user" style={{ cursor: "pointer" }} />
            </Menu.Item>
          }
        >
          <Popup.Content>
            <Header>
              <Icon name="home" />
              {backend.host}
            </Header>
            {loginForm}
          </Popup.Content>
        </Popup>
      </Menu>
      <Segment attached="bottom" style={{ height: "calc(100% - 50px)", overflow: "auto" }}>
        {renderItem()}
      </Segment>
    </div>
  );
}

const CoderView = ({ backend }) => {
  return (
    <Grid textAlign="center" style={{ height: "100%" }}>
      <Grid.Column width="8">
        <Header>Coding jobs</Header>
        <CoderJobsTable backend={backend} />
      </Grid.Column>
    </Grid>
  );
};
