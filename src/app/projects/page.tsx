import Image from "next/image";
import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import Platforms from "@/components/Platforms";
import Reveal from "@/components/Reveal";

import { projectsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import {
  resolvePlatforms,
  resolveResearchProjects,
} from "@/lib/project-data";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
  const records = await fetchSanity<Project[]>(projectsQuery);

  /* The platforms Anweshan's IT team built are pulled out of the research grid
     and given their own section further down, so the work grid stays research
     engagements only. */
  const projects = resolveResearchProjects(records);
  const platforms = resolvePlatforms(records);

  return (
    <main className="min-h-screen bg-snow">
      <PageHeader
        tone="teal"
        eyebrow="Our work"
        title="Research that reaches the decision."
        lead="A selection of studies, evaluations, and data engagements delivered for government bodies, UN agencies, universities, and international partners."
        image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000"
        imageAlt="Field researchers collecting data"
      />

      <section className="py-20 md:py-28">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="h2-section text-forest">Research engagements</h2>
          </Reveal>

          {projects.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-forest/60">
                No projects have been added yet.
              </p>

              <Link
                href="/admin"
                className="inline-block mt-6 text-primary font-semibold hover:underline"
              >
                Go to Admin
              </Link>
            </div>
          ) : (
            <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, i) => {
                const coverUrl = project.cover;

                return (
                  <Reveal as="li" key={project.key} delay={(i % 3) * 110}>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="group h-full flex flex-col outline-none"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                        {coverUrl ? (
                          <Image
                            src={coverUrl}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-mint/50 text-forest/30">
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              aria-hidden="true"
                            >
                              <rect x="3" y="4" width="18" height="16" rx="2" />
                              <circle cx="9" cy="10" r="2" />
                              <path d="m21 16-5-5L5 20" />
                            </svg>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/6 transition-colors duration-500" />

                        {project.category && (
                          <span className="absolute top-4 left-4 bg-snow/95 backdrop-blur text-forest text-[11px] font-semibold tracking-wide px-3.5 py-1.5 rounded-full">
                            {project.category}
                          </span>
                        )}
                      </div>

                      <h2 className="h3-card text-forest mb-3 group-hover:text-accent-dark transition-colors">
                        {project.title}
                      </h2>

                      <p className="text-md text-forest/75 leading-relaxed mb-5 flex-1">
                        {project.summary}
                      </p>

                      {project.client && (
                        <p className="text-primary meta-label pt-4 border-t border-forest/15">
                          {project.client}
                        </p>
                      )}
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <Platforms platforms={platforms} />
    </main>
  );
}
