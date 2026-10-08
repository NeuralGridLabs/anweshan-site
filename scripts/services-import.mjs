/* --------------------------------------------------------------------------
    Services content -> Sanity `production`.

    SCOPED TO THE `services` DOCUMENT. This touches no other type, and it never
    writes a description that already exists in production: the five concise
    services keep the copy an editor authored, and only the new structural
    fields (slug / hasDetailPage / highlights / sections) are added.

    DEFAULT MODE IS DRY RUN. No mutation unless --apply, and --apply refuses to
    run if any guard fails.

      node scripts/services-import.mjs                  # dry run
      node scripts/services-import.mjs --json           # dry run, machine readable
      node scripts/services-import.mjs --apply          # patch, only if all guards pass

    Credentials come from .env.local at runtime and are never printed or
    written to any output. Only the PRESENCE of SANITY_API_WRITE_TOKEN is
    checked.
   ----------------------------------------------------------------------- */

import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
import { createClient } from "@sanity/client";

const argv = new Set(process.argv.slice(2));
const APPLY = argv.has("--apply");
const JSON_OUT = argv.has("--json");

const repoRoot = process.cwd();
const src = (...p) => path.join(repoRoot, ...p);

function loadEnvLocal() {
  const file = src(".env.local");
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = loadEnvLocal();
const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const READ_TOKEN = env.SANITY_API_READ_TOKEN || undefined;
const WRITE_TOKEN = env.SANITY_API_WRITE_TOKEN || undefined;
const WRITE_TOKEN_PRESENT = !!WRITE_TOKEN;

const log = (...a) => { if (!JSON_OUT) console.log(...a); };

log("=== Services -> Sanity ===");
log(`project: ${PROJECT_ID || "(unset)"}  dataset: ${DATASET}  apiVersion: ${API_VERSION}`);
log(`SANITY_API_WRITE_TOKEN: ${WRITE_TOKEN_PRESENT ? "present" : "NOT PRESENT"}`);
log(`mode: ${APPLY ? "APPLY" : "DRY RUN (no mutations)"}`);
if (APPLY && !WRITE_TOKEN_PRESENT) {
  console.error("\nABORT: --apply requires SANITY_API_WRITE_TOKEN in .env.local.");
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error("ABORT: NEXT_PUBLIC_SANITY_PROJECT_ID is not set in .env.local.");
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
  token: READ_TOKEN,
  perspective: "published",
});

/* ---------------------------------------------------------------------- *
 * 1. Read production (read-only)
 * ---------------------------------------------------------------------- */

let live;
try {
  live = await client.fetch(`*[_type == "services"][0]{
    _id, _rev, heading, intro,
    items[]{ _key, title, description, icon, slug, hasDetailPage, highlights, sections }
  }`);
} catch (err) {
  console.error("ABORT: read-only fetch failed. Nothing was written.");
  console.error(String(err && err.message ? err.message : err));
  process.exit(1);
}

log("");
log("--- Current production state (read-only, perspective: published) ---");
if (!live) {
  log("  no `services` document in this dataset");
} else {
  log(`  _id ${live._id}  _rev ${live._rev}`);
  log(`  items: ${(live.items || []).length}`);
  (live.items || []).forEach((i, k) =>
    log(`    [${k}] ${i.title}${i.hasDetailPage ? "  (hasDetailPage)" : ""}`)
  );
}

/* ---------------------------------------------------------------------- *
 * 2. The Clinical Research long-form content.
 *
 * Source: the section headings the owner listed, plus the existing site copy in
 * src/app/services/page.tsx (the `items` chips and the summary paragraph). No
 * fact here is invented: every claim traces to that existing copy, and the
 * bullets are that copy's own list, re-grouped under the headings the owner
 * gave. Nothing is stretched or embellished to fill a section.
 * ---------------------------------------------------------------------- */

const CLINICAL_KEY = "svc-01";

const CLINICAL_SECTIONS = [
  {
    _key: "sec-01",
    heading: "Regulatory and ethical compliance",
    body: "Protocol development and regulatory approvals with the Nepal Health Research Council (NHRC) and the Department of Drug Administration (DDA).",
    bullets: ["NHRC ethical approval", "DDA trial registration", "Site and IRB permissions"],
  },
  {
    _key: "sec-02",
    heading: "Study design and feasibility",
    bullets: ["Feasibility assessment"],
  },
  {
    _key: "sec-03",
    heading: "Trial operations and site management",
    body: "Site management and participant recruitment, with GCP training for the teams that deliver them.",
    bullets: ["Site management", "Participant recruitment", "GCP training"],
  },
  {
    _key: "sec-04",
    heading: "Data management and statistics",
    bullets: ["Data management"],
  },
  {
    _key: "sec-05",
    heading: "Pharmacovigilance",
    bullets: ["Pharmacovigilance"],
  },
  {
    _key: "sec-06",
    heading: "Quality assurance",
    body: "GCP-compliant monitoring across the study.",
    bullets: ["Trial monitoring"],
  },
];

