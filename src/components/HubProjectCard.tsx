import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

import { textListOf, textOf, unwrapMutationValue } from "@/lib/sanity-value";
import type { HubProject } from "@/lib/types";

import ProjectChips from "@/components/ProjectChips";

/* One assignment as a compact card.

   Shared by a client's page (HubProjects) and a project's own page, where it
   appears under "More from <client>". It lives here rather than inline in both
   so the two can never drift apart.

   Not a client component: it holds no state. */

/* `years` is the pre-existing display string; startYear/endYear are the
   structured years. A project may have either, so both are honoured. */
export function timelineOf(project: HubProject): string {
  const years = textOf(project.years);
  if (years.trim()) return years.trim();

  const start = unwrapMutationValue(project.startYear);
  const end = unwrapMutationValue(project.endYear);

  if (typeof start !== "number") return "";
  if (typeof end !== "number" || end === start) return String(start);
  return `${start} to ${end}`;
}

export default function HubProjectCard({
  project,
  className = "",
}: {
  project: HubProject;
  className?: string;
}) {
  const timeline = timelineOf(project);
  const methods = textListOf(project.methods);
  const title = textOf(project.title, "Untitled assignment");
  const summary = textOf(project.summary);
  const location = textOf(project.location);
  const status = textOf(project.status);
  const category = textOf(unwrapMutationValue(project.category));

  const rawFacts = unwrapMutationValue(project.facts);
  const firstFact = Array.isArray(rawFacts) ? rawFacts[0] : undefined;
  const firstStatValue = firstFact ? textOf((firstFact as { value?: unknown }).value) : "";
  const firstStatLabel = firstFact ? textOf((firstFact as { label?: unknown }).label) : "";

  const ongoing = status === "Ongoing";

  return (
    <Link
      href={`/projects/${project.slug?.current}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-ivory border border-forest/15 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-lg hover:shadow-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-snow ${className}`}
    >
      {/* Accent rule that wipes in from the left. Carries the hover signal so
          the card reads as a link without relying on the arrow alone. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
      />

      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Sector first, then the service chip. The stat sits ahead of them so
            the headline figure is never the thing that gets clipped when a card
            is too narrow for all three. */}
        <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
          {firstStatValue && (
            <span className="shrink-0 rounded-full bg-forest px-3 py-1 text-xs font-bold text-ivory">
              {firstStatValue}
              {firstStatLabel ? ` ${firstStatLabel}` : ""}
            </span>
          )}

          <ProjectChips sectors={project.sectors} category={category} />
        </div>

        {status && (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-forest/85 text-xs font-medium whitespace-nowrap">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                ongoing ? "bg-primary" : "bg-forest/40"
              }`}
            />

            {status}
          </span>
        )}
      </div>

      <h3 className="text-forest text-lg font-bold leading-snug tracking-tight line-clamp-2 transition-colors duration-300 group-hover:text-forest/80">
        {title}
      </h3>

      {summary && (
        <p className="mt-2 text-forest/85 text-sm leading-relaxed line-clamp-2">
          {summary}
        </p>
      )}

      {/* One meta row: years and place share a line. */}
      {(timeline || location) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-forest/85 text-sm">
          {timeline && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="shrink-0" />
              {timeline}
            </span>
          )}

          {location && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          )}
        </div>
      )}

      {methods.length > 0 && (
        <ul className="mt-3 flex flex-nowrap gap-2 overflow-hidden">
          {methods.slice(0, 2).map((method) => (
            <li
              key={method}
              className="min-w-0 truncate rounded-full border border-forest/25 px-3 py-1 text-xs font-medium text-forest/90"
            >
              {method}
            </li>
          ))}
        </ul>
      )}

      {/* Footer merged onto the last line: no separate rule or row. */}
      <span className="mt-auto flex items-center justify-end gap-2 pt-4 text-forest text-sm font-semibold">
        View assignment

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-forest/20 text-forest transition-all duration-300 group-hover:bg-accent group-hover:border-accent">
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </Link>
  );
}