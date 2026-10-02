/* --------------------------------------------------------------------------
    Content manifest for the Anweshan -> Sanity production migration.

    This file is DATA ONLY. It is the single source of truth for what the
    import script plans to write, where each value came from in the frontend,
    and which fields are uncertain or unmapped. It never talks to Sanity.

    Rules honoured while building it:
      - Only factual / editorial content is included.
      - Layout, styling, counters and navigation labels are excluded.
      - Nothing is invented. Missing values are recorded as `missing` or
        `uncertain` rather than guessed.
      - Every record carries a `source` pointing at the file it was read from.

    Run order: scripts/sanity-import.mjs
   ----------------------------------------------------------------------- */

import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "..");

/** Resolve a repo-relative source path to an absolute one. */
export function src(rel) {
  return path.join(repoRoot, rel);
}

/* ---------------------------------------------------------------------- *
 * Stable document IDs
 *
 * Singletons reuse the exact ID their Desk structure item pins to
 * (sanity.config.ts pins each singleton's documentId to its type name), so a
 * seeded singleton is the same document an editor would open.
 *
 * Collections use a `type-` prefix plus a slugified natural key. Re-running the
 * import resolves to the same IDs, which is what makes the import idempotent.
 * ---------------------------------------------------------------------- */
export function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const SINGLETON_IDS = {
  siteSettings: "siteSettings",
  home: "home",
  about: "about",
  services: "services",
  clients: "clients",
  career: "career",
  contact: "contact",
};

export const projectIdFor = (slug) => `project-${slugify(slug)}`;
export const teamMemberIdFor = (name) => `team-${slugify(name)}`;
export const publicationIdFor = (title) => `publication-${slugify(title)}`;
export const galleryEventIdFor = (title) => `gallery-${slugify(title)}`;

/* ---------------------------------------------------------------------- *
 * Singletons
 * ---------------------------------------------------------------------- */

/**
 * About page copy that exists in the frontend but has no `about` schema field.
 * Recorded so the reviewer can see exactly what the CMS will NOT be able to
 * hold after this migration.
 */
