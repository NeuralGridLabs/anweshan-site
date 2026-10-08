"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Search, X } from "lucide-react";

import Reveal from "@/components/Reveal";
import ProjectChips from "@/components/ProjectChips";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { SECTORS } from "@/lib/sectors";

/* The projects index: search, a sector filter, a service filter and a client
   filter, over the same cards the server used to render.

   A client component because the filtering is interactive. Everything it needs
   arrives as plain serialisable data - the image is already a resolved URL, so
   no Sanity code runs in the browser.

   The sector filter lives in the URL as ?sector=<value> so a filtered view can
   be linked to, which is how /sectors sends people here. It is read on mount
   and written with history.replaceState rather than useSearchParams: reading it
   from the client keeps /projects statically generated instead of opting the
   whole route into dynamic rendering, and replaceState does not re-render, so
   the filter state stays the single source of truth. The trade-off is that the
   sector filter applies after hydration, so a shared link briefly shows the
   unfiltered list. */

export type ProjectCard = {
  key: string;
  slug: string;
  title: string;
  summary: string;
  client: string;
  status: string;
  years: string;
  cover: string | null;
  /** Primary service value, or "" when the editor has not chosen one. */
  category: string;
  /** Sector values from SECTORS. Empty when the project has none yet. */
  sectors: string[];
};

type SortKey = "service" | "recent" | "az";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "service", label: "Grouped by service" },
  { value: "recent", label: "Most recent" },
  { value: "az", label: "A to Z" },
];

/* Alternating grounds so each service band reads as its own section. Existing
   tokens only, and no two adjacent bands share a background. */
const BAND_BG = ["bg-snow", "bg-sage"];

/* The sector filter lives in the URL as ?sector=<value>, so a filtered view can
   be linked to — that is how /sectors sends people here.

   It is read through useSyncExternalStore rather than useSearchParams or a
   setState-in-effect, for two reasons. useSearchParams would opt /projects out
   of static rendering for one query parameter. A setState inside an effect
   causes a cascading render, which the lint rule rightly rejects.

   The URL is a genuine external store, so it is treated as one: `popstate`
   keeps the back button working, and SECTOR_EVENT tells the component when it
   has changed the URL itself (replaceState fires no event of its own).

   Consequence to be aware of: the server snapshot is "all", so a shared link
   briefly paints the unfiltered list before the stored value is adopted. */
const SECTOR_EVENT = "anweshan:sector-change";

function subscribeToSector(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(SECTOR_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(SECTOR_EVENT, onChange);
  };
}

function readSectorFromUrl() {
  return new URLSearchParams(window.location.search).get("sector") ?? "all";
}

/* Server render: always "all". The client snapshot is only read after mount. */
function serverSector() {
  return "all";
}

