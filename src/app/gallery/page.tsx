import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import GalleryGrid from "@/components/GalleryGrid";
import type { LightboxPhoto } from "@/components/GalleryLightbox";

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
 * Newest first.
 *
 * Sorting happens here rather than in the GROQ `order()` because events with
 * no date have to sort to the end deterministically, and GROQ's handling of a
 * missing sort key is not something to lean on for page order. Dated events
 * come first, then the explicit `order` field as the tiebreak, then _id so
 * two events that agree on both never swap places between builds.
 */
function newestFirst(events: GalleryEvent[]): GalleryEvent[] {
  return [...events].sort((a, b) => {
    const aTime = a.date ? Date.parse(a.date) : NaN;
    const bTime = b.date ? Date.parse(b.date) : NaN;
    const aDated = !Number.isNaN(aTime);
    const bDated = !Number.isNaN(bTime);

    if (aDated && bDated && aTime !== bTime) return bTime - aTime;
    if (aDated !== bDated) return aDated ? -1 : 1;

    const aOrder = a.order ?? 0;
    const bOrder = b.order ?? 0;
    if (aOrder !== bOrder) return aOrder - bOrder;

    return a._id.localeCompare(b._id);
  });
}

/**
 * Flattens a section's events into one photo list.
 *
 * Events arrive newest first and each event's photos keep their stored order,
 * so an event's photos stay together in the grid rather than being scattered.
 * Every photo carries the event's title, formatted date and description
 * alongside its own alt and caption, which is what lets the flat grid and the
 * lightbox both name the event without either of them knowing what an event
 * is.
 *
 * `indexInEvent` and `eventPhotoCount` are stamped per event, so the lightbox
 * can count "2 / 8" against the event rather than against the section.
 *
 * Nothing is invented: a field the document does not have stays undefined and
 * simply does not render. Photos whose asset cannot be resolved are dropped
 * rather than rendered as a broken tile.
 */
function flattenEvents(events: GalleryEvent[]): LightboxPhoto[] {
  const out: LightboxPhoto[] = [];

  for (const event of events) {
    const title = event.title?.trim() || undefined;
    const date = formatDate(event.date) || undefined;
    const description = event.description?.trim() || undefined;

    const eventPhotos: LightboxPhoto[] = (event.images ?? []).flatMap(
      (img, i) => {
        const src = sanityImageUrl(img);
        if (!src) return [];

        return [
          {
            key: img._key || `${event._id}-${i}`,
            src,
            alt: img.alt ?? "",
            caption: img.caption,
            eventTitle: title,
            eventDate: date,
            eventDescription: description,
            indexInEvent: 0,
            eventPhotoCount: 0,
          },
        ];
      }
    );

    /* Counted after the unusable ones are dropped, so the denominator in the
       lightbox matches the photos that can actually be seen. */
    eventPhotos.forEach((photo, i) => {
      photo.indexInEvent = i;
      photo.eventPhotoCount = eventPhotos.length;
    });

    out.push(...eventPhotos);
  }

  return out;
}

export default async function GalleryPage() {
  const events =
    (await fetchSanity<GalleryEvent[]>(galleryEventsQuery)) ?? [];

  /* Newest first, once, before the events are split across sections, so every
     section's flattened photos read newest-event-first too. */
  const sorted = newestFirst(events);

  /* One flat list per section. An event with no usable photo contributes
     nothing, so a section can end up empty and is then not rendered. */
  const sections = GALLERY_SECTIONS.map((section) => {
    const photos = flattenEvents(
      sorted.filter((e) => e.category === section.category)
    );

    return { ...section, photos };
  }).filter((section) => section.photos.length > 0);

  /* Events with no category, or a category the page does not know about, would
     otherwise vanish. They are surfaced separately so nothing is hidden. */
  const uncategorised = flattenEvents(
    sorted.filter((e) => !e.category || !KNOWN_CATEGORIES.has(e.category))
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
                  {/* Section header on a rule, with a plain photo count
                      opposite the title. */}
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
                      {section.photos.length}{" "}
                      {section.photos.length === 1 ? "photo" : "photos"}
                    </p>
                  </div>

                  <GalleryGrid photos={section.photos} />
                </section>
              ))}

              {uncategorised.length > 0 && (
                <section>
                  <div className="mb-10 pb-6 border-b border-forest/15 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="max-w-2xl">
                      <h2 className="h2-section text-forest mb-3">
                        Not yet categorised
                      </h2>

                      <p className="body-lg text-forest/85">
                        These events have no Section set, so they are not part of
                        the two sections above. Set Section on each one in the CMS
                        to move it into place.
                      </p>
                    </div>

                    <p className="eyebrow shrink-0 text-forest/70 text-base">
                      {uncategorised.length}{" "}
                      {uncategorised.length === 1 ? "photo" : "photos"}
                    </p>
                  </div>

                  <GalleryGrid photos={uncategorised} />
                </section>
              )}

              {sections.length === 0 && uncategorised.length === 0 && (
                <Reveal>
                  <p className="body-lg text-forest/85">
                    Events have been added but none of them have any photos
                    uploaded yet.
                  </p>
                </Reveal>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}