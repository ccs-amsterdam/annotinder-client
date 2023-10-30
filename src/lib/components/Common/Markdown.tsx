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
        // components={{
        //   // Map `h1` (`# heading`) to use `h2`s.
        //   h1: "h2",
        //   // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
        //   em(props) {
        //     const { node, ...rest } = props;
        //     return <i style={{ color: "red" }} {...rest} />;
        //   },
        // }}
        // components={{
        //   code(props) {
        //     const { children, className, node, ...rest } = props;
        //     const match = /language-(\w+)/.exec(className || "");
        //     return match ? (
        //       <span
        //         {...rest}
        //         children={String(children).replace(/\n$/, "")}
        //         style={{ backgroundColor: "lightgrey", padding: "2px 5px" }}
        //       />
        //     ) : (
        //       <code {...rest} className={className}>
        //         {children}
        //       </code>
        //     );
        //   },
        // }}
        linkTarget={"_blank"}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
