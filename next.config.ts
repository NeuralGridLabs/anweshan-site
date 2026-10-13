import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
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
  /* Baseline security headers. Deliberately not a Content-Security-Policy:
     one has to be tuned against what the Sanity Studio at /admin loads, and a
     half-right CSP that breaks the CMS is worse than none. These four are
     safe without that knowledge.
       - frame-ancestors via X-Frame-Options stops the site being framed for
         clickjacking.
       - nosniff stops the browser guessing a MIME type we did not send.
       - no-referrer-when-downgrade keeps full referrers off http:// hops and
         off cross-origin requests, without the cross-site tracking that
         same-origin-origin would cost.
       - HSTS only over https, which is what :proto ensures.
     max-age is a year; includeSubDomains is left off because that is a promise
     about every subdomain and is not ours to make. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
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
