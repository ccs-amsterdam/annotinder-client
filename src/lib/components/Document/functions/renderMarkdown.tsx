import React, { ReactElement } from "react";
import Markdown from "../../Common/Markdown";

export default function renderMarkdown(markdown_field: string): ReactElement {
  if (!markdown_field || markdown_field.length === 0) return null;
  return (
    <div style={{ padding: "25px", width: "100%", fontSize: "1.2em" }}>
      <Markdown>{markdown_field}</Markdown>
    </div>
  );
}
