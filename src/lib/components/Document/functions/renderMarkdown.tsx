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
          fontSize: "1.2em",
          ...(markdown_field.style || {}),
        }}
      >
        <Markdown>{markdown_field.value}</Markdown>
      </div>
    );
  }

  return rm;
}
