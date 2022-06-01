import { SemanticWIDTHS, Table } from "semantic-ui-react";
import { getColor } from "../../../functions/tokenDesign";

const COLWIDTHS = [4, 4, 2, 2]; // for offset and text

const AnnotateTable = ({ tokens, variableMap, annotations }) => {
  if (!variableMap || Object.keys(variableMap).length === 0) return null;

  return (
    <Table
      style={{ fontSize: "10px", maxHeight: "100%", borderRadius: "0px" }}
      fixed
      role="grid"
      aria-labelledby="header"
      unstackable
      singleLine
      compact="very"
      size="small"
    >
      <Table.Header className="annotations-thead" style={{ height: "30px" }}>
        <Table.Row>
          <Table.HeaderCell
            title="Variable"
            width={COLWIDTHS[0] as SemanticWIDTHS}
            style={{ padding: "5px" }}
          >
            Variable
          </Table.HeaderCell>
          <Table.HeaderCell
            title="Vale"
            width={COLWIDTHS[1] as SemanticWIDTHS}
            style={{ padding: "5px" }}
          >
            Value
          </Table.HeaderCell>
          <Table.HeaderCell
            title="Field"
            width={COLWIDTHS[2] as SemanticWIDTHS}
            style={{ padding: "5px" }}
          >
            Field
          </Table.HeaderCell>
          <Table.HeaderCell
            title="Position"
            width={COLWIDTHS[3] as SemanticWIDTHS}
            style={{ padding: "5px" }}
          >
            Position
          </Table.HeaderCell>
          <Table.HeaderCell title="Text" style={{ padding: "5px" }}>
            Text
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body
        className="annotations-tbody"
        style={{ overflow: "auto", height: "calc(100% - 40px)" }}
      >
        {annotationRows(tokens, variableMap, annotations)}
      </Table.Body>
    </Table>
  );
};

const annotationRows = (tokens, variableMap, annotations) => {
  const rows = [];
  let i = 0;

  const onClick = (span) => {
    if (!span) return;
    const token = tokens?.[span[0]];
    if (token?.select) token.select(span);
  };

  for (const annotation of annotations) {
    const text = annotation.text || "";

    const row = (
      <AnnotationRow
        key={i}
        variable={annotation.variable}
        variableMap={variableMap}
        annotation={annotation}
        onClick={onClick}
        text={text}
      />
    );
    if (row !== null) rows.push(row);
    i++;
  }
  return rows;
};

const AnnotationRow = ({ variable, variableMap, annotation, onClick, text }) => {
  if (!variableMap?.[annotation.variable]?.codeMap) return null;

  const codeMap = variableMap[variable].codeMap;
  if (!codeMap?.[annotation.value] || !codeMap[annotation.value].active) return null;
  const color = getColor(annotation.value, codeMap);
  const label = codeMap[annotation.value]?.foldToParent
    ? `${codeMap[annotation.value].foldToParent} - ${annotation.value}`
    : annotation.value;

  const position = `${annotation.offset}-${annotation.offset + annotation.length}`;

  return (
    <Table.Row
      className="annotations-tr"
      onClick={() => onClick(annotation.token_span)}
      style={{ cursor: "pointer", border: "0px !important" }}
    >
      <Table.Cell width={COLWIDTHS[0] as SemanticWIDTHS}>
        <span title={variable}>{variable}</span>
      </Table.Cell>

      <Table.Cell
        title={label}
        width={COLWIDTHS[1] as SemanticWIDTHS}
        style={color ? { background: color } : null}
      >
        <span title={label}>{label}</span>
      </Table.Cell>
      <Table.Cell title={annotation.field} width={COLWIDTHS[2] as SemanticWIDTHS}>
        {annotation.field}
      </Table.Cell>
      <Table.Cell title={position} width={COLWIDTHS[3] as SemanticWIDTHS}>
        {position}
      </Table.Cell>
      <Table.Cell>
        <span title={text}>{text}</span>
      </Table.Cell>
    </Table.Row>
  );
};

export default AnnotateTable;
