import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Explore from "@/components/Explore";
import { homeQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";

export default async function Home() {
  const homeData = await fetchSanity(homeQuery);

  return (
    <main>
      <section id="home">
        <Hero data={homeData} />
      </section>
      <section id="about">
        <About data={homeData} />
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
