"use client";

import Profile from "./Profile";
import Settings from "./Settings";

export default function MorePage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* One combined card — this wrapper owns the overall rounded shape
          and clips Profile/Settings into it; Settings' own rounded-t
          "shelf" (negative-margin overlap) creates the separation. */}
      <div
        className="vp-card-in relative overflow-hidden rounded-[1.75rem] border"
        style={{
          borderColor: "rgba(var(--vp-accent-rgb),0.22)",
          boxShadow:
            "0 16px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <Profile />
        <Settings />
      </div>
    </div>
  );
}
