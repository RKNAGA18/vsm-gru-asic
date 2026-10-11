import katex from "katex";

interface Props { tex: string; displayMode?: boolean; className?: string }

export default function KaTeXRenderer({ tex, displayMode = false, className = "" }: Props) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode,
    strict: "ignore",
  });
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
