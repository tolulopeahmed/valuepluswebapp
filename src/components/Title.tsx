export default function Title({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-telegraf text-[2.7rem] tracking-tighter font-black leading-tight text-white md:text-[2.2rem] ${className}`}
    >
      {children}
    </p>
  );
}
