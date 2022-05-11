import React, { useState, useEffect } from "react";
import { Button, Header, Portal, Segment } from "semantic-ui-react";
import FullDataTable from "./FullDataTable";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../../functions/copyToClipboard";

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

  return (
    <FullDataTable fullData={users} columns={columns} buttons={LoginLinkButton} backend={backend} />
  );
}

const LoginLinkButton = ({ row, backend, style }) => {
  const [link, setLink] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // to just load this if it's being requested
    if (!open) return;
    backend
      .getToken(row.email)
      .then((token) => {
        const qrhost = backend.host.replace(":", "%colon%");
        setLink({
          url: `${window.location.origin}/ccs-annotator-client/?host=${backend.host}&token=${token.token}`,
          qrUrl: `${window.location.origin}/ccs-annotator-client/?host=${qrhost}&token=${token.token}`,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }, [open, backend, row]);

  return (
    <Portal
      on="click"
      onOpen={() => setOpen(true)}
      hoverable
      mouseLeaveDelay={9999999}
      trigger={<Button icon="linkify" style={{ padding: "5px", ...style }} />}
    >
      <Segment
        style={{
          bottom: "25%",
          left: "25%",
          position: "fixed",
          minWidth: "50%",
          zIndex: 1000,
          background: "#dfeffb",
          border: "1px solid #136bae",
          textAlign: "center",
        }}
      >
        <Header style={{ fontSize: "1.5em" }}>Login link for {row.email}</Header>
        <QRCodeCanvas value={encodeURI(link?.qrUrl)} size={256} />
        <br />
        <br />
        <a href={link?.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "2em" }}>
          Login link
        </a>
        <br />
        <br />
        <Button secondary onClick={() => copyToClipboard(link?.url)}>
          Copy link
        </Button>
      </Segment>
    </Portal>
  );
};
