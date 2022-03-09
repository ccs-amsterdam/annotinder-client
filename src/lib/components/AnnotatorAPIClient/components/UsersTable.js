import React, { useState, useEffect } from "react";
import { Button, Popup, Header } from "semantic-ui-react";
import FullDataTable from "./FullDataTable";
import QRCode from "react-qr-code";

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
        const qrhost = backend.host.replace(":", "%colon%");
        setLink({
          url: `https://ccs-amsterdam.github.io/ccs-annotator-client/?host=${backend.host}&token=${token}`,
          qrUrl: `https://ccs-amsterdam.github.io/ccs-annotator-client/?host=${qrhost}&token=${token}`,
        });
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
      <Header style={{ fontSize: "1.5em" }}>Login link for {row.email}</Header>
      <QRCode value={encodeURI(link?.qrUrl)} size={256} />
      <br />
      <br />
      <a href={link?.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "2em" }}>
        Login link
      </a>
      <Button
        secondary
        onClick={() => navigator.clipboard.writeText(link?.url)}
        style={{ float: "right" }}
      >
        Copy link
      </Button>
    </Popup>
  );
};
