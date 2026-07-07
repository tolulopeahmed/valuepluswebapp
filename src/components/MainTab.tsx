"use client";

function Icon({ path, size = 22 }: { path: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  learn: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  refer:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  withdraw: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

const TABS = [
  { id: "home", label: "ValuePlus", icon: ICONS.home },
  { id: "learn", label: "Learn", icon: ICONS.learn },
  { id: "refer", label: "Refer", icon: ICONS.refer },
  { id: "withdraw", label: "Withdraw", icon: ICONS.withdraw },
  { id: "more", label: "More", icon: ICONS.more },
];

export default function MainTab({
  active,
  onTab,
}: {
  active: string;
  onTab: (id: string) => void;
}) {
  return (
    // md:hidden = mobile-only, pure CSS, no JS width check needed
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-white/[0.08] px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      style={{
        background: "rgba(7,11,18,0.92)",
        backdropFilter: "blur(24px) saturate(1.5)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTab(tab.id)}
            className="relative flex flex-col items-center gap-[3px] px-3 py-2"
          >
            <span
              className={`absolute -top-1 h-9 w-9 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
                isActive
                  ? "scale-100 bg-[rgba(239,199,0,0.14)] opacity-100"
                  : "scale-75 opacity-0"
              }`}
            />
            <span
              className={`relative transition-all duration-300 ${
                isActive
                  ? "-translate-y-0.5 scale-110 text-[rgb(239,199,0)]"
                  : "translate-y-0 scale-100 text-white/35"
              }`}
            >
              <Icon path={tab.icon} size={20} />
            </span>
            <span
              className={`relative text-[0.52rem] font-black uppercase tracking-[0.1em] leading-none transition-colors ${isActive ? "text-[rgb(239,199,0)]" : "text-white/30"}`}
            >
              {tab.label}
            </span>
            <span
              className={`absolute bottom-0 h-[2px] rounded-t-full bg-[rgb(239,199,0)] transition-all duration-300 ${
                isActive ? "w-6 opacity-100" : "w-0 opacity-0"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
