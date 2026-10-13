"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/* --------------------------------------------------------------------------
   Back to top.

   A single round button in the bottom-right that appears once the reader is
   far enough down the page for going back up to be worth offering.

   Hidden rather than unmounted: the button stays in the DOM and fades, so it
   cannot shift layout on the way in. When hidden it is also taken out of the
   tab order and out of pointer reach, because a control the reader can focus
   but not see is worse than no control at all.

   Suppressed on /admin. That route is the Sanity Studio, which mounts its own
   chrome and scrolls its own panes; a site-level floating button floating over
   a CMS editor is noise. usePathname is read here rather than in the layout so
   this component stays self-contained.

   Scroll position is only ever read inside an effect and inside the click
   handler, never during render, so there is nothing for the server and the
   client to disagree about.
   ----------------------------------------------------------------------- */

/** How far down the page the button waits before appearing. */
const SHOW_AFTER = 400;

export default function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  /* Track the scroll offset. The listener is passive so it never blocks
     scrolling, which is the whole point of it running on every scroll event,
     and it is removed on unmount. rAF-throttled because scroll fires far more
     often than the state is worth re-rendering for. */
  useEffect(() => {
    let frame = 0;

    function onScroll() {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setVisible(window.scrollY > SHOW_AFTER);
      });
    }

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* The Studio gets no button. Rendered as null rather than hidden with CSS
     so nothing reaches the DOM there at all. */
  if (pathname?.startsWith("/admin")) return null;

  function scrollToTop() {
    /* Asked at click time rather than read once on mount, so a reader who
       turns reduced motion on while the page is open gets the instant jump. */
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      /* Out of the tab order and unclickable while invisible, so a keyboard
         reader never lands on something they cannot see. */
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed right-6 bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-forest text-white shadow-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-primary hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      } motion-reduce:transition-none`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}