import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

import { aboutQuery, homeQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityImageUrl } from "@/lib/image";
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

  const aboutImage =
    sanityImageUrl(aboutData?.image) ??
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2000";

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
        eyebrow="About us"
        title={aboutData?.heading || "Fostering evidence-based policy planning."}
        lead={homeData?.aboutBlurb || aboutData?.body || "Anweshan Private Limited is a contemporary issue focused research organization of a highly motivated team of young professionals committed to evidence based analysis regarding development challenges."}
        image={aboutImage}
        imageAlt="Research team working together"
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
            <p className="text-white eyebrow text-base mb-2">
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
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200"
                alt="Health worker in the field"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="text-forest eyebrow mb-8 text-base">
                Our mission
              </p>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-2xl md:text-4xl font-bold text-base-text leading-[1.22] tracking-tight mb-8">
                {mission}
              </p>
            </Reveal>

            <Reveal delay={180}>
              <p className="text-base-text/70 body-lg mb-8">
                We collaborate with governments, civil society, and the
                private sector to support policy development, strengthen
                health systems, and advance innovative financing and
                technological integration, addressing the underlying social
                determinants of health. Our work is grounded in principles
                of participation, ownership, and knowledge transfer,
                ensuring lasting impact for all stakeholders.
              </p>

              <p className="text-forest/70 eyebrow mb-6 text-base">
                Mission pillars
              </p>

              <ul className="flex flex-col gap-8">
                {pillars.map((pillar, i) => (
                  <li key={pillar.title ?? i} className="border-l-2 border-gold pl-5">
                    {pillar.title && (
                      <p className="text-lg md:text-xl font-bold text-forest mb-2">
                        {pillar.title}
                      </p>
                    )}
                    <p className="text-base-text/70 body-lg">{pillar.text}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="relative bg-ivory text-forest py-20 md:py-32 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-20">
            <div className="md:col-span-8">
              <p className="text-forest/70 eyebrow mb-6 text-base">
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

                  <p className="text-forest/60 body-sm max-w-md">
                    {item.note}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={220}>
            <Link
              href="/team"
              className="group inline-flex items-center gap-3 rounded-full bg-gold text-forest text-sm font-semibold px-8 py-4 mt-16 hover:bg-primary transition-colors"
            >
              Meet our team

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

