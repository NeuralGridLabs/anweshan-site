"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* One logo as the CMS delivers it: an already-resolved CDN or local URL. */
export type MarqueeLogo = { name: string; src: string };

type Logo = {
  name: string;
  file?: string;
  short?: string;
};

type ClientMarqueeProps = {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  ctaLabel?: string;
  ctaLink?: string;
  logos?: MarqueeLogo[];
};

/* Fallback only: used when the CMS list is empty, so the strip still renders
   the logos the site has always shipped with. */
const FALLBACK_LOGOS: Logo[] = [
  {
    name: "World Health Organization",
    file: "/images/clients/who.png",
  },
  {
    name: "UNICEF",
    file: "/images/clients/unicef.png",
  },
  {
    name: "UNDP",
    file: "/images/clients/undp.png",
  },
  {
    name: "Pfizer",
    file: "/images/clients/pfizer.png",
  },
  {
    name: "USAID",
    file: "/images/clients/usaid.png",
  },
  {
    name: "Ministry of Health and Population",
    file: "/images/clients/MoHP.png",
  },
  {
    name: "GIZ",
    file: "/images/clients/GIZ.jpg",
  },
  {
    name: "International Vaccine Institute",
    file: "/images/clients/IVI.png",
  },
  {
    name: "BBC Media Action",
    file: "/images/clients/BBC.jpg",
  },
  {
    name: "Bournemouth University",
    file:
      "/images/clients/Shield_of_the_University_of_Bournemouth.svg.webp",
  },
  {
    name: "Plan International",
    file: "/images/clients/Plan_International.svg.webp",
  },
  {
    name: "JICA",
    file: "/images/clients/jica.svg.webp",
  },
  {
    name: "DFID",
    file: "/images/clients/DFID.jpg",
  },
  {
    name: "Helen Keller International",
    file:
      "/images/clients/Helen_Keller_International_logo.webp",
  },
  {
    name: "DanChurchAid",
    file: "/images/clients/DCA_logo1.png",
  },
  {
    name: "NHSSP",
    file: "/images/clients/NHSSP.jpg",
  },
];

const SPEED = 0.12;

/* Each mark is a fixed `w-44` (176px) box. A short CMS list is repeated inside
   every copy until one copy is at least this wide, so the seamless loop never
   leaves a visible gap at the end of the strip. */
const MARK_WIDTH = 176;
const TARGET_COPY_WIDTH = 1600;

function Mark({ logo, priority }: { logo: Logo; priority?: boolean }) {
  return (
    <div className="flex items-center justify-center w-44 h-20 shrink-0 select-none">
      {logo.file ? (
        <Image
          src={logo.file}
          alt={logo.name}
          width={160}
          height={70}
          draggable={false}
          priority={priority}
          className="object-contain max-w-[150px] max-h-[60px]"
        />
      ) : (
        <span className="text-sm font-semibold text-forest whitespace-nowrap">
          {logo.short}
        </span>
      )}
    </div>
  );
}

/* An internal path goes through next/link for a client-side transition;
   everything else (absolute URLs, bare fragments) uses a plain anchor. */
function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export default function ClientMarquee({
  eyebrow,
  heading,
  intro,
  ctaLabel,
  ctaLink,
  logos,
}: ClientMarqueeProps) {
  const items: Logo[] =
    logos && logos.length > 0
      ? logos.map((logo) => ({ name: logo.name, file: logo.src }))
      : FALLBACK_LOGOS;

  /* Repeat a short list so one copy fills the strip. With the full 16-logo
     fallback this is 1, i.e. exactly today's behaviour. */
  const repeats = Math.max(
    1,
    Math.ceil(TARGET_COPY_WIDTH / (MARK_WIDTH * items.length)),
  );

  const row = Array.from({ length: repeats }, () => items).flat();

  /* The button always points somewhere useful: CMS values win, otherwise it
     falls back to the clients page so the band is never a dead end. */
  const ctaHref = ctaLink?.trim() || "/clients";
  const ctaText = ctaLabel?.trim() || "View clients";

  const ctaClasses =
    "inline-flex items-center gap-2 rounded-full bg-forest text-white text-sm font-semibold px-6 py-3 hover:bg-forest/90 transition-colors";

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const grabXRef = useRef(0);
  const offsetRef = useRef(0);
  const periodRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const measure = () => {
      if (copyRef.current) {
        periodRef.current = copyRef.current.offsetWidth;
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (copyRef.current) observer.observe(copyRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = now - last;
      last = now;

      if (!reduced && !draggingRef.current) {
        offsetRef.current += delta * SPEED;
      }

      const period = periodRef.current;
      if (period > 0) {
        const viewport = viewportRef.current;
        if (viewport) {
          viewport.scrollLeft = offsetRef.current % period;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    grabXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    offsetRef.current -= event.clientX - grabXRef.current;
    grabXRef.current = event.clientX;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section id="clients" className="relative bg-mint pt-16 md:pt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <p className="text-forest/70 text-[14px] font-semibold tracking-[0.18em] uppercase mb-4">
          {eyebrow?.trim() || "Who we work with"}
        </p>

        <h2 className="h2-section text-forest max-w-3xl">
          {heading?.trim() || "Anweshan has worked with a wide range of clients."}
        </h2>

        <p className="mt-5 text-forest/75 body-lg max-w-2xl">
          {intro?.trim() ||
            "Government bodies, UN agencies, universities, and international organisations across development research, information technology, and communications."}
        </p>

        <div className="mt-8">
          {isInternal(ctaHref) ? (
            <Link href={ctaHref} className={ctaClasses}>
              {ctaText}
            </Link>
          ) : (
            <a href={ctaHref} className={ctaClasses}>
              {ctaText}
            </a>
          )}
        </div>
      </div>

      <div className="relative bg-white py-12 md:py-14">
        <div className="absolute left-0 inset-y-0 w-24 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />

        <div className="absolute right-0 inset-y-0 w-24 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-y cursor-grab select-none ${
            dragging ? "cursor-grabbing" : ""
          }`}
        >
          <div className="flex w-max">
            {[0, 1, 2].map((copy) => (
              <div
                key={copy}
                ref={copy === 0 ? copyRef : undefined}
                className="flex shrink-0 pr-6"
                aria-hidden={copy > 0}
              >
                {row.map((logo, i) => (
                  <Mark
                    key={`${logo.name}-${i}`}
                    logo={logo}
                    priority={copy === 0 && i < 4}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
