import Image from "next/image";
import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

import { projectsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";

type Project = {
  _id: string;
  slug?: {
    current?: string;
  };
  title: string;
  category?: string;
  summary?: string;
  description?: string;
  client?: string;
  image?: string;
  coverImage?: {
    asset?: {
      _ref?: string;
    };
  };
};

export default async function ProjectsPage() {
  const rawProjects = await fetchSanity(projectsQuery);

  const projects = (rawProjects as Project[]) || [];

  function getImageUrl(project: Project) {
    if (project.coverImage?.asset?._ref) {
      const ref = project.coverImage.asset._ref;

      return `https://cdn.sanity.io/images/10g74skr/production/${ref
        .replace("image-", "")
        .replace(/-(jpg|jpeg|png|webp|gif)$/, ".$1")}`;
    }

    return project.image || "/placeholder.jpg";
  }

  const themeCount = new Set(
    projects.map((project) => project.category).filter(Boolean)
  ).size;

  return (
    <main className="min-h-screen bg-snow">
      <PageHeader
        tone="teal"
        eyebrow="Our work"
        title="Research that reaches the decision."
        lead="A selection of studies, evaluations, and data engagements delivered for government bodies, UN agencies, universities, and international partners."
        image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000"
        imageAlt="Field researchers collecting data"
        meta={[
          {
            label: "Studies listed",
            value: projects.length.toString(),
          },
          {
            label: "Themes",
            value: themeCount.toString(),
          },
          {
            label: "AMR records",
            value: "600000",
          },
          {
            label: "Hospitals & labs",
            value: "28",
          },
        ]}
      />

      <section className="py-20 md:py-28">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10">
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
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, i) => {
                const slug =
                  project.slug?.current || project._id;

                return (
                  <Reveal
                    as="li"
                    key={project._id}
                    delay={(i % 3) * 110}
                  >
                    <Link
                      href={`/projects/${slug}`}
                      className="group h-full flex flex-col outline-none"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                        <Image
                          src={getImageUrl(project)}
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

                      <h2 className="h3-card text-forest mb-3 group-hover:text-accent-dark transition-colors">
                        {project.title}
                      </h2>

                      <p className="text-md text-forest/75 leading-relaxed mb-5 flex-1">
                        {project.summary || project.description}
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
    </main>
  );
}