export const UNMAPPED = [
  {
    what: "Mission paragraph on /about",
    where: "src/app/about/page.tsx:113-121",
    text: "We collaborate with governments, civil society, and the private sector to support policy development, strengthen health systems, and advance innovative financing and technological integration, addressing the underlying social determinants of health. Our work is grounded in principles of participation, ownership, and knowledge transfer, ensuring lasting impact for all stakeholders.",
    reason: "No `about` schema field. `about.mission` holds the short mission statement only.",
  },
  {
    what: "Two organisational objectives (01, 02)",
    where: "src/app/about/page.tsx:18-29",
    text: "01 To conduct contemporary research and foster evidence-based policy analysis, formulation and planning, and nurture an academic milieu. / 02 To be a leading communication research center that drives social action in the community.",
    reason: "No schema field. `about.missionPillars` is a different concept (2 pillars vs 2 objectives).",
  },
  {
    what: "Second About paragraph on the homepage",
    where: "src/components/About.tsx:45-47",
    text: "From clinical trials to nationwide household surveys, and from HPV vaccination research to community health toolkit deployments, our work spans the full spectrum of health research across Nepal.",
    reason: "Hardcoded, no CMS read path. `home.aboutBlurb` is a single `text` field.",
  },
  {
    what: "Social links (LinkedIn, Instagram, Facebook)",
    where: "src/lib/socials.ts:6-19",
    text: "https://www.linkedin.com/company/anweshan/ , https://www.instagram.com/anweshan_org/ , https://www.facebook.com/anweshanpvt/",
    reason: "No `siteSettings` field for social profiles. Rendered from hardcoded data by TopBar/Footer.",
  },
  {
    what: "YouTube channel link",
    where: "src/components/About.tsx:52",
    text: "https://www.youtube.com/@anweshan",
    reason: "Same as above. Not present in `socialLinks` either.",
  },
  {
    what: "Homepage Explore rail (3 items: Expertise / Projects / Team)",
    where: "src/components/Explore.tsx:9-40",
    text: "Captions and descriptions for the three explore cards, plus their Unsplash backgrounds.",
    reason: "No schema. `clients` is a client roster, not a nav/feature rail. Excluded as navigation content.",
  },
  {
    what: "Per-service bullet lists and card images (6 services)",
    where: "src/app/services/page.tsx:30-39,52-62,75-80,93-100,113-119,132-137",
    text: "e.g. 'NHRC ethical approval', 'Census surveys', 'Multi-stakeholder platforms' ... plus 6 Unsplash card images.",
    reason: "`services.items[]` has only title / description / icon. The bullets and the card image have nowhere to go.",
  },
  {
    what: "Application checklist (4 items)",
    where: "src/app/career/page.tsx:85-90",
    text: "Your CV and current position / The role and research area you are applying for / Relevant field, clinical, or analysis experience in Nepal / Earliest availability",
    reason: "`career` has heading, intro, vacancies[]. No checklist field.",
  },
  {
    what: "Vacancy `closes` value ('Rolling' on all 6)",
    where: "src/app/career/page.tsx:29,39,49,59,69,79",
    text: "Rolling",
    reason: "No `career.vacancies[].closes` field. Also never rendered in the frontend.",
  },
  {
    what: "Contact Mobile and Website rows",
    where: "src/app/contact/page.tsx:23-40",
    text: "Mobile 977-9801210115 / Website www.anweshan.org",
    reason: "`contact` has a single `phone` field and no website field. `phone` is set to the LANDLINE only; the mobile is NOT merged into it and the website is dropped. Both are still hardcoded in the frontend and will keep rendering there.",
  },
  {
    what: "Site-wide metadata (title, description)",
    where: "src/app/layout.tsx:14-15",
    text: "Anweshan - Redefining Research / Clinical research, policy dialogue, and data-driven survey work across Nepal.",
    reason: "No schema. `siteSettings.tagline` is the closest field; the description is proposed there and flagged `uncertain`.",
  },
  {
    what: "'Working since 2017' badge",
    where: "src/components/About.tsx:32",
    text: "Working since 2017",
    reason: "No schema field. A founding-year fact with no home for it.",
  },
  {
    what: "Homepage About carousel images (about-01.jpg, about-02.jpg)",
    where: "src/components/AboutImages.tsx:12-15",
    text: "/images/about/about-01.jpg , /images/about/about-02.jpg",
    reason: "Not migrated. This is a standalone 2-image carousel with its own timing, not the `home.slides` array. `home.slides` is proposed only for the three hero captions, whose images are remote. The two local files are left on disk and unused by the migration rather than being forced into the wrong field.",
  },
  {
    what: "Header counters (team members / teams / advisors / based in)",
    where: "src/app/team/page.tsx:83-96",
    text: "Computed counts, e.g. 'Team members' -> 34, 'Based in' -> Lalitpur.",
    reason: "Deliberately NOT migrated. Counters are layout; the `Based in` fact has no field.",
  },
  {
    what: "Publication files / external URLs",
    where: "(no local source)",
    text: "None.",
    reason: "No publication data exists in the frontend. `publications` is skipped entirely.",
  },
  {
    what: "Gallery event photos",
    where: "(no local source)",
    text: "None.",
    reason: "No gallery data or imagery in `public/`. `galleryEvent` is skipped entirely.",
  },
];

