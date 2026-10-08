"use client";

import { useMemo, useState } from "react";

import HubProjectCard from "@/components/HubProjectCard";
import Reveal from "@/components/Reveal";
import { categoryShort } from "@/lib/categories";
import type { HubProject } from "@/lib/types";

/* A client's assignments, newest first, grouped by the year they started.

   A client component only because of the category filter. Everything it needs
   arrives as plain data: the query has already removed any project that is not
   cleared for the web, so nothing here can leak a hidden assignment. */

type Props = { projects: HubProject[] };

const ALL = "all";

/* The filter earns its place only on a longer list with real variety. Below
   these thresholds it is just clutter above a handful of cards. */
const MIN_PROJECTS_FOR_FILTER = 6;
const MIN_CATEGORIES_FOR_FILTER = 2;

/* startYear is the grouping key. Legacy projects predate it, so undated work is
   kept together under its own heading rather than silently dropped. */
function yearOf(project: HubProject): number | null {
  return project.startYear ?? null;
}

export default function HubProjects({ projects }: Props) {
  const [active, setActive] = useState<string>(ALL);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const project of projects) {
      /* Only real strings can become a chip label or a React key. */
      if (typeof project.category !== "string" || project.category === "") continue;
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const visible = useMemo(
    () =>
      active === ALL
        ? projects
        : projects.filter((project) => project.category === active),
    [projects, active],
  );

  /* Grouped by year, newest year first, so the order projects arrived in does
     not leak into the layout. */
  const groups = useMemo(() => {
    const byYear = new Map<string, HubProject[]>();

    for (const project of visible) {
      const year = yearOf(project);
      const key = year === null ? "undated" : String(year);
      const bucket = byYear.get(key);

      if (bucket) bucket.push(project);
      else byYear.set(key, [project]);
    }

    return [...byYear.entries()].sort(([a], [b]) => {
      if (a === "undated") return 1;
      if (b === "undated") return -1;
      return Number(b) - Number(a);
    });
  }, [visible]);

  const showFilter =
    projects.length >= MIN_PROJECTS_FOR_FILTER &&
    categoryCounts.length >= MIN_CATEGORIES_FOR_FILTER;

  const chipClass = (isActive: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 ${
      isActive
        ? "bg-forest text-white"
        : "border border-forest/30 text-forest/90 hover:border-forest/60"
    }`;

  return (
    <div>
      {showFilter && (
        <div className="flex flex-wrap gap-2.5 mb-8">
          <button
            type="button"
            onClick={() => setActive(ALL)}
            aria-pressed={active === ALL}
            className={chipClass(active === ALL)}
          >
            All ({projects.length})
          </button>

          {categoryCounts.map(([value, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActive(value)}
              aria-pressed={active === value}
              className={chipClass(active === value)}
            >
              {categoryShort(value)} ({count})
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-forest/15 bg-ivory px-6 py-16 text-center">
          <p className="text-forest body-lg">
            No assignments in this service area yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([key, group]) => (
            /* Groups with nothing in them never reach here: the filter runs
               before grouping, so an emptied year disappears entirely. */
            <div
              key={key}
              className="grid grid-cols-1 gap-3 lg:grid-cols-[90px_1fr] lg:gap-6"
            >
              <div>
                <h3 className="text-3xl font-bold text-primary-dark tabular-nums lg:sticky lg:top-28">
                  {key === "undated" ? "Year not recorded" : key}
                </h3>

                <p className="mt-1 text-forest/85 text-xs font-semibold uppercase tracking-[0.12em]">
                  {group.length === 1
                    ? "1 assignment"
                    : `${group.length} assignments`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.map((project, i) => (
                  <Reveal key={project._id} delay={Math.min(i, 5) * 70}>
                    <HubProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}