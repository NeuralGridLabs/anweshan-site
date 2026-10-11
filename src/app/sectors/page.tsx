import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Cutouts from "@/components/Cutouts";
import Reveal from "@/components/Reveal";

import { sectorProjectValuesQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { SECTORS } from "@/lib/sectors";

/* --------------------------------------------------------------------------
    /sectors

    The eight sectors come from src/lib/sectors.ts, NOT from Sanity documents.
    They are a fixed editorial list with fixed copy, so making them CMS
    documents would mean eight clearances to maintain for something that never
    changes. The list file is also what the schema dropdown, the /projects
    filter and the importer read, so there is one source of truth.

    Assignment counts are the only CMS input, and they are allowed to fail: if
    the query returns nothing the page simply omits the count rather than
    claiming a sector has no work.

    Layout intent: NOT a card grid. A numbered editorial index — oversized
    01-08 numerals beside full-size sector names, band background alternating so
    the page reads as a run of statements. Same numbered rhythm as the featured
    work band on the home page.

    Numerals are painted from `accent` on the dark hero; on the light bands
    forest/25 is used instead, because gold on cream is about 1.5:1.
   ----------------------------------------------------------------------- */

const HEADLINE = "Deep work across connected public-interest sectors";

const STANDFIRST =
  "Our services are transferable, but context is not. Sector pages should show the questions, systems and evidence particular to each field, then link directly to relevant work and publications.";

/* Indexed by position so the rhythm holds however many sectors the list holds. */
const BANDS = [
  { bg: "bg-snow", num: "text-forest/25", bar: "bg-forest" },
  { bg: "bg-ivory", num: "text-forest/25", bar: "bg-gold" },
] as const;

/** Two digits, so the column stays the same width from 01 to 10. */
const pad = (n: number) => String(n).padStart(2, "0");

export const metadata = {
  title: "Sectors",
  description: STANDFIRST,
};

export default async function SectorsPage() {
  /* One query for all eight counts: every sector value on every ready project,
     flattened. A null result means "unknown", which is rendered as no line at
     all rather than as a zero. */
  const values = await fetchSanity<string[]>(sectorProjectValuesQuery);

  const counts = new Map<string, number>();
  for (const value of values ?? []) {
    if (typeof value !== "string") continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const countsKnown = values !== null;

  return (
    <main className="min-h-screen bg-forest">
      <section className="relative bg-forest text-ivory overflow-hidden">
        {/* Reuses the existing "featured" shape set: large soft forms that read
            well against forest, with no new decoration introduced. */}
        <Cutouts variant="featured" />

        <div className="relative max-w-[1400px] mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-accent eyebrow mb-8">Sectors</p>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight text-ivory text-balance">
                  {HEADLINE}
                </h1>
              </Reveal>
            </div>

            <div className="lg:col-span-5 lg:pt-16">
              <Reveal delay={160}>
                <p className="text-lg leading-8 text-white/85 max-w-[46ch]">
                  {STANDFIRST}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <ol className="list-none">
        {SECTORS.map((sector, i) => {
          const band = BANDS[i % BANDS.length];
          const count = counts.get(sector.value);

          /* The whole row is the link, so the heading cannot also be a link
             without nesting two anchors. The row's accessible name therefore
             comes from the heading and the link text together. */
          const href = `/projects?sector=${sector.value}`;

          return (
            <li key={sector.value} className={`${band.bg} text-forest`}>
              <Link
                href={href}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/60 focus-visible:ring-inset"
              >
                {/* Numeral in its own column so it can be genuinely oversized
                    without stealing the measure from the name. */}
                <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-baseline">
                  <span
                    aria-hidden
                    className={`block font-bold tabular-nums leading-[0.85] tracking-tighter transition-colors duration-300 group-hover:text-forest/45 ${band.num} text-6xl md:text-8xl lg:col-span-3 lg:text-[7.5rem]`}
                  >
                    {pad(i + 1)}
                  </span>

                  <div className="mt-5 lg:mt-0 lg:col-span-7">
                    <h2 className="text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight text-balance transition-colors duration-300 group-hover:text-primary-dark">
                      {sector.label}
                    </h2>

                    <p className="mt-5 text-lg leading-8 max-w-[62ch] text-forest/85">
                      {sector.description}
                    </p>

                    {countsKnown && (
                      <p className="mt-4 text-sm font-semibold text-forest/85">
                        {count === undefined || count === 0
                          ? "No assignments yet"
                          : `${count} assignment${count === 1 ? "" : "s"}`}
                      </p>
                    )}
                  </div>

                  {/* Corner mark on its own column, so a long sector name can
                      never reflow it. */}
                  <span
                    aria-hidden
                    className="mt-6 inline-flex lg:mt-0 lg:col-span-2 lg:justify-end items-center gap-3 font-semibold text-sm text-forest"
                  >
                    <span className="hidden xl:inline">View work in this sector</span>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-forest/30 transition-all duration-300 group-hover:bg-forest group-hover:border-forest group-hover:text-white">
                      <ArrowUpRight
                        size={18}
                        strokeWidth={2.5}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </span>
                </div>

                {/* Hairline that wipes in under the row, matching the
                    featured-work rows on the home page. */}
                <div className="max-w-[1400px] mx-auto px-6">
                  <div
                    className={`h-px origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 ${band.bar}`}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Closing band. Sectors hold no references of their own, so this links to
          the collections rather than implying a filtered view. */}
      <section className="bg-cream text-forest py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6">
          <Reveal>
            <p className="text-forest eyebrow mb-8">Where the work sits</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10">
            {[
              { label: "Our work", href: "/projects" },
              { label: "Our clients", href: "/clients" },
              { label: "Our publications", href: "/publications" },
            ].map((item, i) => (
              <Reveal key={item.href} delay={i * 80}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-4 border-t border-forest/25 pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/60 focus-visible:ring-offset-4"
                >
                  <span className="text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary-dark">
                    {item.label}
                  </span>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest/30 transition-all duration-300 group-hover:bg-forest group-hover:border-forest group-hover:text-white">
                    <ArrowUpRight
                      size={17}
                      strokeWidth={2.5}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}