/** Copy deliberately left out because it is layout / counters / nav. */
export const EXCLUDED_AS_LAYOUT = [
  { where: "src/app/globals.css", what: "Brand palette, type scale, keyframes, reveal/underline utilities." },
  { where: "src/components/Cutouts.tsx", what: "Decorative aria-hidden shapes." },
  { where: "src/components/Reveal.tsx", what: "IntersectionObserver reveal + transitionDelay." },
  { where: "src/components/NavLinks.tsx, src/components/Navbar.tsx", what: "Nav labels and menu structure." },
  { where: "src/components/Platforms.tsx:22-28", what: "'Anweshan IT' section copy. The 3 platform *projects* in src/lib/projects.ts ARE migrated as `project` docs; this section blurb is layout copy." },
  { where: "src/app/*/page.tsx (eyebrow/title/lead props)", what: "Page-header eyebrows are labels, not CMS fields. Only `heading`/`intro` on the singleton schemas are proposed, from the visible H1/lead." },
  { where: "src/components/Hero.tsx:50-57,128,144,158", what: "Slide timing, gradients, pill widths, progress maths." },
  { where: "src/components/AboutImages.tsx:17,70-107", what: "Carousel duration and opacity transitions." },
  { where: "src/components/ClientMarquee.tsx:81", what: "Marquee SPEED constant." },
  { where: "siteSettings.stats[]", what: "Headline stat band. Counters -> excluded per brief." },
];

/** Singletons that have no local source at all. */
export const SINGLETONS_WITH_NO_SOURCE = ["siteSettings", "home", "about", "services", "clients", "career", "contact"];

/* ---------------------------------------------------------------------- *
 * home
 * ---------------------------------------------------------------------- */
export const homePlan = {
  _id: SINGLETON_IDS.home,
  _type: "home",
  source: ["src/components/Hero.tsx:97,102,106-107,115,122", "src/components/About.tsx:43", "src/components/Hero.tsx:21-34"],
  doc: {
    heroEyebrow: "Field research in Nepal",
    heroHeading: "Research that moves health policy forward",
    heroSubtext:
      "Clinical trials, HPV vaccination studies, and nationwide household surveys that shape Nepal's health landscape.",
    primaryCtaLabel: "See our work",
    secondaryCtaLabel: "Our clients",
    aboutBlurb:
      "Anweshan Pvt. Ltd. is a multidisciplinary Clinical Research Organization and public health think tank based in Lalitpur, Nepal. We bring together researchers, clinicians, and policy experts to generate evidence that shapes health systems and improves lives.",
    /**
     * `slides` is DELIBERATELY NOT IMPORTED.
     *
     * src/app/page.tsx:36-41 maps each slide through `sanityImageUrl` and then
     * drops any slide whose image is falsy:
     *
     *     .map((slide) => ({ image: sanityImageUrl(slide.image) ?? "", ... }))
     *     .filter((slide) => slide.image !== "");
     *
     * The three hero images are hotlinked Unsplash URLs, which the owner
     * excluded. So a slide with only a `label` would be filtered straight out,
     * `slides` would arrive as `[]`, and Hero.tsx:42 would fall back to its
     * bundled DEFAULT_SLIDES. The labels would sit in the Studio looking
     * editable while never rendering anywhere.
     *
     * Writing them would be worse than leaving them out, so they are not
     * written. To make the hero slides editable in the Studio, real licensed
     * images have to be uploaded first; that is a separate task.
     */
  },
  uncertain: [
    "slides: NOT imported. The 3 hero images are hotlinked Unsplash URLs, excluded per the owner's decision. Because src/app/page.tsx:36-41 drops any slide without a resolvable image, a label-only slide would never render \u2014 Hero.tsx:42 would fall back to its bundled DEFAULT_SLIDES. Storing them would create data that looks editable in the Studio but is dead. Upload real slide images first, then re-run to import the labels.",
    "aboutBlurb vs About.tsx:46 second paragraph: only the first paragraph fits the single `aboutBlurb` field.",
  ],
  missing: ["slides (deliberately not imported \u2014 see the note above)"],
};

/* ---------------------------------------------------------------------- *
 * about
 *
 * DECISION (owner): leave the live `about` document entirely alone. The live
 * doc stores missionPillars as ONE pillar with both paragraphs joined; the
 * frontend has TWO. That split is an editorial decision the owner is making
 * separately in the Studio, so this migration plans no action on `about` at
 * all. Not even the empty fields are filled.
 * ---------------------------------------------------------------------- */
