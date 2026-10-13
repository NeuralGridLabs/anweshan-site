"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import GalleryLightbox, {
  type LightboxPhoto,
} from "@/components/GalleryLightbox";

/* --------------------------------------------------------------------------
   One section's flat photo grid, and the lightbox it opens.

   The page flattens a section's events into a single list, so this component
   never sees an event - only photos, each already carrying the event details
   the tile and the lightbox need.

   Tiles are real <button>s and carry their event in the aria-label, so what a
   tile represents is available to a screen reader at rest. The gradient strip
   with the event title is a bonus on hover and on keyboard focus; it is not
   the only way to find out, and the tiles themselves have no text on them.

   Photos are revealed PAGE_SIZE at a time. The whole list is still passed to
   the lightbox, so the arrows can reach every photo in the section including
   ones not yet rendered as tiles.
   ----------------------------------------------------------------------- */

/** Photos rendered per page; "Show more" adds this many each time. */
const PAGE_SIZE = 24;

/**
 * Widths the tiles actually occupy: 2 across below md, 3 to lg, 4 to xl, 5
 * above that. Matches the grid the tiles sit in, so the browser does not
 * fetch a desktop-sized image for a two-up phone tile.
 */
const TILE_SIZES =
  "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw";

type Props = {
  photos: LightboxPhoto[];
};

export default function GalleryGrid({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  /* Opening remembers the exact tile that was pressed. It is held as a ref
     rather than read back from document.activeElement because Safari does not
     focus a button when you click it, so activeElement would be <body> and
     focus would never come back to the grid. */
  const openAt = useCallback((index: number, tile: HTMLButtonElement) => {
    triggerRef.current = tile;
    setOpenIndex(index);
  }, []);

  /* Hand focus back to the tile once the dialog has closed. This runs after
     GalleryLightbox has called onClose from the native close event, so the
     dialog is already shut and the page is no longer inert - focusing before
     that point would be swallowed by the modal. The guard makes it a no-op on
     mount, when there is no trigger to return to. */
  useEffect(() => {
    if (openIndex !== null) return;

    const tile = triggerRef.current;
    if (!tile) return;

    triggerRef.current = null;
    tile.focus();
  }, [openIndex]);

  if (photos.length === 0) return null;

  const visible = photos.slice(0, visibleCount);
  const remaining = photos.length - visible.length;

  return (
    <>
      {/* Photos on a uniform 4:3 frame: 2 across on a phone, 3 from md, 4 from
          lg, 5 from xl. Cropping each to a common frame keeps the rows aligned
          whatever the photos' own aspect ratios are. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((photo, i) => (
          <button
            key={photo.key}
            type="button"
            onClick={(e) => openAt(i, e.currentTarget)}
            aria-label={
              photo.eventTitle
                ? `View photo from ${photo.eventTitle}`
                : "View photo"
            }
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-sage transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-mist hover:shadow-md motion-reduce:transition-none"
          >
            <Image
              src={photo.src}
              /* The photo's own alt where it has one, otherwise the event
                 title, which is the most specific thing known about it. */
              alt={photo.alt || photo.eventTitle || ""}
              fill
              loading="lazy"
              sizes={TILE_SIZES}
              className="object-cover"
            />

            {/* Event title on a gradient, on hover and on keyboard focus only.
                One line, truncated; the full title is in the lightbox. */}
            {photo.eventTitle && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 via-forest/35 to-transparent px-3 pb-2 pt-8 opacity-0 transition-opacity duration-300 group-focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
              >
                <span className="block truncate text-sm font-semibold text-white">
                  {photo.eventTitle}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="rounded-full border-2 border-forest px-8 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-mist"
          >
            Show more
            <span className="sr-only">
              {` — ${remaining} more ${remaining === 1 ? "photo" : "photos"}`}
            </span>
          </button>
        </div>
      )}

      <GalleryLightbox
        photos={photos}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}