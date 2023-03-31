import { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  children: string;
  style?: CSSProperties;
}

const Markdown = ({ children, style = {} }: MarkdownProps) => {
  return (
    <div style={{ ...style }}>
      <ReactMarkdown linkTarget={"_blank"}>{children}</ReactMarkdown>
    </div>
  );
};

export default Markdown;
