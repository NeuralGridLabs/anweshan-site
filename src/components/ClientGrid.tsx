"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import ClientLogoTile from "@/components/ClientLogoTile";
import Reveal from "@/components/Reveal";
import { categoryShort } from "@/lib/categories";
import type { ClientHub } from "@/lib/types";

/* The client card grid: search and sort are the only interactive parts, so the
   whole component is a client component and each card is a single link. Hubs
   arrive already filtered to ready ones that have at least one ready project. */

type SortKey = "default" | "assignments" | "az" | "recent";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Studio order" },
  { value: "assignments", label: "Most assignments" },
  { value: "az", label: "A to Z" },
  { value: "recent", label: "Most recent" },
];

/* "2016 to 2024" reads as a range; a single year must not read "2016 to 2016". */
function yearRange(hub: ClientHub): string {
  const first = hub.firstYear;
  const last = hub.lastYear;

  if (!first) return "";
  if (!last || last === first) return String(first);
  return `${first}–${last}`;
}

function sortHubs(hubs: ClientHub[], sort: SortKey): ClientHub[] {
  const list = [...hubs];

  switch (sort) {
    case "assignments":
      return list.sort((a, b) => (b.projectCount ?? 0) - (a.projectCount ?? 0));
    case "az":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "recent":
      return list.sort((a, b) => (b.lastYear ?? 0) - (a.lastYear ?? 0));
    default:
      /* Studio order first, then the busiest client, so a hub with no explicit
         order number still lands somewhere sensible. */
      return list.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) return orderA - orderB;
        return (b.projectCount ?? 0) - (a.projectCount ?? 0);
      });
  }
}

export default function ClientGrid({ hubs }: { hubs: ClientHub[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("default");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle
      ? hubs.filter((hub) => hub.name.toLowerCase().includes(needle))
      : hubs;

    return sortHubs(matched, sort);
  }, [hubs, query, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-10">
        <div className="flex-1">
          <label
            htmlFor="client-search"
            className="block text-forest/70 meta-label mb-2"
          >
            Search clients
          </label>

          <input
            id="client-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-forest body placeholder:text-forest/40 focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          />
        </div>

        <div className="md:w-64">
          <label
            htmlFor="client-sort"
            className="block text-forest/70 meta-label mb-2"
          >
            Sort by
          </label>

          <select
            id="client-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-forest body focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p aria-live="polite" className="text-forest/70 body-sm mb-8">
        {visible.length === 1
          ? "1 client"
          : `${visible.length} clients`}
      </p>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {visible.map((hub, i) => {
            const count = hub.projectCount ?? 0;
            const range = yearRange(hub);
            const categories = hub.categories ?? [];
            const extra = Math.max(0, categories.length - 2);

            return (
              /* The stagger is capped so a long list does not leave the last
                 cards waiting seconds for their animation. */
              <Reveal key={hub._id} delay={i < 12 ? i * 70 : 0}>
                <Link
                  href={`/clients/${hub.slug?.current}`}
                  className="group flex h-full flex-col rounded-2xl bg-ivory border border-forest/15 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-snow"
                >
                  <ClientLogoTile
                    logo={hub.logo}
                    name={hub.name}
                    shortName={hub.shortName}
                  />

                  {hub.relationshipType && (
                    <span className="mt-5 inline-flex self-start rounded-full bg-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-forest/70">
                      {hub.relationshipType}
                    </span>
                  )}

                  <h3 className="mt-4 text-forest h3-card line-clamp-2">
                    {hub.name}
                  </h3>

                  {/* Numbers, split by a hairline rule */}
                  <div className="mt-6 flex items-stretch divide-x divide-forest/15 border-t border-forest/15 pt-5">
                    <div className="pr-6">
                      <p className="text-4xl font-bold text-primary-dark tabular-nums leading-none">
                        {count}
                      </p>
                      <p className="mt-2 text-forest/60 meta-label">
                        {count === 1 ? "assignment" : "assignments"}
                      </p>
                    </div>

                    <div className="pl-6">
                      <p className="text-xl font-semibold text-forest tabular-nums leading-none pt-1.5">
                        {range || "—"}
                      </p>
                      <p className="mt-2 text-forest/60 meta-label">years</p>
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {categories.slice(0, 2).map((value) => (
                        <li
                          key={value}
                          className="rounded-full border border-forest/15 px-3 py-1 text-[11px] font-medium text-forest/70"
                        >
                          {categoryShort(value)}
                        </li>
                      ))}

                      {extra > 0 && (
                        <li className="rounded-full border border-forest/15 px-3 py-1 text-[11px] font-medium text-forest/70">
                          +{extra}
                        </li>
                      )}
                    </ul>
                  )}

                  <span className="mt-auto pt-6 flex justify-end text-forest/50 transition-transform group-hover:translate-x-1">
                    <ArrowRight size={20} />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-forest/15 bg-ivory px-6 py-16 text-center">
          <p className="text-forest body-lg mb-6">
            No clients match that search.
          </p>

          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-full bg-forest px-6 py-3 text-white text-sm font-semibold transition-colors hover:bg-forest/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}