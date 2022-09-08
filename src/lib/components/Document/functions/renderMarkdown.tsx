import { MarkdownField, RenderedMarkdown } from "../../../types";
import Markdown from "../../Common/Markdown";

export default function renderMarkdown(markdown_fields: MarkdownField[]): RenderedMarkdown {
  const rm: RenderedMarkdown = {};

  for (let markdown_field of markdown_fields) {
    rm[markdown_field.name] = (
      <div
        key={"markdown-" + markdown_field}
        style={{
          gridArea: markdown_field.name,
          padding: "25px",
          width: "100%",
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
