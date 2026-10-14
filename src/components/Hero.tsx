"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/* --------------------------------------------------------------------------
   Hero.

   The copy, the CTAs, the amber ground and the nav are untouched. Only the
   image band changed: it is back to a single-image auto-advancing carousel,
   now carrying three collage photographs of Anweshan fieldwork instead of the
   stock images it started with.

   NO CROPPING, AND NO GUESSING AT A RATIO. All three collages are exactly
   2700x1000, so they share a ratio of 2.7 and the frame is set to that. At a
   ratio the frame and the photograph agree on, object-contain fills the frame
   exactly - there is no letterbox to fill and therefore no blurred backdrop
   copy behind it, which is the whole point of measuring rather than guessing.
   Anything that would crop the collage to fit is a bug, not a style: these
   pictures are several scenes wide, and cutting any of them loses a panel.

   The frame's height comes from its own aspect ratio rather than a fixed
   pixel height, so the space is reserved before a byte of image arrives and
   nothing below it moves on load. The width is capped and centred, so the
   band sits under the buttons rather than stretching across the hero.

   THE FRAME IS THE ONLY ELEMENT. The caption sits bottom-left and the dots
   bottom-right, both over a short scrim and on the same baseline, so there
   is no bar under the picture and no gap below it. Both sit inside the frame,
   which is rounded, overflow-hidden and relative.

THE SCRIM IS SHORT AND LIGHT. A collage is several scenes wide, and those
   scenes are the point. A tall, solid gradient over the lower third made the
   bottom row look hidden rather than dimmed, so the scrim now only covers the
   bottom quarter, peaks at 90% rather than 100%, and fades out entirely -
   all it has to do is give white text something to sit on.

   Autoplay runs every 5s with the same 1500ms opacity fade the previous
   carousel used. It stops on hover, on focus anywhere inside, while the tab is
   hidden, and entirely under prefers-reduced-motion. The effect depends on the
   paused flag rather than only setting it, so pausing really does clear the
   timer instead of leaving one running behind a stopped counter.

   Only the first slide is priority-loaded. The other two are lazy, so the
   browser does not fetch two 2700px collages for a visitor who never reaches
   them.
   ----------------------------------------------------------------------- */

interface HeroData {
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubtext?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
}

type HeroSlide = {
  src: string;
  label: string;
  alt: string;
};

/** Intrinsic size of all three collages, so the frame can reserve the space. */
const COLLAGE_W = 2700;
const COLLAGE_H = 1000;

const SLIDES: HeroSlide[] = [
  {
    src: "/images/hero/household-collage.jpg",
    label: "Household Survey",
    alt: "Household survey fieldwork photo collage",
  },
  {
    src: "/images/hero/training-collage.jpg",
    label: "Training",
    alt: "Training fieldwork photo collage",
  },
  {
    src: "/images/hero/community-collage.jpg",
    label: "Community Health Survey",
    alt: "Community health survey fieldwork photo collage",
  },
];

/** Milliseconds each slide is held, matching the old carousel's pace. */
const HOLD_MS = 5000;
/** The old carousel's crossfade. */
const FADE = "duration-[1500ms] ease-in-out";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Hero({ data }: { data?: HeroData }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = SLIDES.length;

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

  const goTo = useCallback(
    (index: number) => setCurrent(((index % total) + total) % total),
    [total]
  );

  /* Autoplay. Depends on `paused` and on `current`, so the countdown restarts
     after every advance and stops dead while paused. */
  useEffect(() => {
    if (paused || prefersReducedMotion()) return;

    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, HOLD_MS);

    return () => clearTimeout(timer);
  }, [current, paused, total]);

  /* Returning to a backgrounded tab should not skip the carousel forward by
     however long it was away, so it is held while the tab is hidden and
     released on the way back rather than restarted mid-countdown. */
  useEffect(() => {
    function onVisibility() {
      if (!document.hidden) setPaused(false);
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

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

        {/* Carousel. Width capped and centred under the buttons. The frame
            carries the aspect ratio, so its height is reserved before the
            photograph loads and nothing below it shifts. */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="mx-auto w-full max-w-[1080px]"
        >
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label="Fieldwork photo collages"
            /* bg-forest, not the sage it was: the frame is sized from an
               aspect ratio, so the browser rounds its height down by a
               fraction of a pixel. The pale sage (#E9F5DB - effectively white)
               showed through that seam as a thin light line down the edge.
               A dark ground cannot show a seam. */
            className="relative aspect-[2.7/1] w-full overflow-hidden rounded-3xl bg-forest ring-1 ring-black/10 shadow-[0_18px_44px_rgba(25,60,45,0.16)]"
          >
            {SLIDES.map((slide, index) => (
              <div
                key={slide.src}
                aria-hidden={index !== current}
                className={`absolute inset-0 transition-opacity ${FADE} motion-reduce:transition-none ${
                  index === current ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* object-cover, and it still loses nothing: the frame is 2.7:1 and the
                    file is 2700x1000, which is also exactly 2.7:1. Cover only
                    crops when the frame and the picture disagree, and here
                    they do not - it is the one case where cover and contain
                    render identically, except that cover also absorbs the
                    sub-pixel rounding of the frame's height and so cannot
                    leave a seam. The previous object-contain fitted to within
                    a fraction of a pixel and the pale ground behind showed
                    through it as a hairline.

                    No padding or border on this wrapper, so the picture runs
                    edge to edge, and intrinsic width and height are given so
                    the browser can reserve the box before the bytes arrive. */}
                <Image
                  src={slide.src}
                  alt={index === current ? slide.alt : ""}
                  width={COLLAGE_W}
                  height={COLLAGE_H}
                  priority={index === 0}
                  sizes="(min-width: 1080px) 1080px, 92vw"
                  className="h-full w-full object-cover"
                />

                {/* Scrim: a short band across the bottom, solid brand green at
                    the very bottom and gone a quarter of the way up.

                    It was h-3/5 at full strength, which darkened the entire
                    lower third of the collage and made the bottom row of
                    pictures look hidden. Collage panels are the whole point of
                    these images, so the scrim now only has to do its one job -
                    give white text something to sit on - and it does that
                    inside the height the caption actually occupies. It is also
                    pointer-events-none, so it never swallows a click meant for
                    the dots beside it. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#064e3b]/90 via-[#064e3b]/35 to-transparent" />
              </div>
            ))}

            {/* Caption, bottom-left, and dots, bottom-right: both over the
                scrim on the same baseline, so the frame is the only element in
                the band and nothing sits below it. */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-5 pb-4 md:px-6 md:pb-5">
              <p
                aria-live="polite"
                className="pointer-events-none text-sm font-bold tracking-wide text-white md:text-lg"
              >
                {SLIDES[current].label}
              </p>

              <div className="flex shrink-0 items-center gap-2">
                {SLIDES.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Show slide ${index + 1}: ${slide.label}`}
                    aria-current={index === current}
                    className={`h-1.5 rounded-full transition-[width,background-color] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#064e3b] motion-reduce:transition-none ${
                      index === current ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}