export const aboutPlan = {
  _id: SINGLETON_IDS.about,
  _type: "about",
  skipEntirely: true,
  source: ["src/lib/about.ts:16-30", "src/app/about/page.tsx:53"],
  doc: {},
  uncertain: [
    "No action planned. The live `about` document is treated as authoritative and is not touched, per the owner's decision.",
    "Its `missionPillars` stays as a single joined pillar; the two-pillar split from src/lib/about.ts is NOT applied.",
  ],
  missing: [
    "heading: still null in production (the owner chose to leave it; the /about page keeps its hardcoded fallback H1)",
    "body: still null in production",
    "image: still unset in production",
  ],
};

/* ---------------------------------------------------------------------- *
 * siteSettings
 * ---------------------------------------------------------------------- */
export const siteSettingsPlan = {
  _id: SINGLETON_IDS.siteSettings,
  _type: "siteSettings",
  source: ["src/components/Footer.tsx:67", "src/components/About.tsx:43", "src/app/layout.tsx:15"],
  doc: {
    orgName: "Anweshan Pvt. Ltd.",
    tagline: "Clinical research, policy dialogue, and data-driven survey work across Nepal.",
    logo: { __localFile: "public/images/logo.png", __alt: "Anweshan logo (dark)" },
    logoLight: { __localFile: "public/images/logo-light.png", __alt: "Anweshan logo (light)" },
  },
  uncertain: [
    "tagline: reused verbatim from the layout `description` (src/app/layout.tsx:15), which is the only short site-level line in the repo. Not a purpose-written tagline. Flagged as a candidate to rewrite.",
    "orgName: the repo spells the organisation three different ways \u2014 'Anweshan Pvt. Ltd.' (Footer.tsx:67, About.tsx:43), 'Anweshan Private Limited' (about/page.tsx:54), 'Anweshan' (contact/page.tsx:81). The Footer form is used.",
  ],
  missing: [],
  excluded: [
    "stats[]: excluded per brief (counters). Note the Team page header (src/app/team/page.tsx:83-96) still reads 'Based in: Lalitpur' \u2014 a real fact with no CMS home.",
    "social links: no schema field.",
  ],
};

/* ---------------------------------------------------------------------- *
 * services
 * ---------------------------------------------------------------------- */
/* Service copy now lives in the CMS and is maintained there.

   src/app/services/page.tsx no longer contains any service text: it renders
   whatever the `services` document holds. This manifest entry is retained only
   as the historical record of the copy that was originally migrated, and
   scripts/services-restore.mjs cross-checks against it.

   The live import for this type is scripts/services-import.mjs. */
export const SERVICES_SOURCE = "src/app/services/page.tsx (service text removed — now CMS-managed)";

