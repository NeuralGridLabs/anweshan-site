/* --------------------------------------------------------------------------
   Result types for the GROQ queries in ./queries.ts

   Each interface mirrors the projection of the query with the same name, and
   is kept in sync with the matching schema in /sanity/schemaTypes. Fields the
   schema does not mark `validation: (r) => r.required()` are optional, because
   a GROQ projection returns `null` for absent values.

   `fetchSanity` is called with these as its type argument so query results are
   typed at the call site instead of collapsing to `unknown`.
   ----------------------------------------------------------------------- */

export type SanityImage = {
  _type?: "image";
  _key?: string;
  asset?: { _ref?: string; _type?: "reference" };
  /* Intrinsic dimensions, projected alongside `asset` so a photo can render at
     its true aspect ratio (w-full h-auto) with no fixed frame. */
  dims?: { width?: number; height?: number; aspectRatio?: number };
  alt?: string;
  crop?: unknown;
  hotspot?: unknown;
};

/* `url` is the resolved cdn.sanity.io URL, projected from the asset document via
   `file.asset->url` in ./queries.ts. It is the only trustworthy source for a
   file link: `asset._ref` is an id, not a URL (its `-pdf` extension separator
   has to be a `.` in the real CDN path). `url` is absent when the referenced
   asset document does not exist, so treat every field here as optional. */
export type SanityFile = {
  _type?: "file";
  asset?: { _ref?: string; _type?: "reference" };
  url?: string;
  originalFilename?: string;
  extension?: string;
  size?: number;
};

export type StatEntry = { value?: string; label?: string };

export type SiteSettings = {
  orgName?: string;
  tagline?: string;
  logo?: SanityImage;
  logoLight?: SanityImage;
  stats?: StatEntry[];
};

export type HomeSlide = { image?: SanityImage; label?: string; alt?: string };

export type Home = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubtext?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  /* Optional. "#id" scrolls to that id, "/path" or a full URL navigates.
     Empty means the Hero keeps its built-in default target. */
  primaryCtaLink?: string;
  secondaryCtaLink?: string;
  slides?: HomeSlide[];
  /* Split on blank lines into paragraphs when rendered. */
  aboutBlurb?: string;
  /* About band on the home page. Each falls back to the component's own copy
     when empty, so an untouched document renders exactly as before. */
  aboutEyebrow?: string;
  aboutBadge?: string;
  aboutHeading?: string;
  /* Exact phrase inside aboutHeading to colour; must match character for
     character. Not found means no coloured words. */
  aboutHeadingHighlight?: string;
  aboutCtaLabel?: string;
  /* Credibility markers in the strip under the hero. The schema caps this at
     four; an empty array renders no strip at all. */
  proofItems?: string[];
  servicesEyebrow?: string;
  servicesHeading?: string;
  serviceCards?: { title?: string; description?: string; link?: string }[];
  /* Our clients band on the home page, below Publications. Every field falls
     back to the carousel's own copy, so an untouched document renders exactly
     as before. */
  clientsEyebrow?: string;
  clientsHeading?: string;
  clientsIntro?: string;
  /* Both halves of the band's button are needed for it to appear. */
  clientsCtaLabel?: string;
  clientsCtaLink?: string;
};

export type MissionPillar = {
  title?: string;
  text: string;
};

export type AboutPromise = {
  title?: string;
  text?: string;
};

/* How-we-work step, and a values tile, share this shape. */
export type AboutStep = {
  title?: string;
  text?: string;
};

export type About = {
  heading?: string;
  body?: string;
  image?: SanityImage;
  vision?: string;
  mission?: string;
  missionPillars?: MissionPillar[];
  /* Story band on /about, under the page header. */
  storyEyebrow?: string;
  storyParagraphs?: string[];
  /* Commitments band on /about. When `promises` is empty the page falls back
     to the local objectives copy. */
  purposeEyebrow?: string;
  purpose?: string;
  promisesHeading?: string;
  promises?: AboutPromise[];
  /* Dark band of /about. Hidden when there are no steps. */
  howWeWorkHeading?: string;
  howWeWorkSteps?: AboutStep[];
  /* Values tiles. Hidden when empty. */
  valuesHeading?: string;
  values?: AboutStep[];
  /* Closing check-list. Hidden when empty. */
  whyHeading?: string;
  whyItems?: string[];
};

/* One section of a service's long-form detail page. Every field is optional so
   an editor can write a heading-only section, a bullets-only section, or both. */
export type ServiceSection = {
  _key?: string;
  heading?: string;
  body?: string;
  bullets?: string[];
};

export type ServiceItem = {
  _key?: string;
  title: string;
  description?: string;
  icon?: string;
  /* Optional image shown beside the title in the services section. */
  image?: SanityImage;
  /* Detail page URL segment. Present only when the service has a detail page. */
  slug?: { _type?: "slug"; current?: string };
  /* Editor-controlled switch: a service gets a detail page only when this is on.
     Kept thin on purpose — thin pages are prevented here, not by a query that
     silently 404s. */
  hasDetailPage?: boolean;
  /* Detail page only. Never rendered on the band in the services list. */
  tagline?: string;
  detailBody?: string;
  capabilities?: string[];
  /* Shown on both the band and the detail page. */
  ctaLabel?: string;
  ctaLink?: string;
  /* Chips shown under the description in the services overview. */
  highlights?: string[];
  /* Retired: superseded by tagline, detailBody and capabilities. Hidden in the
     Studio, still projected so existing documents keep their data readable. */
  sections?: ServiceSection[];
};

