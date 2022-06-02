import { SemanticWIDTHS, Table } from "semantic-ui-react";
import { getColor } from "../../../functions/tokenDesign";
import { Annotation, VariableMap, Span, Token } from "../../../types";

const COLWIDTHS = [4, 4, 2, 2]; // for offset and text

interface AnnotateTableProps {
  tokens: Token[];
  variableMap: VariableMap;
  annotations: Annotation[];
}

const AnnotateTable = ({ tokens, variableMap, annotations }: AnnotateTableProps) => {
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

const annotationRows = (tokens: Token[], variableMap: VariableMap, annotations: Annotation[]) => {
  const rows = [];
  let i = 0;

  const onClick = (span: Span) => {
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

interface AnnotationRowProps {
  variable: string;
  variableMap: VariableMap;
  annotation: Annotation;
  onClick: (span: Span) => void;
  text: string;
}

const AnnotationRow = ({
  variable,
  variableMap,
  annotation,
  onClick,
  text,
}: AnnotationRowProps) => {
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
        <span title={String(label)}>{label}</span>
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
