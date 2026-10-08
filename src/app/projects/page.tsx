import PageHeader from "@/components/PageHeader";
import Platforms from "@/components/Platforms";
import ProjectExplorer from "@/components/ProjectExplorer";
import type { ProjectCard } from "@/components/ProjectExplorer";

import { projectsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import {
  resolvePlatforms,
  resolveResearchProjects,
} from "@/lib/project-data";
import type { Project } from "@/lib/types";

/* Projects, grouped by primary service.

   The grouping, the search box and the filters all live in ProjectExplorer, a
   client component, because filtering has to happen as the reader types. This
   page does the one thing only a server can do: resolve image URLs and hand
   over plain data. The platforms Anweshan's IT team built are still pulled out
   of the grid and given their own section below it. */

export default async function ProjectsPage() {
  const records = await fetchSanity<Project[]>(projectsQuery);

  const projects = resolveResearchProjects(records);
  const platforms = resolvePlatforms(records);

  /* Sanity data is mapped to plain, serialisable values before it crosses into
     the client component. The cover image is already a resolved URL, so no
     Sanity code ships to the browser. */
  const cards: ProjectCard[] = projects.map((project) => ({
    key: project.key,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    client: project.client,
    status: project.status ?? "",
    years: project.years ?? "",
    cover: project.cover,
    category: project.category,
  }));

  return (
    <main className="min-h-screen bg-snow">
      <PageHeader
        tone="teal"
        eyebrow="Our work"
        title="Research that reaches the decision."
        lead="A selection of studies, evaluations, and data engagements delivered for government bodies, UN agencies, universities, and international partners."
        plain
      />

      <ProjectExplorer projects={cards} />

      <Platforms platforms={platforms} />
    </main>
  );
}
