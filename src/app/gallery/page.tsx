import Link from "next/link";
import Image from "next/image";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

import { galleryEventsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityImageUrl } from "@/lib/image";
import type { GalleryEvent, GalleryEventCategory } from "@/lib/types";

/**
 * The Gallery renders as two fixed sections, in this order. A section is only
 * rendered when at least one galleryEvent carries its category, so an empty
 * section never appears. Order here is the on-page order; do not sort it.
 */
const GALLERY_SECTIONS: {
  category: GalleryEventCategory;
  heading: string;
  description: string;
}[] = [
  {
    category: "events-training",
    heading: "Events, Training & Workshops",
    description:
      "Fieldwork, trainings, workshops, and moments from the studies we run across Nepal.",
  },
  {
    category: "celebrations",
    heading: "Team Celebrations",
    description:
      "The team outside of work — anniversaries, retreats, and festivals we celebrate together.",
  },
];

const KNOWN_CATEGORIES = new Set<string>(
  GALLERY_SECTIONS.map((s) => s.category)
);

function formatDate(date?: string) {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) return date;

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * One event: the photo grid, with the date beneath it.
 *
 * There is deliberately no event title and no event description. A gallery
 * event is only a grouping device for a set of photos plus the date they were
 * taken, so the date is the only metadata shown. The card and grid styling is
 * unchanged from the original page.
 */
function EventEntry({ event }: { event: GalleryEvent }) {
  const photos = event.images ?? [];
  const date = formatDate(event.date);

  return (
    <Reveal>
      <article className="rounded-3xl border border-forest/10 bg-ivory p-5 shadow-[0_8px_30px_rgba(25,60,45,0.05)] md:p-7">
        {/* Event header: what this set of photos is, and how many. Titles are
            used when the CMS has one; the date is the fallback, so a set is
            never left with nothing to identify it by. */}
        <header className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-5 border-b border-forest/10">
          <h3 className="h3-card text-forest">
            {event.title || date || "Gallery"}
          </h3>

          <p className="flex items-center gap-3 text-forest/85">
            {event.title && date && (
              <span className="eyebrow">{date}</span>
            )}

            <span className="eyebrow">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </span>
          </p>
        </header>

        {/* Photos on a uniform 4:3 frame. Mixing the photos' own aspect ratios
            made the rows ragged, which read as broken rather than editorial;
            cropping to a common frame keeps the grid aligned. */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {photos.map((img, j) => {
              const src = sanityImageUrl(img);

              return (
                <div
                  key={img._key || j}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-sage"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={img.alt || event.title || "Gallery photo"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm text-forest/85">
                        Image unavailable
                      </span>
                    </div>
                  )}

                  {/* Caption on hover, when the photo carries alt text. */}
                  {img.alt && (
                    <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-forest/80 via-forest/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="body-sm line-clamp-2 text-ivory">
                        {img.alt}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="body-sm text-forest/85">
            No photos uploaded for this event.
          </p>
        )}
      </article>
    </Reveal>
  );
}

export default async function GalleryPage() {
  const events =
    (await fetchSanity<GalleryEvent[]>(galleryEventsQuery)) ?? [];

  const sections = GALLERY_SECTIONS.map((section) => ({
    ...section,
    events: events.filter((e) => e.category === section.category),
  })).filter((section) => section.events.length > 0);

  /* Events with no category, or a category the page does not know about, would
     otherwise vanish. They are surfaced separately so nothing is hidden. */
  const uncategorised = events.filter(
    (e) => !e.category || !KNOWN_CATEGORIES.has(e.category)
  );

  return (
    <main className="min-h-screen text-base bg-snow">
      <PageHeader
        tone="primary"
        eyebrow="Field & events"
        title="Gallery"
        lead="Moments from our fieldwork, workshops, launches and the people behind the evidence."
      />

      <section className="bg-mist py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 space-y-20 md:space-y-24">
          {events.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-forest/15 bg-cream p-12 text-center">
                <p className="eyebrow text-forest mb-4 text-base">
                  No gallery events yet
                </p>

                <p className="body-lg text-forest/85 max-w-xl mx-auto">
                  Add an event with its photos from the CMS at{" "}
                  <Link
                    href="/admin"
                    className="underline-grow font-semibold text-forest"
                  >
                    /admin
                  </Link>{" "}
                  and it will appear here, grouped by event.
                </p>
              </div>
            </Reveal>
          ) : (
            <>
              {sections.map((section) => (
                <section key={section.category}>
                  {/* Section header on a rule, with the photo count sitting
                      opposite the title so the page reads at a glance. */}
                  <div className="mb-10 pb-6 border-b border-forest/15 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="max-w-2xl">
                      <h2 className="h2-section text-forest mb-3">
                        {section.heading}
                      </h2>

                      <p className="body-lg text-forest/85">
                        {section.description}
                      </p>
                    </div>

                    <p className="eyebrow shrink-0 text-forest/70 text-base">
                      {section.events.reduce(
                        (n, e) => n + (e.images?.length ?? 0),
                        0
                      )}{" "}
                      photos
                    </p>
                  </div>

                  <div className="space-y-8 md:space-y-10">
                    {section.events.map((event) => (
                      <EventEntry key={event._id} event={event} />
                    ))}
                  </div>
                </section>
              ))}

              {uncategorised.length > 0 && (
                <section>
                  <div className="mb-12 max-w-3xl">
                    <h2 className="h2-section text-forest mb-4">
                      Not yet categorised
                    </h2>

                    <p className="body-lg text-forest/85">
                      These events have no Section set, so they are not part of
                      the two sections above. Set Section on each one in the CMS
                      to move it into place.
                    </p>
                  </div>

                  <div className="space-y-8 md:space-y-10">
                    {uncategorised.map((event) => (
                      <EventEntry key={event._id} event={event} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
