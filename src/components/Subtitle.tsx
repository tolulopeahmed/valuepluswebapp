export default function Subtitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[0.84rem] text-white/42 md:text-[0.64rem] ${className}`}
    >
      {children}
    </p>
  );
}
