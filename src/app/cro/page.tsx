import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { CapabilityPackForm, FeasibilityForm } from "./CroEnquiryForms";

export const metadata: Metadata = {
  title: "Clinical research and CRO services in Nepal | Anweshan",
  description:
    "Country-level clinical and biomedical research support in Nepal, from feasibility and ethics coordination to site operations, data, quality and publication.",
  openGraph: {
    title: "Clinical research and CRO services in Nepal | Anweshan",
    description:
      "Country-level clinical and biomedical research support in Nepal, from feasibility and ethics coordination to site operations, data, quality and publication.",
    type: "website",
  },
};

const partners = [
  "Pharmaceutical and biotechnology companies exploring studies in Nepal",
  "Global and regional CROs seeking an accountable country partner",
  "Universities, hospitals and investigator-led research groups",
  "Vaccine, diagnostics, antimicrobial and public-health research programmes",
  "Foundations and product-development partnerships conducting implementation or real-world research",
];

const lifecycle = [
  ["Strategy and feasibility", "Country and site landscape review, epidemiological and care-pathway context, investigator and site outreach, operational feasibility, recruitment assumptions, cost and timeline inputs, and risk mapping."],
  ["Start-up, ethics and regulatory coordination", "Local document preparation, submission coordination, translation and back-translation, responses and version control, import or product-related coordination where applicable, and start-up tracking. Formal sponsor and investigator responsibilities remain clearly assigned."],
  ["Site identification and activation", "Site qualification support, workflow and resource assessment, study-team mapping, site agreements, initiation planning, training logistics and readiness documentation."],
  ["Participant and community materials", "Context-sensitive consent and participant materials, linguistic review, community engagement planning, recruitment communication and comprehension testing."],
  ["Study and field operations", "Country coordination, site support, study logistics, participant tracking processes, field-team deployment, training, documentation, issue escalation and operational reporting."],
  ["Data management and biostatistics", "Database and electronic data-capture support, data dictionaries, data-quality rules, cleaning, query management, statistical analysis and reproducible tables and outputs."],
  ["Monitoring and quality", "Risk-based monitoring support, source and process checks, deviation and issue tracking, corrective and preventive action support, essential-document control, audit readiness and quality reporting."],
  ["Safety and pharmacovigilance support", "Local safety workflow coordination, reporting pathways, reconciliation and follow-up support when the required qualified personnel, agreements and SOPs are in place."],
  ["Medical writing and publication", "Protocols, study reports, abstracts, manuscripts, evidence synthesis, submission support and public-facing research communication with transparent authorship."],
  ["Real-world and implementation research", "Post-introduction studies, health-facility research, service and pathway assessments, mixed-method implementation studies and evidence for scale-up."],
];

const experience = [
  ["SUSTAIN stepped-wedge cluster-randomised study in eight public hospitals", "Multi-site research, process evaluation and work within maternal/newborn care settings"],
  ["CAPTURA AMR work across 28 laboratories and more than 660,000 isolate records", "Site engagement, data transfer, large health datasets, curation, analysis and publication"],
  ["National abortion-incidence study covering 767 health facilities and 231 key informants", "Large multi-source reproductive-health research and national coordination"],
  ["Ear and hearing study in Karnali with 1,946 participants in the analysed sample", "Community-based biomedical assessment, field quality and peer-reviewed publication"],
  ["Eye-care analysis using 43,848 records from 23 hospitals across seven provinces", "Multi-site secondary data analysis and real-world service evidence"],
  ["Health-facility assessments, hospital readiness work and digital-health assignments", "Operational research across facilities, workflows, systems and users"],
];

const areas = [
  "Maternal, newborn and reproductive health",
  "Vaccines, infectious disease and outbreak response",
  "Antimicrobial resistance and antimicrobial use",
  "Eye, ear, hearing and disability research",
  "Health systems, digital health and implementation science",
  "Cancer-care access and noncommunicable disease",
  "Migration health and occupational health",
];

