import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";

import ClientLogoTile from "@/components/ClientLogoTile";
import HubProjectCard from "@/components/HubProjectCard";
import Reveal from "@/components/Reveal";
import { projectBySlugQuery, projectsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityImageUrl } from "@/lib/image";
import { categoryLabel } from "@/lib/categories";
import type { Project, ProjectSibling } from "@/lib/types";

/* A single project.

   This used to fetch every project and pick one out of the list in JavaScript.
   It now asks for exactly this project, which matters for two reasons: the
   query applies the clearance filter, so a project not cleared for the web
   returns nothing and 404s; and the hub and sibling data come back with it
   instead of needing a second round trip.

   Every block below renders only when its data exists, so a legacy project with
   none of the new fields looks exactly as it did before. */

/* The single-project query projects the project fields directly, with the hub
   nested under `clientHub`, rather than the flat shape projectsQuery returns.
   This maps it to the same HubProject shape the card components already take,
   so no new card type was needed. */
type ProjectDetail = Project & {
  clientHub?: Project["clientHub"];
  siblings?: ProjectSibling[];
};

/* `years` is the display string editors wrote; the structured years are the
   fallback so a project with only those still shows a timeline. */
function timelineOf(project: ProjectDetail): string {
  if (project.years?.trim()) return project.years.trim();

  const start = project.startYear;
  const end = project.endYear;

  if (!start) return "";
  if (!end || end === start) return String(start);
  return `${start} to ${end}`;
}

async function fetchProject(slug: string): Promise<ProjectDetail | null> {
  const detail = await fetchSanity<ProjectDetail | null>(projectBySlugQuery, {
    slug,
  });

  return detail ?? null;
}

