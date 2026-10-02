import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

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

  return (
    <main className="min-h-screen text-base bg-snow">
      <PageHeader
        tone="ink"
        title="About Us"
        lead={aboutData?.body || homeData?.aboutBlurb}
        plain
        stacked
      />

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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-20">
            <div className="md:col-span-8">
              <p className="text-forest/70 mb-6 text-sm md:text-xl font-semibold tracking-[0.2em] uppercase">
                Our objective
              </p>

              <h2 className="h2-section text-forest">
                Two commitments that shape every engagement.
              </h2>
            </div>
          </div>

          {/* Two-column objectives */}
          <div className="relative grid grid-cols-1 md:grid-cols-2">
            <span
              aria-hidden
              className="hidden md:block absolute inset-y-8 left-1/2 w-px bg-forest/15"
            />

            {fallbackObjectives.map((item, i) => (
              <Reveal key={item.id} delay={i * 140}>
                <div
                  className={`h-full py-10 md:py-4 ${
                    i === 0
                      ? "md:pr-16 border-b border-forest/15 md:border-b-0"
                      : "md:pl-16"
                  }`}
                >
                  <p className="text-forest/40 text-sm font-semibold tabular-nums mb-8">
                    {item.id}
                  </p>

                  <p className="text-2xl md:text-4xl font-bold leading-[1.22] tracking-tight mb-8 first-letter:float-left first-letter:mr-3 first-letter:text-6xl md:first-letter:text-7xl first-letter:leading-[0.85] first-letter:font-bold first-letter:text-forest">
                    {item.text}
                  </p>

                
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={220}>
            <Link
              href="/publications"
              className="group inline-flex items-center gap-3 rounded-full bg-gold text-forest text-sm font-semibold px-8 py-4 mt-16 hover:bg-primary transition-colors"
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
    </main>
  );
}

