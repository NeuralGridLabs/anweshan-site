"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import ClientLogoTile from "@/components/ClientLogoTile";
import Reveal from "@/components/Reveal";
import { categoryShort } from "@/lib/categories";
import { textOf, unwrapMutationValue } from "@/lib/sanity-value";
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
  const first = unwrapMutationValue(hub.firstYear);
  const last = unwrapMutationValue(hub.lastYear);

  if (typeof first !== "number") return "";
  if (typeof last !== "number" || last === first) return String(first);
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
            className="block text-forest/85 meta-label mb-2"
          >
            Search clients
          </label>

          <input
            id="client-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-forest body placeholder:text-forest/65 transition-shadow focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          />
        </div>

        <div className="md:w-64">
          <label
            htmlFor="client-sort"
            className="block text-forest/85 meta-label mb-2"
          >
            Sort by
          </label>

          <select
            id="client-sort"
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

      <p aria-live="polite" className="text-forest/85 body-sm mb-6">
        {visible.length === 1
          ? "1 client"
          : `${visible.length} clients`}
      </p>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((hub, i) => {
            const count = hub.projectCount ?? 0;
            const range = yearRange(hub);
            /* CMS content is editable by hand, so a category can arrive as
               something other than the expected string. Coerce to strings and
               drop anything unusable rather than handing an object to React,
               which would take the whole page down. */
            const categories = (hub.categories ?? []).filter(
              (value): value is string => typeof value === "string" && value !== "",
            );

            /* Same guard for the hub's own name and relationship type. */
            const name = textOf(hub.name, "Client");
            const relationshipType = textOf(hub.relationshipType);

            return (
              /* The stagger is capped so a long list does not leave the last
                 cards waiting seconds for their animation. */
              <Reveal key={hub._id} delay={i < 12 ? i * 70 : 0}>
                <Link
                  href={`/clients/${hub.slug?.current}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-forest/15 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sage"
                >
                  {/* Accent rule wipes in from the left on hover. Shared with the
                      assignment cards so both card systems read as one family. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                  />

                  {/* The logo runs edge to edge across the top of the card, so a
                      white mark reads as full-size against the white card rather
                      than as a small floating icon. */}
                  <div className="relative border-b border-forest/10 bg-gradient-to-b from-sage/60 to-white">
                    <ClientLogoTile
                      logo={hub.logo}
                      name={name}
                      shortName={hub.shortName}
                      className="h-52 w-full md:h-60"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    {/* Relationship sits on the name row rather than claiming a
                        row of its own. */}
                    <h3 className="text-forest h3-card line-clamp-2 transition-colors duration-300 group-hover:text-primary-dark">
                      {name}
                    </h3>

                    {relationshipType && (
                      <span className="mt-3 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary-dark">
                        {relationshipType}
                      </span>
                    )}

                    {/* One compact row: count + label, years, then the arrow at the
                        card corner. */}
                    <div className="mt-4 flex items-center gap-3 border-t border-forest/15 pt-4">
                      <span className="text-3xl font-bold text-primary-dark tabular-nums leading-none">
                        {count}
                      </span>

                      <span className="text-forest/85 text-sm font-medium leading-tight">
                        {count === 1 ? "assignment" : "assignments"}
                      </span>

                      <span className="ml-auto text-forest tabular-nums text-sm font-semibold whitespace-nowrap">
                        {range || "—"}
                      </span>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-forest/20 text-forest transition-all duration-300 group-hover:bg-accent group-hover:border-accent">
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>

                    {/* At most one chip line, and never a "+N" that would force a
                        second row. */}
                    {categories.length > 0 && (
                      <ul className="mt-4 flex flex-nowrap gap-2 overflow-hidden">
                        {categories.slice(0, 2).map((value) => (
                          <li
                            key={value}
                            className="min-w-0 truncate rounded-full bg-sage px-3 py-1 text-xs font-medium text-forest/90"
                          >
                            {categoryShort(value)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-forest/15 bg-white px-6 py-16 text-center shadow-sm">
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