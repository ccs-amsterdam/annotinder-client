import { useState } from "react";
import { Grid, Icon, List, Modal, TextArea, Dimmer, Loader, Checkbox } from "semantic-ui-react";
import { StyledButton } from "../../../styled/StyledSemantic";
import Backend from "../../Login/Backend";
import UsersTable from "./UsersTable";
import { SetState, User } from "../../../types";

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
    <Grid stackable textAlign="center" style={{ height: "100%" }}>
      <CreateUserModal
        backend={backend}
        addUsers={addUsers}
        setAddUsers={setAddUsers}
        setUsers={setUsers}
      />
      <Grid.Column width="8">
        <h3>Users</h3>
        <UsersTable backend={backend} users={users} setUsers={setUsers} />
      </Grid.Column>
      <Grid.Column width="4">
        <h3>Create new users</h3>

        <TextArea
          placeholder="List usernames, separated by newline, space, comma or semicolon"
          value={text}
          rows="10"
          style={{ width: "100%" }}
          onChange={(e, d) => setText(String(d.value))}
        ></TextArea>
        <StyledButton fluid primary onClick={() => onCreate()}>
          Create users
        </StyledButton>
      </Grid.Column>
    </Grid>
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
        <List.Item key={user.name}>
          <List.Icon
            name={cannotAdd ? "exclamation" : "check"}
            style={{ color: cannotAdd ? "var(--red)" : "var(--green)" }}
          />
          <List.Content>
            <span style={{ color: "red" }}>{cannotAdd}</span>
            {user.name}
          </List.Content>
        </List.Item>
      );
    });
    return ul;
  };

  return (
    <Modal
      closeIcon
      open={addUsers.length > 0}
      onClose={() => {
        setAddUsers([]);
      }}
      onOpen={() => setStatus("idle")}
    >
      <h3>
        <Icon name="users" /> Create users
      </h3>
      <Modal.Content>
        <p>Do you want to add the following users?</p>
        <List>{listUsers()}</List>
        <Checkbox
          toggle
          label="Add users as admin"
          checked={asAdmin}
          onClick={() => setAsAdmin(!asAdmin)}
        />
      </Modal.Content>
      <Modal.Actions>
        {status === "error" ? (
          <div>Could not add users (for a reason not yet covered in the error handling...)</div>
        ) : null}
        {status === "pending" ? (
          <Dimmer active inverted>
            <Loader content="Creating Users" />
          </Dimmer>
        ) : (
          <>
            <StyledButton
              color="red"
              onClick={() => {
                setAddUsers([]);
              }}
            >
              <Icon name="remove" /> No
            </StyledButton>
            <StyledButton color="green" onClick={onSubmit}>
              <Icon name="checkmark" /> Yes
            </StyledButton>
          </>
        )}
      </Modal.Actions>
    </Modal>
  );
};
