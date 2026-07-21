"use client";

import { useEffect, useState } from "react";

// Same admin line used by Sidebar's "Chat Admin" row and the public
// site's footer FAB: 09024312689 in wa.me international format.
const ADMIN_WHATSAPP_URL = "https://wa.me/2349024312689";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="white"
        d="M16.02 4C9.4 4 4 9.33 4 15.9c0 2.1.56 4.15 1.62 5.95L4 28l6.32-1.58A12.17 12.17 0 0 0 16.02 28C22.65 28 28 22.67 28 16.1 28 9.53 22.65 4 16.02 4Zm0 21.86c-1.78 0-3.52-.47-5.03-1.36l-.36-.21-3.75.94 1-3.62-.24-.38a9.86 9.86 0 0 1-1.5-5.23c0-5.38 4.43-9.76 9.88-9.76 5.45 0 9.88 4.38 9.88 9.76s-4.43 9.86-9.88 9.86Z"
      />
      <path
        fill="white"
        d="M21.42 18.55c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.09 3.17 5.07 4.45.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
      />
    </svg>
  );
}

// Appears once the user has scrolled down a bit on the More screen,
// hides again near the top. Reuses the .whatsapp-admin-* look from the
// public site's footer FAB (globals.css) but with its own `bottom`
// offset, since here it has to clear the mobile bottom tab bar
// (MainTab) instead of sitting flush with the viewport edge.
export default function ChatAdminFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const checkScrollPosition = () => {
      setVisible(window.scrollY > 120);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScrollPosition);
        ticking = true;
      }
    };

    checkScrollPosition();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style jsx>{`
        .app-chat-admin-fab {
          bottom: calc(6.75rem + env(safe-area-inset-bottom));
        }
        @media (min-width: 768px) {
          .app-chat-admin-fab {
            bottom: 1.5rem;
          }
        }
      `}</style>

      <a
        href={ADMIN_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`app-chat-admin-fab whatsapp-admin-fab ${
          visible ? "whatsapp-admin-fab-visible" : ""
        }`}
        aria-label="Chat with ValuePlus admin on WhatsApp"
      >
        <span className="whatsapp-admin-icon">
          <WhatsAppIcon />
        </span>

        <span className="whatsapp-admin-label">Chat Admin</span>
      </a>
    </>
  );
}
