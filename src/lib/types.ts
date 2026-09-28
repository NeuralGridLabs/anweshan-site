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
  alt?: string;
  crop?: unknown;
  hotspot?: unknown;
};

export type SanityFile = {
  _type?: "file";
  asset?: { _ref?: string; _type?: "reference" };
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

export type ServiceItem = {
  title: string;
  description?: string;
  icon?: string;
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
  externalUrl?: string;
  coverImage?: SanityImage;
  order?: number;
  featuredOnHome?: boolean;
};

export type GalleryEvent = {
  _id: string;
  title: string;
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
