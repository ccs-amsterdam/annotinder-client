import React, { useState, useEffect } from "react";
import { Button, Popup, Header } from "semantic-ui-react";
import FullDataTable from "./FullDataTable";

const columns = [
  { name: "role", width: 2, f: (row) => (row.is_admin ? "admin" : "coder") },
  { name: "email", width: 11, title: true },
];

export default function UsersTable({ backend, users, setUsers }) {
  useEffect(() => {
    backend
      .getUsers()
      .then(setUsers)
      .catch((e) => setUsers([]));
  }, [backend, setUsers]);

  // const rowOptions = (row) => {
  //   const style = { padding: "5px" };
  //   return (
  //     <ButtonGroup>
  //       <Button icon="linkify" style={style} />
  //     </ButtonGroup>
  //   );
  // };

  // const columnsWithButton = [{ name: "", width: 2, f: rowOptions }, ...columns];

  return (
    <FullDataTable
      fullData={users}
      columns={columns}
      buttons={[LoginLinkButton]}
      backend={backend}
    />
  );
}

const buttonstyle = { padding: "5px" };

const LoginLinkButton = ({ row, backend }) => {
  const [link, setLink] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // to just load this if it's being requested
    if (!open && !link) return;
    backend
      .getToken(row.email)
      .then((token) => {
        setLink(
          `${window.location.host}/ccs-annotator-client/?host=${backend.host}&token=${token}`
        );
      })
      .catch((e) => {
        console.log(e);
      });
  }, [open, link, backend, row]);

  return (
    <Popup
      on="click"
      onOpen={() => setOpen(true)}
      hoverable
      trigger={<Button icon="linkify" style={buttonstyle} />}
    >
      <Header>Login link for {row.email}</Header>
      <p>{link}</p>
      <Button onClick={() => navigator.clipboard.writeText(link)}>Copy link</Button>
    </Popup>
  );
};
