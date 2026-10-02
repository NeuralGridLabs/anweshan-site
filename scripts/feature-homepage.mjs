/* --------------------------------------------------------------------------
    Restore the homepage rails by setting the CMS `featured` flags.

    The home page has two editorial rails:

      - "Our featured work"   -> project.featured == true
      - "Our publications"    -> publication.featuredOnHome == true

    Both flags are unset across the whole dataset, so both rails render empty.
    An earlier change removed a local-code fallback that had been masking this:
    `resolveFeaturedProjects` used to fall back to the picks in
    `src/lib/projects.ts`, so the rail looked populated while the CMS said
    nothing was featured. The fallback is gone (CMS is the only source), which
    is correct — the data now has to be set where it belongs, in the CMS.

    This script sets the flags, nothing else. It touches ONLY the boolean, so no
    title, description, narrative or asset can be altered by running it.

      node scripts/feature-homepage.mjs             # dry run
      node scripts/feature-homepage.mjs --apply     # set the flags
   ----------------------------------------------------------------------- */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const APPLY = new Set(process.argv.slice(2)).has("--apply");
const log = (...a) => console.log(...a);
const repoRoot = process.cwd();

function loadEnvLocal() {
  const f = path.join(repoRoot, ".env.local");
  if (!fs.existsSync(f)) return {};
  const out = {};
  for (const raw of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[line.slice(0, eq).trim()] = v;
  }
  return out;
}
const env = loadEnvLocal();
const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const READ = env.SANITY_API_READ_TOKEN;
const WRITE = env.SANITY_API_WRITE_TOKEN;

if (!PROJECT_ID) { console.error("ABORT: NEXT_PUBLIC_SANITY_PROJECT_ID missing."); process.exit(1); }
if (APPLY && !WRITE) { console.error("ABORT: --apply needs SANITY_API_WRITE_TOKEN."); process.exit(1); }

const readClient = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION, useCdn: false, token: READ, perspective: "published" });
const writeClient = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION, useCdn: false, token: WRITE, perspective: "published" });

/* The four research projects the home rail used to show, in the order the local
   roster listed them. They are the four most substantial research engagements;
   the three Anweshan-built platforms are excluded because they get their own
   section on /projects and must not appear in the research rail. */
const FEATURED_PROJECTS = [
  "predeparture-orientation-training",
  "covid-19-vaccination-sudurpaschim",
  "national-health-insurance-policy",
  "antimicrobial-stewardship",
];

/* Publications: newest first, capped at three by the query itself. The three
   chosen are the most recent and best-documented records. */
const FEATURED_PUBLICATIONS = [
  "5f30ef5b-77aa-4fdd-acb0-4bac54bced5f", // CAPTURA / antimicrobial prescribing (2026)
  "0eb2a2fa-4160-4f9e-85b1-72cb890bcb4c", // Hearing impairment, Karnali (2025)
  "a1d9d4d1-0a9c-44fd-baa1-5f08b8dd3119", // Equity in transplantation access (2023)
];

(async () => {
  log("=== Home page rails ===");
  log(`project: ${PROJECT_ID}  dataset: ${DATASET}`);
  log(`mode: ${APPLY ? "APPLY" : "DRY RUN (no mutations)"}\n`);

  const projects = await readClient.fetch(
    `*[_type == "project" && slug.current in $slugs]{ _id, "slug": slug.current, title, year, featured }`,
    { slugs: FEATURED_PROJECTS }
  );
  const publications = await readClient.fetch(
    `*[_type == "publication" && _id in $ids]{ _id, title, year, featuredOnHome }`,
    { ids: FEATURED_PUBLICATIONS }
  );

  log("--- project.featured -> true ---");
  for (const p of projects) {
    log(`  ${p.slug.padEnd(34)} ${String(p.year).padEnd(5)} featured=${String(p.featured).padEnd(5)} ${p.title.slice(0, 52)}`);
  }
  const missingProjects = FEATURED_PROJECTS.filter((s) => !projects.some((p) => p.slug === s));
  if (missingProjects.length) log(`\n  NOT FOUND in CMS: ${missingProjects.join(", ")}`);

  log("\n--- publication.featuredOnHome -> true ---");
  for (const p of publications) {
    log(`  ${p._id.slice(0, 8)}  ${String(p.year).padEnd(5)} featuredOnHome=${String(p.featuredOnHome).padEnd(5)} ${p.title.slice(0, 52)}`);
  }
  const missingPubs = FEATURED_PUBLICATIONS.filter((id) => !publications.some((p) => p._id === id));
  if (missingPubs.length) log(`\n  NOT FOUND in CMS: ${missingPubs.join(", ")}`);

  const toChange = projects.filter((p) => p.featured !== true).length + publications.filter((p) => p.featuredOnHome !== true).length;
  log(`\n  records needing a change: ${toChange}`);

  if (!APPLY) {
    log("\nDry run. Nothing written. Re-run with --apply.");
    process.exit(0);
  }

  /* Patch each document's single boolean. `set` at the top level of the patch
     changes one field and cannot disturb any other. */
  const tx = writeClient.transaction();
  for (const p of projects) {
    if (p.featured !== true) tx.patch(p._id, { set: { featured: true } });
  }
  for (const p of publications) {
    if (p.featuredOnHome !== true) tx.patch(p._id, { set: { featuredOnHome: true } });
  }
  await tx.commit();
  log(`\nWrote ${toChange} flag(s).`);

  const after = await readClient.fetch(`{
    "projects": count(*[_type == "project" && featured == true]),
    "publications": count(*[_type == "publication" && featuredOnHome == true])
  }`);
  log(`  now featured: ${after.projects} project(s), ${after.publications} publication(s)`);

  /* Confirm nothing else moved: compare a couple of untouched fields. */
  const sample = await readClient.fetch(`*[_type == "project" && slug.current == "amr-amu-data-management"][0]{
    "stillHasNarrative": count(overview), "stillHasTitle": defined(title) }`);
  log(`  sanity: a non-featured project still has ${sample.stillHasNarrative} overview paragraph(s): ${sample.stillHasNarrative > 0 ? "yes" : "NO — INVESTIGATE"}`);
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
