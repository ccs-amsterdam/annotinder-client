import React, { useEffect, useRef, useState } from "react";
import { Ref } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";
import Meta from "./Meta";
import renderText from "../functions/renderText";
import renderImages from "../functions/renderImages";

const Body = ({ tokens, text_fields, meta_fields, image_fields, setReady, maxHeight }) => {
  const [text, setText] = useState({});
  const [images, setImages] = useState({});
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
    setImages(renderImages(image_fields));
    if (setReady) setReady((current) => current + 1); // setReady is an optional property used to let parents know the text is ready.
  }, [tokens, text_fields, image_fields, setReady]);

  if (tokens === null) return null;

  return (
    <>
      <Ref innerRef={containerRef}>
        <div
          key="tokens"
          className="TokensContainer"
          style={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "auto",
            maxHeight: maxHeight,
          }}
        >
          <div
            key="meta"
            style={{
              width: "100%",
              textAlign: "right",
              padding: "10px 30px",
            }}
          >
            <Meta meta_fields={meta_fields} />
          </div>
          <div
            style={{
              flex: "1 97%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              //alignItems: "center",
            }}
          >
            <div key="content" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
              {text_fields.map((tf) => text[tf.name])}
              {image_fields.map((imf) => images[imf.name])}
            </div>

            <div key="empty_space" style={{ height: "25px" }} />
          </div>
        </div>
      </Ref>
    </>
  );
};

export default React.memo(Body);
