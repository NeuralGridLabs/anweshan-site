import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.110.39"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  serverExternalPackages: [
    "sanity",
    "@sanity/vision",
    "next-sanity",
    "next-sanity/studio",
    "swr",
    "styled-components",
    "@sanity/ui",
    "@sanity/icons",
    "@sanity/client",
    "@sanity/image-url",
  ],
};

export default nextConfig;
