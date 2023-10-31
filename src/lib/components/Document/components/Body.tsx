import React, { CSSProperties, useEffect, useRef, useState, useMemo, ReactElement } from "react";
import { Ref } from "semantic-ui-react";
import Meta from "./Meta";
import renderText from "../functions/renderText";
import renderImages from "../functions/renderImages";
import renderMarkdown from "../functions/renderMarkdown";
import FocusOverlay from "./FocusOverlay";

import {
  FieldGrid,
  FieldRefs,
  ImageField,
  MarkdownField,
  MetaField,
  TextField,
  Token,
} from "../../../types";
import styled from "styled-components";
import { Loader } from "../../../styled/Styled";

const DocumentContent = styled.div<{
  grid: FieldGrid;
  centered: boolean;
  highLines: boolean;
}>`
  display: ${(p) => (p.grid?.areas ? "grid" : null)};
  margin: ${(p) => (p.centered ? "auto" : "")};
  padding-top: 0px;
  padding-bottom: 0px;
  width: 100%;
  z-index: 1;

  grid-template-areas: ${(p) => p.grid?.areas};
  grid-template-columns: ${(p) => p.grid?.columns};
  ${(p) => (p.grid?.rows ? `grid-template-rows: ${p.grid.rows};` : `grid-auto-rows: min-content;`)}
  p {
    line-height: ${(p) => (p.highLines ? "2.5em" : "1.5em")};
  }
`;

const BodyContainer = styled.div`
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  scroll-behavior: smooth;
`;

interface BodyProps {
  tokens: Token[];
  textFields: TextField[];
  metaFields: MetaField[];
  imageFields: ImageField[];
  markdownFields: MarkdownField[];
  grid?: FieldGrid;
  onReady: () => any;
  bodyStyle: CSSProperties;
  focus: string[];
  centered: boolean;
  readOnly: boolean;
  currentUnitReady: boolean;
}

const Body = ({
  tokens,
  textFields,
  metaFields,
  imageFields,
  markdownFields,
  grid,
  onReady,
  bodyStyle = {},
  focus,
  centered,
  readOnly,
  currentUnitReady,
}: BodyProps) => {
  const [content, setContent] = useState<(ReactElement | ReactElement[])[]>([]);
  const fieldRefs: FieldRefs = useMemo(() => ({}), []);
  const containerRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(true);

  useEffect(() => {
    if (!tokens) return;
    const text = renderText(tokens, textFields, containerRef, fieldRefs);
    const images = renderImages(imageFields, setImagesLoaded, containerRef);
    const markdown = renderMarkdown(markdownFields, fieldRefs);

    const content: (ReactElement | ReactElement[])[] = [];
    if (text) for (const f of textFields) content.push(text[f.name]);
    if (images) for (const f of imageFields) content.push(images[f.name]);
    if (markdown) for (const f of markdownFields) content.push(markdown[f.name]);
    setContent(content);

    const timer = setInterval(() => {
      if (tokens.length > 0) {
        const hasref = tokens.findIndex((token) => token.ref?.current) > -1;
        if (!hasref) return;
      }
      onReady();
      clearInterval(timer);
    }, 50);
  }, [tokens, textFields, imageFields, markdownFields, onReady, setImagesLoaded, fieldRefs]);

  if (tokens === null) return null;

  return (
    <>
      <Ref innerRef={containerRef}>
        <BodyContainer
          key="bodycontainer"
          id="bodycontainer"
          className="BodyContainer"
          style={{
            ...bodyStyle,
          }}
        >
          <Meta metaFields={metaFields} />
          <div
            key="fields"
            style={{
              position: "relative",
              flex: "1 1 97%",
              display: "flex",
              paddingTop: "10px",
              width: "100%",
            }}
          >
            <Loader active={!imagesLoaded || !currentUnitReady} radius={0} />
            <DocumentContent
              centered={centered}
              highLines={!readOnly}
              grid={grid}
              key="content"
              className="DocumentContent"
            >
              <FocusOverlay
                key="focusoverlay"
                fieldRefs={fieldRefs}
                focus={focus}
                containerRef={containerRef}
              />
              {content}
            </DocumentContent>
          </div>
        </BodyContainer>
      </Ref>
    </>
  );
};

export default React.memo(Body);
