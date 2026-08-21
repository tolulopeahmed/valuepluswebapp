import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SnackbarProvider } from "@/components/Snackbar";
import ReferralCapture from "@/components/ReferralCapture";

// `interactiveWidget: "resizes-content"` is what makes a focused input
// (e.g. "confirm password" near the bottom of the signup form) actually
// scroll clear of the on-screen keyboard on modern mobile browsers —
// without it, the layout viewport doesn't shrink when the keyboard
// opens, so the browser's own "scroll focused input into view" has
// nothing to scroll against and the keyboard can end up covering the
// field instead.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "ValuePlus | Learn the A-Z of Publishing",
  description:
    "#1 Platform for authors who want to publish and learners who want to become publishers.",

  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    title: "ValuePlus | Learn the A-Z of Publishing",
    description:
      "#1 Platform for authors who want to publish and learners who want to become publishers.",
    siteName: "ValuePlus",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ValuePlus | Learn the A-Z of Publishing",
    description:
      "#1 Platform for authors who want to publish and learners who want to become publishers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReferralCapture />
        <SnackbarProvider>
          <AuthProvider>{children}</AuthProvider>
        </SnackbarProvider>
      </body>
    </html>
  );
}
