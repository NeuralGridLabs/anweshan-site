import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import Reveal from "@/components/Reveal";
import { projectBySlugQuery, projectsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";

type ProjectRef = {
  _id: string;
  slug?: {
    current?: string;
  };
  title: string;
};

type ProjectImage = {
  asset?: {
    _ref?: string;
  };
};

type ProjectFact = {
  label: string;
  value: string;
};

type Project = {
  _id: string;
  slug?: {
    current?: string;
  };
  title: string;
  category?: string;
  summary?: string;
  status?: string;
  years?: string;
  client?: string;
  location?: string;
  coverImage?: ProjectImage;
  facts?: ProjectFact[];
  overview?: string[];
  approach?: string[];
  outcomes?: string[];
  methods?: string[];
  team?: string;
};

export async function generateStaticParams() {
  const rawProjects = await fetchSanity(projectsQuery);

  const projects = (rawProjects as ProjectRef[]) || [];

  return projects.map((project) => ({
    slug: project.slug?.current || project._id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rawProject = await fetchSanity(projectBySlugQuery, { slug });

  const project = rawProject as Project | null;

  if (!project) return {};

  return {
    title: `${project.title} | Anweshan`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rawProject = await fetchSanity(projectBySlugQuery, { slug });

  const project = rawProject as Project | null;

  if (!project) notFound();

  const rawAllProjects = await fetchSanity(projectsQuery);

  const allProjects = (rawAllProjects as ProjectRef[]) || [];

  const index = allProjects.findIndex(
    (p) => (p.slug?.current || p._id) === slug
  );

  const nextProject =
    allProjects.length > 0
      ? allProjects[(index + 1) % allProjects.length]
      : null;

  const meta = [
    { label: "Status", value: project.status },
    { label: "Timeline", value: project.years },
    { label: "Partner", value: project.client },
    { label: "Location", value: project.location },
  ];

  function getImageUrl(image?: ProjectImage) {
    if (!image?.asset?._ref) {
      return "/placeholder.jpg";
    }

    const ref = image.asset._ref;

    return `https://cdn.sanity.io/images/10g74skr/production/${ref
      .replace("image-", "")
      .replace(/-(jpg|jpeg|png|webp|gif)$/, ".$1")}`;
  }

  return (
    <main className="min-h-screen bg-snow">
      {/* Header */}
      <section className="relative bg-mint text-forest">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(project.coverImage)}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-primary via-mint/90 to-mint/70" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24">
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-9">
              <p className="text-forest eyebrow mb-6">
                {project.category}
              </p>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight mb-8">
                {project.title}
              </h1>

              <p className="text-dark body-lg max-w-2xl">
                {project.summary}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 mt-16 pt-10 border-t border-white/15">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="text-dark meta-label mb-2">
                  {item.label}
                </dt>

                <dd className="text-dark text-base font-semibold leading-snug">
                  {item.value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Key figures */}
      <section className="relative bg-sage text-forest py-12 border-y border-forest/15 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-white/15">
          {project.facts?.map((fact) => (
            <Reveal
              key={fact.label}
              className="lg:px-8 lg:first:pl-0"
            >
              <p className="text-3xl text-primary-dark md:text-4xl font-bold tracking-tight tabular-nums">
                {fact.value}
              </p>

              <p className="text-white/55 meta-label mt-2">
                {fact.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Narrative */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="h2-section text-base-text mb-8">
                Overview
              </h2>
            </Reveal>

            {project.overview?.map((para, i) => (
              <Reveal key={i} delay={i * 90}>
                <p className="text-base-text/70 body-lg mb-6">
                  {para}
                </p>
              </Reveal>
            ))}

            <Reveal>
              <h2 className="h2-section text-base-text mt-16 mb-10">
                How we worked
              </h2>
            </Reveal>

            <ol className="border-t border-forest/12">
              {project.approach?.map((step, i) => (
                <Reveal key={i} delay={i * 90}>
                  <li className="flex gap-6 py-7 border-b border-forest/12">
                    <span className="text-forest text-xs font-semibold tabular-nums shrink-0 pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <p className="text-base-text/75 body">
                      {step}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>

            <Reveal>
              <h2 className="h2-section text-base-text mt-16 mb-8">
                What it produced
              </h2>
            </Reveal>

            <ul className="space-y-5">
              {project.outcomes?.map((item, i) => (
                <Reveal key={i} delay={i * 90}>
                  <li className="flex gap-4 text-base-text/75 body">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow mt-2.5 shrink-0" />
                    {item}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <Reveal>
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-8">
                <Image
                  src={getImageUrl(project.coverImage)}
                  alt={project.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 32vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="bg-accent rounded-2xl p-8">
                <p className="text-base-text/95 meta-label mb-5">
                  Methods
                </p>

                <ul className="space-y-3 mb-8">
                  {project.methods?.map((method) => (
                    <li
                      key={method}
                      className="flex gap-3 text-base-text/75 body-sm"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                      {method}
                    </li>
                  ))}
                </ul>

                <p className="text-base-text/45 meta-label mb-3">
                  Team
                </p>

                <p className="text-base-text/75 body-sm">
                  {project.team}
                </p>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <p className="text-base-text/40 text-xs leading-relaxed mt-6">
                Detailed figures and narrative on this page are
                placeholders pending the final project record.
              </p>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* Next project */}
      {nextProject && (
        <section className="bg-cream py-16 md:py-20">
          <div className="max-w-[1400px] mx-auto px-6">
            <p className="text-base-text/75 meta-label mb-6">
              Next project
            </p>

            <Link
              href={`/projects/${
                nextProject.slug?.current || nextProject._id
              }`}
              className="group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <h2 className="h2-section text-base-text group-hover:text-primary transition-colors max-w-3xl">
                {nextProject.title}
              </h2>

              <span className="shrink-0 p-4 rounded-full bg-accent text-dark group-hover:bg-primary transition-colors">
                <ArrowRight size={22} />
              </span>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}