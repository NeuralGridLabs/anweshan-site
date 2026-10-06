import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

import { categoryShort } from "@/lib/categories";
import type { HubProject } from "@/lib/types";

/* One assignment as a compact card.

   Shared by a client's page (HubProjects) and a project's own page, where it
   appears under "More from <client>". It lives here rather than inline in both
   so the two can never drift apart.

   Not a client component: it holds no state. */

/* `years` is the pre-existing display string; startYear/endYear are the
   structured years. A project may have either, so both are honoured. */
export function timelineOf(project: HubProject): string {
  if (project.years?.trim()) return project.years.trim();

  const start = project.startYear;
  const end = project.endYear;

  if (!start) return "";
  if (!end || end === start) return String(start);
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
  const methods = project.methods ?? [];
  const extraMethods = Math.max(0, methods.length - 3);
  const firstStat = project.facts?.[0];
  const ongoing = project.status === "Ongoing";

  return (
    <Link
      href={`/projects/${project.slug?.current}`}
      className={`group flex h-full flex-col rounded-2xl bg-ivory border border-forest/15 p-6 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-snow ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        {project.category ? (
          <span className="rounded-full bg-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-forest/70">
            {categoryShort(project.category)}
          </span>
        ) : (
          <span />
        )}

        {project.status && (
          <span className="inline-flex items-center gap-2 text-forest/60 text-xs font-medium whitespace-nowrap">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                ongoing ? "bg-primary" : "bg-forest/40"
              }`}
            />

            {project.status}
          </span>
        )}
      </div>

      <h3 className="text-forest h3-card line-clamp-3">{project.title}</h3>

      {project.summary && (
        <p className="mt-3 text-forest/75 body-sm line-clamp-3">
          {project.summary}
        </p>
      )}

      {(timeline || project.location) && (
        <div className="mt-5 space-y-2">
          {timeline && (
            <p className="flex items-center gap-2 text-forest/70 body-sm">
              <Calendar size={14} className="shrink-0" />
              {timeline}
            </p>
          )}

          {project.location && (
            <p className="flex items-center gap-2 text-forest/70 body-sm">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{project.location}</span>
            </p>
          )}
        </div>
      )}

      {firstStat?.value && (
        <p className="mt-5 border-l-2 border-gold pl-3 text-forest font-semibold">
          {firstStat.value}
          {firstStat.label ? ` ${firstStat.label}` : ""}
        </p>
      )}

      {methods.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {methods.slice(0, 3).map((method) => (
            <li
              key={method}
              className="rounded-full border border-forest/15 px-3 py-1 text-[11px] font-medium text-forest/70"
            >
              {method}
            </li>
          ))}

          {extraMethods > 0 && (
            <li className="rounded-full border border-forest/15 px-3 py-1 text-[11px] font-medium text-forest/70">
              +{extraMethods}
            </li>
          )}
        </ul>
      )}

      <span className="mt-auto pt-6 inline-flex items-center gap-2 text-forest text-sm font-semibold">
        View assignment

        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}