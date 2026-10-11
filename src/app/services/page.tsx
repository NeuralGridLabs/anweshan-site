import Image from "next/image";
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

/* Service imagery and the alternating light/dark banding are presentation, not
   content, so they stay here. Everything an editor writes — title, description,
   image, highlights — comes from the CMS. Order and count are CMS-driven too.
   There is no hardcoded image list any more: each service uses the picture
   attached to it in the Studio, and a service with none simply renders without
   an image panel. */

/* Alternating band colours, indexed by position so the rhythm holds regardless
   of how many services the CMS has. */
const BANDS = [
  { bg: "bg-forest", text: "text-white", label: "text-ivory", chip: "border-white/40 text-white", body: "", trigger: "text-white" },
  { bg: "bg-cream", text: "text-forest", label: "text-forest", chip: "border-forest/40 text-forest/90", body: "text-black", trigger: "text-forest" },
];

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
          const flipped = i % 2 === 1;

          /* The shared gate in lib/services.ts decides whether this service
             gets a pop-up at all: the flag is on, there is a slug, and there is
             body content to show. The pop-up lists exactly the services that
             pass it, so a band and its pop-up can never disagree. */
          const slug = hasServiceDetail(service)
            ? service.slug?.current
            : undefined;

          /* The image attached to this service in the Studio. Absent is fine:
             the card simply has no image panel. */
          const imageUrl = sanityImageUrl(service.image);

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
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                    flipped ? "lg:[direction:rtl]" : ""
                  }`}
                >
                  <Reveal className={`lg:col-span-5 ${flipped ? "lg:[direction:ltr]" : ""}`}>
                    {imageUrl && (
                      <div className="relative aspect-[5/4] rounded-2xl overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={service.image?.alt || service.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </Reveal>

                  <div className={`lg:col-span-6 ${flipped ? "lg:col-start-7 lg:[direction:ltr]" : "lg:col-start-7"}`}>
                    <Reveal>
                      <div className="flex items-center gap-4 mb-7">
                        <span className={`text-sm font-semibold ${band.label}`}>
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
              </div>
            </section>
          );
        })
      )}
    </main>
    </ServiceDialogProvider>
  );
}
