import { useMemo } from "react";
import styled from "styled-components";
import { getColor } from "../../../functions/tokenDesign";
import { Annotation, VariableMap, AnnotationMap, TriggerSelector } from "../../../types";

const VariableNames = styled.div`
  font-size: 2rem;
  padding: 2rem 1rem;
  color: var(--primary-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  //border-top: 1px solid var(--background-fixed);
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
      border-radius: 4px;
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
    border-radius: 4px;
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

      div {
        text-align: right;
      }
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

interface AnnotationListProps {
  variableMap: VariableMap;
  annotations: Annotation[];
  selectors: Record<string, TriggerSelector>;
}

const AnnotationList = ({ variableMap, annotations, selectors }: AnnotationListProps) => {
  const annMap: AnnotationMap = useMemo(() => {
    const annMap: AnnotationMap = {};
    for (let a of annotations || []) annMap[a.id] = a;
    return annMap;
  }, [annotations]);

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
      <StyledDiv>{listAnnotations(variableMap, annotations, annMap, selectors)}</StyledDiv>
    </div>
  );
};

const listAnnotations = (
  variableMap: VariableMap,
  annotations: Annotation[],
  annMap: AnnotationMap,
  selectors: Record<string, TriggerSelector>
) => {
  const rows = [];

  for (const annotation of annotations) {
    if (annotation.type === "span") {
      const text = annotation.text || "";
      rows.push(
        <ShowSpanAnnotation
          key={"span" + rows.length}
          variableMap={variableMap}
          annotation={annotation}
          onClick={() => {
            selectors?.span({
              index: annotation.token_span[0],
              from: annotation.token_span[0],
              to: annotation.token_span[1],
            });
          }}
          text={text}
        />
      );
    }
    if (annotation.type === "relation") {
      if (!annotation.from && annotation.to) continue;

      rows.push(
        <ShowRelation
          key={"relation" + rows.length}
          variableMap={variableMap}
          annotation={annotation}
          annMap={annMap}
          onClick={() => {
            selectors?.relation({
              from: annotation.edge[0],
              to: annotation.edge[1],
              fromId: annotation.fromId,
              toId: annotation.toId,
            });
          }}
        />
      );
    }
  }
  return rows;
};

interface ShowSpanAnnotationProps {
  variableMap: VariableMap;
  annotation: Annotation;
  onClick: () => void;
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
  const label = annotation.value;

  return (
    <div className={"annotation"} onClick={onClick}>
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
  annMap: AnnotationMap;
  onClick: () => void;
}

const ShowRelation = ({ variableMap, annotation, annMap, onClick }: ShowRelationProps) => {
  let codeMap = variableMap?.[annotation.variable]?.codeMap;
  if (!codeMap) return null;

  const color = getColor(annotation.value, codeMap);
  const label = annotation.value;
  //if (!annotation.from.token_span || !annotation.to.token_span) return null;
  //const relationSpan: Span = [annotation.from.token_span[0], annotation.to.token_span[1]];

  return (
    <div className={"relation"} onClick={onClick} style={{ background: color || null }}>
      <div className="header">
        <span>{label}</span>
        {/* <div>
          <i>
            {annotation.from.value} → {annotation.to.value}
          </i>
        </div> */}
      </div>
      <div>
        <p className="text left">{annotation.text}</p>
      </div>
    </div>
  );
};

export default AnnotationList;
