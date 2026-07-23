export default function Title({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // leading-none (not -tight) + a small negative bottom margin — at
    // this font-size, -tight's line-height still reserves a fair bit of
    // space below the glyphs, which read as a much bigger title-to
    // -subtitle gap than intended (MyFund's reference sits much closer).
    <p
      className={`font-telegraf text-[2.7rem] tracking-tight font-black leading-none text-white md:text-[2.2rem] -mb-1 ${className}`}
    >
      {children}
    </p>
  );
}
