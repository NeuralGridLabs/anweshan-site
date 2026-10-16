import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import {
  ServiceDialogProvider,
  ServiceDetailTrigger,
  type ServiceDetail,
} from "@/components/ServiceDialog";

import { servicesQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityImageUrl } from "@/lib/image";
import { hasServiceDetail } from "@/lib/services";
import { serviceAreaForSlug } from "@/lib/categories";
import type { Services as ServicesData } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

/* Service banding is presentation, not content, so it stays here. Everything an
   editor writes — title, description, highlights — comes from the CMS. Order and
   count are CMS-driven too. Bands are text-only and read left to right down the
   page; there is no image panel and nothing alternates sides. The one image
   still resolved below is the pop-up's own header picture, which the CMS
   `servicesQuery` fetches independently of the band. */

/* Alternating band colours, indexed by position so the rhythm holds regardless
   of how many services the CMS has. */
const BANDS = [
  { bg: "bg-forest", text: "text-white", label: "text-ivory", chip: "border-white/40 text-white", body: "", trigger: "text-white" },
  { bg: "bg-cream", text: "text-forest", label: "text-forest", chip: "border-forest/40 text-forest/90", body: "text-black", trigger: "text-forest" },
];

const SERVICES_TITLE = "Services | Anweshan";
/* The page's own intro, used as the meta description when the editor has not
   written one. Falls back to the CMS intro first so the two never disagree. */
const SERVICES_DESCRIPTION =
  "Research design, fieldwork and data collection, monitoring and evaluation, policy and programme support, and evidence communication, delivered by a Nepal-based team.";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchSanity<ServicesData>(servicesQuery);

  return pageMetadata({
    cmsTitle: data?.seoTitle,
    /* The intro is the editor's own description of the page, so it is the
       better source when present. pageMetadata truncates it either way. */
    cmsDescription: data?.seoDescription ?? data?.intro,
    fallbackTitle: SERVICES_TITLE,
    fallbackDescription: SERVICES_DESCRIPTION,
    path: "/services",
  });
}

export default async function ServicesPage() {
  const sanityData = await fetchSanity<ServicesData>(servicesQuery);
  const services = sanityData?.items ?? [];

  /* The pop-up needs only plain data, so Sanity images are resolved to URL
     strings here on the server and nothing in the client subtree touches the
     CMS. `number` is the band's own position, so the oversized numeral in the
     pop-up matches the number already printed on the band. */
  const detailServices: ServiceDetail[] = services
    .map((service, i) => ({ service, i }))
    .filter(({ service }) => hasServiceDetail(service))
    .map(({ service, i }) => {
      /* The pop-up's "See projects" jump. The slug is translated to its
         category through the one map in lib/categories.ts, so the six services
         whose slug matches their category need no special case, and
         clinical research (slug "cro") resolves correctly without the pop-up
         knowing the mapping exists. */
      const area = serviceAreaForSlug(service.slug?.current);

      return {
        slug: service.slug!.current!,
        number: String(i + 1).padStart(2, "0"),
        title: service.title,
        tagline: service.tagline,
        detailBody: service.detailBody,
        capabilities: service.capabilities,
        ctaLabel: service.ctaLabel,
        ctaLink: service.ctaLink,
        imageUrl: sanityImageUrl(service.image) ?? undefined,
        projectsHref: area ? `/projects#${area}` : undefined,
      };
    });

  return (
    <ServiceDialogProvider services={detailServices}>
    <main className="min-h-screen bg-snow">
      <PageHeader
        tone="primary"
        eyebrow="Our services"
        title={sanityData?.heading ?? "What we offer"}
        lead={sanityData?.intro}
        plain
      />

      {services.length === 0 ? (
        <section className="bg-snow py-20 md:py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="eyebrow text-forest mb-4 text-base">
              No services yet
            </p>

            <p className="body-lg text-forest/85">
              Services are added from the CMS. Open{" "}
              <Link href="/admin" className="font-semibold text-forest underline underline-offset-4">
                /admin
              </Link>{" "}
              and add one to the Services document to see it here.
            </p>
          </div>
        </section>
      ) : (
        services.map((service, i) => {
          const band = BANDS[i % BANDS.length];

          /* The shared gate in lib/services.ts decides whether this service
             gets a pop-up at all: the flag is on, there is a slug, and there is
             body content to show. The pop-up lists exactly the services that
             pass it, so a band and its pop-up can never disagree. */
          const slug = hasServiceDetail(service)
            ? service.slug?.current
            : undefined;

          /* The heading is always plain text now that the detail pages are
             gone: nothing sits inside an <h2> but the title. */
          const title = (
            <h2 className="h2-section mb-7 text-balance">{service.title}</h2>
          );

          return (
            /* The band's own anchor. Home's service cards link to /services#<slug> for any
               service without a pop-up, so the band has to carry the id that
               jump lands on. scroll-mt clears the sticky navbar. */
            <section
              key={service._key || service.slug?.current || i}
              id={slug ?? undefined}
              className={`${band.bg} ${band.text} scroll-mt-24`}
            >
              <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-28">
                {/* Text only, so there is nothing left to alternate. This used
                    to be a 12-column grid with the photo in one half and the
                    copy in the other, reversed with direction:rtl on every
                    second band — which meant half the bands were read from the
                    right and the numbering jumped about the page. One
                    left-aligned column at a single measure replaces it. */}
                <div className="max-w-4xl">
                  <Reveal>
                    <div className="flex items-center gap-4 mb-6">
                      <span
                        className={`text-4xl md:text-5xl font-bold leading-none tabular-nums ${band.label}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </Reveal>

                  <Reveal delay={90}>{title}</Reveal>

                    {/* A service with detail opens its pop-up instead of
                    navigating. Bands without detail are unchanged: they
                    simply carry no button at all. */}
                  {slug && (
                    <Reveal delay={120}>
                      <ServiceDetailTrigger
                        slug={slug}
                        label="Learn more"
                        className={`group mb-7 inline-flex items-center gap-2 text-sm font-semibold ${band.trigger} transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current`}
                      />
                    </Reveal>
                  )}

                  {service.description && (
                    <Reveal delay={150}>
                      <p className={`body-lg mb-9 ${band.body}`}>
                        {service.description}
                      </p>
                    </Reveal>
                  )}

                  {service.highlights && service.highlights.length > 0 && (
                    <Reveal delay={210}>
                      <ul className="flex flex-wrap gap-2.5 text-base">
                        {service.highlights.map((h) => (
                          <li
                            key={h}
                            className={`border ${band.chip} text-sm font-medium px-4 py-2 rounded-full`}
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  )}
                </div>
              </div>
            </section>
          );
        })
      )}
    </main>
    </ServiceDialogProvider>
  );
}
