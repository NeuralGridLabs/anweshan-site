"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";

import Cutouts from "@/components/Cutouts";

/* --------------------------------------------------------------------------
    Service detail pop-up

    The service detail PAGES are gone; this dialog carries the same content on
    /services. It is built on the native <dialog> element and showModal(), so
    focus trapping, the backdrop, Escape-to-close and focus restoration are the
    platform's behaviour rather than something re-implemented here.

    The provider owns one dialog for the whole page and hands out an `open`
    function through context, so the band buttons stay server-rendered plain
    markup and only this subtree ships to the browser.

    Props are plain serialisable data: the parent resolves Sanity images to URL
    strings on the server, so nothing here reaches for the CMS.

    Deep links. Opening writes ?open=<slug> with history.replaceState - no
    navigation, no scroll jump, no extra entry in the back stack - and closing
    removes it again. On mount the parameter is read once, so
    /services?open=<slug> (and the permanent redirect that now sends
    /services/<slug> here) opens straight into the right service.
   ----------------------------------------------------------------------- */

export type ServiceDetail = {
  slug: string;
  number: string;
  title: string;
  tagline?: string;
  detailBody?: string;
  capabilities?: string[];
  ctaLabel?: string;
  ctaLink?: string;
  imageUrl?: string;
  /* /projects#<category>, resolved on the server through serviceAreaForSlug so
     the pop-up links to the same grouped band the old detail page did. Absent
     when the slug has no matching category. */
  projectsHref?: string;
};

/** Same classes as the Hero primary button, so the two read as one family. */
const PILL =
  "inline-flex items-center gap-2 rounded-full bg-forest text-white text-sm font-semibold px-6 py-3 hover:bg-forest/90 transition-colors";

/** An internal path is a client-side navigation; an https URL opens in a new tab. */
function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/* ---- context --------------------------------------------------------- */

type DialogApi = { open: (slug: string) => void };

const ServiceDialogContext = createContext<DialogApi | null>(null);

/**
 * Opens the page's service pop-up. Must be rendered inside
 * `ServiceDialogProvider`; returns a no-op if it is not, so a band can never
 * crash the page by being rendered outside the provider.
 */
export function useServiceDialog(): DialogApi {
  return useContext(ServiceDialogContext) ?? { open: () => {} };
}

/* ---- trigger --------------------------------------------------------- */

/**
 * The band trigger. A real <button type="button"> with aria-haspopup="dialog",
 * so it is announced as opening a dialog and is reachable by keyboard, rather
 * than a link pretending to be one.
 */
export function ServiceDetailTrigger({
  slug,
  label,
  className,
}: {
  slug: string;
  label: string;
  className?: string;
}) {
  const { open } = useServiceDialog();

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => open(slug)}
      className={className}
    >
      {label}
      <ArrowRight
        size={18}
        strokeWidth={2.5}
        aria-hidden
        className="shrink-0 transition-transform group-hover:translate-x-1"
      />
    </button>
  );
}

/* ---- pop-up ---------------------------------------------------------- */

