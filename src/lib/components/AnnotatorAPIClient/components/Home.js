import React, { useState } from "react";
import { Icon, List, Menu, Popup, Segment } from "semantic-ui-react";
import CoderView from "./CoderView";
import ManageJobs from "./ManageJobs";
import ManageUsers from "./ManageUsers";

export default function Home({ backend, authForm }) {
  const [menuItem, setMenuItem] = useState("coderView");
  if (!backend) return null;

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
      <MenuBar
        backend={backend}
        authForm={authForm}
        menuItem={menuItem}
        setMenuItem={setMenuItem}
      />
      <Segment attached="bottom" style={{ height: "calc(100% - 50px)", overflow: "auto" }}>
        {renderItem()}
      </Segment>
    </div>
  );
}

const menuItems = [
  { label: "Coder view", value: "coderView", onlyAdmin: false },
  { label: "Manage jobs", value: "manageJobs", onlyAdmin: true },
  { label: "Manage users", value: "manageUsers", onlyAdmin: true },
];

const MenuBar = ({ backend, authForm, menuItem, setMenuItem }) => {
  return (
    <Menu inverted tabular style={{ height: "40px", marginBottom: "10px" }}>
      {menuItems.map((item) => {
        if (item.onlyAdmin && !backend?.is_admin) return null;
        return (
          <Menu.Item
            key={item.label}
            name={item.label}
            active={menuItem === item.value}
            onClick={() => setMenuItem(item.value)}
          />
        );
      })}

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
          <List>
            <List.Item>
              <List.Icon name="home" />
              <List.Content>{backend.host}</List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="user" />
              <List.Content>{backend.email}</List.Content>
            </List.Item>
          </List>
          {authForm}
        </Popup.Content>
      </Popup>
    </Menu>
  );
};
