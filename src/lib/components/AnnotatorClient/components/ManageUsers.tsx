import { useEffect, useState } from "react";
import { StyledButton } from "../../../styled/StyledSemantic";
import Backend from "../../Login/Backend";
import UsersTable from "./UsersTable";
import { SetState, User } from "../../../types";
import styled from "styled-components";
import { CenteredDiv } from "../../../styled/Styled";
import Modal from "../../Common/components/Modal";
import { Loader } from "../../../styled/Styled";
import Toggle from "../../Common/components/Toggle";

const StyledDiv = styled.div`
  display: grid;
  grid-template-areas: "UsersTable CreateUsers";
  grid-template-columns: minmax(auto, 900px) 300px;

  .CreateUsers {
    align-self: center;
    grid-area: CreateUsers;
    padding: 2rem;
  }
  .UsersTable {
    grid-area: UsersTable;
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "CreateUsers"
      "UsersTable";
  }
`;

interface AddUser {
  name: string;
  exists: boolean;
}

interface ManageUsersProps {
  backend: Backend;
}

export default function ManageUsers({ backend }: ManageUsersProps) {
  const [text, setText] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [addUsers, setAddUsers] = useState<AddUser[]>([]);

  const onCreate = () => {
    const newUsers = text.split(/[\s,;\n]/).reduce((newUsers, name) => {
      name = name.trim();
      if (name === "") return newUsers;
      const exists = !!users.find((u) => u.name === name);
      newUsers.push({ name, exists });

      return newUsers;
    }, []);
    setAddUsers(newUsers);
  };

  return (
    <CenteredDiv>
      <StyledDiv>
        <CreateUserModal
          backend={backend}
          addUsers={addUsers}
          setAddUsers={setAddUsers}
          setUsers={setUsers}
        />
        <div className="UsersTable">
          <UsersTable backend={backend} users={users} setUsers={setUsers} />
        </div>
        <div className="CreateUsers">
          <textarea
            placeholder="List usernames, separated by newline, space, comma or semicolon"
            value={text}
            rows={3}
            style={{ resize: "none", width: "100%" }}
            onChange={(e) => setText(String(e.target.value))}
          />
          <StyledButton fluid primary onClick={() => onCreate()}>
            Create users
          </StyledButton>
        </div>
      </StyledDiv>
    </CenteredDiv>
  );
}

interface CreateUserModalProps {
  backend: Backend;
  addUsers: AddUser[];
  setAddUsers: SetState<AddUser[]>;
  setUsers: SetState<User[]>;
}

const CreateUserModal = ({ backend, addUsers, setAddUsers, setUsers }: CreateUserModalProps) => {
  const [status, setStatus] = useState("idle");
  const [asAdmin, setAsAdmin] = useState(false);

  useEffect(() => {
    if (addUsers && addUsers.length > 0) setStatus("idle");
  }, [addUsers]);

  const onSubmit = async () => {
    const users = addUsers.reduce((submitUsers, user) => {
      if (user.exists) return submitUsers;
      submitUsers.push({
        name: user.name,
        email: user.name,
        admin: asAdmin,
        password: "test",
      });
      return submitUsers;
    }, []);
    try {
      await backend.postUsers(users);
      await backend
        .getUsers()
        .then(setUsers)
        .catch((e) => setUsers([]));
      setAddUsers([]);
    } catch (e) {
      setStatus("error");
    }
  };

  const listUsers = () => {
    const ul = addUsers.map((user) => {
      let cannotAdd = "";
      if (user.exists) cannotAdd = "User already exists: ";
      return (
        <li key={user.name}>
          <span style={{ color: "red" }}>{cannotAdd}</span>
          {user.name}
        </li>
      );
    });
    return ul;
  };

  return (
    <Modal
      open={addUsers.length > 0}
      setOpen={(open) => {
        setAddUsers([]);
      }}
    >
      <h3>Create users</h3>
      <div>
        <p>Do you want to create the following users?</p>
        <ul>{listUsers()}</ul>
        <div style={{ display: "flex" }}>
          <label style={{ marginRight: "1rem" }}>Give admin rights:</label>
          <Toggle checked={asAdmin} setChecked={setAsAdmin} />
        </div>
      </div>
      <div>
        {status === "error" ? (
          <div>Could not create users (for a reason not yet covered in the error handling...)</div>
        ) : null}
        {status === "pending" ? (
          <Loader active={true} />
        ) : (
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <StyledButton
              fluid
              onClick={() => {
                setAddUsers([]);
              }}
            >
              Cancel
            </StyledButton>
            <StyledButton fluid primary onClick={onSubmit}>
              Create
            </StyledButton>
          </div>
        )}
      </div>
    </Modal>
  );
};
