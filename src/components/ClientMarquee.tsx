"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Logo = {
  name: string;
  file?: string;
  short?: string;
};

const logos: Logo[] = [
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
    name: "GiZ",
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
      "/images/clients/Helen_Keller_International_logo.svg.webp",
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

export default function ClientMarquee() {
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
    <section className="relative bg-sage pt-16 md:pt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <p className="text-forest/70 text-[14px] font-semibold tracking-[0.18em] uppercase mb-4">
          Who we work with
        </p>

        <h2 className="h2-section text-forest max-w-3xl">
          Anweshan has worked with a wide range of clients.
        </h2>

        <p className="mt-5 text-forest/75 body-lg max-w-2xl">
          Government bodies, UN agencies, universities, and international
          organisations across development research, information technology,
          and communications.
        </p>
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
                {logos.map((logo, i) => (
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
