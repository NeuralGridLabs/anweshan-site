import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

import { serviceBySlugQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import type { ServiceItem } from "@/lib/types";

/* `items` is filtered down to the one matching service, so it stays an array
   here. Applying a trailing [0] inside the projection instead would collapse it
   to a bare object and silently break the lookup. */
type ServiceDetail = {
  heading?: string;
  items?: ServiceItem[];
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await fetchSanity<ServiceDetail>(serviceBySlugQuery, { slug });
  const service = data?.items?.[0] as ServiceItem | undefined;

  /* The query already requires hasDetailPage and a non-empty sections array, so
     a service without a detail page 404s here rather than rendering an empty
     page. That is what keeps the other five services from having thin pages. */
  if (!service || !service.sections?.length) {
    notFound();
  }

  const sections = service.sections;

  return (
    <main className="min-h-screen bg-snow text-base">
      <PageHeader
        tone="primary"
        eyebrow="Service"
        title={service.title || "Service detail"}
        lead={service.description}
        stacked
      />

      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <Link
              href="/services"
              className="group mb-12 inline-flex items-center gap-2 text-sm font-semibold text-forest/70 transition-colors hover:text-forest"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              All services
            </Link>
          </Reveal>

          {service.highlights && service.highlights.length > 0 && (
            <Reveal delay={60}>
              <ul className="mb-16 flex flex-wrap gap-2.5">
                {service.highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-full border border-forest/20 px-4 py-2 text-xs font-medium text-forest/80"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {/* Sections stack in CMS order. Each is independent: a heading-only
              section, a bullets-only section and a full section all render
              correctly, so a service never has to pad content to match another. */}
          <div className="flex flex-col gap-14 md:gap-16">
            {sections.map((section, i) => (
              <Reveal key={section._key || i} delay={80 + i * 60}>
                <div className="border-l-2 border-gold pl-6 md:pl-8">
                  {section.heading && (
                    <h2 className="h3-card text-forest mb-4 text-balance">
                      {section.heading}
                    </h2>
                  )}

                  {section.body && (
                    <p className="body-lg text-forest/75 mb-5 max-w-2xl">
                      {section.body}
                    </p>
                  )}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="flex flex-col gap-2.5">
                      {section.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-3 text-forest/75"
                        >
                          <span
                            aria-hidden
                            className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold"
                          />

                          <span className="body">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
