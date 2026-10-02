import PageHeader from "@/components/PageHeader";
import { Mail, ArrowUpRight, MapPin, Clock } from "lucide-react";

import Reveal from "@/components/Reveal";

import { careerQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import type { Career as CareerData } from "@/lib/types";

/** Display shape for the vacancy list. CMS records are mapped onto it. */
type Vacancy = {
  id?: string;
  title: string;
  group: string;
  type: string;
  location: string;
  closes?: string;
  summary: string;
};

const fallbackVacancies: Vacancy[] = [
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

export default async function CareerPage() {
  const sanityData = await fetchSanity<CareerData>(careerQuery);

  // Normalise CMS vacancies onto the display shape used by the list below:
  // the schema has no `id`, and stores the blurb as `description`.
  const vacancies: Vacancy[] = sanityData?.vacancies?.length
    ? sanityData.vacancies.map((v, i) => ({
        id: String(i + 1).padStart(2, "0"),
        title: v.title,
        summary: v.description ?? "",
        location: v.location ?? "",
        type: v.type ?? "",
        group: v.group ?? "",
      }))
    : fallbackVacancies;

  return (
    <main className="min-h-screen bg-paper">
      <PageHeader
        tone="primary"
        eyebrow="Work with us"
        title={sanityData?.heading || "Work with a team committed to evidence."}
        lead={
          sanityData?.intro ||
          "Anweshan is a contemporary issue focused research organization of highly motivated young professionals seeking to contribute to the wellbeing of poor, vulnerable and marginalized people."
        }
        plain
      />

      {/* Vacancies */}
      <section className="bg-paper py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
            <div className="md:col-span-7">
              <p className="text-primary eyebrow mb-6 text-base">
                Current openings
              </p>

              <h2 className="h2-section text-base-text">
                {vacancies.length} roles open across the practice.
              </h2>
            </div>

            <div className="md:col-span-4 md:col-start-9 flex md:items-end">
            
            </div>
          </div>

          <ul className="border-t border-accent-dark/15">
            {vacancies.map((role, i) => (
              <Reveal
                key={role.id || role.title}
                delay={i * 70}
              >
                <li>
                  <a
                    href={`mailto:info@anweshan.org?subject=${encodeURIComponent(
                      "Application: " + role.title
                    )}`}
                    className="group grid grid-cols-12 items-start gap-4 md:gap-8 py-8 border-b border-accent-dark/15 hover:bg-accent-dark/[0.04] transition-colors"
                  >
                    <span className="col-span-2 md:col-span-1 text-base-text/30 text-xs font-semibold tabular-nums pt-1.5">
                      {role.id || String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="col-span-10 md:col-span-5">
                      <span className="block h3-card text-base-text group-hover:text-accent-dark transition-colors">
                        {role.title}
                      </span>

                      <span className="block text-base-text/70 body-sm mt-2 max-w-2xl">
                        {role.summary}
                      </span>
                    </span>

                    <span className="col-span-12 md:col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 md:pt-1.5">
                      <span className="inline-flex items-center gap-2 text-base-text/75 text-base">
                        <MapPin
                          size={13}
                          className="text-accent"
                        />
                        {role.location}
                      </span>

                      <span className="inline-flex items-center gap-2 text-base-text/75 text-base">
                        <Clock
                          size={13}
                          className="text-accent"
                        />
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

          
        </div>
      </section>

      {/* Applying */}
      <section className="bg-mist py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Single column: the image that sat beside this is removed, so the
              checklist gets the full content width instead of a narrow column. */}
          <div className="max-w-3xl">
            <Reveal>
              <p className="text-primary-dark eyebrow mb-6 text-base">
                How to apply
              </p>
            </Reveal>

            <Reveal delay={90}>
              <h2 className="h2-section text-base-text mb-10">
                Send us four things and we will take it from there.
              </h2>
            </Reveal>

            <ul className="border-t border-accent-dark/15 mb-10">
              {checklist.map((item, i) => (
                <Reveal
                  key={item}
                  delay={140 + i * 70}
                >
                  <li className="flex gap-5 py-5 border-b border-accent-dark/15">
                    <span className="text-accent-dark text-sm font-semibold tabular-nums pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="text-base-text/80 body-lg">
                      {item}
                    </span>
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
                  className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"
                />
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}

