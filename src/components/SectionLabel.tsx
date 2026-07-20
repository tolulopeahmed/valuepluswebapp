import type { CSSProperties, ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function SectionLabel({
  children,
  className = "",
  style,
}: SectionLabelProps) {
  return (
    <p
      className={`mb-2 text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/30 md:text-[0.62rem] ${className}`}
      style={style}
    >
      {children}
    </p>
  );
}
