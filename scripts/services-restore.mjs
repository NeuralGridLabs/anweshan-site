/* EMERGENCY RESTORE of the `services` document.
 *
 * The patch in services-import.mjs used `set` on `items[_key=="..."]`, which
 * does NOT match array members in a Sanity patch: it appended new stub objects
 * and dropped title/description from all six items.
 *
 * Original copy is recoverable from TWO independent sources, which must agree
 * before anything is written:
 *   1. scripts/migration-manifest.mjs servicesPlan  (what created production)
 *   2. src/app/services/page.tsx fallbackServices  (the original site copy)
 *
 * This script refuses to run unless the two sources match each other exactly.
 */
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
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
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
  token: env.SANITY_API_READ_TOKEN,
  perspective: "published",
});
const writeClient = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN,
  perspective: "published",
});

const jiti = createJiti(path.join(repoRoot, "scripts", "_jiti-anchor.mjs"));
const manifest = await jiti.import(path.join(repoRoot, "scripts", "migration-manifest.mjs"));

const pageSrc = fs.readFileSync(path.join(repoRoot, "src", "app", "services", "page.tsx"), "utf8");

/* Pull title/summary pairs out of fallbackServices by parsing the literal.
   Deliberately narrow: it only reads `title:` and `summary:` keys in order. */
const fbTitles = [...pageSrc.matchAll(/^\s{4}title:\s*\n?\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => m[1]);
const fbSummaries = [...pageSrc.matchAll(/^\s{4}summary:\s*\n?\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => m[1]);

const manItems = manifest.servicesPlan.doc.items;
log("=== source cross-check ===");
log(`manifest items: ${manItems.length}   page.tsx titles: ${fbTitles.length}   summaries: ${fbSummaries.length}`);

const mismatches = [];
manItems.forEach((it, i) => {
  if (fbTitles[i] !== it.title) mismatches.push(`[${i}] title\n  manifest: ${it.title}\n  page.tsx: ${fbTitles[i]}`);
  if (fbSummaries[i] !== it.description) mismatches.push(`[${i}] description\n  manifest: ${it.description}\n  page.tsx: ${fbSummaries[i]}`);
});

if (mismatches.length) {
  log("\nABORT: the two independent sources DISAGREE. Not writing anything.");
  mismatches.forEach((m) => log("  " + m));
  process.exit(1);
}
log("both sources agree exactly on all 6 title/description pairs \u2014 safe to restore\n");

const current = await client.fetch(`*[_type == "services"][0]{ _id, _rev, heading, intro, "n": count(items) }`);
log("current document:", JSON.stringify(current));

const CLINICAL_SLUG = "clinical-research-services";

const CLINICAL_SECTIONS = [
  { _key: "sec-01", heading: "Regulatory and ethical compliance", body: "Protocol development and regulatory approvals with the Nepal Health Research Council (NHRC) and the Department of Drug Administration (DDA).", bullets: ["NHRC ethical approval", "DDA trial registration", "Site and IRB permissions"] },
  { _key: "sec-02", heading: "Study design and feasibility", bullets: ["Feasibility assessment"] },
  { _key: "sec-03", heading: "Trial operations and site management", body: "Site management and participant recruitment, with GCP training for the teams that deliver them.", bullets: ["Site management", "Participant recruitment", "GCP training"] },
  { _key: "sec-04", heading: "Data management and statistics", bullets: ["Data management"] },
  { _key: "sec-05", heading: "Pharmacovigilance", bullets: ["Pharmacovigilance"] },
  { _key: "sec-06", heading: "Quality assurance", body: "GCP-compliant monitoring across the study.", bullets: ["Trial monitoring"] },
];
const CLINICAL_HIGHLIGHTS = ["NHRC ethical approval", "DDA trial registration", "Site and IRB permissions", "Feasibility assessment", "GCP training", "Participant recruitment", "Trial monitoring", "Pharmacovigilance"];

const SLUGS = {
  "svc-01": CLINICAL_SLUG,
  "svc-02": "q-squared-research",
  "svc-03": "research-and-policy-dialogue-in-nepal",
  "svc-04": "health-and-development-communication",
  "svc-05": "information-technology",
  "svc-06": "political-economic-analysis",
};

const restoredItems = manItems.map((it) => {
  const slug = SLUGS[it._key];
  const isClinical = it._key === "svc-01";
  const out = {
    _key: it._key,
    _type: "object",
    title: it.title,
    description: it.description,
    slug: { _type: "slug", current: slug },
    hasDetailPage: isClinical,
  };
  if (isClinical) {
    out.highlights = CLINICAL_HIGHLIGHTS;
    out.sections = CLINICAL_SECTIONS;
  }
  return out;
});

const doc = {
  _id: current._id,
  _type: "services",
  heading: current.heading || "What we offer",
  intro: current.intro,
  items: restoredItems,
};

log("=== document that would be written ===");
log(JSON.stringify(doc, null, 2).slice(0, 1200) + "\n...");

if (!APPLY) {
  log("\nDry run. Re-run with --apply to restore.");
  process.exit(0);
}

await writeClient.createOrReplace(doc);
log("restored.");

const after = await client.fetch(`*[_type == "services"][0]{
  _rev, "n": count(items),
  items[]{ _key, title, "desc": string::length(description), "slug": slug.current, hasDetailPage, "h": count(highlights), "s": count(sections) }
}`);
log("\n=== after restore ===");
log("items:", after.n);
(after.items || []).forEach((i) =>
  log(`  ${i._key}  hasDetailPage=${i.hasDetailPage}  slug=${i.slug}  descLen=${i.desc}  h=${i.h}  s=${i.s}  ${i.title}`)
);