export const servicesPlan = {
  _id: SINGLETON_IDS.services,
  _type: "services",
  source: [SERVICES_SOURCE, "src/app/services/page.tsx:179-184"],
  doc: {
    heading: "What we offer",
    intro:
      "From full-spectrum clinical research to communication design and political economy analysis, Anweshan supports the whole arc from research question to policy decision.",
    items: [
      {
        _key: "svc-01",
        title: "Clinical Research Services: A Full-Spectrum CRO in Nepal",
        description:
          "Anweshan is Nepal's leading Clinical Research Organization, offering full-spectrum support for ethical and high-quality clinical research, from protocol development and regulatory approvals with the Nepal Health Research Council (NHRC) and the Department of Drug Administration (DDA), to site management, participant recruitment, GCP-compliant monitoring, data management, and pharmacovigilance.",
        icon: null,
      },
      {
        _key: "svc-02",
        title: "Q-Squared Research",
        description:
          "Our firm specializes mainly in Quantitative and Qualitative (Q-squared) research and surveys. Monitoring and Evaluation also lies in our area of specialization, alongside socio-economic mapping and poverty analysis.",
        icon: null,
      },
      {
        _key: "svc-03",
        title: "Research and Policy Dialogue in Nepal",
        description:
          "Policy dialogue is a vehicle through which people can be helped to see problems and issues in society from different perspectives. It intends to identify areas and gaps in the health and development sector where it is in the best interest of all to make improvements and reforms.",
        icon: null,
      },
      {
        _key: "svc-04",
        title: "Health and Development Communication",
        description:
          "Anweshan works in designing and drafting communication research plans and communication strategy. We help our clients disseminate their information through the most appropriate mediums.",
        icon: null,
      },
      {
        _key: "svc-05",
        title: "Information Technology",
        description:
          "Information Technology Services provides innovative, customer-focused and issue-orientated solutions that enable academicians and the general public to pursue excellence in research, education, health and development.",
        icon: null,
      },
      {
        _key: "svc-06",
        title: "Political Economic Analysis",
        description:
          "Anweshan conducts political economy analysis to help clients understand how particular institutions, cultures, incentives, political motives and actions shape their intended project development and implementation.",
        icon: null,
      },
    ],
  },
  uncertain: [
    "items[].icon is null on all 6. The schema calls for a lucide icon *name* and the frontend has no per-service icon data. The frontend compensates by rendering the icon string as a chip (services/page.tsx:158). Not invented.",
    "heading / intro come from the page H1 and lead (services/page.tsx:180,181-184), which are page furniture rather than a dedicated CMS field. Flagged.",
  ],
  missing: ["items[].icon"],
};

/* ---------------------------------------------------------------------- *
 * clients
 * ---------------------------------------------------------------------- */
export const CLIENTS_SOURCE = "src/components/ClientMarquee.tsx:12-79";

/**
 * name -> local file. `short` wordmark fallback exists in the type but is unused.
 *
 * Each item carries the file as a nested `logo` image object, matching
 * sanity/schemaTypes/clients.ts:17-18 (`name` + `logo`). The `__localFile`
 * marker is resolved into a real Sanity asset reference by
 * scripts/sanity-import.mjs; it must not sit directly on the item.
 */
const client = (key, name, file, extra) => ({
  _key: key,
  name,
  logo: { _type: "image", __localFile: file, __alt: name },
  ...(extra || {}),
});

export const clientItems = [
  client("client-who", "World Health Organization", "public/images/clients/who.png"),
  client("client-unicef", "UNICEF", "public/images/clients/unicef.png"),
  client("client-undp", "UNDP", "public/images/clients/undp.png"),
  client("client-pfizer", "Pfizer", "public/images/clients/pfizer.png"),
  client("client-usaid", "USAID", "public/images/clients/usaid.png"),
  client("client-mohp", "Ministry of Health and Population", "public/images/clients/MoHP.png"),
  client("client-giz", "GiZ", "public/images/clients/GIZ.jpg", {
    __uncertain: "Spelled 'GiZ' in ClientMarquee.tsx:38; GROQ-irrelevant but editorially wrong. Kept verbatim, not corrected.",
  }),
  client("client-ivi", "International Vaccine Institute", "public/images/clients/IVI.png"),
  client("client-bbc", "BBC Media Action", "public/images/clients/BBC.jpg"),
  client("client-bournemouth", "Bournemouth University", "public/images/clients/Shield_of_the_University_of_Bournemouth.svg.webp"),
  client("client-plan", "Plan International", "public/images/clients/Plan_International.svg.webp"),
  client("client-jica", "JICA", "public/images/clients/jica.svg.webp"),
  client("client-dfid", "DFID", "public/images/clients/DFID.jpg"),
  client("client-dca", "DanChurchAid", "public/images/clients/DCA_logo1.png"),
  client("client-nhssp", "NHSSP", "public/images/clients/NHSSP.jpg"),
];

