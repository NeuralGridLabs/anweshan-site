import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import Reveal from "@/components/Reveal";
import type { ResolvedProject } from "@/lib/project-data";

/* --------------------------------------------------------------------------
   Anweshan-built platforms

   Distinct from the research work above: these are products the in-house IT
   team designed, built and operates, so they are labelled as such rather than
   presented as studies. Each links out to its live destination.
   ----------------------------------------------------------------------- */

export default function Platforms({ platforms }: { platforms: ResolvedProject[] }) {
  if (platforms.length === 0) return null;

  return (
    <section className="relative bg-sage py-20 md:py-28">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <Reveal>
<h2 className="h2-section text-forest mt-4 max-w-[20ch] text-balance">
  Anweshan IT
</h2>
          <p className="body-lg text-forest/75 mt-5 max-w-[62ch]">
            Alongside our research practice, our in-house IT team designs, builds
            and runs digital products for health programmes, hospitals and field
            teams across Nepal.
          </p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map((platform, i) => {
            const href = platform.externalUrl ?? `/projects/${platform.slug}`;

            return (
              <Reveal as="li" key={platform.key} delay={(i % 3) * 110}>
                <a
                  href={href}
                  {...(platform.externalUrl
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 focus-visible:-translate-y-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-sage"
                >
                  <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
                    {platform.cover ? (
                      <Image
                        src={platform.cover}
                        alt={platform.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                        draggable={false}
                        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-mint/50 text-forest/30">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <circle cx="9" cy="10" r="2" />
                          <path d="m21 16-5-5L5 20" />
                        </svg>
                      </div>
                    )}

                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-base-text text-[11px] font-semibold tracking-wide px-3.5 py-1.5 rounded-full">
                      {platform.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <h3 className="h3-card text-base-text mb-3 group-hover:text-forest transition-colors">
                      {platform.title}
                    </h3>

                    <p className="body-sm text-base-text/75 line-clamp-4 mb-6">
                      {platform.summary}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-5 border-t border-forest/15">
                      <span className="meta-label text-base-text/55 truncate">
                        {platform.client}
                      </span>

                      <span className="shrink-0 p-2.5 rounded-full bg-forest/5 text-forest group-hover:bg-gold group-hover:text-forest transition-colors">
                        <ArrowUpRight size={18} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
