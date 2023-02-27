import styled from "styled-components";
import { getColor } from "../../../functions/tokenDesign";
import { Annotation, VariableMap, Span, Token, SpanParent } from "../../../types";

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
    align-items: stretch;

    //border-bottom: 1px dotted var(--text-light);
    cursor: pointer;
    margin: 0.2rem;

    .value {
      display: flex;
      width: 30%;
      min-width: 120px;
      border-radius: 5px;
      padding: 0.5rem 0rem;
    }
    .value span {
      margin: auto;
    }
  }
  .relation {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;
    margin: 0.2rem;

    span {
      font-weight: bold;
      padding: 0.2rem;
    }
    div {
      display: flex;
      margin: 0.2rem;
    }
    .header {
      display: flex;
      width: 100%;
      padding: 0rem 0.4rem;
      justify-content: space-between;
    }

    p {
      flex: 1 1 auto;
    }
  }

  .text {
    margin: auto;
    line-height: 1.5rem;
    padding: 0.15rem 0.5rem;
    max-height: 5rem;
    overflow: auto;
    width: 70%;
    text-align: justify;
    hyphens: auto;
  }
  .right {
    text-align: right;
  }
`;

const AnnotationList = ({ tokens, variableMap, annotations }: AnnotationListProps) => {
  if (!variableMap || Object.keys(variableMap).length === 0) return null;

  return <StyledDiv>{listAnnotations(tokens, variableMap, annotations)}</StyledDiv>;
};

const listAnnotations = (tokens: Token[], variableMap: VariableMap, annotations: Annotation[]) => {
  const rows = [];
  let i = 0;

  const onClick = (span: Span, end?: boolean) => {
    if (!span) return;
    const token = tokens?.[span[end ? 1 : 0]];
    if (token?.select) token.select(span);
  };

  for (const annotation of annotations) {
    const text = annotation.text || "";

    const row = (
      <ShowSpanAnnotation
        key={"span" + i}
        variableMap={variableMap}
        annotation={annotation}
        onClick={onClick}
        text={text}
      />
    );
    if (row !== null) rows.push(row);

    for (let parent of annotation.parents || []) {
      const row = (
        <ShowRelation
          key={"relation" + parent.value + parent.offset + "_" + i}
          variableMap={variableMap}
          annotation={annotation}
          parent={parent}
          onClick={onClick}
          fromText={text}
          toText={parent.text}
        />
      );
      if (row !== null) rows.push(row);
    }
    i++;
  }
  return rows;
};

interface ShowSpanAnnotationProps {
  variableMap: VariableMap;
  annotation: Annotation;
  onClick: (span: Span) => void;
  text: string;
}

const ShowSpanAnnotation = ({
  variableMap,
  annotation,
  onClick,
  text,
}: ShowSpanAnnotationProps) => {
  let codeMap = variableMap?.[annotation.variable]?.codeMap;
  if (!codeMap) return null;

  if (!codeMap?.[annotation.value] || !codeMap[annotation.value].active) return null;
  const color = getColor(annotation.value, codeMap);
  const label = codeMap[annotation.value]?.foldToParent
    ? `${codeMap[annotation.value].foldToParent} - ${annotation.value}`
    : annotation.value;

  return (
    <div className={"annotation"} onClick={() => onClick(annotation.token_span)}>
      <div className="value" style={{ background: color || null }}>
        <span>{label}</span>
      </div>
      <p className="text" title={text}>
        {text}
      </p>
    </div>
  );
};

interface ShowRelationProps {
  variableMap: VariableMap;
  annotation: Annotation;
  parent: SpanParent;
  onClick: (span: Span, end: boolean) => void;
  fromText: string;
  toText: string;
}

const ShowRelation = ({
  variableMap,
  annotation,
  parent,
  onClick,
  fromText,
  toText,
}: ShowRelationProps) => {
  let codeMap = variableMap?.[parent?.relationVariable]?.codeMap;
  if (!codeMap) return null;

  const color = getColor(parent.relationValue, codeMap);
  const label = codeMap[parent.relationValue]?.foldToParent
    ? `${codeMap[parent.relationValue].foldToParent} - ${parent.relationValue}`
    : parent.relationValue;

  if (!annotation.token_span || !parent.span) return null;

  const relationSpan: Span =
    annotation.token_span[0] < parent.span[0]
      ? [annotation.token_span[1], parent.span[0]]
      : [annotation.token_span[0], parent.span[1]];

  return (
    <div
      className={"relation"}
      onClick={() => onClick(relationSpan, true)}
      style={{ background: color || null }}
    >
      <div className="header">
        <span>{label}</span>
        <div>
          <i>
            {annotation.value} 🠪 {parent.value}
          </i>
        </div>
      </div>
      <div>
        <p className="text left" title={fromText}>
          {fromText + " 🠪 " + toText}
        </p>
      </div>
    </div>
  );
};

export default AnnotationList;