export default function CroPage() {
  return (
    <main className="min-h-screen bg-snow text-forest">
      <PageHeader
        tone="primary"
        eyebrow="Clinical research in Nepal"
        title="A country-level research partner built for rigorous delivery"
        lead="Anweshan supports pharmaceutical, biotech, global CRO, academic and global-health partners with clinical and biomedical research in Nepal, from feasibility and ethics coordination through site operations, data, quality and publication support."
        plain
        stacked
      />

      <div className="bg-ivory py-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 sm:flex-row">
          <a href="#enquiry" className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">Discuss a study in Nepal</a>
          <a href="#capability-pack" className="inline-flex min-h-12 items-center justify-center rounded-full border border-forest/25 px-6 py-3 text-sm font-semibold text-forest transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">Request our capability pack</a>
        </div>
      </div>

      <section className="bg-snow py-20 md:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-6 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-5"><p className="eyebrow mb-5 text-forest">Why Nepal and why Anweshan</p><h2 className="h2-section text-balance">Research shaped by local realities.</h2></Reveal>
          <Reveal delay={100} className="md:col-span-7"><p className="body-lg text-forest/75">Nepal offers diverse study settings, established referral hospitals, experienced clinicians and important unanswered questions across infectious disease, maternal and newborn health, reproductive health, noncommunicable disease, antimicrobial resistance, disability and implementation science. Successful research here depends on more than access to sites. It requires a partner that understands national institutions, ethics and regulatory pathways, hospital workflows, language, field logistics, data conditions and community expectations. Anweshan brings those pieces together through a Nepal-based multidisciplinary team and a growing business-development presence in Basel.</p></Reveal>
        </div>
      </section>

      <section className="bg-sage py-20 md:py-28" aria-labelledby="partners-heading">
        <div className="mx-auto max-w-[1400px] px-6"><Reveal><p className="eyebrow mb-5">Who we work with</p><h2 id="partners-heading" className="h2-section mb-12">A practical partner for different research teams.</h2></Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{partners.map((partner, i) => <Reveal as="li" key={partner} delay={(i % 3) * 70} className="rounded-2xl border border-forest/15 bg-white p-6 body text-forest">{partner}</Reveal>)}</ul>
        </div>
      </section>

      <section className="bg-snow py-20 md:py-28" aria-labelledby="lifecycle-heading">
        <div className="mx-auto max-w-[1100px] px-6"><Reveal><p className="eyebrow mb-5">Support across the study lifecycle</p><h2 id="lifecycle-heading" className="h2-section mb-12">Coordinated support from first questions to shared findings.</h2></Reveal>
          <ol className="border-l border-forest/20">{lifecycle.map(([title, text], i) => <Reveal as="li" key={title} delay={(i % 4) * 45} className="relative pb-10 pl-8 last:pb-0"><span aria-hidden="true" className="absolute -left-[13px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-forest">{i + 1}</span><h3 className="h3-card mb-3">{title}</h3><p className="body text-forest/75">{text}</p></Reveal>)}</ol>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28" aria-labelledby="experience-heading">
        <div className="mx-auto max-w-[1400px] px-6"><Reveal><p className="eyebrow mb-5">Experience that supports this direction</p><h2 id="experience-heading" className="h2-section mb-12">Relevant experience across studies, sites and datasets.</h2></Reveal>
          <div className="grid gap-4 md:grid-cols-2">{experience.map(([evidence, demonstrates], i) => <Reveal key={evidence} delay={(i % 2) * 70} className="rounded-2xl border border-forest/15 bg-white p-6"><p className="eyebrow mb-3 text-forest/60">Evidence</p><h3 className="mb-5 text-lg font-bold leading-snug">{evidence}</h3><p className="border-t border-forest/15 pt-4 body-sm text-forest/75"><span className="font-semibold text-forest">What it demonstrates: </span>{demonstrates}</p></Reveal>)}</div>
        </div>
      </section>

      <section className="bg-snow py-20 md:py-28" aria-labelledby="areas-heading">
        <div className="mx-auto max-w-[1400px] px-6"><Reveal><p className="eyebrow mb-5">Areas of experience</p><h2 id="areas-heading" className="h2-section mb-10">Questions that matter across Nepal.</h2></Reveal>
          <ul className="flex flex-wrap gap-3">{areas.map((area) => <li key={area} className="rounded-full border border-forest/20 bg-white px-5 py-3 text-sm font-medium">{area}</li>)}</ul>
        </div>
      </section>

      <section className="bg-sage py-20 md:py-28" aria-labelledby="quality-heading">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-6 md:grid-cols-12 md:gap-12"><Reveal className="md:col-span-5"><p className="eyebrow mb-5">Quality and compliance</p><h2 id="quality-heading" className="h2-section">Clear responsibilities. Traceable decisions.</h2></Reveal><div className="space-y-6 md:col-span-7"><Reveal delay={80}><p className="body-lg text-forest/75">Quality is designed into the study from the beginning. We define responsibilities, document workflows, control versions, train teams, monitor critical processes and keep decisions traceable. Study-specific quality arrangements are aligned with the protocol, sponsor requirements, applicable ethics and regulatory approvals, data-protection obligations and recognised good clinical practice principles.</p></Reveal><Reveal delay={160}><p className="body-lg text-forest/75">Before an engagement begins, we agree the oversight model, data flows, escalation routes, safety responsibilities, essential documents and quality indicators. Where a function requires a licensed or qualified role, we identify and document that responsibility rather than implying it is covered by a general project team.</p></Reveal></div></div>
      </section>

      <section className="bg-forest py-20 text-white md:py-28" aria-labelledby="basel-heading">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-6 md:grid-cols-12 md:gap-12"><Reveal className="md:col-span-6"><p className="eyebrow mb-5 text-white/75">Basel to Nepal</p><h2 id="basel-heading" className="h2-section">A direct bridge between European sponsors and research delivery in Nepal</h2></Reveal><Reveal delay={100} className="md:col-span-6 md:pt-2"><p className="body-lg text-white/80">Anweshan&apos;s presence in Basel creates a practical point of contact for European life-sciences and research organisations considering Nepal. Sponsors can discuss feasibility, quality expectations and partnership structures in Europe while working with an established Nepal-based team for country intelligence, stakeholder coordination and delivery. The purpose is simple: reduce the distance between sponsor expectations and the realities that determine study performance on the ground.</p></Reveal></div>
      </section>

      <section id="enquiry" className="scroll-mt-24 bg-snow py-20 md:py-28" aria-labelledby="enquiry-heading">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-12"><div className="lg:col-span-5"><Reveal><p className="eyebrow mb-5">Study feasibility enquiry</p><h2 id="enquiry-heading" className="h2-section mb-6">Planning a study in Nepal?</h2><p className="body text-forest/75">Send us the protocol synopsis, target population, site assumptions and expected timeline. We will respond with the questions needed for a focused feasibility discussion.</p></Reveal></div><Reveal delay={100} className="lg:col-span-7"><div className="rounded-2xl border border-forest/15 bg-sage/50 p-6 md:p-8"><FeasibilityForm /></div></Reveal></div>
      </section>

      <section id="capability-pack" className="scroll-mt-24 bg-ivory py-20 md:py-24" aria-labelledby="capability-heading">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 md:grid-cols-2"><Reveal><p className="eyebrow mb-5">Capability pack</p><h2 id="capability-heading" className="h2-section mb-5">Request our capability pack.</h2><p className="body text-forest/75">Tell us a little about your organisation and how you plan to use the pack. We will follow up by email.</p></Reveal><Reveal delay={100}><div className="rounded-2xl border border-forest/15 bg-white p-6 md:p-8"><CapabilityPackForm /></div></Reveal></div>
      </section>
    </main>
  );
}
