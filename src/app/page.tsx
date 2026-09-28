import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Publications from "@/components/Publications";
import Explore from "@/components/Explore";

import {
  homeQuery,
  featuredProjectsQuery,
  featuredPublicationsQuery,
} from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityImageUrl } from "@/lib/image";
import { resolveFeaturedProjects } from "@/lib/project-data";
import type { Home as HomeData, Project, Publication } from "@/lib/types";

export default async function Home() {
  const homeData = await fetchSanity<HomeData>(homeQuery);

  /* Featured work is resolved on the server: the read token is not available
     in the browser, so a client-side fetch cannot reach a private dataset. */
  const featuredProjects = resolveFeaturedProjects(
    await fetchSanity<Project[]>(featuredProjectsQuery),
  );

  /* Publication preview is resolved the same way. The query already limits this
     to publications an editor has flagged for the homepage; the component
     renders nothing when the list is empty. */
  const featuredPublications =
    (await fetchSanity<Publication[]>(featuredPublicationsQuery)) ?? [];

  /* Slide images are resolved to CDN URLs here rather than in the client
     component, so `@sanity/client` stays out of the browser bundle. Slides
     without a resolvable image are dropped, letting Hero fall back to its
     bundled defaults. */
  const slides = (homeData?.slides ?? [])
    .map((slide) => ({
      image: sanityImageUrl(slide.image) ?? "",
      label: slide.label ?? "",
    }))
    .filter((slide) => slide.image !== "");

  const heroData = {
    heroEyebrow: homeData?.heroEyebrow,
    heroHeading: homeData?.heroHeading,
    heroSubtext: homeData?.heroSubtext,
    primaryCtaLabel: homeData?.primaryCtaLabel,
    secondaryCtaLabel: homeData?.secondaryCtaLabel,
    slides: slides.length > 0 ? slides : undefined,
  };

  return (
    <main>
      <section id="home">
        <Hero data={heroData} />
      </section>

      <section id="about">
        <About data={{ aboutBlurb: homeData?.aboutBlurb }} />
      </section>

      <section id="projects">
        <Projects projects={featuredProjects} />
      </section>

      <Publications publications={featuredPublications} />

      <section id="explore">
        <Explore />
      </section>
    </main>
  );
}
