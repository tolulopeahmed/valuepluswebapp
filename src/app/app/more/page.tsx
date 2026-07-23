"use client";

import Profile from "./Profile";
import Settings from "./Settings";
import ChatAdminFab from "./ChatAdminFab";

export default function MorePage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Profile + Settings render directly on the page now, no bordered
          "card" wrapping them — matches the reference (MyFund's More page
          has no such outer container either) and frees up the horizontal
          space that border/shadow implied as an inset. Settings' own
          -mt-8/rounded-t-[2.5rem] still creates the shelf-over-hero
          transition between the two sections on its own. */}
      <div className="vp-card-in">
        <Profile />
        <Settings />
      </div>

      {/* Rendered as a sibling of the card above, not a descendant —
          .vp-card-in animates `transform`, and any transformed ancestor
          would turn into the containing block for this fixed-position
          FAB, breaking its viewport-relative positioning. */}
      <ChatAdminFab />
    </div>
  );
}
