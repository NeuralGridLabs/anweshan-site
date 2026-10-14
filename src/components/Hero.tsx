"use client";

import Image from "next/image";
import { useCallback } from "react";
import { ArrowRight } from "lucide-react";

import Reveal from "@/components/Reveal";

/* --------------------------------------------------------------------------
   Hero.

   The copy, the CTAs and the amber ground are unchanged. The image band is
   three of Anweshan's own fieldwork photographs in one aligned row, in place
   of the stock-photo carousel. The wave pattern that used to sit over the
   section is gone: it was an artificial texture sitting under the pictures,
   and the row reads cleaner on solid brand amber without it.

   THE RATIO IS CHOSEN FROM THE FILES, not picked as a round number. The three
   photographs are 1112x918 (1.21), 2215x2616 (0.85) and 1122x1402 (0.80), and
   a square frame is the one that treats all three most evenly - it crops the
   landscape by 17% of its width and the two portraits by 15% and 20% of their
   height. A wider frame would have cut half the household photograph's body
   away; a taller one would have done the same to the community shot's forms.

   WHAT EACH CROP SPARES. Each photograph is cropped, but only in the place
   where there is nothing worth keeping, and the position is measured against
   the real file:

     household  landscape, so it loses width and keeps ALL of its height. The
                crop falls on the girl's back at one edge and the sari at the
                other; both faces and the emotion card sit well inside.
     hpv        her head starts 7.5% down and her card ends at 82%, so 42%
                puts the window at 6-91%. Her whole head survives with room to
                spare, along with both hands and the entire card. Only the
                skirt and the ground below it are given up.
     community  the topmost face begins 11% down and the pink forms end at
                93%, and a square window holds 80%. 40% puts it at 8-88%,
                which clears every head - including the woman at the back
                right - and keeps the forms being filled in.

   NOTHING MOVES. No scale and no translate on the card: a zoom inside the
   frame is a crop, and a moving card stops lining up with its neighbours. The
   lift on hover is carried by shadow and ring instead, which read as height
   without moving a pixel of the photograph.

   The title is a short strip across the bottom, not a wash over the whole
   picture, so a hovered photograph still shows its subject. It is always in
   the DOM for assistive tech, and always painted on anything without a
   pointer - tested against hover capability rather than a width, so a touch
   tablet is not left with a title that can never appear. The cards are not
   tab stops: they are not controls and do nothing on activation.

   Every tile is a fixed square reserved before the photograph arrives, so
   nothing reflows while loading, and the row is capped in width so the band
   stays in proportion to the heading above it rather than dominating the
   hero. Every transition is motion-reduce guarded.
   ----------------------------------------------------------------------- */

interface HeroData {
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubtext?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
}

type HeroImage = {
  src: string;
  label: string;
  alt: string;
  /** Focal point. Measured against the file - see the note above. */
  position: string;
  preload?: boolean;
};

const HERO_IMAGES: HeroImage[] = [
  {
    src: "/images/hero/household-survey.jpg",
    label: "Household Survey",
    alt: "An enumerator in a pink sari records answers on a tablet outside a village house while a child holds up a card of emotion faces",
    position: "50% 50%",
    preload: true,
  },
  {
    src: "/images/hero/hpv-vaccination-research.jpg",
    label: "HPV Vaccination Research",
    alt: "A girl stands outside a village house and holds her HPV vaccination card up to the camera",
    position: "50% 42%",
  },
  {
    src: "/images/hero/community-health-survey.jpg",
    label: "Community Health Survey",
    alt: "Two enumerators fill in questionnaires on pink forms as women seated on woven mats take part in a group discussion",
    position: "50% 40%",
  },
];

export default function Hero({ data }: { data?: HeroData }) {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const followLink = useCallback(
    (link: string | undefined, fallback: () => void) => {
      const value = link?.trim();
      if (!value) {
        fallback();
        return;
      }
      if (value.startsWith("#") && value.length > 1) {
        scrollTo(value.slice(1));
        return;
      }
      window.location.href = value;
    },
    [scrollTo]
  );

  const primaryLabel = data?.primaryCtaLabel?.trim() || "See our work";

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "#EAB308" }}>
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-20">
        {/* Centered copy */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-[#064e3b] text-xl font-bold mb-6 tracking-wide">
            {data?.heroEyebrow || "Research • Implementation • Evidence Communication"}
          </span>

          <h1 className="text-4xl md:text-[3.25rem] font-extrabold text-forest leading-[1.12] mb-6">
            {data?.heroHeading || "Evidence that moves from fieldwork to policy action"}
          </h1>

          <p className="text-forest/80 text-lg md:text-xl font-medium leading-relaxed mb-10">
            {data?.heroSubtext ||
              "We help governments, development partners, research institutions and responsible businesses understand difficult problems, deliver rigorous work and turn findings into decisions, systems and communication that people can use."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => followLink(data?.primaryCtaLink, () => scrollTo("projects"))}
              className="flex items-center gap-2 rounded-full bg-[#064e3b] text-white text-sm font-bold px-7 py-3.5 hover:bg-[#064e3b]/90 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {primaryLabel}
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => followLink(undefined, () => { window.location.href = "/contact"; })}
              className="flex items-center gap-2 rounded-full border-2 border-[#064e3b]/30 text-[#064e3b] text-sm font-bold px-7 py-3.5 hover:bg-[#064e3b]/10 transition-colors"
            >
              Discuss a project
            </button>
          </div>
        </div>

        {/* Three identical squares, one row from md, capped so the band stays
            in proportion to the heading rather than filling the whole width. */}
        <ul
          className="mx-auto grid max-w-[1080px] grid-cols-1 gap-5 md:grid-cols-3 md:gap-6
                     [&:has(>li:hover)>li:not(:hover)]:opacity-50
                     [&:has(>li:hover)>li:not(:hover)]:saturate-50"
        >
          {HERO_IMAGES.map((image, i) => (
            <Reveal
              as="li"
              key={image.src}
              delay={i * 120}
              className="group/tile transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            >
              <figure
                className="relative aspect-square overflow-hidden rounded-3xl bg-forest ring-1 ring-black/10
                           shadow-[0_14px_34px_rgba(25,60,45,0.12)]
                           transition-[box-shadow,ring-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                           group-hover/tile:shadow-[0_26px_60px_rgba(25,60,45,0.26)]
                           group-hover/tile:ring-2 group-hover/tile:ring-[#064e3b]/40
                           motion-reduce:transition-none"
              >
                {/* The photograph, filling its square. One image, no backdrop,
                    no overlay across the frame, no pattern behind it. */}
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  preload={image.preload}
                  sizes="(min-width: 768px) 30vw, 92vw"
                  style={{ objectPosition: image.position }}
                  className="object-cover transition-[filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:brightness-[1.06] motion-reduce:transition-none"
                />

                {/* A short strip across the bottom, not a wash over the whole
                    picture - the subject stays visible on hover. */}
                <figcaption
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-20
                             bg-gradient-to-t from-[#064e3b] via-[#064e3b]/55 to-transparent
                             opacity-100 transition-opacity duration-500
                             [@media(hover:hover)]:opacity-0
                             [@media(hover:hover)]:group-hover/tile:opacity-100
                             motion-reduce:transition-none"
                >
                  <span className="absolute inset-x-0 bottom-0 block px-4 pb-3.5 text-center text-sm font-bold tracking-wide text-white md:text-base">
                    {image.label}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}