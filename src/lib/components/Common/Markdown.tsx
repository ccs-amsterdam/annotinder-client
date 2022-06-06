import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  children: string;
}

const Markdown = ({ children }: MarkdownProps) => {
  return <ReactMarkdown linkTarget={"_blank"}>{children}</ReactMarkdown>;
};

export default Markdown;
