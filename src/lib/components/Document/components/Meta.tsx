import { MetaField } from "../../../types";
import { StyledTable } from "../../../styled/StyledSemantic";

interface MetaProps {
  meta_fields: MetaField[];
}

const Meta = ({ meta_fields }: MetaProps) => {
  const rows = () => {
    return meta_fields.map((row) => {
      let label = row.label ?? row.name ?? "";
      label = String(label);

      return (
        <StyledTable.Row
          key={label}
          style={{
            lineHeight: "1.2",
            fontSize: `1.2em`,
          }}
        >
          <StyledTable.Cell
            width={1}
            style={{
              borderTop: "none",
              textAlign: "right",
              color: "var(--primary-text)",
            }}
          >
            <b>{label}</b>
          </StyledTable.Cell>
          <StyledTable.Cell style={row.style}>{row.value}</StyledTable.Cell>
        </StyledTable.Row>
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
        <StyledTable
          basic="very"
          compact
          unstackable
          style={{
            width: "100%",
            lineHeight: "0.8",
            padding: "10px",
            paddingLeft: "10px",
            background: "var(--background)",
            color: "var(--text)",
          }}
        >
          <StyledTable.Body>{rows()}</StyledTable.Body>
        </StyledTable>
      </div>
    </div>
  );
};

export default Meta;
