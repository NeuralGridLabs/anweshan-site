"use client";

import { useMemo } from "react";

import type { Publication } from "@/lib/types";

type Props = {
  publications: Publication[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
};

export default function PublicationTimeline({
  publications,
  selectedYear,
  onSelectYear,
}: Props) {
  const { data, max, total, undated } = useMemo(() => {
    const counts = new Map<number, number>();
    let undatedCount = 0;

    for (const pub of publications) {
      if (typeof pub.year === "number") {
        counts.set(pub.year, (counts.get(pub.year) ?? 0) + 1);
      } else {
        undatedCount += 1;
      }
    }

    if (counts.size === 0) {
      return { data: [], max: 0, total: 0, undated: undatedCount };
    }

    const years = [...counts.keys()];
    const first = Math.min(...years);
    const last = Math.max(Math.max(...years), new Date().getFullYear());

    const rows: { year: number; count: number }[] = [];
    for (let y = first; y <= last; y++) {
      rows.push({ year: y, count: counts.get(y) ?? 0 });
    }

    return {
      data: rows,
      max: Math.max(...rows.map((r) => r.count)),
      total: rows.reduce((sum, r) => sum + r.count, 0),
      undated: undatedCount,
    };
  }, [publications]);

  if (data.length === 0) return null;

  const first = data[0].year;
  const last = data[data.length - 1].year;

  return (
    <section className="border-b border-forest/10 bg-snow py-10">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-1 text-forest/60">Output over time</p>
            <h2 className="text-2xl font-bold tracking-tight text-forest">
              {total} publications, {first} to {last}
            </h2>
          </div>
          <p className="text-sm text-forest/55">
            Click a year to filter the list below.
          </p>
        </div>

        <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
          {data.map(({ year, count }) => {
            const active = selectedYear === String(year);
            const heightPct = count === 0 ? 2 : Math.max(8, (count / max) * 100);

            return (
              <button
                key={year}
                type="button"
                disabled={count === 0}
                aria-pressed={active}
                aria-label={`${year}: ${count} publication${count === 1 ? "" : "s"}`}
                onClick={() => onSelectYear(active ? "all" : String(year))}
                className="group flex w-12 shrink-0 flex-col items-center gap-1 disabled:cursor-default"
              >
                <span className="h-4 text-xs font-semibold tabular-nums text-forest/70">
                  {count > 0 ? count : ""}
                </span>
                <span className="flex h-36 w-full items-end">
                  <span
                    className={`w-full rounded-t-md transition-all duration-200 ${
                      active
                        ? "bg-forest"
                        : count > 0
                          ? "bg-primary group-hover:bg-forest/80"
                          : "bg-forest/10"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </span>
                <span
                  className={`text-xs tabular-nums ${
                    active ? "font-bold text-forest" : "text-forest/60"
                  }`}
                >
                  {year}
                </span>
              </button>
            );
          })}
        </div>

        {undated > 0 && (
          <p className="mt-3 text-xs text-forest/50">
            {undated} publication{undated === 1 ? "" : "s"} without a year not shown.
          </p>
        )}
      </div>
    </section>
  );
}