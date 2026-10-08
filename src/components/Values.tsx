import Reveal from "@/components/Reveal";
import type { AboutStep } from "@/lib/types";

/* --------------------------------------------------------------------------
    Values

    The tile grid on /about, between How we work and the closing check-list.

    Server component and static. Renders nothing when there are no values, so an
    unconfigured document shows no empty section.
   ----------------------------------------------------------------------- */

type ValuesProps = {
  heading?: string;
  values?: AboutStep[];
};

export default function Values({ heading, values }: ValuesProps) {
  const items = (values ?? []).filter(
    (v) => v?.title?.trim() || v?.text?.trim(),
  );

  if (items.length === 0) return null;

  return (
    <section className="bg-sage py-20 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6">
        {heading?.trim() && (
          <Reveal>
            <h2 className="h2-section text-forest mb-12 md:mb-16 text-balance">
              {heading.trim()}
            </h2>
          </Reveal>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((value, i) => (
            <Reveal key={value.title ?? i} delay={i * 80}>
              {/* Same card surface used by the featured-work rail. */}
              <div className="h-full rounded-2xl bg-white border border-forest/15 p-6">
                {value.title?.trim() && (
                  <h3 className="h3-card text-forest mb-3 text-balance">
                    {value.title.trim()}
                  </h3>
                )}

                {value.text?.trim() && (
                  <p className="text-forest/85 body-sm">{value.text.trim()}</p>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}