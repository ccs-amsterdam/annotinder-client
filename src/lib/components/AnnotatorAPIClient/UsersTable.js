import React, { useEffect, useState } from "react";
import FullDataTable from "./FullDataTable";
import { Icon } from "semantic-ui-react";

const columns = [
  { name: "admin", width: 2, f: (row) => (row.is_admin ? <Icon name="check" /> : null) },
  { name: "email", title: true },
];

export default function UsersTable({ backend }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    backend
      .getUsers()
      .then(setUsers)
      .catch((e) => setUsers([]));
  }, [backend]);

  const onClick = (d) => {
    console.log(d);
  };

  return <FullDataTable fullData={users} columns={columns} onClick={onClick} />;
}
