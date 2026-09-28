/* --------------------------------------------------------------------------
    Project resolution

    Sanity is the source of truth, but the dataset can be empty (or the fetch
    can fail) and the pages would then render nothing. The local roster in
    ./projects.ts is used in that case.

    Both sources are normalised to `ResolvedProject` so the list, the detail
    route, and the home rail render identically whichever one is in play.

    Projects only. Publications (reports, papers, datasets) are a separate
    Sanity type and are deliberately not merged in here.
   ----------------------------------------------------------------------- */

import { featuredLocalProjects, projects as localProjects, type Project as LocalProject } from "./projects";
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

function facts(
  source: { label: string; value: string }[] | undefined,
): ProjectFact[] | undefined {
  return source?.map((f) => ({ label: f.label, value: f.value }));
}

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
  };
}

function fromLocal(project: LocalProject): ResolvedProject {
  return {
    key: `local:${project.slug}`,
    slug: project.slug,
    title: project.title,
    summary: project.description,
    client: project.partner,
    category: project.theme,
    cover: project.image,
    externalUrl: project.url,
    status: project.status,
    years: project.years,
    location: project.location,
    methods: project.methods,
    team: project.team,
    overview: project.overview,
    approach: project.approach,
    outcomes: project.outcomes,
    facts: facts(project.facts),
  };
}

/** All projects, ordered as the source orders them. */
export function resolveProjects(records: SanityProject[] | null): ResolvedProject[] {
  if (records?.length) return records.map(fromSanity);
  return localProjects.map(fromLocal);
}

/* --------------------------------------------------------------------------
    Anweshan-built platforms

    The platforms the in-house IT team builds and runs are not research
    engagements, so they get their own heading rather than being mixed into
    the work grid or the home rail. Membership is keyed on slug so the same
    three are recognised whether they came from Sanity or the local roster.
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

/** A single project by slug, or null when neither source has it. */
export function resolveProject(
  records: SanityProject[] | null,
  slug: string,
): ResolvedProject | null {
  return resolveProjects(records).find((p) => p.slug === slug) ?? null;
}

/** Home rail: Sanity's own `featured` flag when set, otherwise the local picks.
    Platforms are filtered out of both routes, and if flagging only platforms
    the rail falls back to the local research picks rather than rendering empty. */
export function resolveFeaturedProjects(
  records: SanityProject[] | null,
): ResolvedProject[] {
  const featured = (records ?? [])
    .filter((p) => p.featured)
    .map(fromSanity)
    .filter((p) => !isPlatform(p));

  if (featured.length) return featured;
  return featuredLocalProjects.map(fromLocal);
}
