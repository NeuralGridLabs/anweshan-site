"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Cutouts from "@/components/Cutouts";

const items = [
  {
    id: "01",
    label: "Services",
    href: "/services",
    caption: "Six practices, trusted by partners",
    description:
      "Clinical research, Q-squared surveys, policy dialogue, communication, and information technology.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: "02",
    label: "Projects",
    href: "/projects",
    caption: "Twelve studies",
    description:
      "Antimicrobial stewardship, migration health, immunisation, and reproductive health research.",
    image:
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: "03",
    label: "Team",
    href: "/team",
    caption: "Researchers and advisors",
    description:
      "The clinicians, analysts, and field staff who design and deliver the work.",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1400",
  },
];

export default function Explore() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative bg-cream text-forest overflow-hidden">
      <Cutouts variant="explore" />
      {/* Coloured outline shapes in the corners and sides, drawn above the wash */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <span className="absolute -top-20 -left-20 w-72 h-72 rounded-full border-2 border-forest/40" />
        <span className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full border-2 border-forest/50" />
        <span className="absolute top-1/4 right-10 w-44 h-44 rounded-full border-2 border-forest/35" />
        <span className="absolute -top-10 right-1/3 w-60 h-60 rounded-[2.5rem] rotate-45 border-2 border-forest/35" />
      </div>

      {/* Ambient image wash tied to the active row */}
      <div className="absolute inset-0 z-0">
        {items.map((item, i) => (
          <Image
            key={item.href}
            src={item.image}
            alt=""
            fill
            sizes="100vw"
            className={`object-cover transition-opacity duration-[900ms] ease-out ${
              active === i ? "opacity-25" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-butter via-butter/95 to-butter/80" />
      </div>

      <div className="relative max-w-[1120px] mx-auto px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-10 mb-14 md:mb-20">
          <div className="md:col-span-8">
            <h2 className="h2-section text-forest">
              Evidence, partners, and the people behind the work.
            </h2>
          </div>
        </div>

        <ul className="border-t border-forest/15" onMouseLeave={() => setActive(0)}>
          {items.map((item, i) => {
            const isActive = active === i;
            return (
              <li key={item.href} onMouseEnter={() => setActive(i)}>
                <Link
                  href={item.href}
                  onFocus={() => setActive(i)}
                  className="group relative grid grid-cols-12 items-center gap-4 md:gap-8 py-8 md:py-10 border-b border-forest/15 outline-none"
                >
                  {/* Sliding fill */}
                  <span
                    className={`absolute inset-y-0 left-[-1.5rem] right-[-1.5rem] bg-forest/[0.04] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />

                  <span
                    className={`relative col-span-2 md:col-span-1 text-xs font-semibold tabular-nums transition-colors duration-300 ${
                      isActive ? "text-forest" : "text-forest/45"
                    }`}
                  >
                    {item.id}
                  </span>

                  <span className="relative col-span-10 md:col-span-4">
                    <span
                      className={`block text-2xl md:text-4xl font-bold tracking-tight transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isActive ? "text-forest md:translate-x-2" : "text-forest/80"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="block text-forest/55 meta-label mt-2">{item.caption}</span>
                  </span>

                  <span className="relative hidden md:block md:col-span-4 text-forest/75 body-sm">
                    {item.description}
                  </span>

                  {/* Thumbnail */}
                  <span className="relative hidden md:block md:col-span-2">
                    <span
                      className={`block relative h-20 w-full rounded-lg overflow-hidden transition-all duration-500 ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </span>
                  </span>

                  <span className="relative col-span-12 md:col-span-1 flex md:justify-end">
                    <span
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-full transition-all duration-400 ${
                        isActive
                          ? "bg-primary text-cream rotate-0"
                          : "bg-primary/10 text-forest/50 -rotate-45"
                      }`}
                    >
                      <ArrowUpRight size={20} strokeWidth={2.5} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
