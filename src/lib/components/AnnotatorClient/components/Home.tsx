import { ReactElement, useRef, useState } from "react";
import { FaHome, FaUser } from "react-icons/fa";
import { SetState } from "../../../types";
import { DarkModeButton } from "../../Common/components/Theme";
import Backend from "../../Login/Backend";
import CoderView from "./CoderView";
import ManageJobs from "./ManageJobs";
import ManageUsers from "./ManageUsers";
import styled from "styled-components";
import MenuButtonGroup from "../../Annotator/components/MenuButtonGroup";
import Popup from "../../Common/components/Popup";

interface HomeProps {
  backend: Backend;
  authForm: ReactElement;
}

const StyledDiv = styled.div`
  .Content {
    margin-top: 5rem;
  }
`;

const Menu = styled.ul`
  display: flex;
  align-items: center;
  list-style-type: none;
  margin: 0;
  padding: 3px 10px 0px 10px;
  gap: 1rem;
  font-size: 1.6rem;
  color: var(--text);

  .RightSide {
    padding-top: 5px;
    flex: 1 1 auto;
    display: flex;
    justify-content: flex-end;
  }

  li {
    cursor: pointer;
    padding: 1.5rem 0.5rem 0.5rem 0.5rem;

    &.active {
      border-bottom: 2px solid var(--primary);
    }
  }
`;

const PopupContent = styled.div`
  padding: 1rem;
  font-size: 1.5rem;
  svg {
    margin-right: 1rem;
  }
  .authform {
    display: flex;
    justify-content: center;
  }
`;

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
    <StyledDiv>
      <MenuBar
        backend={backend}
        authForm={authForm}
        menuItem={menuItem}
        setMenuItem={setMenuItem}
      />
      <div className="Content">{renderItem()}</div>
    </StyledDiv>
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
  const userButtonRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Menu>
        {menuItems.map((item) => {
          if (item.onlyAdmin && !backend?.is_admin) return null;
          return (
            <li
              key={item.label}
              className={menuItem === item.value ? "active" : ""}
              onClick={() => setMenuItem(item.value)}
            >
              {item.label}
            </li>
          );
        })}

        <div className="RightSide">
          <MenuButtonGroup>
            <DarkModeButton />
            <div ref={userButtonRef}>
              <FaUser />
            </div>
          </MenuButtonGroup>
        </div>
      </Menu>
      <Popup triggerRef={userButtonRef}>
        <PopupContent>
          <div>
            <FaHome />
            <span>{backend.host.replace(/http[s]?:\/\//, "")}</span>
          </div>
          <div>
            <FaUser />
            <span>{backend.name}</span>
          </div>
          <div className="authform" style={{ width: "200px" }}>
            {authForm}
          </div>
        </PopupContent>
      </Popup>
    </>
  );
};
