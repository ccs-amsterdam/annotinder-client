import React from "react";
import { Table } from "semantic-ui-react";
import { MetaField } from "../../../types";

interface MetaProps {
  meta_fields: MetaField[];
}

const Meta = ({ meta_fields }: MetaProps) => {
  const rows = () => {
    return meta_fields.map((row) => {
      let label = row.label ?? row.name ?? "";
      label = String(label);
      return (
        <Table.Row
          key={label}
          style={{
            lineHeight: "1.2",
            fontSize: `1.2em`,
          }}
        >
          <Table.Cell
            width={1}
            style={{
              borderTop: "none",
              textAlign: "right",
              color: "#1768a6",
            }}
          >
            <b>{label.toUpperCase()}</b>
          </Table.Cell>
          <Table.Cell style={row.style}>{row.value}</Table.Cell>
        </Table.Row>
      );
    });
  };

  if (meta_fields.length === 0) return null;

  return (
    <div
      key="meta"
      style={{
        width: "calc(100% - 20px)",
        display: "flex",
        marginTop: "5px",
        marginBottom: "10px",
        fontFamily: "Garamond, serif",
        //boxShadow: "3px 4px 10px grey",
      }}
    >
      <div style={{ margin: "auto" }}>
        <Table
          basic="very"
          compact
          unstackable
          style={{
            width: "100%",
            lineHeight: "0.8",
            padding: "10px",
            paddingLeft: "10px",
            background: "#ffffff",
            color: "black",
          }}
        >
          <Table.Body>{rows()}</Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default Meta;
