import React from "react";
import ReactMarkdown from "react-markdown";

export default function renderMarkdown(markdown_field) {
  if (!markdown_field) return null;
  return (
    <div style={{ padding: "25px", width: "100%", fontSize: "1.2em" }}>
      <ReactMarkdown linkTarget={"_blank"}>{markdown_field}</ReactMarkdown>
    </div>
  );
}
