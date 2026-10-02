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

export type HomeSlide = { image?: SanityImage; label?: string };

export type Home = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubtext?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  slides?: HomeSlide[];
  aboutBlurb?: string;
};

export type MissionPillar = {
  title?: string;
  text: string;
};

export type About = {
  heading?: string;
  body?: string;
  image?: SanityImage;
  vision?: string;
  mission?: string;
  missionPillars?: MissionPillar[];
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
  /* Editor-controlled switch: a service gets a detail page only when this is on
     AND long-form content exists. Keeps thin pages from being created. */
  hasDetailPage?: boolean;
  /* Chips shown under the description in the services overview. */
  highlights?: string[];
  /* Long-form content rendered on the detail page. */
  sections?: ServiceSection[];
};

export type Services = {
  heading?: string;
  intro?: string;
  items?: ServiceItem[];
};

export type ClientItem = { name: string; logo?: SanityImage };

export type Clients = {
  heading?: string;
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
  client?: string;
  year?: number;
  category?: string;
  summary?: string;
  status?: string;
  years?: string;
  location?: string;
  methods?: string[];
  team?: string;
  overview?: string[];
  approach?: string[];
  outcomes?: string[];
  facts?: ProjectFact[];
  coverImage?: SanityImage;
  externalUrl?: string;
  featured?: boolean;
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
