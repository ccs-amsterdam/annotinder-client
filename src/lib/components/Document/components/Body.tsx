import React, { CSSProperties, useEffect, useRef, useState, useMemo } from "react";
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
  RenderedImages,
  RenderedMarkdown,
  RenderedText,
  TextField,
  Token,
} from "../../../types";
import styled from "styled-components";

const DocumentContent = styled.div<{ grid: FieldGrid; centered: boolean }>`
  display: ${(p) => (p.grid?.areas ? "grid" : null)};
  grid-template-rows: ${(p) => p.grid?.rows};
  grid-template-columns: ${(p) => p.grid?.columns};
  grid-template-areas: ${(p) => p.grid?.areas};
  margin: ${(p) => (p.centered ? "auto" : "")};
  padding-top: 0px;
  padding-bottom: 0px;
  width: 100%;
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
}: BodyProps) => {
  const [text, setText] = useState<RenderedText>({});
  const [images, setImages] = useState<RenderedImages>({});
  const [markdown, setMarkdown] = useState<RenderedMarkdown>({});
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
    setText(renderText(tokens, text_fields, containerRef, fieldRefs));
    setImages(renderImages(image_fields, containerRef));
    setMarkdown(renderMarkdown(markdown_fields, fieldRefs));
    setTimeout(() => onReady(), 50);
  }, [tokens, text_fields, image_fields, markdown_fields, onReady, fieldRefs]);

  if (tokens === null) return null;
  return (
    <>
      <Ref innerRef={containerRef}>
        <div
          key="bodycontainer"
          className="BodyContainer"
          style={{
            height: "100%",
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "auto",
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
              grid={grid}
              key="content"
              className="DocumentContent"
            >
              {text_fields.map((tf) => text[tf.name])}
              {image_fields.map((imf) => images[imf.name])}
              {markdown_fields.map((md) => markdown[md.name])}
            </DocumentContent>
          </div>
        </div>
      </Ref>
    </>
  );
};

export default React.memo(Body);