export type Services = {
  heading?: string;
  intro?: string;
  items?: ServiceItem[];
};

export type ClientItem = { name: string; logo?: SanityImage };

export type Clients = {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  note?: string;
  ctaLabel?: string;
  ctaLink?: string;
  items?: ClientItem[];
};

export type Vacancy = {
  title: string;
  group?: string;
  location?: string;
  type?: string;
  description?: string;
};

export type Career = {
  heading?: string;
  intro?: string;
  vacancies?: Vacancy[];
};

export type Contact = {
  heading?: string;
  address?: string;
  email?: string;
  phone?: string;
  mapEmbed?: string;
};

export type ProjectFact = { label?: string; value?: string };

export type Project = {
  _id: string;
  title: string;
  slug?: { _type?: "slug"; current?: string };
  /* Legacy free-text partner name. Predates the client hub and is still what the
     "Partner" line on the project page shows. */
  client?: string;
  /* Reference link to a clientHub document, projected as the object below. */
  clientHub?: ClientHubRef;
  year?: number;
  /* "ready" or "needs-clearance". Absent on legacy documents, which are ready. */
  webStatus?: string;
  /* Timeline range. `years` is the pre-existing display string; these two are the
     structured years used for ordering and the client timeline. */
  startYear?: number;
  endYear?: number;
  category?: string;
  /* Every service area this assignment involved. `category` remains the single
     primary service; this is the full set, and drives which service pages list
     the project. */
  serviceAreas?: string[];
  summary?: string;
  status?: string;
  years?: string;
  location?: string;
  /* Doubles as the expertise chip list. */
  methods?: string[];
  team?: string;
  overview?: string[];
  approach?: string[];
  outcomes?: string[];
  /* Key figures: { value, label }. Doubles as the stats tiles. */
  facts?: ProjectFact[];
  coverImage?: SanityImage;
  externalUrl?: string;
  featured?: boolean;
};

/** The hub fields a single project needs, as projected by projectBySlugQuery. */
export type ClientHubRef = {
  _id: string;
  name: string;
  slug?: { _type?: "slug"; current?: string };
  logo?: SanityImage;
  shortName?: string;
  relationshipType?: string;
  projectCount?: number;
};

/** One assignment inside a client hub, as projected by clientHubBySlugQuery. */
export type HubProject = {
  _id: string;
  title: string;
  slug?: { _type?: "slug"; current?: string };
  summary?: string;
  category?: string;
  /* Full set of service areas, alongside the single primary `category`. */
  serviceAreas?: string[];
  status?: string;
  years?: string;
  startYear?: number;
  endYear?: number;
  location?: string;
  client?: string;
  methods?: string[];
  facts?: ProjectFact[];
};

/** A hub as it appears in the /clients card grid. */
export type ClientHub = {
  _id: string;
  name: string;
  slug?: { _type?: "slug"; current?: string };
  logo?: SanityImage;
  shortName?: string;
  relationshipType?: string;
  order?: number;
  projectCount?: number;
  firstYear?: number;
  lastYear?: number;
  categories?: string[];
};

/** A hub with its own page: the card fields plus intro, website and projects. */
export type ClientHubDetail = ClientHub & {
  intro?: string;
  website?: string;
  projects?: HubProject[];
};

/** One of a project's other assignments for the same client. */
export type ProjectSibling = {
  _id: string;
  title: string;
  slug?: { _type?: "slug"; current?: string };
  years?: string;
  startYear?: number;
};

export type TeamMember = {
  _id: string;
  name: string;
  role?: string;
  group?: string;
  bio?: string;
  photo?: SanityImage;
  email?: string;
  order?: number;
};

export type Publication = {
  _id: string;
  title: string;
  authors?: string;
  year?: number;
  journal?: string;
  abstract?: string;
  file?: SanityFile;
  /* Resolved CDN URL of `file`, projected directly by the GROQ queries as
     `file.asset->url`. Preferred over re-deriving it from `file.asset._ref`;
     null/absent when the publication has no file or the asset is missing. */
  fileUrl?: string;
  externalUrl?: string;
  coverImage?: SanityImage;
  order?: number;
  featuredOnHome?: boolean;
};

export type GalleryEventCategory = "events-training" | "celebrations";

export type GalleryEvent = {
  _id: string;
  title: string;
  category?: GalleryEventCategory;
  date?: string;
  description?: string;
  images?: SanityImage[];
  coverImage?: SanityImage;
  order?: number;
};

/** Narrows a possibly-absent string, for fallbacks that need `string`. */
export function text(value: string | null | undefined, fallback = ""): string {
  return value ?? fallback;
}
