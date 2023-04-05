import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, StyledButton } from "../../../styled/StyledSemantic";
import QRCodeCanvas from "qrcode.react";
import copyToClipboard from "../../../functions/copyToClipboard";
import { RowObj, SetState } from "../../../types";
import Backend from "../../Login/Backend";

import GridList from "../../Common/components/GridList/GridList";
import {
  DataPoint,
  DataQuery,
  GridItemTemplate,
  FilterQueryOption,
  SortQueryOption,
} from "../../Common/components/GridList/GridListTypes";
import { sortData } from "../../Common/components/GridList/GridListFunctions";

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

  const loadData = useCallback(
    async (query: DataQuery) => {
      console.log(query);
      let data: DataPoint[] = users.map((v: any) => {
        v = { ...v };
        v.role = v.is_admin ? "admin" : "coder";
        return v;
      });

      data = data.filter((v) => {
        for (let filter of query.filter) {
          if (filter.type === "search") {
            const str: string = v[filter.variable] as string;
            if (typeof str !== "string") continue;
            if (!str.toLowerCase().includes(filter.search.toLowerCase())) return false;
          }
          if (filter.type === "select") {
            if (!filter.select.includes(v[filter.variable])) return false;
          }
        }

        return true;
      });

      sortData(data, query);
      const meta = { offset: query.offset, total: data.length };
      data = data.slice(query.offset, query.offset + query.n);
      return { data, meta };
    },
    [users]
  );

  const setDetail = useCallback(
    async (data: DataPoint) => {
      return <LoginLink datapoint={data} backend={backend} />;
    },
    [backend]
  );

  const gridListSettings = useMemo(() => {
    const template: GridItemTemplate[] = [
      { label: "User", value: "name", style: { fontWeight: "bold", fontSize: "1.6rem" } },

      {
        label: "Role",
        value: "role",
        style: { fontStyle: "italic" },
      },
    ];

    const sortOptions: SortQueryOption[] = [
      { variable: "created", label: "Created", default: "desc" },
    ];

    const filterOptions: FilterQueryOption[] = [
      { variable: "user", label: "User", type: "search" },
      { variable: "email", label: "Email", type: "search" },
      {
        variable: "role",
        label: "Role",
        type: "select",
        selectOptions: [
          { label: "admin", value: "admin" },
          { label: "coder", value: "coder" },
        ],
      },
    ];

    return { template, sortOptions, filterOptions };
  }, []);

  return (
    <GridList
      loadData={loadData}
      setDetail={setDetail}
      template={gridListSettings.template}
      sortOptions={gridListSettings.sortOptions}
      filterOptions={gridListSettings.filterOptions}
    />
  );
}

interface LoginLinkButtonProps {
  datapoint: DataPoint;
  backend: Backend;
}

const LoginLink = ({ datapoint, backend }: LoginLinkButtonProps) => {
  const [link, setLink] = useState(null);
  const [passwd, setPasswd] = useState("");
  const [changed, setChanged] = useState("");

  async function changePassword() {
    const res = await backend.postPassword(String(datapoint.email), passwd);
    if (res.status === 204) {
      setChanged("success");
    } else {
      setChanged("error");
    }
  }

  useEffect(() => {
    // to just load this if it's being requested
    backend
      .getToken(datapoint.id)
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
  }, [backend, datapoint]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>
        <>Login link for {datapoint.name}</>
      </h2>
      <QRCodeCanvas value={encodeURI(link?.qrUrl)} size={128} />
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
      <br />
      <br />

      <h3>Change password</h3>
      <input
        style={{ margin: "1rem", borderRadius: "5px" }}
        value={passwd}
        type="password"
        autoComplete="new-password"
        onChange={(e) => setPasswd(e.target.value)}
      />
      {!changed && (
        <Button disabled={!passwd} onClick={changePassword}>
          Change password
        </Button>
      )}
      {changed === "success" && <p style={{ color: "green" }}>Password changed</p>}
      {changed === "error" && <p style={{ color: "red" }}>Error changing password</p>}
    </div>
  );
};
