import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import Cutouts from "@/components/Cutouts";

/* Photographs are placeholder portraits pending real staff photography.
   Replace the photo field with /images/team/<name>.jpg once supplied. */
type Member = { name: string; role: string; group: string; photo: string };

const team: Member[] = [
  { name: "Manish Gautam", role: "Managing Director", group: "Leadership", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Dharma Gautam", role: "Director", group: "Leadership", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Dr. Niraj Poudyal", role: "Senior Research Advisor", group: "Research", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Dr. Binod Kumar Sah", role: "Senior Research Advisor", group: "Research", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Bhogendra Raj Dotel", role: "Senior Health Systems Adviser", group: "Research", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Kaushal Joshi", role: "Lead Graphic Communications Advisor", group: "Communications", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Shanker Dev Kattel", role: "Health and Wellness Research Specialist", group: "Research", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Manisha Budhathoki", role: "Research Officer", group: "Research", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Sanju Maharjan", role: "Programme Manager", group: "Operations", photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Palistha Bajracharya", role: "Operations Manager", group: "Operations", photo: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Surendra Koirala", role: "Business Development Officer", group: "Operations", photo: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Sabitra Acharya", role: "Finance Officer", group: "Operations", photo: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Dr. Sunita Shrestha", role: "Clinical Research Physician", group: "Clinical", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Rajan Thapa", role: "Clinical Trial Manager", group: "Clinical", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Anita Gurung", role: "Clinical Research Associate", group: "Clinical", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Prakash Adhikari", role: "GCP Monitoring Officer", group: "Clinical", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Bimala Rai", role: "Pharmacovigilance Officer", group: "Clinical", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Dipesh Karki", role: "Regulatory Affairs Officer", group: "Clinical", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Sarita Tamang", role: "Site Coordinator", group: "Clinical", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Nabin Bhattarai", role: "Senior Data Manager", group: "Data", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Puja Sharma", role: "Data Analyst", group: "Data", photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Kiran Lama", role: "Database Developer", group: "Data", photo: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Sujata Pandey", role: "Statistician", group: "Data", photo: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Ramesh Magar", role: "GIS and Mapping Officer", group: "Data", photo: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Anjali Basnet", role: "Qualitative Research Officer", group: "Research", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Bikash Chaudhary", role: "Field Research Coordinator", group: "Research", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Nisha Khadka", role: "Research Assistant", group: "Research", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Suman Regmi", role: "Monitoring and Evaluation Officer", group: "Research", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Rekha Yadav", role: "Health Communication Officer", group: "Communications", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Aayush Shakya", role: "Multimedia and Motion Designer", group: "Communications", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Pratima Dahal", role: "Content and Editorial Lead", group: "Communications", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Milan Subedi", role: "Web and Systems Developer", group: "Communications", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Sneha Joshi", role: "Human Resources Officer", group: "Operations", photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=750" },
  { name: "Deepak Bhandari", role: "Logistics and Procurement Officer", group: "Operations", photo: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=600&h=750" },
];

const groups = [
  { name: "Leadership", blurb: "Direction, partnerships, and institutional oversight." },
  { name: "Research", blurb: "Study design, qualitative and quantitative enquiry, evaluation." },
  { name: "Clinical", blurb: "Trial delivery, GCP monitoring, regulatory and safety reporting." },
  { name: "Data", blurb: "Data management, analysis, statistics, and geospatial work." },
  { name: "Communications", blurb: "Design, editorial, motion, and digital systems." },
  { name: "Operations", blurb: "Programme management, finance, people, and logistics." },
];

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-snow">
      <PageHeader
        tone="ink"
        eyebrow="Our team"
        title="A highly motivated team of young professionals."
        lead="Researchers, clinicians, communications specialists, and operations staff committed to evidence based analysis of development challenges."
        image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
        imageAlt="Team collaborating in a meeting"
        meta={[
          { label: "Team members", value: "34" },
          { label: "Practice groups", value: "6" },
          { label: "Senior advisors", value: "4" },
          { label: "Based in", value: "Lalitpur" },
        ]}
      />

      {groups.map((group, gi) => {
        const members = team.filter((m) => m.group === group.name);
        if (!members.length) return null;
        const dark = gi % 2 === 1;

        return (
          <section
            key={group.name}
            className={`${dark ? "bg-sage text-forest" : "bg-snow text-forest"} py-16 md:py-24 relative overflow-hidden`}
          >
                    <Cutouts variant="team" />
            <div className="max-w-[1400px] mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
                <div className="md:col-span-4">
                  <p className={`${dark ? "text-forest" : "text-forest"} text-2xl md:text-3xl font-bold mb-4`}>
                    {group.name}
                  </p>
                  <p className={`${dark ?"text-forest/70" : "text-forest/55"} text-base md:text-lg leading-relaxed whitespace-nowrap`}>
                    {group.blurb}
                  </p>
                </div>
                <div className="md:col-span-8 flex md:justify-end md:items-end">
                  <p className={`${dark ? "text-forest/40" : "text-forest/30"} text-sm font-semibold tabular-nums`}>
                    {String(members.length).padStart(2, "0")}
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {members.map((person, i) => (
                  <Reveal as="li" key={person.name} delay={(i % 4) * 90}>
                    <article className="group">
                      <div className={`relative aspect-[4/5] rounded-xl overflow-hidden mb-4 ${dark ? "bg-forest/6" : "bg-mint/50"}`}>
                        <Image
                          src={person.photo}
                          alt={person.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 22vw"
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <h2 className={`text-base md:text-lg font-bold leading-tight tracking-tight ${dark ? "text-forest" : "text-forest"}`}>
                        {person.name}
                      </h2>
                      <p className={`body-sm mt-1 ${dark ? "text-forest/80" : "text-forest/60"}`}>
                        {person.role}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </main>
  );
}
