"use client";

import Link from "next/link";
import Image from "next/image";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ResolvedProject } from "@/lib/project-data";

import Cutouts from "@/components/Cutouts";

export default function Projects({ projects }: { projects: ResolvedProject[] }) {
  const scroller = useRef<HTMLUListElement>(null);

  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Native scroll drives the state, so wheel, trackpad,
  // touch, scrollbar, and keyboard all stay in sync.
  const onScroll = useCallback(() => {
    const el = scroller.current;

    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;

    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft > max - 8);
  }, []);

  useEffect(() => {
    onScroll();

    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("resize", onScroll);
    };
  }, [onScroll]);

  const nudge = (dir: 1 | -1) => {
    const el = scroller.current;

    if (!el) return;

    const card = el.querySelector("li");

    const step = card
      ? card.clientWidth + 24
      : el.clientWidth * 0.8;

    el.scrollBy({
      left: dir * step,
      behavior: "smooth",
    });
  };

  // Pointer drag for mouse users
  const drag = useRef({
    active: false,
    startX: 0,
    startLeft: 0,
    moved: false,
  });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;

    const el = scroller.current;

    if (!el) return;

    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = scroller.current;

    if (!drag.current.active || !el) return;

    const dx = e.clientX - drag.current.startX;

    if (Math.abs(dx) > 4) {
      drag.current.moved = true;
    }

    el.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  // Suppress the click that ends a drag,
  // so dragging never navigates.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();

      drag.current.moved = false;
    }
  };

  return (
    <section className="relative bg-sage py-20 md:py-28 overflow-hidden">
      <Cutouts variant="featured" />

      <div className="relative">
        <div className="max-w-[1480px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 mb-12 md:mb-14 border-b border-forest/15">
            <div>
              <h2 className="h2-section text-forest">
                Our featured work
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/projects"
                className="group hidden sm:inline-flex items-center gap-2 text-forest/75 hover:text-forest text-sm font-semibold mr-2 transition-colors"
              >
                View all projects

                <ArrowUpRight
                  size={16}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>

              <button
                onClick={() => nudge(-1)}
                disabled={atStart}
                className="p-3.5 rounded-full bg-forest/10 border border-forest/20 text-forest hover:bg-gold hover:text-forest active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300"
                aria-label="Scroll to previous projects"
              >
                <ChevronLeft
                  size={22}
                  strokeWidth={2.5}
                />
              </button>

              <button
                onClick={() => nudge(1)}
                disabled={atEnd}
                className="p-3.5 rounded-full bg-forest/10 border border-forest/20 text-forest hover:bg-gold hover:text-forest active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300"
                aria-label="Scroll to next projects"
              >
                <ChevronRight
                  size={22}
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll-snap rail */}
        <div className="max-w-[1480px] mx-auto px-6 md:px-12">
          <ul
            ref={scroller}
            onScroll={onScroll}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onClickCapture={onClickCapture}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pr-2 pb-2 cursor-grab active:cursor-grabbing"
          >
            {projects.map((project) => {
              const coverUrl = project.cover;

              /* Products Anweshan operates link out to their live destination. */
              const href =
                project.externalUrl ?? `/projects/${project.slug}`;

              return (
                <li
                  key={project.key}
                  className="snap-start shrink-0 w-[clamp(250px,21vw,324px)]"
                >
                  <Link
                    href={href}
                    {...(project.externalUrl
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group flex h-full flex-col rounded-2xl overflow-hidden bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 focus-visible:-translate-y-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-sage"
                  >
                    <div className="relative h-[210px] shrink-0 overflow-hidden">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={project.title}
                          fill
                          sizes="360px"
                          draggable={false}
                          className="object-cover pointer-events-none transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-mint/50 text-forest/30">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <circle cx="9" cy="10" r="2" />
                            <path d="m21 16-5-5L5 20" />
                          </svg>
                        </div>
                      )}

                      {project.category && (
                        <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-base-text text-[11px] font-semibold tracking-wide px-3.5 py-1.5 rounded-full">
                          {project.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-7">
                      <h3 className="h3-card text-base-text mb-3 group-hover:text-forest transition-colors">
                        {project.title}
                      </h3>

                      <p className="body-sm text-base-text/75 line-clamp-3 mb-6">
                        {project.summary}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-4 pt-5 border-t border-forest/15">
                        <span className="meta-label text-base-text/55 truncate">
                          {project.client}
                        </span>

                        <span className="shrink-0 p-2.5 rounded-full bg-forest/5 text-forest group-hover:bg-gold group-hover:text-forest transition-colors">
                          <ArrowUpRight
                            size={18}
                            strokeWidth={2.5}
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Progress bar */}
        <div className="max-w-[1480px] mx-auto px-6 md:px-12 mt-9">
          <div className="h-[3px] w-full max-w-xs bg-forest/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-[width] duration-200"
              style={{
                width: `${Math.max(
                  8,
                  progress * 100
                )}%`,
              }}
            />
          </div>

          <Link
            href="/projects"
            className="sm:hidden mt-8 inline-flex items-center gap-2 rounded-full bg-gold text-forest text-sm font-semibold px-6 py-3"
          >
            View all projects

            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
