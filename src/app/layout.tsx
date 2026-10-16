import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

import { OG_IMAGE, indexingAllowed, openGraphFor, siteUrl, twitterFor } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const DEFAULT_TITLE = "Anweshan | Research, implementation and evidence communication";
const DEFAULT_DESCRIPTION =
  "Research and implementation partner in Nepal: from study design and field delivery to data systems, policy products and evidence communication.";

/* metadataBase is what lets every route emit an absolute canonical and an
   absolute og:image URL. Without it Next resolves relative URLs against
   localhost, which is the difference between a share card that works and one
   that renders broken in Slack or WhatsApp. siteUrl() supplies the production
   origin even when NEXT_PUBLIC_SITE_URL was never set. */
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: DEFAULT_TITLE,
    /* Every route sets its own absolute title, so the template does not append
       anything to them. It exists so a route that ever omits a title still
       gets the site name rather than a bare string. */
    template: "%s",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: openGraphFor(DEFAULT_TITLE, DEFAULT_DESCRIPTION, "/"),
  twitter: twitterFor(DEFAULT_TITLE, DEFAULT_DESCRIPTION),
  icons: {
    icon: OG_IMAGE.url,
  },
  /* Stated here as well as in pageMetadata() so a route that never reaches the
     shared helper still inherits noindex from a preview or local build. The
     two always agree - they read the same predicate. */
  robots: indexingAllowed() ? undefined : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-snow`}>
        <TopBar />
        <Navbar />
        {children}
        <Footer />
        {/* Suppressed on /admin by the component itself, which knows the route
            from usePathname; keeping it here means it is mounted once for the
            whole site rather than per page. */}
        <ScrollToTop />
      </body>
    </html>
  );
}
