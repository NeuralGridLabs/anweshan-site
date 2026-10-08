import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";

export type HomeServiceCard = {
  title: string;
  description?: string;
  link: string;
};

export default function HomeServiceCards({
  eyebrow,
  heading,
  cards,
}: {
  eyebrow?: string;
  heading?: string;
  cards: HomeServiceCard[];
}) {
  return (
    <section className="bg-snow py-20 md:py-28" aria-labelledby="home-services-heading">
      <div className="mx-auto max-w-[1400px] px-6">
        <Reveal>
          <p className="eyebrow mb-5 text-forest/70">{eyebrow || "Our services"}</p>
          <h2 id="home-services-heading" className="h2-section mb-10 text-forest text-balance">
            {heading || "Research and delivery across the study lifecycle."}
          </h2>
        </Reveal>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const external = /^https:\/\//i.test(card.link);
            return (
              <Reveal as="li" key={`${card.title}-${card.link}`} delay={(index % 3) * 70} className="h-full">
                <a
                  href={card.link || "/services"}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full min-h-56 flex-col rounded-2xl border border-forest/15 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-forest/35 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-snow"
                >
                  <h3 className="h3-card text-forest transition-colors group-hover:text-primary-dark">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="body-sm mt-4 text-forest/75">{card.description}</p>
                  )}
                  <span className="mt-auto flex justify-end pt-6 text-forest transition-transform group-hover:translate-x-1" aria-hidden="true">
                    <ArrowUpRight size={20} />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
