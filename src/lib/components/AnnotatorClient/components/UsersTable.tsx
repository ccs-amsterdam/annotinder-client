import { useState, useEffect, CSSProperties } from "react";
import { Icon, Portal } from "semantic-ui-react";
import { CustomButton, StyledButton } from "../../../styled/StyledSemantic";
import FullDataTable from "./FullDataTable";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../../functions/copyToClipboard";
import { Column, RowObj, SetState } from "../../../types";
import Backend from "../../Login/Backend";
import styled from "styled-components";

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

const PortalContent = styled.div`
  padding: 1em;
  background: var(--background);
  bottom: 25%;
  left: 25%;
  position: fixed;
  min-width: 50%;
  z-index: 1000;
  background: #dfeffb;
  border: 1px solid var(--background-inversed);
  text-align: center;
`;

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
      onClose={() => {
        setOpen(false);
      }}
      hoverable
      mouseLeaveDelay={9999999}
      trigger={
        <CustomButton>
          <Icon name="linkify" />
        </CustomButton>
      }
    >
      <PortalContent>
        <h2>Login link for {row.name}</h2>
        <QRCodeCanvas value={encodeURI(link?.qrUrl)} size={256} />
        <br />
        <br />
        <a href={link?.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "2em" }}>
          Login link
        </a>
        <br />
        <br />
        <StyledButton secondary onClick={() => copyToClipboard(link?.url)}>
          Copy link
        </StyledButton>
      </PortalContent>
    </Portal>
  );
};
