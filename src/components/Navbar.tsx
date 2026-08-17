"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import NavLinks from "@/components/NavLinks";

const mobileLinks = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Clients", href: "/clients" },
  { label: "Team", href: "/team" },
  { label: "Career", href: "/career" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-forest border-b border-forest/30 shadow-[0_1px_0_rgba(0,0,0,0.12)]"
            : "bg-forest border-b border-forest/20"
        }`}
      >
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* Wordmark recoloured white; the yellow and green marks are
                preserved from the original artwork. */}
            <Image
              src="/images/logo-light.png"
              alt="Anweshan logo"
              width={180}
              height={44}
              priority
              className={`object-contain transition-all duration-300 ${
                scrolled ? "h-10" : "h-15"
              } w-auto`}
            />
          </Link>

          <NavLinks />

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden md:flex items-center gap-2 rounded-full bg-white text-forest text-sm font-semibold px-5 py-2.5 hover:bg-gold transition-colors transition-colors"
            >
              Get in touch
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 -mr-2 text-white"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-forest/80" onClick={() => setOpen(false)} />

        <div
          className={`absolute right-0 top-0 h-full w-[86%] max-w-sm bg-forest text-white px-8 py-7 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end mb-10">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 -mr-2">
              <X size={26} />
            </button>
          </div>

          <ul className="space-y-1">
            {mobileLinks.map((link, i) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li
                  key={link.href}
                  style={{ transitionDelay: open ? `${120 + i * 45}ms` : "0ms" }}
                  className={`transition-all duration-500 ${
                    open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
                  }`}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block text-3xl font-bold tracking-tight py-2.5 border-b border-white/12 ${
                      isActive ? "text-gold" : "text-white/80 hover:text-white"
                    } transition-colors`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white text-forest text-sm font-semibold px-6 py-3.5 hover:bg-gold transition-colors"
          >
            Get in touch
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
