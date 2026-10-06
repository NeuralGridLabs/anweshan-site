import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";

import Reveal from "@/components/Reveal";
import { servicesQuery, serviceBySlugQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityImageUrl } from "@/lib/image";
import { hasServiceDetail } from "@/lib/services";
import type { ServiceItem } from "@/lib/types";

/* The /services band and this route share one gate (lib/services.ts), so a band
   can never link to a page that would 404. Every element below renders only when
   its data exists, so a service with a minimal record still gets a clean page. */

const META_DESCRIPTION_LENGTH = 160;

/* Same classes as the Hero primary button, so the two read as one family. */
const PILL =
  "inline-flex items-center gap-2 rounded-full bg-forest text-white text-sm font-semibold px-6 py-3 hover:bg-forest/90 transition-colors";

/** An internal path is a client-side navigation; an https URL opens in a new tab. */
function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function CtaButton({ label, href }: { label: string; href: string }) {
  if (isInternal(href)) {
    return (
      <Link href={href} className={PILL}>
        {label}
        <ArrowRight size={14} />
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={PILL}>
      {label}
      <ArrowUpRight size={14} />
    </a>
  );
}

async function fetchDetailServices(): Promise<ServiceItem[]> {
  const overview = await fetchSanity<{ items?: ServiceItem[] }>(servicesQuery);

  /* The single-item query is what powers one page. Reading the overview first
     keeps "Other services" and generateStaticParams on the same cached fetch the
     /services page already uses, so this route adds no extra round trip. */
  const slugs = (overview?.items ?? [])
    .filter(hasServiceDetail)
    .map((item) => item.slug?.current)
    .filter((slug): slug is string => Boolean(slug));

  if (slugs.length === 0) return [];

  const results = await Promise.all(
    slugs.map(async (slug) => {
      const detail = await fetchSanity<{ items?: ServiceItem[] }>(
        serviceBySlugQuery,
        { slug },
      );

      return (detail?.items ?? [])[0] ?? null;
    }),
  );

  return results.filter((item): item is ServiceItem => item !== null);
}

export async function generateStaticParams() {
  const overview = await fetchSanity<{ items?: ServiceItem[] }>(servicesQuery);

  return (overview?.items ?? [])
    .filter(hasServiceDetail)
    .map((item) => ({ slug: item.slug?.current as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const services = await fetchDetailServices();
  const service = services.find((item) => item.slug?.current === slug);

  if (!service) return {};

  return {
    title: `${service.title} | Services`,
    description: service.detailBody
      ? service.detailBody.slice(0, META_DESCRIPTION_LENGTH)
      : undefined,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const services = await fetchDetailServices();

  const service = services.find((item) => item.slug?.current === slug);

  /* The gate is re-applied here on purpose: a slug that is not entitled to a
     page is a 404, not a partially rendered page. */
  if (!service || !hasServiceDetail(service)) notFound();

  const others = services.filter(
    (item) => item.slug?.current !== service.slug?.current,
  );

  const imageUrl = sanityImageUrl(service.image);
  const capabilities = service.capabilities ?? [];
  const twoColumnCapabilities = capabilities.length > 6;

  const ctaLabel = service.ctaLabel?.trim() ?? "";
  const ctaLink = service.ctaLink?.trim() ?? "";
  const showCta = ctaLabel !== "" && ctaLink !== "";

  return (
    <main className="min-h-screen bg-snow">
      {/* Header */}
      <section className="relative bg-ivory text-forest">
        <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-20">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-forest/70 hover:text-forest text-sm font-semibold mb-12 transition-colors"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />

            All services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className={imageUrl ? "lg:col-span-7" : "lg:col-span-9"}>
              <p className="text-forest eyebrow mb-6">Our services</p>

              <h1 className="h1-page mb-7">{service.title}</h1>

              {service.tagline && (
                <p className="text-primary-dark body-lg italic max-w-2xl">
                  {service.tagline}
                </p>
              )}
            </div>

            {/* Only rendered when the service actually has one, so a service
                without an image does not leave a hole in the header. */}
            {imageUrl && (
              <div className="lg:col-span-5">
                <div className="relative aspect-[5/4] rounded-2xl overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={service.image?.alt || service.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body + capabilities */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            {service.detailBody && (
              <Reveal>
                <p className="text-forest body-lg max-w-2xl">
                  {service.detailBody}
                </p>
              </Reveal>
            )}

            {showCta && (
              <Reveal delay={90}>
                <div className="mt-10">
                  <CtaButton label={ctaLabel} href={ctaLink} />
                </div>
              </Reveal>
            )}
          </div>

          {capabilities.length > 0 && (
            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <div className="rounded-2xl bg-ivory border border-forest/15 p-8">
                  <h2 className="meta-label text-forest/70 mb-6">
                    What this includes
                  </h2>

                  <ul
                    className={`grid gap-4 ${
                      twoColumnCapabilities ? "xl:grid-cols-2" : ""
                    }`}
                  >
                    {capabilities.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-forest/85 body"
                      >
                        <Check
                          size={18}
                          strokeWidth={2.5}
                          className="text-primary shrink-0 mt-1"
                        />

                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      {/* Other services */}
      {others.length > 0 && (
        <section className="bg-cream py-16 md:py-20">
          <div className="max-w-[1400px] mx-auto px-6">
            <p className="text-forest/70 meta-label mb-8">Other services</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map((item, i) => (
                <Reveal key={item.slug?.current ?? i} delay={i * 90}>
                  <Link
                    href={`/services/${item.slug?.current}`}
                    className="group flex items-start justify-between gap-6 h-full rounded-2xl bg-ivory border border-forest/15 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span>
                      <span className="block text-forest h3-card mb-2">
                        {item.title}
                      </span>

                      {item.tagline && (
                        <span className="block text-forest/70 body-sm italic">
                          {item.tagline}
                        </span>
                      )}
                    </span>

                    <ArrowRight
                      size={20}
                      className="text-forest shrink-0 mt-1 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}