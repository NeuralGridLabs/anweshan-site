import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { galleryEventsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";

type GalleryImage = { _key?: string; asset?: { _ref?: string }; alt?: string };

type GalleryEvent = {
  _id: string;
  title: string;
  date?: string;
  description?: string;
  images?: GalleryImage[];
  coverImage?: unknown;
  order?: number;
};

function formatDate(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getImageUrl(image: any) {
  if (!image?.asset?._ref) return "";
  const ref = image.asset._ref;
  return `https://cdn.sanity.io/images/10g74skr/production/${ref
    .replace("image-", "")
    .replace(/-(jpg|jpeg|png|webp|gif)$/, ".$1")}`;
}

export default async function GalleryPage() {
  const events = await fetchSanity(galleryEventsQuery) || [];

  return (
    <main className="min-h-screen text-base bg-snow">
      <PageHeader
        tone="primary"
        eyebrow="Field & events"
        title="Gallery"
        lead="Moments from our fieldwork, workshops, launches and the people behind the evidence."
      />

      <section className="bg-ivory py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 space-y-24">
          {events.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-forest/15 bg-cream p-12 text-center">
                <p className="eyebrow text-forest mb-4 text-base">No gallery events yet</p>
                <p className="body-lg text-forest/70 max-w-xl mx-auto">
                  Add an event with its photos from the CMS at
                  {" "}
                  <Link href="/admin" className="underline-grow font-semibold text-forest">
                    /admin
                  </Link>{" "}
                  and it will appear here, grouped by event.
                </p>
              </div>
            </Reveal>
          ) : (
            events.map((event, i) => (
              <Reveal key={event._id} delay={i * 80}>
                <article>

                  {/* Event header */}
                  <div className="mb-8">
                    <p className="text-forest/60 eyebrow text-base mb-2">
                      {formatDate(event.date)}
                    </p>
                    <h2 className="h2-section text-forest mb-3">{event.title}</h2>
                    {event.description && (
                      <p className="body-lg text-forest/70">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-forest/10 mb-8" />

                  {/* Images */}
                  {(event.images?.length ?? 0) > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {event.images!.map((img, j) => (
                        <div
                          key={img._key || j}
                          className="relative aspect-square overflow-hidden rounded-xl bg-sage"
                        >
                          {img.asset?._ref && (
                            <Image
                              src={getImageUrl(img)}
                              alt={img.alt || event.title}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="body-sm text-forest/40">No photos uploaded for this event.</p>
                  )}

                </article>
              </Reveal>
            ))
          )}
        </div>
      </section>
    </main>
  );
}