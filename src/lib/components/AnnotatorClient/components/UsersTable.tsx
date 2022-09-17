import React, { useState, useEffect, CSSProperties } from "react";
import { Button, Header, Portal, Segment } from "semantic-ui-react";
import FullDataTable from "./FullDataTable";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../../functions/copyToClipboard";
import { Column, RowObj, SetState } from "../../../types";
import Backend from "../../Login/Backend";

const columns: Column[] = [
  { name: "id", width: 2 },
  { name: "role", width: 2, f: (row) => (row.is_admin ? "admin" : "coder") },
  { name: "name", width: 11, title: true },
];

interface UsersTableProps {
  backend: Backend;
  users: RowObj[];
  setUsers: SetState<RowObj[]>;
}

export default function UsersTable({ backend, users, setUsers }: UsersTableProps) {
  useEffect(() => {
    backend
      .getUsers()
      .then(setUsers)
      .catch((e) => setUsers([]));
  }, [backend, setUsers]);

  // changing to API handling pagination
  // const getData = useCallback(
  //   async (page: number, pagesize: number, query?: string) => {
  //     const data = await backend.getUsers2(page, pagesize);
  //     return {
  //       rows: data.users,
  //       page,
  //       pages: Math.floor(data.total / pagesize),
  //     };
  //   },
  //   [backend]
  // );

  return (
    <FullDataTable fullData={users} columns={columns} buttons={LoginLinkButton} backend={backend} />
  );
}

interface LoginLinkButtonProps {
  row: RowObj;
  backend: Backend;
  style: CSSProperties;
}

const LoginLinkButton = ({ row, backend, style }: LoginLinkButtonProps) => {
  const [link, setLink] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // to just load this if it's being requested
    if (!open) return;
    backend
      .getToken(row.id)
      .then((token) => {
        const qrhost = backend.host.replace(":", "%colon%");
        setLink({
          url: `${window.location.origin + window.location.pathname}?host=${
            backend.host
          }&token=${token}`,
          qrUrl: `${
            window.location.origin + window.location.pathname
          }?host=${qrhost}&token=${token}`,
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
        <Header style={{ fontSize: "1.5em" }}>Login link for {row.name}</Header>
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