/**
 * DECISION (owner): out of scope for this import.
 *
 * `Helen_Keller_International_logo.webp` is referenced by
 * src/components/ClientMarquee.tsx:38 but is NOT on disk. The owner is
 * re-sourcing the file separately; an import cannot invent it, and shipping a
 * client entry with no logo would render a broken tile. Dropped entirely.
 */
export const CLIENTS_OUT_OF_SCOPE = [
  {
    name: "Helen Keller International",
    key: "client-hki",
    file: "public/images/clients/Helen_Keller_International_logo.webp",
    why: "referenced at src/components/ClientMarquee.tsx:38 but the file does not exist on disk. Owner is re-sourcing it as a separate task; the import deliberately drops this client rather than create a logo-less entry.",
  },
];

export const clientsPlan = {
  _id: SINGLETON_IDS.clients,
  _type: "clients",
  source: [CLIENTS_SOURCE],
  doc: { heading: null, items: clientItems },
  uncertain: [
    "heading is null. The marquee shows 'Who we work with' as an eyebrow (ClientMarquee.tsx:192) and that reads as a section label, so it is not migrated. Editor can set it in the Studio.",
  ],
  missing: ["heading"],
};

/* ---------------------------------------------------------------------- *
 * career
 *
 * DECISION (owner): all 6 vacancies are explicitly fake placeholder listings
 * ("These listings are placeholders for layout review and are not live
 * vacancies." - src/app/career/page.tsx:207-210). They are excluded from this
 * import entirely. Only the section copy is imported, so the /career page
 * falls back to its local vacancies until real roles are entered in the Studio.
 * ---------------------------------------------------------------------- */
export const CAREER_SOURCE = "src/app/career/page.tsx:22-83";

export const careerPlan = {
  _id: SINGLETON_IDS.career,
  _type: "career",
  source: [CAREER_SOURCE, "src/app/career/page.tsx:113,116"],
  doc: {
    heading: "Work with a team committed to evidence.",
    intro:
      "Anweshan is a contemporary issue focused research organization of highly motivated young professionals seeking to contribute to the wellbeing of poor, vulnerable and marginalized people.",
  },
  vacanciesExcluded: true,
  uncertain: [
    "vacancies: EXCLUDED per the owner's decision. All 6 local listings are self-declared placeholders and are not published as real job ads. The /career page will keep falling back to the local list until real vacancies are entered in the Studio.",
    "heading / intro come from the page H1 and lead (career/page.tsx:113,116) \u2014 page furniture mapped onto a CMS field. Flagged.",
  ],
  missing: ["vacancies (deliberately excluded)"],
};

/* ---------------------------------------------------------------------- *
 * contact
 * ---------------------------------------------------------------------- */
export const CONTACT_SOURCE = "src/app/contact/page.tsx:15-41";

export const contactPlan = {
  _id: SINGLETON_IDS.contact,
  _type: "contact",
  source: [CONTACT_SOURCE, "src/app/contact/page.tsx:88"],
  doc: {
    heading: "Start a conversation about your research question.",
    address: "Anweshan Pvt. Ltd., Talchikhel, Lalitpur, Nepal",
    phone: "977-01-5526674",
    email: "info@anweshan.org",
    mapEmbed: null,
  },
  uncertain: [
    "phone keeps only the landline. The mobile 977-9801210115 (contact/page.tsx:29) has no home; `contact` has a single `phone` field and the frontend renders Phone and Mobile as two separate rows. NOT merged, NOT invented.",
    "heading from the page H1 (contact/page.tsx:88) \u2014 page furniture on a CMS field. Flagged.",
  ],
  missing: ["mapEmbed", "mobile (no field)", "website (no field)"],
};

/* ---------------------------------------------------------------------- *
 * project
 *
 * DECISION (owner): import ONLY the factual fields. The narrative arrays
 * (overview / approach / outcomes) are excluded because src/lib/projects.ts:10-11
 * declares them placeholder copy, and all cover images are excluded because
 * they are either remote Unsplash URLs or, in the 6 local cases, unverified.
 *
 * `slug` and `summary` are included even though they were not on the owner's
 * list, because the schema marks BOTH as `validation: (r) => r.required()`
 * (sanity/schemaTypes/project.ts:18,27) and the create would fail validation
 * without them. `summary` is the one-line factual description, not the
 * placeholder narrative.
 * ---------------------------------------------------------------------- */

