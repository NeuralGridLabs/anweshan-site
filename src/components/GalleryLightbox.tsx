"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

/* --------------------------------------------------------------------------
   Gallery lightbox.

   One photo, full screen, with the details of the event it came from.

   The page flattens a whole section into a single list of photos, each one
   carrying its own event's title, date and description. The dialog reads all
   of that off the photo rather than taking it as separate props, so moving
   between photos from two different events needs no extra bookkeeping here:
   cross a boundary and the title, date and counter all change by themselves.

   The counter is deliberately per-event rather than per-section, so it reads
   "2 / 8" for the event being looked at rather than "47 / 94" for the page.

   Built on the native <dialog> element and showModal() for the same reason
   ServiceDialog is: focus trapping, Escape, the inert page behind it and
   focus restoration are the platform's behaviour rather than something
   re-implemented here.

   The <dialog> stays mounted for the life of the grid and is opened and
   closed by whether `index` is null. Stepping between photos therefore never
   tears the dialog down - only the image swaps, which is what keeps the
   backdrop, the scroll lock and the focus position stable.

   Everything a control does is visible without hover, so the dialog behaves
   the same under a finger as under a mouse. Motion is guarded with
   motion-safe, and the global prefers-reduced-motion block in globals.css
   flattens anything that gets through.

   Props are plain serialisable data: the server resolves each Sanity image to
   a URL string, so nothing here reaches for the CMS.
   ----------------------------------------------------------------------- */

export type LightboxPhoto = {
  key: string;
  src: string;
  alt: string;
  caption?: string;
  /* The event this photo came from. All optional on purpose: the page passes
     through only what the document actually holds and invents nothing, so a
     photo from an event with no title simply shows no title. */
  eventTitle?: string;
  /** Already formatted for display on the server. */
  eventDate?: string;
  eventDescription?: string;
  /** This photo's 0-based position within its event, and the event's total. */
  indexInEvent: number;
  eventPhotoCount: number;
};

type Props = {
  photos: LightboxPhoto[];
  /** null when the dialog is closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export default function GalleryLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const open = index !== null;
  const total = photos.length;
  const photo = index === null ? undefined : photos[index];
  const hasPrev = index !== null && index > 0;
  const hasNext = index !== null && index < total - 1;

  const label = photo?.eventTitle
    ? `${photo.eventTitle} photo viewer`
    : "Gallery photo viewer";

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  /* Open and close in step with `index`. Closing goes through close() rather
     than a plain unmount, so the native close event fires and the grid can
     hand focus back to the tile that opened this. Focus restoration is the
     grid's job, not ours: it knows which tile was pressed, and on Safari a
     click does not move focus onto a button, so document.activeElement is
     not a reliable stand-in for it. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  /* Lock the page behind the dialog, padded by the width of the scrollbar we
     just removed so nothing underneath shifts sideways. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  /* Native Escape and the programmatic close() both land on the `close` event,
     which is the one place the grid is told the dialog is done. Handling it
     here rather than in the click handlers keeps the close paths from
     drifting apart. */
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  /* Previous/next step through the whole list, which is the whole section:
     crossing from one event's last photo to the next event's first simply
     moves on by one, and the title and counter follow. Wraps at both ends. */
  const step = useCallback(
    (delta: number) => {
      if (index === null || total === 0) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, onIndexChange, total]
  );

  /* Arrow keys, bound to the document so they work wherever focus sits inside
     the dialog. Escape is the native dialog's own. */
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, step]);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      /* The ::backdrop stays transparent: the layer inside paints the dim, so
         there is one background rather than two stacked ones. */
      className="m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-left backdrop:bg-transparent motion-safe:animate-[dialog-in_200ms_cubic-bezier(0.22,1,0.36,1)]"
    >
      {open && photo && (
        <>
          {/* The backdrop. A click landing here closes the dialog, which is why
              the content layer above opts back in with pointer-events. */}
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 h-full w-full cursor-zoom-out bg-forest/95"
          />

          <div className="pointer-events-none relative flex h-full flex-col text-white">
            <div className="flex justify-end p-4 md:p-6">
              <button
                type="button"
                onClick={close}
                aria-label="Close photo viewer"
                className="pointer-events-auto flex items-center gap-2 rounded-full bg-ivory px-4 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
              >
                <X size={18} strokeWidth={2.5} aria-hidden />
                Close
              </button>
            </div>

            {/* object-contain, so the photo is shown whole whatever its own
                aspect ratio, rather than cropped to fill. `key` remounts the
                image on each step so the fade replays. */}
            <div className="pointer-events-auto relative mx-4 min-h-0 flex-1 md:mx-8">
              <Image
                key={photo.key}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="object-contain motion-safe:animate-[dialog-swap_160ms_ease-out]"
              />
            </div>

            {/* Preload whichever photos the arrows would land on, so stepping
                through a set does not wait on the network. */}
            {[hasPrev ? index - 1 : null, hasNext ? index + 1 : null]
              .filter((i): i is number => i !== null)
              .map((i) => (
                <span
                  key={`preload-${photos[i].key}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
                >
                  <Image src={photos[i].src} alt="" fill preload sizes="100vw" />
                </span>
              ))}

            {/* Disabled at the ends rather than hidden, so the controls keep
                their place in the layout and the tab order stays stable. */}
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={!hasPrev}
              aria-label="Previous photo"
              className="pointer-events-auto absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-forest transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest disabled:cursor-not-allowed disabled:opacity-30 md:left-4 md:h-14 md:w-14"
            >
              <ChevronLeft size={24} strokeWidth={2.5} aria-hidden />
            </button>

            <button
              type="button"
              onClick={() => step(1)}
              disabled={!hasNext}
              aria-label="Next photo"
              className="pointer-events-auto absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-forest transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest disabled:cursor-not-allowed disabled:opacity-30 md:right-4 md:h-14 md:w-14"
            >
              <ChevronRight size={24} strokeWidth={2.5} aria-hidden />
            </button>

            {/* The event this photo belongs to: title (allowed to wrap, since a
                long one is the main wayfinding cue in a flat grid), the date,
                the event's own description, this photo's caption, and where the
                photo sits inside its event.

                Every line is conditional. An event with no title, no date and
                no description shows fewer lines; none is ever replaced with an
                invented placeholder. */}
            <div className="pointer-events-auto px-4 pb-6 pt-4 text-center md:px-8 md:pb-8">
              {photo.eventTitle && (
                <p className="h3-card text-balance">{photo.eventTitle}</p>
              )}

              {photo.eventDate && (
                <p className="eyebrow mt-2 text-white/70">{photo.eventDate}</p>
              )}

              {photo.eventDescription && (
                <p className="body-sm mx-auto mt-3 max-w-2xl text-white/85">
                  {photo.eventDescription}
                </p>
              )}

              {photo.caption && (
                <p className="body-sm mx-auto mt-2 max-w-2xl text-white/70 italic">
                  {photo.caption}
                </p>
              )}

              <p
                aria-live="polite"
                className="mt-3 text-sm font-semibold text-white/70 tabular-nums"
              >
                {photo.indexInEvent + 1} / {photo.eventPhotoCount}
              </p>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}