export function ServiceDialogProvider({
  services,
  children,
}: {
  services: ServiceDetail[];
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [index, setIndex] = useState(-1);
  const [fading, setFading] = useState(false);
  const titleId = useId();

  const active = index >= 0 ? services[index] : null;

  const writeParam = useCallback((slug: string | null) => {
    const url = new URL(window.location.href);

    if (slug) url.searchParams.set("open", slug);
    else url.searchParams.delete("open");

    /* replaceState, never pushState: opening a pop-up is not a navigation and
       must not add a history entry the reader has to back out of twice. */
    window.history.replaceState(null, "", url.toString());
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const show = useCallback(
    (slug: string) => {
      const next = services.findIndex((service) => service.slug === slug);
      if (next === -1) return;

      /* Remember what had focus so it can be handed back on close. */
      triggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      const dialog = dialogRef.current;
      if (dialog && !dialog.open) dialog.showModal();

      setFading(false);
      setIndex(next);
      writeParam(services[next].slug);
    },
    [services, writeParam],
  );

  /* Deep link: read ?open once on mount. An unknown slug opens nothing and the
     parameter is left alone, so a stale link is visible in the address bar
     rather than being silently rewritten.

     The read is deferred by a tick on purpose. `window` does not exist while
     this page is prerendered, so the parameter can only be read after mount,
     and doing the open inside a timer callback keeps it an event rather than a
     synchronous setState in the middle of the commit. */
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("open");
    if (!slug) return;
    if (!services.some((service) => service.slug === slug)) return;

    const timer = setTimeout(() => show(slug), 0);
    return () => clearTimeout(timer);
  }, [services, show]);

  /* Native Escape and the programmatic close() both land on the `close`
     event, which is the one place the URL, the scroll lock and focus are
     cleaned up. Doing it here rather than in the click handlers means the three
     close paths cannot drift apart. */
  const handleClose = useCallback(() => {
    setIndex(-1);
    setFading(false);
    writeParam(null);

    document.body.style.overflow = "";

    /* Return focus to the band button that opened the pop-up. */
    triggerRef.current?.focus?.();
    triggerRef.current = null;
  }, [writeParam]);

  /* Lock the page behind the pop-up. */
  useEffect(() => {
    if (index === -1) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [index]);

  useEffect(() => {
    return () => {
      if (swapTimer.current) clearTimeout(swapTimer.current);
    };
  }, []);

  const cycle = useCallback(
    (delta: number) => {
      if (services.length === 0) return;

      const next = (index + delta + services.length) % services.length;

      if (swapTimer.current) clearTimeout(swapTimer.current);
      setFading(true);
      swapTimer.current = setTimeout(() => {
        setIndex(next);
        setFading(false);
        writeParam(services[next].slug);
      }, 160);
    },
    [index, services, writeParam],
  );

  /* A click that lands on the dialog element itself is a click on the
     backdrop: the panel below fills the dialog completely, so anything inside
     the pop-up hits the panel and never the dialog. */
  const onBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  const api = { open: show };

  const ctaLabel = active?.ctaLabel?.trim() ?? "";
  const ctaLink = active?.ctaLink?.trim() ?? "";
  const showCta = ctaLabel !== "" && ctaLink !== "";

  return (
    <ServiceDialogContext.Provider value={api}>
      {children}

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={onBackdropClick}
        aria-labelledby={active ? titleId : undefined}
        className="dialog-enter m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-left backdrop:bg-forest/70 backdrop:backdrop-blur-sm sm:mx-auto sm:my-auto sm:h-auto sm:max-h-[88vh] sm:max-w-5xl"
      >
        <div className="flex h-full flex-col overflow-y-auto lg:grid lg:grid-cols-[5fr_7fr] lg:overflow-hidden">
          {/* ---- LEFT: identity panel ---- */}
          <div className="relative shrink-0 overflow-hidden bg-forest px-6 pb-8 pt-8 lg:flex lg:flex-col lg:px-10 lg:py-10">
            <Cutouts variant="featured" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                {/* Oversized numeral, decorative only - the heading beside it
                    carries the meaning. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 -left-2 select-none text-[9rem] font-bold leading-none tracking-tighter text-white/10 lg:text-[9rem]"
                >
                  {active?.number}
                </span>

                <p className="relative text-gold eyebrow mb-4">Our services</p>

                <h2
                  id={titleId}
                  className="relative text-3xl md:text-4xl font-bold leading-tight text-white text-balance"
                >
                  {active?.title}
                </h2>

                {active?.tagline && (
                  <p className="relative mt-4 text-lg italic leading-snug text-gold">
                    {active.tagline}
                  </p>
                )}
              </div>

              {/* Sticky round close, so it stays reachable once the panel
                  content has scrolled past it on a phone. */}
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="relative shrink-0 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* The image is desktop-only: on a phone the panel is a compact
                header and a photo would push the content off the screen. */}
            {active?.imageUrl && (
              <div className="relative mt-8 hidden aspect-[5/4] w-full overflow-hidden rounded-2xl ring-1 ring-white/20 lg:block">
                <Image
                  src={active.imageUrl}
                  alt={active.title}
                  fill
                  sizes="(max-width: 1024px) 0px, 40vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* Previous / Next, cycling only through services that have detail. */}
            {services.length > 1 && (
              <div className="relative mt-auto hidden items-center justify-between gap-4 pt-10 lg:flex">
                <button
                  type="button"
                  onClick={() => cycle(-1)}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-ivory/85 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
                >
                  <ArrowLeft
                    size={16}
                    strokeWidth={2.5}
                    aria-hidden
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                  Previous service
                </button>

                <button
                  type="button"
                  onClick={() => cycle(1)}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-ivory/85 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
                >
                  Next service
                  <ArrowRight
                    size={16}
                    strokeWidth={2.5}
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            )}
          </div>

          {/* ---- RIGHT: content panel ---- */}
          <div className="flex min-h-0 flex-col bg-ivory px-6 pb-8 pt-8 lg:overflow-y-auto lg:px-10 lg:py-10">
            {/* Mobile-only close, kept out of the panel flow on desktop where
                the left panel already carries a close. */}
            <div className="mb-6 flex justify-end lg:hidden">
              <ServiceCloseButton onClose={close} />
            </div>

            <div
              className="min-h-0 flex-1 transition-opacity duration-150 motion-reduce:transition-none"
              style={{ opacity: fading ? 0 : 1 }}
            >
              <p className="meta-label text-forest mb-4">What this includes</p>

              {active?.detailBody && (
                <p className="text-lg leading-8 text-forest">
                  {active.detailBody}
                </p>
              )}

              {active?.capabilities && active.capabilities.length > 0 && (
                <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {active.capabilities.map((item, i) => (
                    <li
                      key={item}
                      className="rounded-xl border border-forest/15 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
                    >
                      <span className="text-sm font-bold tabular-nums text-primary-dark">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span className="mt-2 block text-base leading-relaxed text-forest">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer: the editor's CTA when there is one, a jump to the work
                behind this service, plus a quiet close. */}
            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-forest/15 pt-6">
              {active?.projectsHref && (
                <Link
                  href={active.projectsHref}
                  className="group inline-flex items-center gap-2 rounded-full border-2 border-forest px-6 py-3 text-forest text-sm font-semibold transition-colors hover:bg-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                >
                  See projects
                  <ArrowRight
                    size={15}
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              )}

              {showCta &&
                (isInternal(ctaLink) ? (
                  <Link href={ctaLink} className={PILL}>
                    {ctaLabel}
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <a
                    href={ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={PILL}
                  >
                    {ctaLabel}
                    <ArrowUpRight size={14} />
                  </a>
                ))}

              <ServiceCloseButton onClose={close} />
            </div>
          </div>
        </div>
      </dialog>
    </ServiceDialogContext.Provider>
  );
}

function ServiceCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="text-sm font-semibold text-forest/75 underline underline-offset-4 transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
    >
      Close
    </button>
  );
}