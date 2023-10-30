import { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  children: string;
  style?: CSSProperties;
}

const Markdown = ({ children, style = {} }: MarkdownProps) => {
  return (
    <div style={{ ...style }}>
      <ReactMarkdown
        components={{
          code(props) {
            const { node, ...rest } = props;
            return (
              <span
                style={{
                  background: "var(--primary-light)",
                  padding: "0.3rem",
                  borderRadius: "5px",
                }}
                {...rest}
              />
            );
          },
        }}
        linkTarget={"_blank"}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
