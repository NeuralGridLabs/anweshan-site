import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Publications from "@/components/Publications";
import PublicationsPreview, {
  type PreviewPublication,
} from "@/components/PublicationsPreview";
import ProofBar from "@/components/ProofBar";
import Explore from "@/components/Explore";
import HomeServiceCards, { type HomeServiceCard } from "@/components/HomeServiceCards";

import {
  homeQuery,
  featuredProjectsQuery,
  featuredPublicationsQuery,
  clientsQuery,
  servicesQuery,
} from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityImageUrl } from "@/lib/image";
import { resolveFeaturedProjects } from "@/lib/project-data";
import type {
  Home as HomeData,
  Project,
  Publication,
  Clients,
  Services,
} from "@/lib/types";

const fallbackServiceCards: (HomeServiceCard & { serviceAliases: string[] })[] = [
  {
    title: "Research, evaluation and surveys",
    description: "Rigorous mixed-method studies, baselines, evaluations, facility assessments and large-scale field research.",
    link: "/services",
    serviceAliases: ["research-evaluation-surveys", "research-evaluation-and-surveys"],
  },
  {
    title: "Health systems and policy",
    description: "Evidence, planning tools, reviews, guidelines and learning products for stronger public systems.",
    link: "/services",
    serviceAliases: ["health-systems-policy", "health-systems-and-policy"],
  },
  {
    title: "Digital health and data systems",
    description: "Workflow analysis, application development, data-quality systems, dashboards and user support.",
    link: "/services",
    serviceAliases: ["digital-health-data-systems", "digital-health-and-data-systems"],
  },
  {
    title: "Social and behaviour change",
    description: "Audience research, strategy, co-creation and communication products rooted in real barriers and motivations.",
    link: "/services",
    serviceAliases: ["social-behaviour-change", "social-and-behaviour-change"],
  },
  {
    title: "Evidence communication",
    description: "Technical reports, policy briefs, training materials, publications, films, animation and digital content.",
    link: "/services",
    serviceAliases: ["evidence-communication"],
  },
  {
    title: "Clinical research and CRO services",
    description: "Country-level support for feasibility, ethics and regulatory coordination, study operations, data, quality and publication in Nepal.",
    link: "/cro",
    serviceAliases: [],
  },
];

function normalizedServiceName(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function Home() {
  const homeData = await fetchSanity<HomeData>(homeQuery);
  const serviceItems = (await fetchSanity<Services>(servicesQuery))?.items ?? [];

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

  /* The preview directly beneath About renders the same flagged records. It
     takes only the fields its cards use, and drops any record missing a title
     or a year, because both are rendered unconditionally. An empty result hands
     the component its bundled sample, so the band is never blank. */
  const previewPublications: PreviewPublication[] = featuredPublications
    .filter((pub) => pub.title?.trim() && pub.year)
    .map((pub) => ({
      _id: pub._id,
      title: pub.title!,
      year: pub.year as number,
      type: pub.type ?? "",
      journal: pub.journal,
      authors: pub.authors,
      accessStatus: pub.accessStatus,
    }));

  /* Client logos are resolved to URLs on the server, the same way hero slides
     are, so `@sanity/client` stays out of the browser bundle. Entries without a
     resolvable image are dropped; if that empties the list the carousel falls
     back to its own bundled logos. */
  const clientLogos = ((await fetchSanity<Clients>(clientsQuery))?.items ?? [])
    .map((item) => ({ name: item.name, src: sanityImageUrl(item.logo) ?? "" }))
    .filter((logo) => logo.src !== "");

  /* Slide images are resolved to CDN URLs here rather than in the client
     component, so `@sanity/client` stays out of the browser bundle. Slides
     without a resolvable image are dropped, letting Hero fall back to its
     bundled defaults. */
  const slides = (homeData?.slides ?? [])
    .map((slide) => ({
      image: sanityImageUrl(slide.image) ?? "",
      label: slide.label ?? "",
      alt: slide.alt ?? "",
    }))
    .filter((slide) => slide.image !== "");

  const heroData = {
    heroEyebrow: homeData?.heroEyebrow,
    heroHeading: homeData?.heroHeading,
    heroSubtext: homeData?.heroSubtext,
    primaryCtaLabel: homeData?.primaryCtaLabel,
    secondaryCtaLabel: homeData?.secondaryCtaLabel,
    primaryCtaLink: homeData?.primaryCtaLink,
    secondaryCtaLink: homeData?.secondaryCtaLink,
    slides: slides.length > 0 ? slides : undefined,
  };

  const editorCards = homeData?.serviceCards?.filter((card) => card.title?.trim());
  const serviceCards: HomeServiceCard[] = editorCards?.length
    ? editorCards.map((card) => {
        const title = card.title!.trim();
        const isCroCard =
          card.link?.trim().replace(/\/$/, "") === "/cro" ||
          new RegExp("clinical research|\\bCRO\\b", "i").test(title);
        return isCroCard
          ? {
              title: fallbackServiceCards[5].title,
              description: fallbackServiceCards[5].description,
              link: fallbackServiceCards[5].link,
            }
          : {
              title,
              description: card.description,
              link: card.link?.trim() || "/services",
            };
      })
    : fallbackServiceCards.map((card) => {
        const match = serviceItems.find((service) => {
          const slug = service.slug?.current;
          return Boolean(
            slug &&
              (card.serviceAliases.includes(slug) ||
                normalizedServiceName(service.title) === normalizedServiceName(card.title) ||
                normalizedServiceName(slug) === normalizedServiceName(card.title)),
          );
        });
        const slug = match?.slug?.current;
        return {
          title: card.title,
          description: card.description,
          link: slug
            ? match?.hasDetailPage
              ? `/services?open=${slug}`
              : `/services#${slug}`
            : card.link,
        };
      });

  return (
    <main>
      <section id="home">
        <Hero data={heroData} />
      </section>
      <ProofBar items={homeData?.proofItems} />

      {/* About and the publications preview share one continuous gold field.
          The wrapper owns that background so the two read as a single block,
          split only by the thin rule the preview draws at its top edge. */}
      <div className="bg-accent">
        <section id="about">
          <About
            data={{
              aboutBlurb: homeData?.aboutBlurb,
              aboutEyebrow: homeData?.aboutEyebrow,
              aboutHeading: homeData?.aboutHeading,
              aboutHeadingHighlight: homeData?.aboutHeadingHighlight,
              aboutCtaLabel: homeData?.aboutCtaLabel,
            }}
            logos={clientLogos}
            clientsEyebrow={homeData?.clientsEyebrow}
            clientsIntro={homeData?.clientsIntro}
            clientsCtaLabel={homeData?.clientsCtaLabel}
            clientsCtaLink={homeData?.clientsCtaLink}
          />
        </section>
        <PublicationsPreview recentPublications={previewPublications} />
      </div>
      <HomeServiceCards
        eyebrow={homeData?.servicesEyebrow}
        heading={homeData?.servicesHeading}
        cards={serviceCards}
      />
      <Publications publications={featuredPublications} />

      <section id="projects">
        <Projects projects={featuredProjects} />
      </section>
      <section id="explore">
        <Explore />
      </section>
    </main>
  );
}
