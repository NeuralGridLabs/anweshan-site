import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import Cutouts from "@/components/Cutouts";

type Member = { name: string; role: string; group: string; photo: string };

const team: Member[] = [
  { name: "Manish Gautam", role: "Managing Director", group: "Leadership", photo: "/images/team/manish-gautam.jpg" },
  { name: "Dharma Gautam", role: "Director", group: "Leadership", photo: "/images/team/dharma-gautam.jpg" },
  { name: "Sanju Maharjan", role: "Chairperson & Programme Director", group: "Leadership", photo: "/images/team/sanju-maharjan.jpg" },
  { name: "Dr. Niraj Poudyal", role: "Senior Research Advisor", group: "Research & Policy", photo: "/images/team/niraj-poudyal.jpg" },
  { name: "Dr. Binod Kumar Sah", role: "Senior Research Advisor", group: "Research & Policy", photo: "/images/team/binod-kumar-sah.jpg" },
  { name: "Bhogendra Raj Dotel", role: "Senior Health Systems Adviser", group: "Research & Policy", photo: "/images/team/bhogendra-raj-dotel.jpg" },
  { name: "Shanker Dev Kattel", role: "Health and Wellness Research Specialist", group: "Research & Policy", photo: "/images/team/shanker-dev-kattel.jpg" },
  { name: "Shreya Shrestha", role: "Research Coordinator", group: "Research & Policy", photo: "/images/team/shreya-shrestha.jpg" },
  { name: "Aayushi Thapa", role: "Sr. Qualitative Research Officer", group: "Research & Policy", photo: "/images/team/aayushi-thapa.jpg" },
  { name: "Kamal Ranabhat", role: "Sr. Project Officer", group: "Research & Policy", photo: "/images/team/kamal-ranabhat.jpg" },
  { name: "Samiksha Baral", role: "Research Officer", group: "Research & Policy", photo: "/images/team/samiksha-baral.jpg" },
  { name: "Shourya KC", role: "Research Associate", group: "Research & Policy", photo: "/images/team/shourya-kc.jpg" },
  { name: "Jamina Prajapati", role: "Research Associate", group: "Research & Policy", photo: "/images/team/jamina-prajapati.jpg" },
  { name: "Bipana Shrestha", role: "Research Associate", group: "Research & Policy", photo: "/images/team/bipana-shrestha.jpg" },
  { name: "Situ Manandhar", role: "Research Assistant", group: "Research & Policy", photo: "/images/team/situ-manandhar.jpg" },
  { name: "Juna Bhusal", role: "Research Assistant", group: "Research & Policy", photo: "/images/team/juna-bhusal.jpg" },
  { name: "Sudisha Shakya", role: "Research Assistant", group: "Research & Policy", photo: "/images/team/sudisha-shakya.jpg" },
  { name: "Pawan Pandeya", role: "Research Assistant", group: "Research & Policy", photo: "/images/team/pawan-pandeya.jpg" },
  { name: "Kirti Kaushal Joshi", role: "Lead Graphic Communications Advisor", group: "Communications & Technology", photo: "/images/team/kirti-kaushal-joshi.jpg" },
  { name: "Luniva Shakya", role: "Graphic Designer and Coordinator", group: "Communications & Technology", photo: "/images/team/luniva-shakya.jpg" },
  { name: "Madhu Sharma", role: "Full-Stack Developer", group: "Communications & Technology", photo: "/images/team/madhu-sharma.jpg" },
  { name: "Shreya Laxmi Tandukar", role: "Full-Stack Developer", group: "Communications & Technology", photo: "/images/team/shreya-laxmi-tandukar.jpg" },
  { name: "Sujal Yogi", role: "Full-Stack Developer", group: "Communications & Technology", photo: "/images/team/sujal-yogi.jpg" },
  { name: "Surendra Koirala", role: "Business Development Officer", group: "Programmes & Operations", photo: "/images/team/surendra-koirala.jpg" },
  { name: "Sabitra Acharya", role: "Admin & Finance Officer", group: "Programmes & Operations", photo: "/images/team/sabitra-acharya.jpg" },
  { name: "Manisha Budhathoki", role: "Programme Officer", group: "Programmes & Operations", photo: "/images/team/manisha-budhathoki.jpg" },
  { name: "Prakriti Maharjan", role: "Operations Associate", group: "Programmes & Operations", photo: "/images/team/prakriti-maharjan.jpg" },
  { name: "Supriya Bhushal", role: "Finance Assistant", group: "Programmes & Operations", photo: "/images/team/supriya-bhushal.jpg" },
  { name: "Krishna Khadka", role: "Data Coordinator", group: "Programmes & Operations", photo: "/images/team/krishna-khadka.jpg" },
  { name: "Akhilesh Mishra", role: "Data Associate", group: "Programmes & Operations", photo: "/images/team/akhilesh-mishra.jpg" },
  { name: "Prabin Parajuli", role: "Data Associate", group: "Programmes & Operations", photo: "/images/team/prabin-parajuli.jpg" },
  { name: "Anju Thapa", role: "Office Housekeeping Assistant", group: "Support Services", photo: "/images/team/anju-thapa.jpg" },
  { name: "Ganesh Rana Magar", role: "Office and Transport Assistant", group: "Support Services", photo: "/images/team/ganesh-rana-magar.jpg" },
  { name: "Chhatra Malla", role: "Office Assistant", group: "Support Services", photo: "/images/team/chhatra-malla.jpg" },
];

const groups = [
  { name: "Leadership", blurb: "Direction, partnerships, and institutional oversight that steers strategy." },
  { name: "Research & Policy", blurb: "Study design, qualitative and quantitative enquiry, evaluation, and policy analysis." },
  { name: "Programmes & Operations", blurb: "Programme management, finance, data, and partnerships that keep delivery running." },
  { name: "Communications & Technology", blurb: "Design, editorial, and digital development that power our communications." },
  { name: "Support Services", blurb: "Office administration and logistics that keep the organisation running smoothly." },
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
          { label: "Practice groups", value: "5" },
          { label: "Senior advisors", value: "3" },
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
                  <p className={`${dark ? "text-dark" : "text--dark"} whitespace-nowrap text-2xl md:text-3xl font-bold mb-4`}>
                    {group.name}
                  </p>
                  <p className={`${dark ?"text-forest/77" : "text-forest/75"} text-base md:text-lg leading-relaxed whitespace-nowrap`}>
                    {group.blurb}
                  </p>
                </div>
                <div className="md:col-span-8 flex md:justify-end md:items-end">
                  <p className={`${dark ? "text-forest/70" : "text-forest/70"} text-sm font-semibold tabular-nums`}>
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
                          className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
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
