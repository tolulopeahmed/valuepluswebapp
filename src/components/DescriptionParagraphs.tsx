// A book description as typed in admin/the editor: blank lines become
// separate paragraphs (with a modest gap, not a whole empty line), and a
// single line break inside a paragraph is kept.
export default function DescriptionParagraphs({
  text,
  className = "",
  gapClassName = "mt-2.5",
}: {
  text: string;
  className?: string;
  gapClassName?: string;
}) {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={`whitespace-pre-line ${index ? gapClassName : ""} ${className}`}>
          {paragraph}
        </p>
      ))}
    </>
  );
}
