import React from "react";
import { Table } from "semantic-ui-react";
import { MetaField } from "../../../types";

interface MetaProps {
  meta_fields: MetaField[];
}

const Meta = ({ meta_fields }: MetaProps) => {
  const rows = () => {
    return meta_fields.map((row) => {
      return (
        <Table.Row
          key={row.label || row.name}
          style={{
            lineHeight: "1.2",
            fontSize: `1.3em`,
          }}
        >
          <Table.Cell width={1} style={{ borderTop: "none" }}>
            <b>{row.label || row.name}</b>
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
        width: "100%",
        textAlign: "right",
        padding: "10px 30px",
      }}
    >
      <Table
        basic="very"
        unstackable
        compact
        style={{
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
  );
};

export default Meta;
