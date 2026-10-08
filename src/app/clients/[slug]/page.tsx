import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import ClientLogoTile from "@/components/ClientLogoTile";
import HubProjects from "@/components/HubProjects";
import Reveal from "@/components/Reveal";
import { clientHubsQuery, clientHubBySlugQuery, clientsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { categoryLabel, categoryShort } from "@/lib/categories";
import { textOf, unwrapMutationValue } from "@/lib/sanity-value";
import type { ClientHub, ClientHubDetail, Clients } from "@/lib/types";

/* One client's page: who they are, the numbers, and every cleared assignment
   they appear on. The hub query already withholds anything not cleared for the
   web, so this page cannot show a hidden project. */

const PILL =
  "inline-flex items-center gap-2 rounded-full bg-forest text-white text-sm font-semibold px-6 py-3 hover:bg-forest/90 transition-colors";

const TIMELINE_NOTE =
  "The timeline below presents each completed assignment in the year it was delivered, with Anweshan's role and the resulting output stated separately. It excludes proposal-only work and confidential details that have not been cleared for public use.";

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/** "research, evaluation and surveys, digital health and behavioural change" */
function themeSentence(categories: string[]): string {
  const themes = categories.slice(0, 3).map((value) => categoryLabel(value).toLowerCase());

  if (themes.length === 0) return "";
  if (themes.length === 1) return themes[0];

  return `${themes.slice(0, -1).join(", ")} and ${themes[themes.length - 1]}`;
}

/** Intro sentence used when the editor has not written one. */
function fallbackIntro(name: string, categories: string[]): string {
  const themes = themeSentence(categories);

  if (!themes) {
    return `${name} and Anweshan have worked together on research and consulting assignments.`;
  }

  return `${name} and Anweshan have worked together on assignments spanning ${themes}.`;
}

function yearsRange(first?: number, last?: number): string {
  if (!first) return "—";
  if (!last || last === first) return String(first);
  return `${first}–${last}`;
}

async function fetchHub(slug: string): Promise<ClientHubDetail | null> {
  const detail = await fetchSanity<ClientHubDetail | null>(clientHubBySlugQuery, {
    slug,
  });

  return detail ?? null;
}

export async function generateStaticParams() {
  const hubs = await fetchSanity<ClientHub[]>(clientHubsQuery);

  return (hubs ?? [])
    .filter((hub) => (hub.projectCount ?? 0) > 0 && hub.slug?.current)
    .map((hub) => ({ slug: hub.slug?.current as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hub = await fetchHub(slug);

  if (!hub) return {};

  return {
    title: `${textOf(hub.name, "Client")} | Clients`,
    description:
      textOf(hub.intro).trim() ||
      fallbackIntro(
        textOf(hub.name, "Client"),
        (hub.categories ?? []).filter((v): v is string => typeof v === "string"),
      ),
  };
}

export default async function ClientHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [hub, singleton] = await Promise.all([
    fetchHub(slug),
    fetchSanity<Clients>(clientsQuery),
  ]);

  /* Unknown, not cleared, or nothing to show: all three are a 404 rather than a
     thin page. */
  if (!hub) notFound();

  const projects = hub.projects ?? [];

  if (projects.length === 0) notFound();

  /* Everything below is read defensively: a hand-edited field can hold an object
     where a string is expected, and rendering that would 500 the page. */
  const hubName = textOf(hub.name, "Client");
  const categories = (hub.categories ?? []).filter(
    (value): value is string => typeof value === "string" && value !== "",
  );

  const categoryCounts = new Map<string, number>();
  for (const project of projects) {
    const category = textOf(unwrapMutationValue(project.category));
    if (!category) continue;
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  const intro = textOf(hub.intro).trim() || fallbackIntro(hubName, categories);

  const firstYear = unwrapMutationValue(hub.firstYear);
  const lastYear = unwrapMutationValue(hub.lastYear);

  /* Only tiles with a real value are built. Years and the latest assignment come
     from fields an editor may never have filled, and a tile showing an em dash
     reads as broken rather than empty. */
  const stats = [
    { label: "Assignments", value: String(projects.length) },
    { label: "Years active", value: yearsRange(firstYear, lastYear) },
    { label: "Service areas", value: String(categoryCounts.size) },
    {
      label: "Latest assignment",
      value: typeof lastYear === "number" ? String(lastYear) : "",
    },
  ].filter((stat) => stat.value !== "");

  const website = textOf(hub.website).trim();
  const showWebsite = website.startsWith("https://");

  const relationshipType = textOf(hub.relationshipType);

  const ctaLabel = textOf(singleton?.ctaLabel).trim();
  const ctaLink = textOf(singleton?.ctaLink).trim();

  return (
    <main className="min-h-screen bg-snow">
      {/* Header */}
      <section className="relative bg-ivory text-forest">
        <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-12 md:pt-14 md:pb-14">
          <Link
            href="/clients"
            className="group inline-flex items-center gap-2 text-forest/85 hover:text-forest text-sm font-semibold mb-8 transition-colors"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />

            All clients
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <ClientLogoTile
                  logo={hub.logo}
                  name={hubName}
                  shortName={hub.shortName}
                  /* Larger to match the card grid, and rounded so the tile does not read as a
                   raw image box on the ivory band. */
                className="h-40 w-full max-w-md rounded-2xl border border-forest/10"
                />
              </Reveal>

              <Reveal delay={70}>
                <h1 className="h1-page mt-8 mb-5">{hubName}</h1>
              </Reveal>

              {relationshipType && (
                <Reveal delay={110}>
                  <span className="inline-flex rounded-full bg-gold/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-forest/90">
                    {relationshipType}
                  </span>
                </Reveal>
              )}

              <Reveal delay={150}>
                <div className="mt-6 max-w-2xl">
                  <p className="text-forest body-lg">{intro}</p>
                  <p className="text-forest/85 body mt-4">{TIMELINE_NOTE}</p>
                </div>
              </Reveal>
            </div>

            {stats.length > 0 && (
              <div className="lg:col-span-5">
                {/* Two tiles read as a pair; one or three still sit correctly in
                    a two-column grid, leaving no ragged empty tile. */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, i) => (
                    <Reveal key={stat.label} delay={i * 70}>
                      <div className="rounded-2xl bg-white border border-forest/15 p-5 h-full">
                        <p className="text-3xl md:text-4xl font-bold text-primary-dark tabular-nums leading-none">
                          {stat.value}
                        </p>

                        <p className="mt-3 text-forest/85 meta-label">
                          {stat.label}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Service areas */}
      {categoryCounts.size > 0 && (
        <section className="bg-snow py-12">
          <div className="max-w-[1400px] mx-auto px-6">
            <p className="text-forest/85 meta-label mb-5">Service areas</p>

            <ul className="flex flex-wrap gap-2">
              {[...categoryCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([value, count]) => (
                  <li
                    key={value}
                    className="inline-flex items-center gap-2 rounded-full border border-forest/30 px-4 py-2 text-sm font-medium text-forest/90"
                  >
                    {categoryShort(value)}

                    <span className="text-primary-dark font-bold tabular-nums">
                      {count}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}

      {/* Assignments */}
      <section className="bg-snow pb-20 md:pb-28">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="h2-section text-forest mb-10">Assignments</h2>

          <HubProjects projects={projects} />
        </div>
      </section>

      {/* Website + singleton CTA */}
      {(showWebsite || (ctaLabel && ctaLink)) && (
        <section className="bg-cream py-14">
          <div className="max-w-[1400px] mx-auto px-6 flex flex-wrap items-center gap-4">
            {showWebsite && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-forest/30 px-6 py-3 text-forest text-sm font-semibold transition-colors hover:bg-forest hover:text-white"
              >
                Visit {hubName}
                <ArrowUpRight size={14} />
              </a>
            )}

            {ctaLabel && ctaLink &&
              (isInternal(ctaLink) ? (
                <Link href={ctaLink} className={PILL}>
                  {ctaLabel}
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <a
                  href={ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={PILL}
                >
                  {ctaLabel}
                  <ArrowUpRight size={14} />
                </a>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}