export const PROJECT_STATUS_ALLOWED = new Set(["Ongoing", "Completed"]);

/** Local status -> schema status. DECISION (owner): "Live" -> "Ongoing". */
export const PROJECT_STATUS_MAP = { Live: "Ongoing" };

export const PROJECT_IMPORTED_FIELDS = [
  "title",
  "slug",
  "summary",
  "client",
  "category",
  "status",
  "year",
  "years",
  "location",
  "methods",
  "team",
  "coverImage (local files only)",
  "externalUrl (3 platform projects)",
];

/**
 * DECISION (owner): derive the numeric `year` from the existing `years`
 * display string by taking the FIRST 4-DIGIT NUMBER ANYWHERE in it, e.g.
 * "2022 - 2023" -> 2022, "2022 - present" -> 2022, and
 * "January - June 2023" -> 2023.
 *
 * An earlier version required the string to *begin* with a year, which left
 * "January - June 2023" blank. The owner relaxed that rule, so a month name in
 * front no longer blocks the derivation. A result outside 1900-2099 is still
 * rejected rather than written, and anything with no 4-digit number at all
 * falls through to PROJECT_YEAR_OVERRIDES or is left blank for hand-entry.
 */
export function parseStartYear(yearsText) {
  const text = String(yearsText ?? "").trim();
  const found = text.match(/\d{4}/);
  if (!found) {
    return { year: null, ok: false, why: `"${text}" contains no 4-digit number` };
  }
  const n = Number(found[0]);
  if (n < 1900 || n > 2099) {
    return { year: null, ok: false, why: `"${text}" -> first 4-digit number is ${n}, which is not a plausible year (1900-2099)` };
  }
  return { year: n, ok: true, why: `"${text}" -> first 4-digit number anywhere is ${n}` };
}

/**
 * DECISION (owner): years the owner supplied by hand, for the 3 platform
 * projects whose `years` text is just "Ongoing" and therefore carries no
 * number to derive from.
 *
 * These are authoritative and are written verbatim. They are NOT inferred
 * from anything in the repository.
 */
export const PROJECT_YEAR_OVERRIDES = {
  "hire-enumerator": 2025,
  "bir-hospital-amr-guidelines": 2026,
  "giz-survey-fieldops": 2026,
};

export const PROJECT_EXCLUDED_FIELDS = [
  { field: "overview", why: "Excluded per the owner's decision. src/lib/projects.ts:10-11 declares detail copy to be placeholder; 12 of 15 records carry the identical self-declared placeholder paragraph." },
  { field: "approach", why: "Excluded per the owner's decision. On all 12 research projects this is the same house-style template with only the partner name substituted, not real methodology." },
  { field: "outcomes", why: "Excluded per the owner's decision. Same shared template; the claimed deliverables are not verified." },
  { field: "coverImage", why: "Only set for the 6 projects that have a real local file in public/images/projects/. The other 9 point at remote Unsplash URLs and are left without an image, per the owner's decision." },
  { field: "facts", why: "Excluded per the owner's decision. These sit inside the same block of src/lib/projects.ts that is explicitly marked placeholder, and the numbers have not been verified as real." },
  { field: "featured", why: "Left at the schema default of false. Nothing in the local source marks a project as featured." },
  { field: "year", why: "DERIVED from the `years` display string by taking its first 4-digit number anywhere in it. 12 of 15 parse that way; the 3 'Ongoing' platform projects carry an owner-supplied year, because their source text has no number to derive from. All 15 end up with a year." },
  { field: "body", why: "Portable Text. No local source at all." },
];

