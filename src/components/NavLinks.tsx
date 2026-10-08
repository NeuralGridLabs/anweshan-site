"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type NavChild = { label: string; href: string };
type NavLink = { label: string; href: string };
type NavGroup = { label: string; children: NavChild[] };
/* Discriminated on `children`, so `link.href` is required in the link branch. */
type NavItem = NavLink | NavGroup;

const navLinks: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  {
    /* "Works" is a presentation label only. It groups the two collections of
       delivered work under one trigger; the /projects and /clients routes
       themselves are untouched and remain the real destinations. */
    label: "Works",
    children: [
      { label: "Projects", href: "/projects" },
      { label: "Clients", href: "/clients" },
    ],
  },
  /* Sectors is its own primary destination, deliberately not a Works child:
     it describes fields of practice rather than a body of delivered work. */
  { label: "Sectors", href: "/sectors" },
  { label: "Publications", href: "/publications" },
  {
    /* "Team" is a trigger, not a link. Its two destinations live in the panel. */
    label: "Team",
    children: [
      { label: "Our Team", href: "/team" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  { label: "Career", href: "/career" },
  { label: "Contact", href: "/contact" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const navRef = useRef<HTMLUListElement | null>(null);

  /* Open state is stored together with the pathname it was opened at, and the
     label actually in effect is DERIVED from it rather than kept as its own
     piece of state.

     Navigating to another route changes `pathname`, so `openedAt` no longer
     matches and the panel closes by itself. That removes the need for an
     effect that resets the menu on every navigation — an effect whose only job
     was to mirror a prop into state, which is exactly the extra render the
     lint rule warns about. Hover, click, outside-click and Escape all still
     work because they set or clear the stored value directly. */
  const [opened, setOpened] = useState<{ label: string; at: string } | null>(null);
  const openMenu = opened && opened.at === pathname ? opened.label : null;

  const openDropdown = (label: string) => setOpened({ label, at: pathname });
  const closeDropdown = () => setOpened(null);
  const toggleDropdown = (label: string) =>
    setOpened((current) =>
      current && current.label === label && current.at === pathname
        ? null
        : { label, at: pathname },
    );

  /* Outside click and Escape both dismiss, matching the burger drawer. */
  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    /* The listeners only read `closeDropdown`, which wraps a plain setState and
       so never changes identity between renders; `openMenu` is the real gate. */
  }, [openMenu]);

  return (
    <ul ref={navRef} className="hidden md:flex items-center gap-5 text-md">
      {navLinks.map((link) => {
        /* --- dropdown trigger --- */
        if ("children" in link) {
          const isActive = link.children.some((c) => pathname.startsWith(c.href));
          const expanded = openMenu === link.label;
          return (
            <li
              key={link.label}
              className="relative py-1"
              onMouseEnter={() => openDropdown(link.label)}
              onMouseLeave={closeDropdown}
            >
              <button
                type="button"
                aria-expanded={expanded}
                aria-haspopup="true"
                onClick={() => toggleDropdown(link.label)}
                className={`flex items-center gap-1 font-semibold transition-colors ${
                  isActive ? "text-white" : "text-white/75 hover:text-white"
                }`}
              >
                {link.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? "w-full" : "w-0"
                }`}
              />

              {/* pt-3 keeps the gap between trigger and panel hoverable, so the
                  menu cannot close while the pointer crosses it. */}
              <div
                className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  expanded
                    ? "visible translate-y-0 opacity-100"
                    : "pointer-events-none invisible -translate-y-1 opacity-0"
                }`}
              >
                <div className="w-52 overflow-hidden rounded-2xl border border-white/12 bg-forest shadow-xl">
                  {link.children.map((child) => {
                    const childActive = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:bg-white/15 focus-visible:text-white ${
                          childActive
                            ? "text-gold"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        }

        /* --- plain link, unchanged --- */
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
