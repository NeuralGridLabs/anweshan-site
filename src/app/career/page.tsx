import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Mail, ArrowUpRight, MapPin, Clock } from "lucide-react";
import Reveal from "@/components/Reveal";

/* Placeholder vacancies for layout purposes. Replace with real
   postings, including a closing date, before publishing. */
const vacancies = [
  {
    id: "01",
    title: "Clinical Research Associate",
    group: "Clinical",
    type: "Full time",
    location: "Lalitpur, with field travel",
    closes: "Rolling",
    summary:
      "Support trial delivery across study sites, from participant recruitment and informed consent through to GCP-compliant source data verification.",
  },
  {
    id: "02",
    title: "Research Officer, Qualitative",
    group: "Research",
    type: "Full time",
    location: "Lalitpur",
    closes: "Rolling",
    summary:
      "Design and run focus group discussions and in-depth interviews, lead coding and thematic analysis, and draft findings chapters.",
  },
  {
    id: "03",
    title: "Data Manager",
    group: "Data",
    type: "Full time",
    location: "Lalitpur",
    closes: "Rolling",
    summary:
      "Own study databases end to end: schema design, validation rules, quality assurance routines, and analysis-ready extracts.",
  },
  {
    id: "04",
    title: "Monitoring and Evaluation Officer",
    group: "Research",
    type: "Contract",
    location: "Lalitpur, with provincial travel",
    closes: "Rolling",
    summary:
      "Build indicator frameworks, run routine data quality assessments, and produce evaluation reporting for programme partners.",
  },
  {
    id: "05",
    title: "Health Communication Designer",
    group: "Communications",
    type: "Full time",
    location: "Lalitpur",
    closes: "Rolling",
    summary:
      "Turn research findings into infographics, factsheets, and motion pieces for government and development partners.",
  },
  {
    id: "06",
    title: "Field Research Enumerator",
    group: "Research",
    type: "Short term",
    location: "Multiple districts",
    closes: "Rolling",
    summary:
      "Collect household and facility data on assigned surveys, working to sampling protocols under a field supervisor.",
  },
];

const checklist = [
  "Your CV and current position",
  "The role and research area you are applying for",
  "Relevant field, clinical, or analysis experience in Nepal",
  "Earliest availability",
];

export default function CareerPage() {
  return (
    <main className="min-h-screen bg-paper">
      <PageHeader
        tone="primary"
        eyebrow="Work with us"
        title="Work with a team committed to evidence."
        lead="Anweshan is a contemporary issue focused research organization of highly motivated young professionals seeking to contribute to the wellbeing of poor, vulnerable and marginalized people."
        image="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000"
        imageAlt="Colleagues working together"
        meta={[
          { label: "Open roles", value: "6" },
          { label: "Practice groups", value: "6" },
          { label: "Team size", value: "34" },
          { label: "Based in", value: "Lalitpur" },
        ]}
      />

      {/* Vacancies */}
      <section className="bg-paper py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
            <div className="md:col-span-7">
              <p className="text-primary eyebrow mb-6 text-base">Current openings</p>
              <h2 className="h2-section text-base-text">Six roles open across the practice.</h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 flex md:items-end">
              <p className="text-base-text/55 body-base">
                Applications are reviewed as they arrive. If nothing here fits, send a speculative
                application and we will keep it on file.
              </p>
            </div>
          </div>

          <ul className="border-t border-accent-dark/15">
            {vacancies.map((role, i) => (
              <Reveal key={role.id} delay={i * 70}>
                <li>
                  <a
                    href={`mailto:info@anweshan.org?subject=${encodeURIComponent(
                      "Application: " + role.title
                    )}`}
                    className="group grid grid-cols-12 items-start gap-4 md:gap-8 py-8 border-b border-accent-dark/15 hover:bg-accent-dark/[0.04] transition-colors"
                  >
                    <span className="col-span-2 md:col-span-1 text-base-text/30 text-xs font-semibold tabular-nums pt-1.5">
                      {role.id}
                    </span>

                    <span className="col-span-10 md:col-span-5">
                      <span className="block h3-card text-base-text group-hover:text-accent-dark transition-colors">
                        {role.title}
                      </span>
                      <span className="block text-base-text/75 body-base mt-2 max-w-md">
                        {role.summary}
                      </span>
                    </span>

                    <span className="col-span-12 md:col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 md:pt-1.5">
                      <span className="inline-flex items-center gap-2 text-base-text/75 text-sm font-medium">
                        <MapPin size={13} className="text-accent-dark" />
                        {role.location}
                      </span>
                      <span className="inline-flex items-center gap-2 text-base-text/75 text-sm font-medium">
                        <Clock size={13} className="text-accent-dark" />
                        {role.type}
                      </span>
                    </span>

                    <span className="col-span-12 md:col-span-2 flex md:justify-end md:pt-1">
                      <span className="inline-flex items-center gap-2 text-base font-semibold text-base-text group-hover:text-accent-dark transition-colors">
                        Apply
                        <ArrowUpRight
                          size={16}
                          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        />
                      </span>
                    </span>
                  </a>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal>
            <p className="text-base-text/40 text-md mt-8">
              These listings are placeholders for layout review and are not live vacancies.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Applying */}

      <section className="bg-mist py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1400"
                alt="Research team at work"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="text-primary-dark eyebrow mb-6 text-base">How to apply</p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="h2-section text-base-text mb-10">
                Send us four things and we will take it from there.
              </h2>
            </Reveal>

            <ul className="border-t border-accent-dark/15 mb-10">
              {checklist.map((item, i) => (
                <Reveal key={item} delay={140 + i * 70}>
                  <li className="flex gap-5 py-4 border-b border-accent-dark/15">
                    <span className="text-accent-dark text-xs font-semibold tabular-nums pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base-text/75 body">{item}</span>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={400}>
              <a
                href="mailto:info@anweshan.org?subject=Speculative%20application"
                className="group inline-flex items-center gap-3 rounded-full bg-accent text-forest text-sm font-semibold px-8 py-4 hover:bg-primary transition-colors"
              >
                <Mail size={16} />
                Email info@anweshan.org
                <ArrowUpRight
                  size={16}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
