import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Explore from "@/components/Explore";

import { homeQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";

type HomeData = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubtext?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  slides?: {
    image: string;
    label: string;
  }[];
};

export default async function Home() {
  const rawHomeData = await fetchSanity(homeQuery);

  const homeData = rawHomeData as HomeData | undefined;

  return (
    <main>
      <section id="home">
        <Hero data={homeData} />
      </section>

      <section id="about">
        <About />
      </section>

      <section id="projects">
        <Projects />
      </section>

      <section id="explore">
        <Explore />
      </section>
    </main>
  );
}