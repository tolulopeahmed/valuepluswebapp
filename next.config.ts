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
  // covers) silently fails to render (a 400 from /_next/image, falls
  // back to whatever onError handles). The localhost:8001 entries were
  // for the old local-disk /media/ path; every upload (avatars, book
  // covers) now goes through apps.core.storage.ImageKitStorage instead
  // (see IMAGEKIT_URL_ENDPOINT in server/config/settings.py), so
  // ik.imagekit.io must be allowlisted too — its absence is why book
  // covers rendered fine in the dashboard (plain <img> tags there
  // aren't subject to this allowlist) but not on the public book page,
  // which uses next/image.
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8001", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8001", pathname: "/media/**" },
      { protocol: "http", hostname: "172.20.10.2", port: "8001", pathname: "/media/**" },
      { protocol: "https", hostname: "ik.imagekit.io", pathname: "/**" },
    ],
  },
};

export default nextConfig;
