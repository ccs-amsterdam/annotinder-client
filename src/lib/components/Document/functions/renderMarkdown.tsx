import { createRef } from "react";
import { MarkdownField, RenderedMarkdown } from "../../../types";
import Markdown from "../../Common/Markdown";

export default function renderMarkdown(
  markdown_fields: MarkdownField[],
  fieldRefs: any
): RenderedMarkdown {
  const rm: RenderedMarkdown = {};

  for (let markdown_field of markdown_fields) {
    fieldRefs[markdown_field.name] = createRef();

    // It should not be possible that value is an array due to unfoldFields,
    // but typescript doesn't catch that
    let value = markdown_field.value;
    if (Array.isArray(value)) value = value.join("");

    rm[markdown_field.name] = (
      <div
        ref={fieldRefs[markdown_field.name]}
        key={"markdown-" + markdown_field.name}
        className="field"
        style={{
          gridArea: markdown_field.grid_area,
          padding: "15px",
          margin: "0px 10px 0px 10px",
          //width: "100%",
          fontSize: "1em",
          //alignSelf: "center",
          ...(markdown_field.style || {}),
        }}
      >
        <Markdown>{value}</Markdown>
      </div>
    );
  }

  return rm;
}
