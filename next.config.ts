import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "172.20.10.2",
    "172.20.10.2:3000",
  ],
  // next/image refuses to optimize any host that isn't explicitly
  // allowlisted — without this, user-uploaded media (avatars, book
  // covers) served from the Django backend's /media/ silently fails to
  // render (a 400 from /_next/image, falls back to whatever onError
  // handles). Same dev hosts as allowedDevOrigins above, backend's port.
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8001", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8001", pathname: "/media/**" },
      { protocol: "http", hostname: "172.20.10.2", port: "8001", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
