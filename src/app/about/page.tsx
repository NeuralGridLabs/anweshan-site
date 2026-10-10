import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import HowWeWork from "@/components/HowWeWork";
import Values from "@/components/Values";
import WhyAnweshan from "@/components/WhyAnweshan";

import { aboutQuery, homeQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import {
  fallbackMission,
  fallbackMissionPillars,
  fallbackVision,
} from "@/lib/about";
import type { About, Home } from "@/lib/types";

const fallbackObjectives = [
  {
    id: "01",
    text: "To conduct contemporary research and foster evidence-based policy analysis, formulation and planning, and nurture an academic milieu.",
    note: "Research that is designed to be used, with findings framed for the people who write policy and run programmes.",
  },
  {
    id: "02",
    text: "To be a leading communication research center that drives social action in the community.",
    note: "Evidence carried into the community through design, media, and dialogue rather than left inside a report.",
  },
];

export default async function AboutPage() {
  const [aboutData, homeData] = await Promise.all([
    fetchSanity<About>(aboutQuery),
    fetchSanity<Home>(homeQuery),
  ]);

  // Sanity wins when it has copy; otherwise the original site's wording is used.
  const vision = aboutData?.vision || fallbackVision;
  const mission = aboutData?.mission || fallbackMission;
  const pillars = aboutData?.missionPillars?.length
    ? aboutData.missionPillars
    : fallbackMissionPillars;

  const promises = (aboutData?.promises ?? []).filter(
    (p) => p?.title?.trim() || p?.text?.trim(),
  );

  /* Blank entries are dropped so an empty paragraph never renders as a gap. */
  const storyParagraphs = (aboutData?.storyParagraphs ?? [])
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p));

  /* The opening sentence becomes the pull statement. Splitting on the first
     full stop followed by a space keeps abbreviations such as "e.g." or "Dr."
     intact, because those are not followed by a space before the next word.
     When there is no such break the whole paragraph stays in the statement. */
  const [firstSentence, ...restSentences] = (() => {
    const opening = storyParagraphs[0] ?? "";
    const match = opening.match(/^([\s\S]*?\.)(?=\s)/);

    if (!match) return [opening, ""] as const;

    return [
      match[1],
      opening.slice(match[1].length).replace(/^\s+/, ""),
    ] as const;
  })();

  /* The leftover of paragraph one, then paragraphs two onwards. Rendered as a
     single list so one or many read the same way. */
  const storyRest = [
    ...(restSentences ? [restSentences] : []),
    ...storyParagraphs.slice(1),
  ].filter(Boolean);

  return (
    <main className="min-h-screen text-base bg-snow">
      <PageHeader
        tone="ink"
        title={aboutData?.heading?.trim() || "About Us"}
        lead={aboutData?.body || homeData?.aboutBlurb}
        plain
        stacked
      />

      {/* Story: the narrative band directly under the header. Hidden entirely
          when no paragraphs are set, so an unconfigured document shows nothing
          between the header and the vision band.

          The opening sentence is lifted out of the first paragraph and set
          large on the left; the remainder of that paragraph and any later ones
          run as reading text on the right. Same CMS strings, no invented copy,
          and a single paragraph lays out without an empty column. */}
      {storyParagraphs.length > 0 && (
        <section className="bg-snow py-20 md:py-32">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
              {/* 5/12: eyebrow over the pull statement. */}
              <Reveal className="lg:col-span-5">
                {aboutData?.storyEyebrow?.trim() && (
                  <>
                    <span
                      aria-hidden
                      className="block w-12 h-[3px] bg-gold mb-6"
                    />

                    <p className="text-forest eyebrow mb-8">
                      {aboutData.storyEyebrow.trim()}
                    </p>
                  </>
                )}

                <p className="text-2xl md:text-3xl lg:text-[2.6rem] font-semibold leading-[1.15] tracking-tight text-forest text-balance">
                  {firstSentence}
                </p>
              </Reveal>

              {/* 7/12: the rest, as ordinary reading text. */}
{storyRest.length > 0 && (
  <Reveal delay={120} className="lg:col-span-7">
    <div className="max-w-[62ch]">
      {/* Opening paragraph */}
      <div className="relative pl-6 border-l-2 border-gold">
        <p className="text-base md:text-lg leading-8 text-forest/85">
          {storyRest[0]}
        </p>
      </div>

      {/* Supporting paragraphs */}
      {storyRest.slice(1).map((paragraph, i) => (
        <div
          key={i}
          className="mt-8 pt-8 border-t border-forest/10"
        >
          <p className="text-base md:text-lg leading-8 text-forest/75">
            {paragraph}
          </p>
        </div>
      ))}
    </div>
  </Reveal>
)}
            </div>
          </div>
        </section>
      )}

      {/* Vision */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2000"
          alt="Mountain landscape in Nepal"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/40 to-forest/15" />
        <div className="relative max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          <Reveal className="md:col-span-3">
            <p className="text-white mb-2 text-sm md:text-xl font-semibold tracking-[0.2em] uppercase">
              Our vision
            </p>
          </Reveal>

          <Reveal delay={120} className="md:col-span-9">
            <p className="text-white text-2xl md:text-4xl font-bold leading-[1.18] tracking-tight">
              {vision}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-cream py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="max-w-4xl">
            <Reveal>
            <p className="text-forest mb-8 text-sm md:text-xl font-semibold tracking-[0.2em] uppercase">
              Our mission
            </p>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-2xl md:text-4xl font-bold text-base-text leading-[1.22] tracking-tight">
                {mission}
              </p>
            </Reveal>
          </div>

          <Reveal delay={180}>
            <p className="text-base-text/70 body-lg mt-10 mb-14 max-w-3xl">
              We collaborate with governments, civil society, and the
              private sector to support policy development, strengthen
              health systems, and advance innovative financing and
              technological integration, addressing the underlying social
              determinants of health. Our work is grounded in principles
              of participation, ownership, and knowledge transfer,
              ensuring lasting impact for all stakeholders.
            </p>

            <p className="text-forest/70 eyebrow mb-8 text-base">
              Mission pillars
            </p>
          </Reveal>

          {/* Two pillars, so two columns sit side by side with no orphan row.
              The list falls back to a single column below md, where two
              narrow measures would break the text into a thin ribbon. */}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
            {pillars.map((pillar, i) => (
              <li key={pillar.title ?? i} className="border-l-2 border-gold pl-6">
                {pillar.title && (
                  <p className="text-lg md:text-xl font-bold text-forest mb-3">
                    {pillar.title}
                  </p>
                )}
                <p className="text-base-text/70 body-lg">{pillar.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Objectives */}
      <section className="relative bg-ivory text-forest py-20 md:py-32 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
<div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 md:mb-16">
            <div className="md:col-span-8">
              {promises.length > 0 ? (
                <>
                  {aboutData?.purposeEyebrow?.trim() && (
                    <p className="eyebrow font-bold text-primary-dark mb-6 text-base md:text-lg">
                      {aboutData.purposeEyebrow.trim()}
                    </p>
                  )}

                  {aboutData?.purpose?.trim() && (
                    <p className="text-forest body-lg max-w-3xl mb-8">
                      {aboutData.purpose.trim()}
                    </p>
                  )}

                  <h2 className="h2-section text-forest">
                    {aboutData?.promisesHeading?.trim() ||
                      "Two commitments that shape every engagement."}
                  </h2>
                </>
              ) : (
                <>
                  <p className="eyebrow font-bold text-primary-dark mb-6 text-base md:text-lg">
                    Our objective
                  </p>

                  <h2 className="h2-section text-forest">
                    Two commitments that shape every engagement.
                  </h2>
                </>
              )}
            </div>
          </div>

          {/* Single-column editorial list.

              Promises and the fallback objectives share this layout; the two
              shapes differ, so both are normalised to an optional heading plus a
              body. One row per item, rules between them, no divider and no
              alternating indents — the number, title and description therefore
              start at the same x in every row. */}
          <ul>
            {(
              promises.length > 0
                ? promises.map((p) => ({ heading: p.title, text: p.text }))
                : fallbackObjectives.map((o) => ({ heading: undefined, text: o.text }))
            ).map((item, i, all) => (
              <Reveal key={item.heading ?? i} delay={i * 90}>
                <li
                  className={`grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-3 py-8 md:py-10 border-t border-forest/15 ${
                    i === all.length - 1 ? "border-b border-forest/15" : ""
                  }`}
                >
                  <p className="md:col-span-1 lg:col-span-2 eyebrow font-bold text-primary-dark text-base md:text-lg">
                    {String(i + 1).padStart(2, "0")}
                  </p>

                  <div className="md:col-span-5 lg:col-span-5">
                    <h3 className="text-2xl md:text-3xl font-bold leading-tight text-forest text-balance">
                      {item.heading || item.text}
                    </h3>
                  </div>

                  {item.heading && item.text && (
                    <div className="md:col-span-6 lg:col-span-5">
                      <p className="text-forest/80 body-lg max-w-xl">
                        {item.text}
                      </p>
                    </div>
                  )}
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={220}>
            <Link
              href="/publications"
              className="group inline-flex items-center gap-3 rounded-full bg-gold text-forest text-sm font-semibold px-8 py-4 mt-12 hover:bg-primary transition-colors"
            >
              Our publications

              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Each band renders nothing when its CMS fields are empty, so the page
          falls back to today's four sections with no gaps. Backgrounds run
          ivory → forest → sage → ivory, none repeating against a neighbour. */}
      <HowWeWork
        heading={aboutData?.howWeWorkHeading}
        steps={aboutData?.howWeWorkSteps}
      />

      <Values heading={aboutData?.valuesHeading} values={aboutData?.values} />

      <WhyAnweshan
        heading={aboutData?.whyHeading}
        items={aboutData?.whyItems}
      />
    </main>
  );
}

