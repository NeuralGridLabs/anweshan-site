import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

const services = [
  {
    id: "01",
    title: "Clinical Research Services: A Full-Spectrum CRO in Nepal",
    summary:
      "Anweshan is Nepal's leading Clinical Research Organization, offering full-spectrum support for ethical and high-quality clinical research, from protocol development and regulatory approvals with the Nepal Health Research Council (NHRC) and the Department of Drug Administration (DDA), to site management, participant recruitment, GCP-compliant monitoring, data management, and pharmacovigilance.",
    items: [
      "NHRC ethical approval",
      "DDA trial registration",
      "Site and IRB permissions",
      "Feasibility assessment",
      "GCP training",
      "Participant recruitment",
      "Trial monitoring",
      "Pharmacovigilance",
    ],
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200",
    bg: "bg-forest",
    text: "text-white",
    chip: "border-white/25 text-white/90",
    label: "text-ivory",
  },
  {
    id: "02",
    title: "Q-Squared Research",
    summary:
      "Our firm specializes mainly in Quantitative and Qualitative (Q-squared) research and surveys. Monitoring and Evaluation also lies in our area of specialization, alongside socio-economic mapping and poverty analysis.",
    items: [
      "Census surveys",
      "Randomized Control Trials",
      "Monitoring & Evaluation",
      "CAPI and PAPI questionnaires",
      "Online surveys",
      "In-Depth Interviews",
      "Key Informant Interviews",
      "Focus Group Discussions",
      "Thematic analysis",
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200",
    bg: "bg-cream",
    text: "text-forest",
    chip: "border-forest/25 text-forest/80",
    label: "text-forest",
  },
  {
    id: "03",
    title: "Research and Policy Dialogue in Nepal",
    summary:
      "Policy dialogue is a vehicle through which people can be helped to see problems and issues in society from different perspectives. It intends to identify areas and gaps in the health and development sector where it is in the best interest of all to make improvements and reforms.",
    items: [
      "Multi-stakeholder platforms",
      "Advocacy and reform agendas",
      "Health, education and economy policy",
      "Academic scholarship support",
    ],
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
    bg: "bg-ivory",
    text: "text-forest",
    chip: "border-forest/25 text-forest/80",
    label: "text-forest",
  },
  {
    id: "04",
    title: "Health and Development Communication",
    summary:
      "Anweshan works in designing and drafting communication research plans and communication strategy. We help our clients disseminate their information through the most appropriate mediums.",
    items: [
      "2D animation",
      "Infographic design",
      "Communication strategy",
      "Audio-visual content",
      "Documentary making",
      "Content branding",
    ],
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
    bg: "bg-snow",
    text: "text-forest",
    chip: "border-forest/25 text-forest/80",
    label: "text-forest",
  },
  {
    id: "05",
    title: "Information Technology",
    summary:
      "Information Technology Services provides innovative, customer-focused and issue-orientated solutions that enable academicians and the general public to pursue excellence in research, education, health and development.",
    items: [
      "Web-based evaluation tools",
      "GIS mapping",
      "Educational modules",
      "Web-based RDQA tool",
      "Electronic Health Records",
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    bg: "bg-forest",
    text: "text-white",
    chip: "border-white/25 text-white/90",
    label: "text-ivory",
  },
  {
    id: "06",
    title: "Political Economic Analysis",
    summary:
      "Anweshan conducts political economy analysis to help clients understand how particular institutions, cultures, incentives, political motives and actions shape their intended project development and implementation.",
    items: [
      "Interest and incentive mapping",
      "Power distribution analysis",
      "Stakeholder engagement strategy",
      "Pre-implementation assessment",
    ],
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200",
    bg: "bg-cream",
    text: "text-forest",
    chip: "border-forest/25 text-forest/80",
    label: "text-forest",
  },
];

const blackSummaryIds = ["02", "03", "04", "06"];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-snow">
      <PageHeader
        tone="primary"
        eyebrow="What we do"
        title="Six practices, one evidence pipeline."
        lead="From full-spectrum clinical research to communication design and political economy analysis, Anweshan supports the whole arc from research question to policy decision."
        image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000"
        imageAlt="Clinical research laboratory"
        meta={[
          { label: "Service areas", value: "6" },
          { label: "Trial phases", value: "4" },
          { label: "Regulators", value: "2" },
          { label: "Standard", value: "GCP" },
        ]}
      />

      {services.map((service, i) => (
        <section key={service.id} className={`${service.bg} ${service.text}`}>
          <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-28">
            <div
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                i % 2 === 1 ? "lg:[direction:rtl]" : ""
              }`}
            >
              <Reveal className={`lg:col-span-5 ${i % 2 === 1 ? "lg:[direction:ltr]" : ""}`}>
                <div className="relative aspect-[5/4] rounded-2xl overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <div className={`lg:col-span-6 ${i % 2 === 1 ? "lg:col-start-7 lg:[direction:ltr]" : "lg:col-start-7"}`}>
                <Reveal>
                  <div className="flex items-center gap-4 mb-7">
                    <span className={`text-sm font-semibold ${service.label}`}>{service.id}</span>
                  </div>
                </Reveal>

                <Reveal delay={90}>
                  <h2 className="h2-section mb-7">
                    {service.title}
                  </h2>
                </Reveal>

                <Reveal delay={150}>
                  <p className={`text-sm md:text-base leading-relaxed mb-9 ${blackSummaryIds.includes(service.id) ? "text-black" : ""}`}>
                    {service.summary}
                  </p>
                </Reveal>

                <Reveal delay={210}>
                  <ul className="flex flex-wrap gap-2.5">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className={`border ${service.chip} text-xs font-medium px-4 py-2 rounded-full`}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
