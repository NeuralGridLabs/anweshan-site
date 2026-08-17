import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import ClientMarquee from "@/components/ClientMarquee";

type Client = { name: string; work: string[]; sector: string };

const clients: Client[] = [
  { name: "Ministry of Health", sector: "Government", work: ['Report: "Respond and Beyond: The Road to Resilience"', "Photo story book: Earthquake 2015 Health Sector Response and Lessons", "Reference material to build resilient health systems", "Electronic Health Record (EHR) System", "HMIS e-reporting workshop"] },
  { name: "World Health Organization", sector: "Multilateral", work: ["DIY video", "2D animation video", "AMR website", "Information book", "Awareness video and standee"] },
  { name: "UNICEF", sector: "Multilateral", work: ["Case studies", "Infographics designing and development"] },
  { name: "UNDP", sector: "Multilateral", work: ["Report preparation", "Editing and finalizing"] },
  { name: "GiZ S2HSP", sector: "Bilateral", work: ["Web-based RDQA tool", "Workshop: Health Management Information System", "Municipality factsheets for the CD-MUN unit", "Editing and design of GiZ RAS II publications"] },
  { name: "Pfizer", sector: "Private sector", work: ["Hand-in-Hand: engaging physicians, nurses, pharmacists and communities on rational antibiotic use", "Antimicrobial Stewardship Project at Sukraraj Tropical & Infectious Disease Hospital and Ilam Hospital since 2022", "Nationwide mystery client survey of antimicrobial use"] },
  { name: "International Vaccine Institute", sector: "Research", work: ["Data management and collection support for over 600,000 retrospective AMR and AMU records from 28 hospitals and laboratories across Nepal"] },
  { name: "USAID and CARE Nepal", sector: "Bilateral", work: ["Field supervision and training to map ARH/FP services by municipality (January - June 2023)", "Identifying gaps to inform USAID ARH/QI strategy and priorities"] },
  { name: "Bournemouth University", sector: "Academic", work: ["Assessing effectiveness of health components of pre-departure orientation training for aspiring Nepali migrants"] },
  { name: "BBC Media Action", sector: "Media", work: ["Qualitative research on FCHV communication and community engagement, exploring mobile phones as a job aid", "Training on formative research methods for FCHV engagement"] },
  { name: "Health Emergency Operation Center", sector: "Government", work: ["Support to HEOC as secretariat of the Ministry of Health and Population during health emergencies and disasters"] },
  { name: "NHSSP", sector: "Programme", work: ["Reference material development", "Designing the EHR system", "Feasibility study: Support from the Distance"] },
  { name: "Golden Community", sector: "NGO", work: ["Focus group discussions and semi-structured interviews", "Feasibility and applicability assessment", "Decipherable data construction"] },
  { name: "Helen Keller International", sector: "INGO", work: ["Advocacy paper on the Integrated Nutrition Program for local government"] },
  { name: "HERD", sector: "Research", work: ["No Longer Lean and Thin: case studies on MSNP"] },
  { name: "Plan International", sector: "INGO", work: ["Development and humanitarian work advancing children's rights and equality for girls"] },
  { name: "Tilganga Institute of Ophthalmology", sector: "Health institution", work: ["SHAPU factsheet"] },
  { name: "DanChurchAid", sector: "INGO", work: ["Designing visibility material for the DRR programme"] },
  { name: "Nepal Tea Board", sector: "Government", work: ["Magazine for the Tea Festival", "Report for the Third International Tea Conference"] },
  { name: "DFID", sector: "Bilateral", work: ["Multiple infographics related to water, sanitation and hygiene"] },
  { name: "FEDO", sector: "NGO", work: ["Quantitative baseline survey and data management"] },
  { name: "NCDC", sector: "Government", work: ["Quantitative baseline survey and data management"] },
  { name: "JICA", sector: "Bilateral", work: ["Leaflet designing and production"] },
];

export default function ClientsPage() {
  return (
    <main className="min-h-screen bg-snow">
      <PageHeader
        tone="sand"
        eyebrow="Our clients"
        title="Anweshan has worked with a wide range of clients."
        lead="Government bodies, UN agencies, universities, and international organisations across development research, information technology, and communications."
        image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=2000"
        imageAlt="Partners in discussion"
        meta={[
          { label: "Clients", value: "23" },
          { label: "UN agencies", value: "3" },
          { label: "AMR records", value: "600000" },
          { label: "Hospitals & labs", value: "28" },
        ]}
      />

      <ClientMarquee />

      <section className="bg-snow py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-forest text-[14px] font-semibold tracking-[0.18em] uppercase mb-4">
              Selected partners
            </p>
            <h2 className="h2-section text-forest">
              Organisations we have delivered for.
            </h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {clients.map((client, i) => {
              const band = ["bg-mint", "bg-sage", "bg-jade", "bg-aqua", "bg-teal", "bg-cream"][i % 6];
              return (
              <Reveal as="li" key={client.name} delay={(i % 4) * 80}>
                <article className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-forest/10 hover:border-forest/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-400">
                  <div className={`relative h-12 ${band} flex items-center px-4`}>
                    <span className="text-forest text-[12px] font-bold tracking-[0.16em] uppercase">
                      {client.sector}
                    </span>
                    <svg className="absolute -bottom-px left-0 w-full h-3 text-white" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M0,16 C70,2 140,16 210,6 C280,-3 350,14 400,8 L400,16 Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="p-5 flex flex-col h-full">
                    <h2 className="text-[18px] leading-snug font-semibold text-forest mb-3">
                      {client.name}
                    </h2>
                    <ul className="space-y-2 mt-auto">
                      {client.work.slice(0, 4).map((item) => (
                        <li key={item} className="flex gap-2 text-forest/70 text-[14px] leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full bg-forest/40 mt-1.5 shrink-0 group-hover:bg-gold transition-colors duration-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {client.work.length > 4 && (
                      <p className="mt-2 text-[13px] text-forest/50">+{client.work.length - 4} more</p>
                    )}
                  </div>
                </article>
              </Reveal>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
