import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Anweshan - Redefining Research",
  description: "Clinical research, policy dialogue, and data-driven survey work across Nepal.",
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
