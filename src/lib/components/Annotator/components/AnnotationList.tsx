import styled from "styled-components";
import { getColor } from "../../../functions/tokenDesign";
import { Annotation, VariableMap, Span, Token } from "../../../types";

interface AnnotationListProps {
  tokens: Token[];
  variableMap: VariableMap;
  annotations: Annotation[];
}

const StyledDiv = styled.div`
  font-size: 1.6rem;
  max-height: 100%;
  border-radius: 5px;
  margin: 0.5rem 0.5rem 0 0.5rem;
  border-collapse: collapse;
  text-align: left;

  .annotation {
    display: flex;
    align-items: center;
    //border-bottom: 1px dotted var(--text-light);
    cursor: pointer;

    .value {
      width: 30%;
      min-width: 120px;
      border-radius: 5px;
      text-align: center;
      padding: 0.7rem 0rem;
    }
    .text {
      line-height: 2rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      padding: 0.3rem 0.5rem;
      width: 70%;
      margin: 0.5rem 0rem;
      text-align: justify;
      //word-wrap: break-word;
      hyphens: auto;
      //white-space: nowrap;
    }
  }
`;

const AnnotationList = ({ tokens, variableMap, annotations }: AnnotationListProps) => {
  if (!variableMap || Object.keys(variableMap).length === 0) return null;

  return <StyledDiv>{listAnnotations(tokens, variableMap, annotations)}</StyledDiv>;
};

const listAnnotations = (tokens: Token[], variableMap: VariableMap, annotations: Annotation[]) => {
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

  return (
    <div className={"annotation"} onClick={() => onClick(annotation.token_span)}>
      <span className="value" style={{ background: color || null }}>
        {label}
      </span>
      <p className="text" title={text}>
        {text}
      </p>
    </div>
  );
};

export default AnnotationList;