export const PROJECT_FIELD_MAP = {
  title: "title",
  slug: "slug.current",
  partner: "client",
  theme: "category",
  description: "summary",
  status: "status",
  years: "years",
  location: "location",
  methods: "methods",
  team: "team",
  image: "coverImage",
};

/** Local fields with no counterpart in the `project` schema. */
export const PROJECT_DROPPED_FIELDS = [
  { local: "id", where: "src/lib/projects.ts:26", why: "Display ordering only. Order is derived from `year` in the GROQ query." },
];

/**
 * DECISION (owner): the 3 platform projects carry a real working link, so
 * `url` IS imported, into a new `project.externalUrl` field.
 *
 * This required three source changes, approved by the owner, because the
 * field did not exist anywhere before:
 *   - sanity/schemaTypes/project.ts     \u2014 added `externalUrl` (type: "url"),
 *     mirroring `publication.externalUrl` at publication.ts:29-35
 *   - src/lib/types.ts:123              \u2014 added `externalUrl` to `Project`
 *   - src/lib/project-data.ts:70         \u2014 mapped it in `fromSanity()`, which
 *     previously only read it on the local fallback path (line 82)
 * The Studio must be deployed for the new schema field to appear.
 */
export const PROJECT_URL_NOTE =
  "url \u2192 externalUrl. The 3 platform projects (Hire Enumerator, Bir Hospital AMR Guidelines, GIZ Survey Field Operations) link out to live products. A new `project.externalUrl` field was added to the schema for this.";

/** The identical boilerplate paragraph on all 12 research projects. */
export const PROJECT_PLACEHOLDER_SENTINEL =
  "This page presents a working outline of the study while the full project record is prepared.";

/* ---------------------------------------------------------------------- *
 * teamMember
 * ---------------------------------------------------------------------- */

/** Must equal sanity/schemaTypes/teamMember.ts:22-30. */
export const TEAM_GROUP_ALLOWED = new Set([
  "Leadership",
  "Advisor and specialist",
  "Research and Programmes",
  "Data",
  "Operations",
  "IT team",
  "Office Support",
]);

/**
 * DECISION (owner): production is authoritative for every team member that
 * already exists. The 33 live documents keep their existing random IDs and
 * their existing content \u2014 no re-key, no field-level update, no `order`
 * write, not even for the typos or the swapped photo. The owner is fixing
 * those by hand in the Studio.
 *
 * The only team record in the import is the one genuine gap, and it is
 * created WITHOUT an `_id` so Sanity assigns its own, exactly like a document
 * a human would create in the Studio.
 *
 * `order` is never written for anyone.
 */
export const TEAM_EXISTING_POLICY = {
  existing: "never-touch",
  writeOrder: false,
  newRecordId: "auto-generated by Sanity",
};

/**
 * DECISION (owner, latest): the one genuine gap is NOT imported by this script.
 * The owner is adding Bhogendra Raj Dotel by hand in the Studio instead, so the
 * person gets an editorially curated document rather than a generated one.
 *
 * These names are listed here so that:
 *   - they are never turned into a `create`, and
 *   - a future bare `--apply` cannot quietly create a duplicate.
 * They are still reported, as "deferred", so the gap stays visible.
 */
export const TEAM_MEMBER_DEFERRALS = [
  {
    name: "Bhogendra Raj Dotel",
    why: "Owner is adding this record by hand in the Studio (DECISION, latest turn). Deliberately excluded from this import so a later `--apply` cannot create a duplicate.",
  },
];

/* ---------------------------------------------------------------------- *
 * publication / galleryEvent \u2014 nothing to migrate
 * ---------------------------------------------------------------------- */
export const publicationsPlan = {
  source: [],
  note: "No publication data exists anywhere in the frontend. `publicationsQuery` and the `publication` schema are wired but have no local fallback. Nothing to create; no documents are touched.",
};

export const galleryPlan = {
  source: [],
  note: "No gallery data and no event imagery exist in the frontend or in `public/`. Nothing to create; no documents are touched.",
};
