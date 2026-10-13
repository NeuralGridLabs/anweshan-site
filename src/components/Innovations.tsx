import Image from "next/image";
import { ExternalLink } from "lucide-react";

import Cutouts from "@/components/Cutouts";
import Reveal from "@/components/Reveal";
import { innovations } from "@/lib/innovations";

/* Innovations.

   The products and units Anweshan has built. Replaces the old "Evidence,
   partners, and the people behind the work" band on the home page.

   Sage rather than forest: the featured-work band above it and the footer
   below it are both dark, and three stacked dark bands read as one slab with
   no rhythm. A pale ground here also keeps the near-white cards distinct from
   their own surface, which a dark band would not.

   Each card is a single <a>, so the whole tile is one tab stop and the CTA
   inside it is a label rather than a second nested link. Every affordance is
   visible at rest - the lift and the accent shift are additions on hover,
   never the only cue that something is clickable.

   Nothing here is interactive beyond the links, so this stays a server
   component; the reveal is the only client boundary. */

const HEADING = "Innovations at Anweshan";

export default function Innovations() {
  /* Same word-by-word rise the page headers use, so the heading arrives the
     way every other section heading on the site does. */
  const words = HEADING.split(" ");

  return (
    <section className="relative bg-sage text-forest py-20 md:py-28 overflow-hidden">
      <Cutouts variant="header" />

      <div className="relative max-w-[1400px] mx-auto px-6">
        <div className="max-w-3xl mb-14 md:mb-16">
          <p className="eyebrow text-base text-forest/60 mb-6">Products &amp; units</p>

          <h2 className="rise h2-section text-forest text-balance">
            {words.map((word, i) => (
              <span key={i} style={{ animationDelay: `${i * 55}ms` }}>
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h2>
        </div>

        {/* One column on phones, two from md so the set reads as a 2x2 block on
            tablets, and four from xl so a wide screen gets a single row.
            Any column count that does not divide the four cards evenly
            would strand one card alone on its own row. */}
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {innovations.map((item, index) => (
            <Reveal as="li" key={item.name} delay={index * 80} className="h-full">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl bg-snow overflow-hidden outline-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-sage"
              >
                {/* The sources are not the same shape, so each one
                    declares its own fit rather than the component guessing.
                    Cover fills the frame and takes the crop on the sides,
                    which for the green canvas is brand colour and never the
                    wordmark. Contain keeps a whole logo or a banner whole, on
                    a white plate with padding so the margin reads as margin
                    rather than as bars. */}
                <span
                  className={`relative block w-full aspect-[2/1] overflow-hidden ${
                    item.fit === "contain" ? "bg-white p-5" : ""
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1400px) 314px, (min-width: 1280px) 284px, (min-width: 768px) 45vw, 92vw"
                    className={
                      item.fit === "contain"
                        ? "object-contain object-center"
                        : "object-cover object-center"
                    }
                  />
                </span>

                <span className="flex flex-1 flex-col p-6">
                  <span className="meta-label text-forest/55">{item.tag}</span>

                  <span className="h3-card text-forest mt-3 text-balance">
                    {item.name}
                  </span>

                  <span className="body-sm text-forest/75 mt-3">{item.description}</span>

{/* mt-auto pins the CTA to the bottom of every card, so the
                      cards line up even though the descriptions are of
                      different lengths. */}
                  <span className="mt-auto pt-6 flex items-center gap-2 text-sm font-semibold text-forest">
                    {item.cta}
                    <ExternalLink
                      size={15}
                      strokeWidth={2.5}
                      aria-hidden
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}