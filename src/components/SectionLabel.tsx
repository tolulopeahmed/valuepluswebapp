export default function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mb-2 text-[0.52rem] font-black uppercase tracking-[0.2em] text-white/30 md:text-[0.62rem]">
      {children}
    </p>
  );
}
