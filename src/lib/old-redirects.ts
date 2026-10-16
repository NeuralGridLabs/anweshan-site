/* --------------------------------------------------------------------------
    Old-URL redirects.

    Every path here used to be a real page on anweshan.org and now returns a
    404. Search results, bookmarks and links in other people's documents still
    point at them, so each one gets a permanent redirect to the page that
    carries the same content today.

    This is a plain static list on purpose. The project slugs below were
    resolved once, against Sanity, filtered on webStatus == "ready", and frozen
    into the source. Nothing is fetched while the app is running, which means:

      - a redirect cannot fail because the CMS was slow or down;
      - a redirect cannot change target under a visitor's feet when an editor
        corrects a title and the slug moves;
      - and the build does not need a network round-trip to produce them.

    The consequence is that if a project is renamed, this file has to be
    updated by hand. That is the right trade for a list of dead URLs: they are
    finished history, not live content.

    Ordering matters and is enforced by OLD_REDIRECTS being assembled in three
    groups below. Next matches redirects in array order and takes the FIRST
    match, so the specific /news/<slug> rules must come before the catch-all
    /news/:slug, or every article would land on /projects and the eleven
    carefully matched ones would be wasted. Reading the groups top to bottom is
    reading the matching order.
   ----------------------------------------------------------------------- */

/**
 * A single permanent redirect. Kept as a named shape rather than inlined so the
 * `permanent: true` decision is made once, here, for all of them.
 */
export type OldRedirect = {
  /** The dead path on the old site, exactly as it appears in old inbound links. */
  source: string;
  /** Where it goes now. */
  destination: string;
  permanent: true;
};

/* --------------------------------------------------------------------------
    Group 1 - the flat old pages.

    The old site nested these under /about/ as separate pages; the new site has
    a single /about. The four /about rules come first, then the old singular
    /client/list (note the singular "client") which became /clients.
   ----------------------------------------------------------------------- */
const OLD_ABOUT_PAGES: OldRedirect[] = [
  { source: "/about/our-mission", destination: "/about", permanent: true },
  { source: "/about/our-objective", destination: "/about", permanent: true },
  { source: "/about/our-vision", destination: "/about", permanent: true },
  { source: "/about/who-we-are", destination: "/about", permanent: true },
];

/** Old top-level pages, one-to-one renames or moves. */
const OLD_TOP_LEVEL_PAGES: OldRedirect[] = [
  { source: "/about/teams", destination: "/team", permanent: true },
  { source: "/career-list", destination: "/career", permanent: true },
  { source: "/client/list", destination: "/clients", permanent: true },
];

/* --------------------------------------------------------------------------
    Group 2 - old /service/<long-slug> pages.

    These are the deepest trap in the list: each destination was chosen by
    reading what the service page actually says today and picking the one
    whose scope matches, not by matching words. The CRO article pointed at
    /cro rather than at any service pop-up, because the new site has a dedicated
    CRO page that the old per-service article is really about.

    Note /service (singular) versus the live /services (plural). They are
    different paths, so these never collide with the live service routes or
    with the /services/:slug -> /services?open=:slug rule in next.config.ts.
   ----------------------------------------------------------------------- */
const OLD_SERVICE_PAGES: OldRedirect[] = [
  {
    source: "/service/clinical-research-services-at-anweshan-a-full-spectrum-cro-in-nepal",
    destination: "/cro",
    permanent: true,
  },
  {
    source: "/service/q-squared-research",
    destination: "/services?open=research-evaluation-surveys",
    permanent: true,
  },
  {
    source: "/service/research-and-policy-dialogue-in-nepal",
    destination: "/services?open=health-systems-policy",
    permanent: true,
  },
  {
    source: "/service/political-economic-analysis",
    destination: "/services?open=health-systems-policy",
    permanent: true,
  },
  {
    source: "/service/information-technology",
    destination: "/services?open=digital-health-data-systems",
    permanent: true,
  },
  {
    source: "/service/health-and-development-communication",
    destination: "/services?open=evidence-communication",
    permanent: true,
  },
];

/* --------------------------------------------------------------------------
    Group 3 - old /clients/<slug> where the client hub was renamed.

    Every source slug here was changed on the new site, so the page exists but
    under a different name. Only these four are listed: every other client hub
    kept its slug and must keep serving normally, including
    /clients/bournemouth-university and /clients/international-vaccine-institute,
    which are live pages and appear nowhere in this file.
   ----------------------------------------------------------------------- */
const OLD_CLIENT_SLUGS: OldRedirect[] = [
  {
    source: "/clients/iom-nepal",
    destination: "/clients/international-organization-for-migration-nepal",
    permanent: true,
  },
  {
    source: "/clients/save-the-children",
    destination: "/clients/save-the-children-international-nepal",
    permanent: true,
  },
  {
    source: "/clients/usaid-and-care-nepal",
    destination: "/clients/care-nepal",
    permanent: true,
  },
  {
    source: "/clients/wateraid",
    destination: "/clients/wateraid-nepal",
    permanent: true,
  },
];

