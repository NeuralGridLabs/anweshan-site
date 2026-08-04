import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <main>
      <TopBar />
      <Navbar />
      <section id="home"><Hero /></section>
      <section id="about"><About /></section>
      <section id="projects"><Projects /></section>
      <section id="publications"><div className="h-screen bg-primary-light flex items-center justify-center text-base-text/40">Publications coming soon</div></section>
      <section id="clients"><div className="h-screen bg-base flex items-center justify-center text-base-text/40">Clients coming soon</div></section>
      <section id="team"><div className="h-screen bg-primary-light flex items-center justify-center text-base-text/40">Team coming soon</div></section>
      <section id="career"><div className="h-screen bg-base flex items-center justify-center text-base-text/40">Career coming soon</div></section>
      <section id="contact"><div className="h-screen bg-primary-light flex items-center justify-center text-base-text/40">Contact coming soon</div></section>
    </main>
  );
}