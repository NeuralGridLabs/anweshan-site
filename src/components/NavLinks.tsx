"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Clients", href: "/clients" },
  { label: "Team", href: "/team" },
  { label: "Career", href: "/career" },
  { label: "Contact", href: "/contact" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="hidden md:flex items-center gap-7 text-md">
      {navLinks.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <li key={link.href} className="relative py-1">
            <Link
              href={link.href}
              className={`font-semibold transition-colors ${
                isActive ? "text-white" : "text-white/75 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
            <span
              className={`absolute -bottom-0.5 left-0 h-[2px] bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive ? "w-full" : "w-0"
              }`}
            />
          </li>
        );
      })}
    </ul>
  );
}
