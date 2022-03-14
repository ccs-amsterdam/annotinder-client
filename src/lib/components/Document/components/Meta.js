import React from "react";
import { Table } from "semantic-ui-react";

const Meta = ({ meta_fields }) => {
  const cellStyle = (row) => {
    const style = { borderTop: "none" };
    if (row.bold) style.fontWeight = "bold";
    if (row.italic) style.fontStyle = "italic";
    return style;
  };

  const rows = () => {
    return meta_fields.map((row) => {
      return (
        <Table.Row
          style={{
            fontSize: `${row.size != null ? row.size : 1}em`,
          }}
        >
          <Table.Cell width={1} style={{ borderTop: "none" }}>
            <b>{row.label || row.name}</b>
          </Table.Cell>
          <Table.Cell style={cellStyle(row)}>{row.value}</Table.Cell>
        </Table.Row>
      );
    });
  };

  if (meta_fields.length === 0) return null;

  return (
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
      {rows()}
    </Table>
  );
};

export default Meta;
