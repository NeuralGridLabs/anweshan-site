import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
  allowedDevOrigins: ["192.168.110.39"],
  /* The per-service detail pages are now a pop-up on /services. Old links,
     bookmarks and search results keep working: they land on the same page with
     the pop-up already open. Permanent, because the URL will never come back -
     ?open= is the destination from here on, not a temporary bridge. */
  async redirects() {
    return [
      {
        source: "/services/:slug",
        destination: "/services?open=:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