/* --------------------------------------------------------------------------
    Group 4 - /blogs, and the /news/<slug> articles.

    Each source below was matched to a READY project in Sanity by its title and
    the project's LIVE slug was read back and written here. None of these slugs
    are guesses: they are the strings Sanity returned. If one of these projects
    is ever renamed, this file needs the same edit.
   ----------------------------------------------------------------------- */
const OLD_NEWS_ARTICLES: OldRedirect[] = [
  /* Two old articles - one qualitative, one training - became the single mHealth
     formative-research case study. Both dead URLs therefore point at the same
     live project. */
  {
    source:
      "/news/qualitative-research-on-fchvs-communication-and-engagement-with-communities-and-to-explore-the-possibilities-of-using-mobile-phone-as-a-job-aid",
    destination: "/projects/formative-research-for-the-mhealth",
    permanent: true,
  },
  {
    source:
      "/news/training-on-formative-research-on-fchvs-communication-and-engagement-with-communities-and-to-explore-the-possibilities-of-using-mobile-phone-as-a-job-aid",
    destination: "/projects/formative-research-for-the-mhealth",
    permanent: true,
  },
  {
    source: "/news/evaluation-study-for-mhealth-fchvs-project",
    destination: "/projects/baseline-and-endline-evaluation-of-the-mhealth-initiative",
    permanent: true,
  },
  {
    source: "/news/formative-research-on-hygiene-behavior",
    destination: "/projects/beacon-formative-research-on-hygiene-behaviour-in-lahan",
    permanent: true,
  },
  {
    source: "/news/research-on-policy-implementation-challenges-in-national-health-insurance-program",
    destination: "/projects/under-one-umbrella-national-health-insurance-research",
    permanent: true,
  },
  {
    source:
      "/news/total-market-approach-and-public-health-facility-mapping-for-fprh-services-usaid-adolescent-reproductive-health",
    destination:
      "/projects/mapping-of-adolescent-reproductive-health-and-family-planning-services",
    permanent: true,
  },
  {
    source:
      "/news/effectiveness-of-health-components-of-predeparture-orientation-training-for-aspiring-nepali-migrants-in-collaboration-with-bournemouth-university",
    destination:
      "/projects/assessment-of-health-content-in-pre-departure-orientation-for-migrant-workers",
    permanent: true,
  },
  {
    source:
      "/news/access-to-safe-abortion-services-in-nepal-and-analysis-of-status-of-policies-institutional-mechanism-social-support-and-practices-to-ensure-safe-abortion-as-human-rights",
    destination: "/projects/analysis-reporting-and-publication-products-on-abortion-in-nepal",
    permanent: true,
  },
  {
    source: "/news/amr-animation-video-and-web-page",
    destination:
      "/projects/antimicrobial-resistance-website-and-two-dimensional-animation",
    permanent: true,
  },
  {
    source: "/news/advocacy-paper-and-videos-for-localizing-nutrition",
    destination: "/projects/nutrition-governance-advocacy-paper-and-animation",
    permanent: true,
  },
  {
    source: "/news/leaflet-designing-and-production-diabetic-retinopathy",
    destination:
      "/projects/diabetic-retinopathy-information-and-education-materials",
    permanent: true,
  },
  {
    source: "/news/anweshan-developed-rdqa-tool",
    destination: "/projects/web-based-routine-data-quality-assessment-platform",
    permanent: true,
  },
];

/* --------------------------------------------------------------------------
    Group 5 - the catch-alls, and they must stay last.

    /blogs and /news are the old section roots; both content archives are now a
    single /projects index.

    /news/:slug catches every article not matched above. It points at /projects
    rather than at a guessed project, because an unmatched old article has no
    reliable live equivalent and sending it to a plausible-looking but wrong
    case study is worse than sending it to the archive. /projects is a real page
    that lists the work, so the visitor lands somewhere useful.
   ----------------------------------------------------------------------- */
const OLD_NEWS_FALLBACKS: OldRedirect[] = [
  { source: "/blogs", destination: "/projects", permanent: true },
  { source: "/news", destination: "/projects", permanent: true },
  { source: "/news/:slug", destination: "/projects", permanent: true },
];

/**
 * Every old-URL redirect, in match order.
 *
 * Concatenated in the order the groups are defined above so the array order is
 * the matching order. Do not reorder: the /news/:slug catch-all would shadow
 * all twelve specific article rules and silently degrade them to /projects.
 */
export const OLD_REDIRECTS: OldRedirect[] = [
  ...OLD_ABOUT_PAGES,
  ...OLD_TOP_LEVEL_PAGES,
  ...OLD_SERVICE_PAGES,
  ...OLD_CLIENT_SLUGS,
  ...OLD_NEWS_ARTICLES,
  ...OLD_NEWS_FALLBACKS,
];