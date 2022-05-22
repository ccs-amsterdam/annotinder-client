import React, { useEffect, useRef, useState } from "react";
import { Ref } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";
import Meta from "./Meta";
import renderText from "../functions/renderText";
import renderImages from "../functions/renderImages";
import renderMarkdown from "../functions/renderMarkdown";
import {
  ImageField,
  MetaField,
  RenderedImages,
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
  markdown_field: string;
  setReady: SetState<number>;
}

const Body = ({
  tokens,
  text_fields,
  meta_fields,
  image_fields,
  markdown_field,
  setReady,
}: BodyProps) => {
  const [text, setText] = useState<RenderedText>({});
  const [images, setImages] = useState<RenderedImages>({});
  const [markdown, setMarkdown] = useState(null);
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
    setText(renderText(tokens, text_fields, containerRef));
    setImages(renderImages(image_fields, containerRef));
    setMarkdown(renderMarkdown(markdown_field));
    if (setReady) setReady((current) => current + 1); // setReady is an optional property used to let parents know the text is ready.
  }, [tokens, text_fields, image_fields, markdown_field, setReady]);

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
          }}
        >
          <Meta meta_fields={meta_fields} />

          <div
            style={{
              flex: "1 1 97%",
              width: "100%",
            }}
          >
            <div key="content" style={{ paddingTop: "0px", paddingBottom: "0px", width: "100%" }}>
              {markdown}
              {text_fields.map((tf) => text[tf.name])}
              {image_fields.map((imf) => images[imf.name])}
            </div>
          </div>
        </div>
      </Ref>
    </>
  );
};

export default React.memo(Body);
