/* --------------------------------------------------------------------------
    Project resolution

    Sanity is the source of truth. Records are normalised to `ResolvedProject`
    so the list, the detail route and the home rail all read the same shape.

    Projects only. Publications (reports, papers, datasets) are a separate
    Sanity type and are deliberately not merged in here.
   ----------------------------------------------------------------------- */

import { sanityImageUrl } from "./image";
import type { Project as SanityProject, ProjectFact } from "./types";

export type ResolvedProject = {
  /** Stable React key and route segment. */
  key: string;
  slug: string;
  title: string;
  summary: string;
  client: string;
  category: string;
  /** Absolute image URL, or null when no image is available. */
  cover: string | null;
  /** Set for products Anweshan operates; those link out instead of to a route. */
  externalUrl?: string;
  year?: number;
  status?: string;
  years?: string;
  location?: string;
  methods?: string[];
  team?: string;
  overview?: string[];
  approach?: string[];
  outcomes?: string[];
  facts?: ProjectFact[];
};

function fromSanity(project: SanityProject): ResolvedProject {
  const slug = project.slug?.current || project._id;

  return {
    key: project._id,
    slug,
    title: project.title,
    summary: project.summary ?? "",
    client: project.client ?? "",
    category: project.category ?? "",
    cover: sanityImageUrl(project.coverImage),
    year: project.year,
    status: project.status,
    years: project.years,
    location: project.location,
    methods: project.methods,
    team: project.team,
    overview: project.overview,
    approach: project.approach,
    outcomes: project.outcomes,
    facts: project.facts,
    externalUrl: project.externalUrl,
  };
}

/* -------------------------------------------------------------------------- *
    Sanity is the ONLY source of project content.

    There used to be a fallback to ./projects.ts, which caused a specific and
    confusing failure: the local roster holds placeholder narrative ("Detailed
    figures and narrative on this page are placeholders...", "This page
    presents a working outline of the study...") for the same slugs that exist
    in Sanity. With a whole-roster fallback, a slug could resolve to the local
    record instead of the CMS one, so edits made in Studio silently did not
    appear on the site — the page rendered, it just rendered someone else's copy.

    The fallback is gone. If the fetch fails or the dataset is empty, callers get
    an empty list and render their existing "nothing yet" state, which is
    honest: better no projects than stale projects that look live.
   -------------------------------------------------------------------------- */

/** All projects, ordered as the source orders them. Empty when CMS is unavailable. */
export function resolveProjects(records: SanityProject[] | null): ResolvedProject[] {
  if (!records?.length) return [];
  return records.map(fromSanity);
}

/* --------------------------------------------------------------------------
    Anweshan-built platforms

    The platforms the in-house IT team builds and runs are not research
    engagements, so they get their own heading rather than being mixed into
    the work grid or the home rail. Membership is keyed on slug so the same
    three are recognised whichever dataset they come from.
   ----------------------------------------------------------------------- */

const PLATFORM_SLUGS = new Set([
  "hire-enumerator",
  "bir-hospital-amr-guidelines",
  "giz-survey-fieldops",
]);

function isPlatform(project: ResolvedProject): boolean {
  return PLATFORM_SLUGS.has(project.slug);
}

/** Research engagements: everything that is not an Anweshan-built platform. */
export function resolveResearchProjects(
  records: SanityProject[] | null,
): ResolvedProject[] {
  return resolveProjects(records).filter((p) => !isPlatform(p));
}

/** The platforms Anweshan's IT team built, for the dedicated section. */
export function resolvePlatforms(
  records: SanityProject[] | null,
): ResolvedProject[] {
  return resolveProjects(records).filter(isPlatform);
}

/** A single project by slug, or null when the CMS has no such record. */
export function resolveProject(
  records: SanityProject[] | null,
  slug: string,
): ResolvedProject | null {
  return resolveProjects(records).find((p) => p.slug === slug) ?? null;
}

/* Home rail. The `featured` flag is the only signal used: if no project is
   flagged the rail is simply empty, rather than quietly borrowing the local
   picks, which is the same class of bug as the roster fallback above. */
export function resolveFeaturedProjects(
  records: SanityProject[] | null,
): ResolvedProject[] {
  return (records ?? [])
    .filter((p) => p.featured)
    .map(fromSanity)
    .filter((p) => !isPlatform(p));
}
