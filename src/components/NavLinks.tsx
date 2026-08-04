"use client";

import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "home" },
  { label: "About us", href: "about" },
  { label: "Projects", href: "projects" },
  { label: "Publications", href: "publications" },
  { label: "Clients", href: "clients" },
  { label: "Career", href: "career" },
  { label: "Contact", href: "contact" },
];

export default function NavLinks() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    navLinks.forEach((link) => {
      const el = document.getElementById(link.href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ul className="hidden md:flex items-center gap-6 text-sm text-base-text/80">
      {navLinks.map((link) => {
        const isActive = active === link.href;
        return (
          <li key={link.href} className="relative pb-1">
            <button
              onClick={() => handleClick(link.href)}
              className={`font-medium transition-colors bg-transparent border-none cursor-pointer ${
                isActive ? "text-primary" : "text-base-text/80 hover:text-primary"
              }`}
            >
              {link.label}
            </button>
            {isActive && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-primary" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