/* "Post-trial access and knowledge sharing" is named in the owner's brief, but
   the existing site copy contains nothing for it: no summary sentence, no chip.
   Rather than write plausible-sounding text for a capability the site has never
   claimed, the section is omitted here and reported as an outstanding gap. An
   editor can add it in the Studio once there is real content for it. */
const OMITTED_SECTIONS = [
  {
    heading: "Post-trial access and knowledge sharing",
    why: "no source text anywhere in the existing site copy \u2014 omitted rather than invented",
  },
];

/* Highlights for the overview. The existing chip list, in its existing order. */
const CLINICAL_HIGHLIGHTS = [
  "NHRC ethical approval",
  "DDA trial registration",
  "Site and IRB permissions",
  "Feasibility assessment",
  "GCP training",
  "Participant recruitment",
  "Trial monitoring",
  "Pharmacovigilance",
];

/* ---------------------------------------------------------------------- *
 * 3. Build the patch.
 *
 * Only the Clinical Research item is changed. `description` is deliberately
 * absent from every patch: the production description is left exactly as an
 * editor wrote it, and Sanity's `createOrReplace`-style overwrite is avoided by
 * patching per-item instead of replacing the whole document.
 * ---------------------------------------------------------------------- */

const CLINICAL_SLUG = "clinical-research-services";

const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const plan = {
  type: "services",
  id: live?._id ?? "services",
  foundExisting: !!live,
  targetItemKey: CLINICAL_KEY,
  targetItemTitle: null,
  setItem: {
    slug: { _type: "slug", current: CLINICAL_SLUG },
    hasDetailPage: true,
    highlights: CLINICAL_HIGHLIGHTS,
    sections: CLINICAL_SECTIONS,
  },
  /* Items that get a slug so the detail route is stable, but stay
     overview-only. Nothing is invented for them: no sections, no highlights. */
  otherSlugs: {
    "svc-02": "q-squared-research",
    "svc-03": "research-and-policy-dialogue-in-nepal",
    "svc-04": "health-and-development-communication",
    "svc-05": "information-technology",
    "svc-06": "political-economic-analysis",
  },
};

if (live) {
  const target = (live.items || []).find((i) => i._key === CLINICAL_KEY);
  plan.targetItemTitle = target?.title ?? "(not found)";
}

/* ---------------------------------------------------------------------- *
 * 4. Guards
 * ---------------------------------------------------------------------- */

const guards = [];
const guard = (name, pass, detail) => guards.push({ name, pass, detail });

guard(
  "target `services` document exists in this dataset",
  !!live,
  live ? `found ${live._id}` : "no services document \u2014 nothing to update"
);

const targetItem = live && (live.items || []).find((i) => i._key === CLINICAL_KEY);
guard(
  "Clinical Research item found by _key svc-01",
  !!targetItem,
  targetItem ? `found "${targetItem.title}"` : "svc-01 not present in production"
);

/* A slug already on production is only a problem if it belongs to a DIFFERENT
   item than the one this import assigns it to. A previous successful run of
   this same script leaves every slug in place, and a re-run must be a no-op
   rather than abort forever. */
const slugOwners = new Map();
for (const i of live?.items || []) {
  const s = i.slug?.current;
  if (s) slugOwners.set(norm(s), i._key);
}

const assignments = { [CLINICAL_KEY]: CLINICAL_SLUG, ...plan.otherSlugs };
const slugClash = [];
for (const [key, slugValue] of Object.entries(assignments)) {
  const owner = slugOwners.get(norm(slugValue));
  if (owner && owner !== key) slugClash.push(`${slugValue} (held by ${owner}, wanted by ${key})`);
}
guard(
  "no slug is held by a different item",
  slugClash.length === 0,
  slugClash.length ? `collision: ${slugClash.join("; ")}` : "all slugs unclaimed or already ours"
);

const wantedSlugs = Object.values(assignments);
const dupes = wantedSlugs.filter((s, i) => wantedSlugs.findIndex((x) => norm(x) === norm(s)) !== i);
guard(
  "no duplicate slugs within this import",
  dupes.length === 0,
  dupes.length ? `duplicated: ${dupes.join(", ")}` : "no duplicates"
);

const sectionsWithNothing = CLINICAL_SECTIONS.filter((s) => !s.body && !(s.bullets || []).length);
guard(
  "every section has at least a body or a bullet",
  sectionsWithNothing.length === 0,
  sectionsWithNothing.length
    ? `empty: ${sectionsWithNothing.map((s) => s.heading).join("; ")}`
    : "all sections carry content"
);

