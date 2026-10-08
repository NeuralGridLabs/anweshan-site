import Reveal from "@/components/Reveal";
import type { AboutStep } from "@/lib/types";

/* --------------------------------------------------------------------------
    How we work

    The dark band on /about: a numbered row of process steps, gold index,
    ivory type. Sits between the commitments and values sections.

    Server component and static: the copy comes from `howWeWorkSteps` and there
    is no interaction, so nothing here ships to the browser.

    Renders nothing when there are no steps, so an unconfigured document shows no
    empty dark band.
   ----------------------------------------------------------------------- */

type HowWeWorkProps = {
  heading?: string;
  steps?: AboutStep[];
};

export default function HowWeWork({ heading, steps }: HowWeWorkProps) {
  /* Entries with neither a title nor text are dropped rather than rendering an
     empty numbered column. */
  const items = (steps ?? []).filter((s) => s?.title?.trim() || s?.text?.trim());

  if (items.length === 0) return null;

  return (
    <section className="bg-forest py-20 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6">
        {heading?.trim() && (
          <Reveal>
            <h2 className="h2-section text-ivory mb-12 md:mb-16 text-balance">
              {heading.trim()}
            </h2>
          </Reveal>
        )}

        {/* Column count follows the step count so a short list does not leave
             five gaps. Capped at six by the schema. */}
        <ul
          className={`grid gap-8 md:gap-6 ${
            items.length >= 5
              ? "grid-cols-1 md:grid-cols-5"
              : items.length === 4
                ? "grid-cols-1 md:grid-cols-4"
                : items.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {items.map((step, i) => (
            <Reveal key={step.title ?? i} delay={i * 90}>
              <div className="h-full border-t border-ivory/20 pt-6">
                <p className="text-gold text-3xl md:text-4xl font-bold tracking-tight tabular-nums mb-4">
                  {String(i + 1).padStart(2, "0")}
                </p>

                {step.title?.trim() && (
                  <h3 className="h3-card text-ivory mb-3 text-balance">
                    {step.title.trim()}
                  </h3>
                )}

                {step.text?.trim() && (
                  <p className="text-ivory/80 body-sm">{step.text.trim()}</p>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}