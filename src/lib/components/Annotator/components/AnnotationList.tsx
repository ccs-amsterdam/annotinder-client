import styled from "styled-components";
import { getColor } from "../../../functions/tokenDesign";
import { Annotation, VariableMap, Span, Token, SpanParent } from "../../../types";

interface AnnotationListProps {
  tokens: Token[];
  variableMap: VariableMap;
  annotations: Annotation[];
}

const VariableNames = styled.div`
  font-size: 2rem;
  padding: 2rem 1rem;
  color: var(--primary-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
`;

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 1.4rem;
  min-height: 20vh;
  padding: 0rem 0rem 0rem 0.5rem;

  margin: 0.5rem 0.5rem 0 0.5rem;
  border-collapse: collapse;
  text-align: left;

  .annotation {
    display: flex;
    align-items: stretch;

    //border-bottom: 1px dotted var(--text-light);
    cursor: pointer;
    margin: 0.2rem;

    .label {
      display: flex;
      width: 100%;
      border-radius: 5px;
      text-align: center;
      padding: 0.5rem 0.3rem;
      border: 1px solid var(--background-inversed-fixed);

      color: var(--text-fixed);
      position: relative;
      ::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--background-fixed);
        border-radius: inherit;
        z-index: -1;
      }
    }
    .label span {
      width: 30%;
      text-align: left;
      margin: auto auto auto 0;
      font-weight: bold;
    }
    .label p {
      padding-left: 1rem;
    }
  }
  .relation {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    border-radius: 8px;
    margin: 0.4rem 0.7rem 0rem 0.2rem;
    padding: 0.2rem 0.2rem 0 0.2rem;
    border: 1px solid var(--background-inversed-fixed);

    color: var(--text-fixed);
    position: relative;
    ::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--background-fixed);
      border-radius: inherit;
      z-index: -1;
    }

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
    padding: 0.15rem 1rem 0.15rem 0.5rem;
    max-height: 5rem;
    overflow: auto;
    width: 70%;
    text-align: justify;
    hyphens: auto;

    ::-webkit-scrollbar {
      width: 4px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      //background: white;
      border-radius: 10px;
      //border: 1px solid #121212;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
      background-color: #121212;
      border-radius: 5px;
    }
  }
  .right {
    text-align: right;
  }
`;

const AnnotationList = ({ tokens, variableMap, annotations }: AnnotationListProps) => {
  if (!variableMap || Object.keys(variableMap).length === 0) return null;
  const variables = Object.keys(variableMap);

  return (
    <div>
      <VariableNames>
        <div className="variableNames">
          {variables.map((v) => {
            return <h3 key={v}>{v}</h3>;
          })}
        </div>
      </VariableNames>
      <StyledDiv>{listAnnotations(tokens, variableMap, annotations)}</StyledDiv>
    </div>
  );
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
          key={
            "relation" +
            parent.relationVariable +
            "-" +
            parent.relationValue +
            "-" +
            parent.value +
            parent.offset +
            "_" +
            i
          }
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
      <div className="label" style={{ background: color || null }}>
        <span>{label}</span>
        <p className="text" title={text}>
          {text}
        </p>
      </div>
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
            {annotation.value} → {parent.value}
          </i>
        </div>
      </div>
      <div>
        <p className="text left" title={fromText}>
          {fromText + " → " + toText}
        </p>
      </div>
    </div>
  );
};

export default AnnotationList;