export default function ProjectExplorer({
  projects,
  emptyHref = "/admin",
  emptyLabel = "Go to Admin",
}: {
  projects: ProjectCard[];
  emptyHref?: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [service, setService] = useState<string>("all");
  const [client, setClient] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("service");

  /* The authoritative sector selection is the URL. An unrecognised value is
     treated as "all" so a mistyped link shows everything rather than nothing. */
  const sectorFromUrl = useSyncExternalStore(
    subscribeToSector,
    readSectorFromUrl,
    serverSector,
  );
  const sector = SECTORS.some((s) => s.value === sectorFromUrl)
    ? sectorFromUrl
    : "all";

  function selectSector(value: string) {
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("sector");
    else url.searchParams.set("sector", value);

    window.history.replaceState(null, "", url.toString());
    /* replaceState notifies nobody, so the store is told by hand. */
    window.dispatchEvent(new Event(SECTOR_EVENT));
  }

  /* Client options come from the data, so a filter can never point at a client
     with no projects. */
  const clients = useMemo(() => {
    const unique = [...new Set(projects.map((p) => p.client).filter(Boolean))];
    return unique.sort((a, b) => a.localeCompare(b));
  }, [projects]);

  /* Only offer a service chip for services that actually have work, so the row
     never lists a discipline that would return nothing. */
  const serviceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      if (!project.category) continue;
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }
    return counts;
  }, [projects]);

  /* Facet counts, each computed against every filter EXCEPT its own. That is
     what makes the numbers move as the other filters change without the active
     chip's own count jumping under the reader's cursor. */
  const sectorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      /* Every filter but the sector one. */
      if (service !== "all" && project.category !== service) continue;
      if (client !== "all" && project.client !== client) continue;

      const needle = query.trim().toLowerCase();
      if (needle) {
        const hit =
          project.title.toLowerCase().includes(needle) ||
          project.summary.toLowerCase().includes(needle) ||
          project.client.toLowerCase().includes(needle) ||
          categoryLabel(project.category).toLowerCase().includes(needle);
        if (!hit) continue;
      }

      for (const value of project.sectors) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
    return counts;
  }, [projects, query, service, client]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const matched = projects.filter((project) => {
      if (service !== "all" && project.category !== service) return false;
      if (client !== "all" && project.client !== client) return false;
      if (sector !== "all" && !project.sectors.includes(sector)) return false;

      if (!needle) return true;

      /* Title, summary, client and service all count, so a reader can search
         "Nepal", a client's name, or a discipline interchangeably. */
      return (
        project.title.toLowerCase().includes(needle) ||
        project.summary.toLowerCase().includes(needle) ||
        project.client.toLowerCase().includes(needle) ||
        categoryLabel(project.category).toLowerCase().includes(needle)
      );
    });

    if (sort === "az") {
      return [...matched].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sort === "recent") {
      /* Newest first year, falling back to the end when a project has none. */
      return [...matched].sort((a, b) => firstYear(b) - firstYear(a));
    }
    return matched;
  }, [projects, query, service, client, sector, sort]);

  /* Grouped in the canonical category order, with anything unrecognised last. */
  const groups = useMemo(() => {
    const buckets = new Map<string, ProjectCard[]>();
    for (const project of visible) {
      const key = project.category || "other";
      const bucket = buckets.get(key);
      if (bucket) bucket.push(project);
      else buckets.set(key, [project]);
    }

    const ordered: { id: string; label: string; short: string; items: ProjectCard[] }[] = [];

    for (const category of CATEGORIES) {
      const found = buckets.get(category.value);
      if (!found) continue;
      buckets.delete(category.value);
      ordered.push({ id: category.value, label: category.label, short: category.short, items: found });
    }

    for (const [key, found] of buckets) {
      ordered.push({ id: key, label: "Other work", short: "Other", items: found });
    }

    return ordered;
  }, [visible]);

  const filtersActive =
    query.trim() !== "" || service !== "all" || client !== "all" || sector !== "all";

  function clearAll() {
    setQuery("");
    setService("all");
    setClient("all");
    selectSector("all");
  }

  return (
    <div>
      {/* ---------------- Controls ---------------- */}
      <div className="bg-sage border-y border-forest/15">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-5">
              <label htmlFor="project-search" className="block text-forest/70 meta-label mb-2">
                Search projects
              </label>

              <div className="relative">
                <Search
                  size={16}
                  aria-hidden
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40 pointer-events-none"
                />

                <input
                  id="project-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Title, client, or keyword"
                  className="w-full rounded-xl border border-forest/15 bg-white py-3 pl-11 pr-4 text-forest body placeholder:text-forest/40 transition-shadow focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                />
              </div>
            </div>

            {/* Client */}
            <div className="md:col-span-3">
              <label htmlFor="project-client" className="block text-forest/70 meta-label mb-2">
                Client
              </label>

              <select
                id="project-client"
                value={client}
                onChange={(event) => setClient(event.target.value)}
                className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-forest body transition-shadow focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
              >
                <option value="all">All clients</option>
                {clients.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-4">
              <label htmlFor="project-sort" className="block text-forest/70 meta-label mb-2">
                Sort
              </label>

              <select
                id="project-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-forest body transition-shadow focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sector chips, above the service row: sector is the coarser question, so it
             is asked first. Only sectors with at least one matching project get a
             chip, so the row can never offer a filter that returns nothing. */}
          {sectorCounts.size > 0 && (
            <div className="mt-5">
              <p className="text-forest/70 meta-label mb-3">Sector</p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => selectSector("all")}
                  aria-pressed={sector === "all"}
                  className={chipClass(sector === "all")}
                >
                  All sectors
                  <span className="ml-2 tabular-nums opacity-60">{projects.length}</span>
                </button>

                {SECTORS.filter((s) => sectorCounts.has(s.value)).map((option) => {
                  const isActive = sector === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => selectSector(isActive ? "all" : option.value)}
                      aria-pressed={isActive}
                      className={chipClass(isActive)}
                    >
                      {option.short}
                      <span className="ml-2 tabular-nums opacity-60">
                        {sectorCounts.get(option.value)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Service chips */}
          {serviceCounts.size > 0 && (
            <div className="mt-5">
              <p className="text-forest/70 meta-label mb-3">Service</p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setService("all")}
                  aria-pressed={service === "all"}
                  className={chipClass(service === "all")}
                >
                  All services
                  <span className="ml-2 tabular-nums opacity-60">{projects.length}</span>
                </button>

                {CATEGORIES.filter((category) => serviceCounts.has(category.value)).map(
                  (category) => {
                    const isActive = service === category.value;
                    return (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setService(isActive ? "all" : category.value)}
                        aria-pressed={isActive}
                        className={chipClass(isActive)}
                      >
                        {category.short}
                        <span className="ml-2 tabular-nums opacity-60">
                          {serviceCounts.get(category.value)}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Result count */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-forest/70 body-sm">
              {visible.length === 1 ? "1 project" : `${visible.length} projects`}
              {filtersActive ? " matching" : ""}
            </p>

            {filtersActive && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white px-4 py-2 text-xs font-semibold text-forest transition-colors hover:bg-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50"
              >
                <X size={14} aria-hidden />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Results ---------------- */}
      {visible.length === 0 ? (
        <section className="bg-snow py-24">
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 text-center">
            <p className="text-forest body-lg mb-3">
              {projects.length === 0
                ? "No projects have been added yet."
                : "No projects match those filters."}
            </p>

            {projects.length === 0 ? (
              <Link
                href={emptyHref}
                className="inline-block mt-6 text-primary font-semibold hover:underline"
              >
                {emptyLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-white text-sm font-semibold transition-colors hover:bg-forest/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>
      ) : (
        groups.map((group, groupIndex) => (
          <section
            key={group.id}
            id={group.id}
            /* scroll-mt clears the sticky navbar when arriving from a jump link */
            className={`${BAND_BG[groupIndex % BAND_BG.length]} text-forest scroll-mt-24 py-20 md:py-28`}
          >
            <div className="max-w-[1240px] mx-auto px-6 md:px-10">
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-primary-dark eyebrow mb-3">{group.short}</p>

                    <h2 className="h2-section text-forest text-balance">{group.label}</h2>
                  </div>

                  <p className="text-forest/60 meta-label">
                    {group.items.length === 1
                      ? "1 assignment"
                      : `${group.items.length} assignments`}
                  </p>
                </div>
              </Reveal>

              <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {group.items.map((project, i) => (
                  <Reveal as="li" key={project.key} delay={(i % 3) * 110} className="h-full">
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function chipClass(isActive: boolean) {
  return `inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sage ${
    isActive
      ? "bg-forest text-white"
      : "border border-forest/20 bg-white text-forest hover:border-forest/60"
  }`;
}

/** First four-digit year found in the display string, or 0. */
function firstYear(project: ProjectCard): number {
  const match = project.years.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function ProjectCard({ project }: { project: ProjectCard }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-forest/15 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2"
    >
      {project.cover && (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5">
          <Image
            src={project.cover}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />

          <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/6 transition-colors duration-500" />

          {project.status && (
            <span className="absolute top-3 left-3 rounded-full bg-snow/95 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-forest/90">
              {project.status}
            </span>
          )}
        </div>
      )}

      {!project.cover && project.status && (
        <p className="text-primary-dark meta-label mb-3">{project.status}</p>
      )}

      <h3 className="h3-card text-forest mb-3 text-balance group-hover:text-primary-dark transition-colors">
        {project.title}
      </h3>

      {project.summary && (
        <p className="text-forest/75 body-sm leading-relaxed mb-5 flex-1 line-clamp-3">
          {project.summary}
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-forest/15 flex items-center justify-between gap-3">
        {/* Chips share the existing footer line rather than adding one, so a
            card is exactly as tall as it was before sectors existed. */}
        <ProjectChips sectors={project.sectors} category={project.category} />

        {project.client ? (
          <p className="text-primary-dark meta-label truncate min-w-0">
            {project.client}
          </p>
        ) : (
          <span />
        )}

        {project.years && (
          <p className="text-forest/60 text-xs font-semibold tabular-nums shrink-0">
            {project.years}
          </p>
        )}
      </div>
    </Link>
  );
}