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
        plain
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
            <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {projects.map((project, i) => (
                <Reveal as="li" key={project.key} delay={(i % 3) * 110} className="h-full">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex h-full flex-col outline-none"
                  >
                    {/* Cover image, when the project has one in the CMS. Kept
                        here deliberately: the request was to remove the page's
                        background photo, not the project covers. */}
                    {project.cover && (
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                        <Image
                          src={project.cover}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                        />

                        <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/6 transition-colors duration-500" />

                        {project.category && (
                          <span className="absolute top-4 left-4 bg-snow/95 backdrop-blur text-forest text-[11px] font-semibold tracking-wide px-3.5 py-1.5 rounded-full">
                            {project.category}
                          </span>
                        )}
                      </div>
                    )}

                    {!project.cover && project.category && (
                      <p className="text-primary meta-label mb-4">
                        {project.category}
                      </p>
                    )}

                    <h2 className="h3-card text-forest mb-3 text-balance group-hover:text-accent-dark transition-colors">
                      {project.title}
                    </h2>

                    <p className="text-forest/75 body-lg leading-relaxed mb-5 flex-1">
                      {project.summary}
                    </p>

                    {project.client && (
                      <p className="text-primary meta-label pt-4 border-t border-forest/15">
                        {project.client}
                      </p>
                    )}
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Platforms platforms={platforms} />
    </main>
  );
}