export async function generateStaticParams() {
  const projects = await fetchSanity<Project[]>(projectsQuery);

  /* projectsQuery already withholds anything not cleared for the web, so only
     publishable slugs are prerendered. Anything else 404s at request time. */
  return (projects ?? [])
    .filter((project) => project.slug?.current)
    .map((project) => ({ slug: project.slug?.current as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) return {};

  return {
    title: `${project.title} | ${project.clientHub?.name ?? project.client ?? "Projects"}`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchProject(slug);

  /* Covers all three cases: an unknown slug, a project whose webStatus is not
     ready (the query returns nothing), and an unpublished draft. */
  if (!project) notFound();

  const coverUrl = sanityImageUrl(project.coverImage);
  const hub = project.clientHub;
  const siblings = project.siblings ?? [];

  const timeline = timelineOf(project);

  const meta = [
    { label: "Status", value: project.status },
    { label: "Timeline", value: timeline },
    { label: "Partner", value: project.client },
    { label: "Location", value: project.location },
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item.value),
  );

  /* True only when the record genuinely has no narrative, so the notice below
     never contradicts real content. */
  const hasNarrative = Boolean(
    project.overview?.length || project.approach?.length || project.outcomes?.length,
  );

  const stats = (project.facts ?? []).filter((fact) => fact.value);
  const methods = project.methods ?? [];
  const steps = project.approach ?? [];
  const outputs = project.outcomes ?? [];

  return (
    <main className="min-h-screen bg-snow">
      {/* Header */}
      <section className="relative bg-forest text-ivory overflow-hidden">
        {/* Cover image, heavily veiled. It is texture rather than subject, which
            keeps the title readable and stops a dark photo fighting the type. */}
        {coverUrl && (
          <div className="absolute inset-0">
            <Image
              src={coverUrl}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/85 to-forest/70" />
          </div>
        )}

        <div className="relative max-w-[1400px] mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24">
          {/* Breadcrumb. With a client it names the route taken to get here;
              without one it stays the original "All projects" link. */}
          {hub ? (
            <nav
              aria-label="Breadcrumb"
              className="mb-12 flex flex-wrap items-center gap-2 text-sm font-semibold"
            >
              <Link
                href="/projects"
                className="text-white/70 hover:text-white transition-colors"
              >
                Projects
              </Link>

              <span aria-hidden className="text-white/60">
                /
              </span>

              <Link
                href="/clients"
                className="text-white/70 hover:text-white transition-colors"
              >
                Clients
              </Link>

              <span aria-hidden className="text-white/60">
                /
              </span>

              <Link
                href={`/clients/${hub.slug?.current}`}
                className="text-white/70 hover:text-white transition-colors"
              >
                {hub.name}
              </Link>

              <span aria-hidden className="text-white/60">
                /
              </span>

              <span className="text-white">{project.title}</span>
            </nav>
          ) : (
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 text-white hover:text-white text-sm font-semibold mb-12 transition-colors"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />

              All projects
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-9">
              {/* The long category label reads better here than the short chip
                  form used on cards. */}
              <p className="text-accent eyebrow mb-6">
                {project.category
                  ? categoryLabel(project.category)
                  : project.category}
              </p>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight mb-8 text-ivory text-balance">
                {project.title}
              </h1>

              <p className="text-white/85 body-lg max-w-2xl">{project.summary}</p>

              {project.externalUrl && (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-forest transition-colors hover:bg-white"
                >
                  Visit project
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </a>
              )}
            </div>
          </div>

          {meta.length > 0 && (
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
              {meta.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/15 bg-white/5 p-5"
                >
                  <dt className="text-accent meta-label mb-3">{item.label}</dt>

                  <dd className="text-ivory text-base font-semibold leading-snug">
                    {item.value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Key figures. White cards on sage, so the numbers read as data rather than
          as more body text. */}
      {stats.length > 0 && (
        <section className="bg-sage py-14 border-b border-forest/15">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((fact, i) => (
              <Reveal
                key={fact.label || i}
                className="rounded-2xl bg-white border border-forest/15 p-6 shadow-sm"
              >
                <p className="text-3xl text-primary-dark md:text-4xl font-bold tracking-tight tabular-nums leading-none">
                  {fact.value}
                </p>

                <p className="text-forest/85 meta-label mt-3">{fact.label}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Narrative */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="h2-section text-base-text mb-8">Overview</h2>
            </Reveal>

            {project.overview?.map((para, i) => (
              <Reveal key={i} delay={i * 90}>
                <p className="text-base-text/70 body-lg mb-6">{para}</p>
              </Reveal>
            ))}

            {methods.length > 0 && (
              <>
                <Reveal>
                  <h2 className="h2-section text-base-text mt-16 mb-8">
                    Expertise
                  </h2>
                </Reveal>

                <ul className="flex flex-wrap gap-2.5">
                  {methods.map((method) => (
                    <li
                      key={method}
                      className="rounded-full border border-forest/30 px-4 py-2 text-sm font-medium text-forest/90"
                    >
                      {method}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {steps.length > 0 && (
              <>
                <Reveal>
                  <h2 className="h2-section text-base-text mt-16 mb-10">
                    How we worked
                  </h2>
                </Reveal>

                <ol className="border-t border-forest/12">
                  {steps.map((step, i) => (
                    <Reveal key={i} delay={i * 90}>
                      <li className="flex gap-6 py-7 border-b border-forest/12">
                        <span className="text-forest text-xs font-semibold tabular-nums shrink-0 pt-1">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <p className="text-base-text/75 body">{step}</p>
                      </li>
                    </Reveal>
                  ))}
                </ol>
              </>
            )}

            {outputs.length > 0 && (
              <>
                <Reveal>
                  <h2 className="h2-section text-base-text mt-16 mb-8">
                    What it produced
                  </h2>
                </Reveal>

                <ul className="space-y-5">
                  {outputs.map((item, i) => (
                    <Reveal key={i} delay={i * 90}>
                      <li className="flex gap-4 text-base-text/75 body">
                        <Check
                          size={18}
                          strokeWidth={2.5}
                          className="text-primary shrink-0 mt-1"
                        />

                        {item}
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 lg:col-start-9">
            {coverUrl && (
              <Reveal>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-8">
                  <Image
                    src={coverUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 32vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            )}

            {/* Client card. Only when the project is actually linked to a hub. */}
            {hub && (
              <Reveal delay={90}>
                <div className="rounded-2xl bg-ivory border border-forest/15 p-7 mb-6 shadow-sm">
                  <p className="text-forest/85 meta-label mb-5">Client</p>

                  <ClientLogoTile
                    logo={hub.logo}
                    name={hub.name}
                    shortName={hub.shortName}
                    className="h-24 w-full rounded-xl border border-forest/10 mb-5"
                  />

                  <p className="text-forest font-bold text-lg leading-snug">
                    {hub.name}
                  </p>

                  {hub.relationshipType && (
                    <p className="mt-1 text-forest/85 body-sm">
                      {hub.relationshipType}
                    </p>
                  )}

                  <Link
                    href={`/clients/${hub.slug?.current}`}
                    className="group mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-white text-sm font-semibold transition-colors hover:bg-forest/90"
                  >
                    {hub.projectCount === 1
                      ? "All 1 assignment"
                      : `All ${hub.projectCount ?? 0} assignments`}

                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </div>
              </Reveal>
            )}

            {project.category && (
              <Reveal delay={120}>
                <div className="rounded-2xl bg-ivory border border-forest/15 p-7 shadow-sm">
                  <p className="text-forest/85 meta-label mb-4">
                    Service area
                  </p>

                  <p className="text-forest font-semibold leading-snug">
                    {categoryLabel(project.category)}
                  </p>
                </div>
              </Reveal>
            )}

            {/* Only when the record genuinely has no narrative. This used to be
                keyed on `externalUrl`, so it printed on every research project
                and made real CMS content look like placeholder text. */}
            {!hasNarrative && (
              <Reveal delay={180}>
                <p className="text-forest/70 text-xs leading-relaxed mt-6">
                  No detailed narrative has been added to this project record
                  yet.
                </p>
              </Reveal>
            )}
          </aside>
        </div>
      </section>

      {/* Other assignments for the same client. Siblings arrive already
          filtered to cleared work and ordered oldest first. */}
      {siblings.length > 0 && (
        <section className="bg-cream py-16 md:py-20">
          <div className="max-w-[1400px] mx-auto px-6">
            <p className="text-base-text/75 meta-label mb-8">
              More from {hub?.name ?? project.client}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {siblings.slice(0, 3).map((sibling, i) => (
                <Reveal key={sibling._id} delay={i * 90}>
                  <HubProjectCard
                    project={{
                      _id: sibling._id,
                      title: sibling.title,
                      slug: sibling.slug,
                      years: sibling.years,
                      startYear: sibling.startYear,
                    }}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="bg-snow py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="h2-section text-base-text max-w-2xl">
            Have a question about this work?
          </h2>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-forest text-white text-sm font-semibold px-6 py-3 hover:bg-forest/90 transition-colors shrink-0"
          >
            Get in touch
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}