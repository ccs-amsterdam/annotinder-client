import styled from "styled-components";
import { getColor } from "../../../functions/tokenDesign";
import { Annotation, VariableMap, Span, Token } from "../../../types";

interface AnnotateTableProps {
  tokens: Token[];
  variableMap: VariableMap;
  annotations: Annotation[];
}

const StyledTable = styled.table`
  font-size: 0.7rem;
  max-height: 100%;
  border-radius: 0px;
  border-collapse: collapse;
  text-align: left;

  & thead {
    line-height: 1rem;
    position: sticky;
    background: var(--primary);
    color: var(--text-inversed-fixed);
    top: 0;
    left: 0;
    border: 1px solid var(--background-inversed);
  }
  & thead,
  tbody,
  tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  & tbody {
    height: calc(100% - 40px);
    display: block;
    overflow: auto;
    height: 100%;
  }
  & th {
    padding: 5px;
    background: transparent;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  & td {
    padding: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-top: 2px;
    padding-bottom: 2px;
    border: 0px;
  }

  & .variable,
  .value {
    width: 20%;
  }
  & .field .position {
    width: 15%;
  }
  & .text {
    width: 30%;
  }
`;

const AnnotateTable = ({ tokens, variableMap, annotations }: AnnotateTableProps) => {
  if (!variableMap || Object.keys(variableMap).length === 0) return null;

  return (
    <StyledTable>
      <thead>
        <tr>
          <th title="Variable" className="variable">
            Variable
          </th>
          <th title="Vale" className="value">
            Value
          </th>
          <th title="Field" className="field">
            Field
          </th>
          <th title="Position" className="position">
            Position
          </th>
          <th title="Text" className="text">
            Text
          </th>
        </tr>
      </thead>
      <tbody>{annotationRows(tokens, variableMap, annotations)}</tbody>
    </StyledTable>
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
    <tr
      onClick={() => onClick(annotation.token_span)}
      style={{ cursor: "pointer", border: "0px !important", background: color || null }}
    >
      <td className="variable" title={variable}>
        <span title={variable}>{variable}</span>
      </td>

      <td className="value" title={String(label)}>
        <span title={String(label)}>{label}</span>
      </td>
      <td className="field" title={annotation.field}>
        {annotation.field}
      </td>
      <td className="position" title={position}>
        {position}
      </td>
      <td className="text">
        <span title={text}>{text}</span>
      </td>
    </tr>
  );
};

export default AnnotateTable;
