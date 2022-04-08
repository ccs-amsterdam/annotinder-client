import React, { useState } from "react";
import {
  Button,
  Grid,
  Header,
  Icon,
  List,
  Modal,
  TextArea,
  Dimmer,
  Loader,
  Checkbox,
} from "semantic-ui-react";

import UsersTable from "./UsersTable";

export default function ManageUsers({ backend }) {
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [addUsers, setAddUsers] = useState([]);

  const onCreate = () => {
    const newUsers = text.split(/[\s,;\n]/).reduce((newUsers, email) => {
      email = email.trim();
      if (email === "") return newUsers;
      const validEmail = email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      const exists = !!users.find((u) => u.email === email);
      newUsers.push({ email, validEmail, exists });

      return newUsers;
    }, []);
    setAddUsers(newUsers);
  };

  return (
    <Grid textAlign="center" style={{ height: "100%" }}>
      <CreateUserModal
        backend={backend}
        addUsers={addUsers}
        setAddUsers={setAddUsers}
        setUsers={setUsers}
      />
      <Grid.Column width="8">
        <Header>Users</Header>
        <UsersTable backend={backend} users={users} setUsers={setUsers} />
      </Grid.Column>
      <Grid.Column width="4">
        <Header>Create new users</Header>

        <TextArea
          placeholder="List email addresses, separated by newline, space, comma or semicolon"
          value={text}
          rows="10"
          style={{ width: "100%" }}
          onChange={(e, d) => setText(d.value)}
        ></TextArea>
        <Button fluid primary onClick={() => onCreate()}>
          Create users
        </Button>
      </Grid.Column>
    </Grid>
  );
}

const CreateUserModal = ({ backend, addUsers, setAddUsers, setUsers }) => {
  const [status, setStatus] = useState("idle");
  const [asAdmin, setAsAdmin] = useState(false);

  const onSubmit = async (event) => {
    const users = addUsers.reduce((submitUsers, user) => {
      if (!user.validEmail || user.exists) return submitUsers;
      submitUsers.push({ email: user.email, admin: asAdmin, password: "test" });
      return submitUsers;
    }, []);
    try {
      await backend.postUsers({ users });
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
      if (!user.validEmail) cannotAdd = "Invalid email address: ";
      if (user.exists) cannotAdd = "User already exists: ";
      return (
        <List.Item key={user.email}>
          <List.Icon
            name={cannotAdd ? "exclamation" : "check"}
            style={{ color: cannotAdd ? "red" : "green" }}
          />
          <List.Content>
            <span style={{ color: "red" }}>{cannotAdd}</span>
            {user.email}
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
      <Header icon="users" content={`Create users`} />
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
            <Button
              color="red"
              onClick={() => {
                setAddUsers([]);
              }}
            >
              <Icon name="remove" /> No
            </Button>
            <Button color="green" onClick={onSubmit}>
              <Icon name="checkmark" /> Yes
            </Button>
          </>
        )}
      </Modal.Actions>
    </Modal>
  );
};
