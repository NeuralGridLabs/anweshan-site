"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type AboutSlide = {
  src: string;
  alt?: string;
};

const SLIDES: AboutSlide[] = [
  { src: "/images/about/about-01.jpg" },
  { src: "/images/about/about-02.jpg" },
];

const DURATION = 5200;

export default function AboutImages({ slides = SLIDES }: { slides?: AboutSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || count < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, DURATION);

    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, count]);

  if (count === 0) return null;

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-sage"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="group"
      aria-roledescription="carousel"
      aria-label="About Anweshan"
    >
      {slides.map((slide, i) => {
        const active = i === index;

        return (
          <div
            key={slide.src}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity ease-out ${
              active
                ? "opacity-100 duration-[1200ms]"
                : "opacity-0 duration-[1200ms]"
            }`}
          >
            {/* The two source photos are near-square (0.99) and 16:9 (1.78),
                so no single fixed frame can hold both without either cropping
                one or letterboxing the other. Fitting rather than filling is
                what guarantees nothing is cut off.

                This blurred, oversized copy sits behind the real image and
                bleeds into whatever space `object-contain` leaves, so the
                bars read as a soft extension of the photo instead of a flat
                panel. It is also the only layer that carries the slow zoom:
                `kenburns` scales up to 1.14, which would clip the edges of
                the contained image it is not applied to. */}
            <Image
              src={slide.src}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              draggable={false}
              className={`object-cover scale-110 blur-xl opacity-45 ${
                active && !reduceMotion ? "kenburns" : ""
              }`}
            />

            <Image
              src={slide.src}
              alt={active ? (slide.alt ?? "") : ""}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              draggable={false}
              className="object-contain select-none"
            />
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous image"
            className="absolute top-1/2 -translate-y-1/2 left-4 p-3 rounded-full bg-white/90 text-forest shadow-sm hover:bg-gold active:scale-95 transition-all duration-300"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next image"
            className="absolute top-1/2 -translate-y-1/2 right-4 p-3 rounded-full bg-white/90 text-forest shadow-sm hover:bg-gold active:scale-95 transition-all duration-300"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  i === index
                    ? "w-7 bg-gold"
                    : "w-2.5 bg-white/80 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
