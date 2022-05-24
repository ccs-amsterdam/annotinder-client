import React, { ReactElement, useState } from "react";
import { Icon, List, Menu, Popup } from "semantic-ui-react";
import { SetState } from "../../../types";
import Backend from "../classes/Backend";
import CoderView from "./CoderView";
import ManageJobs from "./ManageJobs";
import ManageUsers from "./ManageUsers";

interface HomeProps {
  backend: Backend;
  authForm: ReactElement;
}

export default function Home({ backend, authForm }: HomeProps) {
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
    <div style={{ height: "100%", width: "100%" }}>
      <MenuBar
        backend={backend}
        authForm={authForm}
        menuItem={menuItem}
        setMenuItem={setMenuItem}
      />
      <div style={{ height: "5%" }}></div>
      <div style={{ height: "calc(95% - 50px)", overflow: "auto" }}>{renderItem()}</div>
    </div>
  );
}

interface MenuItem {
  label: string;
  value: string;
  onlyAdmin: boolean;
}

const menuItems: MenuItem[] = [
  { label: "Coder view", value: "coderView", onlyAdmin: true },
  { label: "Manage jobs", value: "manageJobs", onlyAdmin: true },
  { label: "Manage users", value: "manageUsers", onlyAdmin: true },
];

interface MenuBarProps {
  backend: Backend;
  authForm: ReactElement;
  menuItem: string;
  setMenuItem: SetState<string>;
}

const MenuBar = ({ backend, authForm, menuItem, setMenuItem }: MenuBarProps) => {
  return (
    <Menu pointing secondary style={{ marginBottom: "10px" }}>
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
