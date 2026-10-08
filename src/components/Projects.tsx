import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import Cutouts from "@/components/Cutouts";
import Reveal from "@/components/Reveal";
import { categoryShort } from "@/lib/categories";
import { sectorShort } from "@/lib/sectors";
import type { ResolvedProject } from "@/lib/project-data";

/* Featured work.

   This used to be a horizontal carousel of photo cards. With no project imagery
   the pictures carried nothing, so the band now takes its shape from typography
   instead: a dark editorial index, one numbered row per assignment.

   It is also inverted to forest. The bands either side of it are pale — a gold
   gradient above and cream below — so a dark strip here is the one real moment
   of contrast on the home page, and the list reads as a considered index
   rather than a row of empty rectangles.

   Nothing here is interactive, so this is a server component: no state, no
   drag handlers, no carousel machinery to ship to the browser. */

/* The first sector on a project, or "" when it has none. Shared by the chip so
   the "first sector" rule is written down once. */
function firstSector(project: ResolvedProject): string {
  return (project.sectors ?? []).find((v) => typeof v === "string" && v !== "") ?? "";
}

export default function Projects({ projects }: { projects: ResolvedProject[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="relative bg-forest text-ivory py-20 md:py-28 overflow-hidden">
      <Cutouts variant="featured" />

      <div className="relative max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 mb-2 border-b border-white/15">
          <div>
            
            <h2 className="h2-section text-ivory text-balance">
              Our featured work
            </h2>
          </div>

          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 self-start rounded-full border border-white/25 px-6 py-3 text-ivory text-sm font-semibold transition-colors hover:bg-accent hover:text-forest hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-forest md:self-auto"
          >
            View all projects

            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* Index rows */}
        <ul>
          {projects.map((project, index) => {
            /* Products Anweshan operates link out to their live destination. */
            const href = project.externalUrl ?? `/projects/${project.slug}`;

            return (
              <Reveal as="li" key={project.key} delay={index * 80}>
                <Link
                  href={href}
                  {...(project.externalUrl
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group relative grid grid-cols-1 md:grid-cols-12 items-baseline gap-x-6 gap-y-3 py-8 md:py-9 border-b border-white/15 transition-colors focus-visible:outline-none focus-visible:bg-white/5"
                >
                  {/* An accent bar that grows from the left on hover, so the row
                      responds across its full width rather than just at the
                      arrow. */}
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100"
                  />

                  {/* Index numeral */}
                  <span className="md:col-span-1 pl-3 md:pl-4 text-4xl md:text-5xl font-bold text-accent/30 tabular-nums leading-none select-none transition-colors duration-300 group-hover:text-accent/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Title */}
                  <h3 className="md:col-span-6 text-2xl md:text-3xl font-bold leading-tight tracking-tight text-ivory text-balance transition-colors duration-300 group-hover:text-accent">
                    {project.title}
                  </h3>

                  {/* Facts */}
                  <div className="md:col-span-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    {/* Sector first, then the service chip. The dark band needs
                        its own chip treatment, so this is not ProjectChips. */}
                    {firstSector(project) && (
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-forest">
                        {sectorShort(firstSector(project) as string)}
                      </span>
                    )}

                    {project.category && (
                      <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-ivory">
                        {categoryShort(project.category)}
                      </span>
                    )}

                    {project.client && (
                      <span className="text-sm font-semibold text-ivory/85">
                        {project.client}
                      </span>
                    )}

                    {project.years && (
                      <span className="text-sm font-medium text-ivory/50 tabular-nums">
                        {project.years}
                      </span>
                    )}
                  </div>

                  <span className="md:col-span-1 justify-self-end flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-ivory transition-all duration-300 group-hover:bg-accent group-hover:border-accent group-hover:text-forest">
                    <ArrowUpRight
                      size={20}
                      strokeWidth={2.5}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
