import React, { CSSProperties, useEffect, useRef, useState, useMemo, ReactElement } from "react";
import { Ref } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";
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

const DocumentContent = styled.div<{ grid: FieldGrid; centered: boolean; highLines: boolean }>`
  display: ${(p) => (p.grid?.areas ? "grid" : null)};
  grid-template-rows: ${(p) => p.grid?.rows};
  grid-template-columns: ${(p) => p.grid?.columns};
  grid-template-areas: ${(p) => p.grid?.areas};
  margin: ${(p) => (p.centered ? "auto" : "")};
  padding-top: 0px;
  padding-bottom: 0px;
  width: 100%;
  z-index: 1;

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
`;

interface BodyProps {
  tokens: Token[];
  text_fields: TextField[];
  meta_fields: MetaField[];
  image_fields: ImageField[];
  markdown_fields: MarkdownField[];
  grid?: FieldGrid;
  onReady: () => any;
  bodyStyle: CSSProperties;
  focus: string[];
  centered: boolean;
  readOnly: boolean;
}

const Body = ({
  tokens,
  text_fields,
  meta_fields,
  image_fields,
  markdown_fields,
  grid,
  onReady,
  bodyStyle = {},
  focus,
  centered,
  readOnly,
}: BodyProps) => {
  const [content, setContent] = useState<(ReactElement | ReactElement[])[]>([]);
  const fieldRefs: FieldRefs = useMemo(() => ({}), []);
  const containerRef = useRef(null);

  useEffect(() => {
    // immitates componentdidupdate to scroll to the textUnit after rendering tokens
    const firstTextUnitToken = tokens.find((token) => token.codingUnit);
    const hasContext = tokens.some((token) => !token.codingUnit);
    if (!hasContext) {
      containerRef.current.scrollTop = 0;
      return;
    }
    if (firstTextUnitToken?.ref?.current && containerRef.current) {
      scrollToMiddle(containerRef.current, firstTextUnitToken.ref.current, 1 / 3);
    }
  }, [tokens]);

  useEffect(() => {
    if (!tokens) return;
    const text = renderText(tokens, text_fields, containerRef, fieldRefs);
    const images = renderImages(image_fields, containerRef);
    const markdown = renderMarkdown(markdown_fields, fieldRefs);

    const content: (ReactElement | ReactElement[])[] = [];
    if (text) for (const f of text_fields) content.push(text[f.name]);
    if (images) for (const f of image_fields) content.push(images[f.name]);
    if (markdown) for (const f of markdown_fields) content.push(markdown[f.name]);
    setContent(content);
    setTimeout(() => onReady(), 50);
  }, [tokens, text_fields, image_fields, markdown_fields, onReady, fieldRefs]);

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
          <Meta meta_fields={meta_fields} />
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
            <FocusOverlay
              key="focusoverlay"
              fieldRefs={fieldRefs}
              focus={focus}
              containerRef={containerRef}
            />
            <DocumentContent
              centered={centered}
              highLines={!readOnly}
              grid={grid}
              key="content"
              className="DocumentContent"
            >
              {content}
            </DocumentContent>
          </div>
        </BodyContainer>
      </Ref>
    </>
  );
};

export default React.memo(Body);
