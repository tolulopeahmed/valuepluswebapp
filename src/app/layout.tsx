import type { Metadata } from "next";
import "./globals.css";

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
    siteName: "ValuePlus Publishing",
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
      <body>{children}</body>
    </html>
  );
}
