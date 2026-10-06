import { Check } from "lucide-react";

import Reveal from "@/components/Reveal";

/* --------------------------------------------------------------------------
    Why partners choose Anweshan

    The closing check-list on /about, after the values tiles.

    Server component and static: a check list has no interaction.

    Renders nothing when there are no items, so an unconfigured document shows no
    empty section.
   ----------------------------------------------------------------------- */

type WhyAnweshanProps = {
  heading?: string;
  items?: string[];
};

export default function WhyAnweshan({ heading, items }: WhyAnweshanProps) {
  const marks = (items ?? []).map((i) => i?.trim()).filter(Boolean);

  if (marks.length === 0) return null;

  return (
    <section className="bg-ivory py-20 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6">
        {heading?.trim() && (
          <Reveal>
            <h2 className="h2-section text-forest mb-12 md:mb-16 text-balance">
              {heading.trim()}
            </h2>
          </Reveal>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {marks.map((mark, i) => (
            <Reveal key={mark} delay={i * 70}>
              <li className="flex items-start gap-4">
                <span className="shrink-0 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                  <Check size={14} strokeWidth={2.5} className="text-primary" />
                </span>

                <span className="text-forest/80 body">{mark}</span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}