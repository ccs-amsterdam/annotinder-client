import React, { useEffect } from "react";
import FullDataTable from "./FullDataTable";

const columns = [
  { name: "role", width: 2, f: (row) => (row.is_admin ? "admin" : "coder") },
  { name: "email", title: true },
];

export default function UsersTable({ backend, users, setUsers }) {
  useEffect(() => {
    backend
      .getUsers()
      .then(setUsers)
      .catch((e) => setUsers([]));
  }, [backend, setUsers]);

  const onClick = (d) => {
    console.log(d);
  };

  return <FullDataTable fullData={users} columns={columns} onClick={onClick} />;
}
