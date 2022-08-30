import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { Ref } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";
import Meta from "./Meta";
import renderText from "../functions/renderText";
import renderImages from "../functions/renderImages";
import renderMarkdown from "../functions/renderMarkdown";
import {
  FieldGrid,
  FieldRefs,
  ImageField,
  MarkdownField,
  MetaField,
  RenderedImages,
  RenderedMarkdown,
  RenderedText,
  SetState,
  TextField,
  Token,
} from "../../../types";

interface BodyProps {
  tokens: Token[];
  text_fields: TextField[];
  meta_fields: MetaField[];
  image_fields: ImageField[];
  markdown_fields: MarkdownField[];
  grid?: FieldGrid;
  setReady: SetState<number>;
  fieldRefs: FieldRefs;
  bodyStyle: CSSProperties;
}

const Body = ({
  tokens,
  text_fields,
  meta_fields,
  image_fields,
  markdown_fields,
  grid,
  setReady,
  fieldRefs,
  bodyStyle = {},
}: BodyProps) => {
  const [text, setText] = useState<RenderedText>({});
  const [images, setImages] = useState<RenderedImages>({});
  const [markdown, setMarkdown] = useState<RenderedMarkdown>({});
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
  });

  useEffect(() => {
    if (!tokens) return null;
    setText(renderText(tokens, text_fields, containerRef, fieldRefs));
    setImages(renderImages(image_fields, containerRef));
    setMarkdown(renderMarkdown(markdown_fields));
    if (setReady) setReady((current) => current + 1); // setReady is an optional property used to let parents know the text is ready.
  }, [tokens, text_fields, image_fields, markdown_fields, setReady, fieldRefs]);

  if (tokens === null) return null;
  return (
    <>
      <Ref innerRef={containerRef}>
        <div
          key="tokens"
          className="BodyContainer"
          style={{
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
            style={{
              flex: "1 1 97%",
              display: "flex",
              width: "100%",
            }}
          >
            <div
              key="content"
              style={{
                display: grid?.areas ? "grid" : null,
                gridTemplateRows: grid?.rows,
                gridTemplateColumns: grid?.columns,
                gridTemplateAreas: grid?.areas,
                margin: "auto",
                paddingTop: "0px",
                paddingBottom: "0px",
                width: "100%",
              }}
            >
              {text_fields.map((tf) => text[tf.name])}
              {image_fields.map((imf) => images[imf.name])}
              {markdown_fields.map((md) => markdown[md.name])}
            </div>
          </div>
        </div>
      </Ref>
    </>
  );
};

export default React.memo(Body);
