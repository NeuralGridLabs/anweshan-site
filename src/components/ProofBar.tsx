/* --------------------------------------------------------------------------
    Proof bar

    A slim forest strip under the hero carrying short credibility markers
    (years working, studies delivered, regions covered).

    Server component: the text comes from `home.proofItems` and there is no
    interaction, so nothing here needs to ship to the browser.

    Renders nothing when the field is empty, so an unconfigured document shows no
    empty band. Static by design — no counters and no reveal animation.
   ----------------------------------------------------------------------- */

type ProofBarProps = {
  items?: string[];
};

export default function ProofBar({ items }: ProofBarProps) {
  /* Blank entries are dropped rather than rendering an empty gap. */
  const marks = (items ?? []).map((item) => item.trim()).filter(Boolean);

  if (marks.length === 0) return null;

  return (
    <section className="bg-forest py-5">
      <div className="max-w-[1400px] mx-auto px-6">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-8">
          {marks.map((mark, i) => (
            <li
              key={`${mark}-${i}`}
              className="flex items-center justify-center gap-x-8 md:gap-x-0"
            >
              <span className="meta-label text-ivory text-center">{mark}</span>

              {/* Gold dot between items on the single desktop row. Hidden on
                  mobile, where the items sit in a 2x2 grid and a trailing dot
                  would read as a stray mark. */}
              {i < marks.length - 1 && (
                <span
                  aria-hidden
                  className="hidden md:block ml-8 h-1 w-1 shrink-0 rounded-full bg-gold"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}