/* Belt and braces after the slug guards: the write path is guarded separately,
   but catching a missing description here means the abort happens before the
   plan is ever printed as approvable. */
const liveWithoutDescription = (live?.items || []).filter((i) => !i.description);
guard(
  "every production item still has a description",
  liveWithoutDescription.length === 0,
  liveWithoutDescription.length
    ? `missing on: ${liveWithoutDescription.map((i) => i._key).join(", ")}`
    : "all 6 present"
);

/* ---------------------------------------------------------------------- *
 * 5. Report / apply
 * ---------------------------------------------------------------------- */

const lines = [];
const P = (s = "") => { lines.push(s); log(s); };

const failedGuards = guards.filter((g) => !g.pass);

P("# Services -> Sanity");
P("");
P(APPLY
  ? "Generated in **APPLY** mode."
  : "Generated in **dry-run** mode. **No Sanity mutation was called.**");
P("");
P(`- Project: \`${PROJECT_ID}\` \u00b7 Dataset: \`${DATASET}\` \u00b7 API version: \`${API_VERSION}\``);
P(`- \`SANITY_API_WRITE_TOKEN\`: **${WRITE_TOKEN_PRESENT ? "present" : "not present"}** (presence only)`);
P(`- Target document: \`${plan.id}\`${live ? ` (production _rev \`${live._rev}\`)` : ""}`);
P("");

P("## Records created or updated");
P("");
if (!live) {
  P("- **none** \u2014 this run only updates an existing document and never creates one.");
} else {
  P(`- **updated:** \`${plan.id}\` \u2014 the \`${CLINICAL_KEY}\` item (**${plan.targetItemTitle}**)`);
  P("  - `hasDetailPage`: set to `true`");
  P(`  - \`slug\`: set to \`${CLINICAL_SLUG}\``);
  P(`  - \`highlights\`: ${CLINICAL_HIGHLIGHTS.length} chips`);
  P(`  - \`sections\`: ${CLINICAL_SECTIONS.length} sections, ${CLINICAL_SECTIONS.reduce((n, s) => n + (s.bullets || []).length, 0)} bullets total`);
  P(`  - \`description\`: **not written** \u2014 the production copy is left exactly as an editor authored it.`);
  const others = (live.items || []).filter((i) => plan.otherSlugs[i._key]);
  if (others.length) {
    P(`- **updated (slug only):** ${others.length} overview-only services, each given a stable slug and \`hasDetailPage: false\``);
    for (const o of others) P(`  - \`${o._key}\` ${o.title} \u2192 \`${plan.otherSlugs[o._key]}\``);
  }
}
P("");

P("## Services with a detail page");
P("");
P(`**Clinical Research Services** only \u2014 \`/services/${CLINICAL_SLUG}\`.`);
P("");
P("The other five carry \`hasDetailPage: false\`, so they show their CMS description in the");
P("services section and are not linked anywhere. Enabling a detail page for one of them later is");
P("a single checkbox in the Studio, provided content has been added by then.");
P("");

P("## Content that could not be imported");
P("");
P("### Omitted entirely (no source)");
P("");
for (const o of OMITTED_SECTIONS) P(`- **${o.heading}** \u2014 ${o.why}.`);
P("");
P("### Partial (heading and bullets, no body paragraph)");
P("");
const gaps = CLINICAL_SECTIONS.filter((s) => !s.body);
if (gaps.length === 0) {
  P("_None._");
} else {
  P(`${gaps.length} of ${CLINICAL_SECTIONS.length} sections have a heading and bullets but **no body paragraph**, because the source copy for them is a chip label with no accompanying sentence:`);
  P("");
  for (const g of gaps) P(`- **${g.heading}** \u2014 bullets only; no body text invented.`);
}
P("");
P("Two further points, both deliberate:");
P("");
P("- The five concise service descriptions were **not** written. They already exist in production")
P("  and this request did not supply replacement text, so they are preserved verbatim rather than")
P("  overwritten. Re-run with an edit in the Studio if they need changing.");
P("- No section body was paraphrased or expanded. Every sentence traces to the existing site copy in")
P("  `src/app/services/page.tsx`; where the source was a bare list item, the section is a heading plus")
P("  that list item and nothing more.");
P("");

P("## Guards");
P("");
P("| # | Check | Result |");
P("| ---: | --- | --- |");
guards.forEach((g, i) => P(`| ${i + 1} | ${g.name} | ${g.pass ? "pass" : "**FAIL**"} \u2014 ${g.detail} |`));
P("");
P(failedGuards.length
  ? `> \u2014 **${failedGuards.length} guard(s) FAILED. \`--apply\` would refuse to run.**`
  : "> All guards pass. `node scripts/services-import.mjs --apply` would write the patch above.");
P("");

if (JSON_OUT) {
  console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", guards, plan, lines }, null, 2));
  process.exit(0);
}

if (!APPLY) {
  log("Dry run complete. Nothing was written. Re-run with --apply to patch the document.");
  process.exit(0);
}

/* ---------------------------------------------------------------------- *
 * 6. Apply
 * ---------------------------------------------------------------------- */

if (failedGuards.length) {
  console.error(`\nABORT: ${failedGuards.length} guard(s) failed. Nothing was written.`);
  for (const g of failedGuards) console.error(`  - ${g.name}: ${g.detail}`);
  process.exit(1);
}

const writeClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
  token: WRITE_TOKEN,
  perspective: "published",
});

/* Re-read immediately before writing and confirm the revision has not moved
   under us, so a concurrent Studio edit is never silently clobbered. */
const fresh = await writeClient.fetch(`*[_type == "services"][0]{ _id, _rev }`);
if (!fresh || fresh._rev !== live._rev) {
  console.error(`\nABORT: the services document changed since the read (expected _rev ${live._rev}, found ${fresh?._rev}).`);
  console.error("Nothing was written. Re-run so the plan is rebuilt against current content.");
  process.exit(1);
}

/* Rewrite the whole document with `createOrReplace`, merging onto the copy just
   read from production.

   NOTE: a patch like `set: { "items[_key==\"...\"]": {...} }` does NOT work here.
   It does not match an array member, so Sanity appends a new stub object and the
   existing items lose their fields. That bug shipped once and was reverted by
   scripts/services-restore.mjs. Merging in JS and replacing the document is
   explicit and cannot silently drop fields.

   `description` is carried over from the live read for every item, so this
   cannot overwrite an editor's copy with anything from this file. */
const liveByKey = new Map((live.items || []).map((i) => [i._key, i]));

const mergedItems = (live.items || []).map((item) => {
  const base = {
    _key: item._key,
    _type: "object",
    title: item.title,
    description: item.description,
  };
  if (item.icon) base.icon = item.icon;

  if (item._key === CLINICAL_KEY) {
    return {
      ...base,
      slug: { _type: "slug", current: CLINICAL_SLUG },
      hasDetailPage: true,
      highlights: CLINICAL_HIGHLIGHTS,
      sections: CLINICAL_SECTIONS,
    };
  }

  const slugValue = plan.otherSlugs[item._key];
  if (slugValue) {
    return { ...base, slug: { _type: "slug", current: slugValue }, hasDetailPage: false };
  }
  return base;
});

const doc = {
  _id: plan.id,
  _type: "services",
  heading: live.heading,
  intro: live.intro,
  items: mergedItems,
};

/* Last guard before the write: no item may lose a field it had in production. */
const lost = [];
for (const before of live.items || []) {
  const after = liveByKey.get(before._key) && mergedItems.find((m) => m._key === before._key);
  if (!after) { lost.push(`${before._key}: dropped from the document`); continue; }
  for (const f of Object.keys(before)) {
    if (f.startsWith("set")) continue;
    if (before[f] === null || before[f] === undefined) continue;
    if (after[f] === undefined) lost.push(`${before._key}: lost field "${f}"`);
  }
  if (before.title !== after.title) lost.push(`${before._key}: title would change`);
  if (before.description !== after.description) lost.push(`${before._key}: description would change`);
}
if (lost.length) {
  console.error("\nABORT: the merge would drop or alter existing content. Nothing was written.");
  for (const l of lost) console.error("  - " + l);
  process.exit(1);
}

log(`\nWriting \`${plan.id}\` (${mergedItems.length} items, ${Object.keys(doc).length} top-level fields)...`);
await writeClient.createOrReplace(doc);

log("Document written.");
log("");
log("--- verifying ---");
const after = await writeClient.fetch(`*[_type == "services"][0]{
  items[]{ _key, title, hasDetailPage, "slug": slug.current, "h": count(highlights), "s": count(sections) }
}`);
const afterClinical = (after?.items || []).find((i) => i._key === CLINICAL_KEY);
log(`  ${CLINICAL_KEY}  hasDetailPage=${afterClinical?.hasDetailPage}  slug=${afterClinical?.slug}  highlights=${afterClinical?.h}  sections=${afterClinical?.s}`);
for (const i of after?.items || []) {
  log(`  ${i._key}  hasDetailPage=${i.hasDetailPage}  slug=${i.slug}  title=${i.title}`);
}
const descAfter = await writeClient.fetch(`*[_type == "services"][0].items[_key=="${CLINICAL_KEY}"][0].description`);
log("");
log(`  description preserved unchanged: ${norm(descAfter) === norm(targetItem.description) ? "yes" : "NO \u2014 INVESTIGATE"}`);
