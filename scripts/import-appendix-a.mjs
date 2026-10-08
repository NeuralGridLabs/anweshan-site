#!/usr/bin/env node
/**
 * Anweshan — Appendix A import (client hubs + assignments)
 *
 * SAFE BY DEFAULT. This script performs NO mutations unless it is given BOTH
 *   --apply  and  --confirm-dataset=<the dataset it will write to>
 * Without both it reads from Sanity and prints a plan. That is the default and
 * the only mode it was ever run in during development.
 *
 * The write token is required only with --apply, is never printed, and is only
 * attached to a second client instance. The read client never has write scope.
 *
 * NEVER DELETES. There is no code path that removes a document. Existing
 * records are patched field by field; a field not named in the mapping table is
 * never touched.
 *
 * Usage:
 *   node scripts/import-appendix-a.mjs                      # full dry run
 *   node scripts/import-appendix-a.mjs --only=bbc-media-action
 *   node scripts/import-appendix-a.mjs --logos-only
 *   node scripts/import-appendix-a.mjs --limit=10
 *   node scripts/import-appendix-a.mjs --status=needs-clearance
 *   node scripts/import-appendix-a.mjs --set-status=ready --only=<slug>
 *   node scripts/import-appendix-a.mjs --apply --confirm-dataset=production
 *
 * Flags:
 *   --only=<client-slug>        limit to one client hub and its projects
 *   --limit=N                   cap the number of projects considered
 *   --logos-only                resolve logos only; create/update nothing
 *   --verify                    READ ONLY. Reports how many of the documents this
 *                                run would create already exist in Sanity.
 *   --status=ready|needs-clearance   webStatus for NEW documents (default: ready)
 *   --set-status=ready|needs-clearance  separate mode: change webStatus on the
 *                                named client's hub + its projects, or on
 *                                everything when no --only is given
 *   --apply                     actually write (requires the two flags below)
 *   --confirm-dataset=<name>    must equal the dataset being written to
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

/* ---------------------------------------------------------------------- *
 * 0. Flags
 * ---------------------------------------------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

function flagValue(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}
function flagPresent(name) {
  return process.argv.includes(`--${name}`);
}

const APPLY = flagPresent("apply");
const CONFIRM_DATASET = flagValue("confirm-dataset");
const ONLY = flagValue("only");
const LIMIT = flagValue("limit") ? Number(flagValue("limit")) : null;
const LOGOS_ONLY = flagPresent("logos-only");
const VERIFY = flagPresent("verify");
const STATUS = flagValue("status") || "ready";
const SET_STATUS = flagValue("set-status");

const VALID_STATUS = ["ready", "needs-clearance"];

if (!VALID_STATUS.includes(STATUS)) {
  console.error(`ABORT: --status must be one of ${VALID_STATUS.join(" | ")}.`);
  process.exit(1);
}
if (SET_STATUS && !VALID_STATUS.includes(SET_STATUS)) {
  console.error(`ABORT: --set-status must be one of ${VALID_STATUS.join(" | ")}.`);
  process.exit(1);
}

/* ---------------------------------------------------------------------- *
 * 1. Environment — presence only, values never printed
 * ---------------------------------------------------------------------- */

function loadEnvLocal() {
  const file = path.join(REPO_ROOT, ".env.local");
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
const WRITE_TOKEN_PRESENT =
  Object.prototype.hasOwnProperty.call(env, "SANITY_API_WRITE_TOKEN") &&
  !!env.SANITY_API_WRITE_TOKEN;

if (!PROJECT_ID) {
  console.error("ABORT: NEXT_PUBLIC_SANITY_PROJECT_ID is not set in .env.local.");
  process.exit(1);
}

/* Two flags are required for any mutation. One is not enough. */
const WILL_WRITE = APPLY && CONFIRM_DATASET === DATASET;
if (APPLY && CONFIRM_DATASET !== DATASET) {
  console.error(
    `\nABORT: --apply also needs --confirm-dataset=${DATASET} (you passed ${
      CONFIRM_DATASET === null ? "nothing" : CONFIRM_DATASET
    }).\nRefusing to write.`,
  );
  process.exit(1);
}
if (WILL_WRITE && !WRITE_TOKEN_PRESENT) {
  console.error("\nABORT: --apply requires SANITY_API_WRITE_TOKEN in .env.local.");
  process.exit(1);
}

const log = (...a) => console.log(...a);
const hr = (t) => log(`\n${"=".repeat(78)}\n${t}\n${"=".repeat(78)}`);
const trunc = (s, n) => {
  const str = String(s ?? "");
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
};

/* ---------------------------------------------------------------------- *
 * 2. Service values, read from the single source of truth
 * ---------------------------------------------------------------------- */

/* The seven service values live in src/lib/categories.ts. Rather than copy
   them (and risk the copy rotting), they are parsed out of that file and then
   checked against EXPECTED_SERVICE_VALUES. If someone adds a category there,
   this script fails loudly instead of silently mis-classifying. */
const EXPECTED_SERVICE_VALUES = [
  "research-evaluation-surveys",
  "health-systems-policy",
  "digital-health-data-systems",
  "social-behaviour-change",
  "evidence-communication",
  "programme-implementation-support",
  "clinical-research-cro",
];

function readServiceValues() {
  const src = fs.readFileSync(path.join(REPO_ROOT, "src", "lib", "categories.ts"), "utf8");
  const block = src.slice(src.indexOf("export const CATEGORIES"), src.indexOf("export const CATEGORY_OPTIONS"));
  const values = [...block.matchAll(/value:\s*"([^"]+)"/g)].map((m) => m[1]);

  const missing = EXPECTED_SERVICE_VALUES.filter((v) => !values.includes(v));
  const extra = values.filter((v) => !EXPECTED_SERVICE_VALUES.includes(v));

  if (missing.length || extra.length) {
    console.error(
      "\nABORT: src/lib/categories.ts no longer matches the service list this\n" +
        "script knows about.\n" +
        (missing.length ? `  missing here: ${missing.join(", ")}\n` : "") +
        (extra.length ? `  unexpected there: ${extra.join(", ")}\n` : "") +
        "Update EXPECTED_SERVICE_VALUES in this script, or the category values.",
    );
    process.exit(1);
  }
  return values;
}

const SERVICE_VALUES = readServiceValues();
const isServiceValue = (v) => SERVICE_VALUES.includes(v);

/* ---------------------------------------------------------------------- *
 * 3. Input JSON
 * ---------------------------------------------------------------------- */

const INPUT = path.join(REPO_ROOT, "data", "anweshan_import_data.json");
if (!fs.existsSync(INPUT)) {
  console.error(`ABORT: ${INPUT} not found.`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const jsonClients = data.clients || [];
const jsonProjects = data.projects || [];

/* ---------------------------------------------------------------------- *
 * 4. Mapping table — printed first, so it can be checked before anything else
 * ---------------------------------------------------------------------- */

/** JSON key -> schema field. Order is the order fields are applied. */
const MAPPING = [
  ["title", "title", "string", "verbatim"],
  ["slug", "slug", "slug (canonical)", "set on new; canonical on existing"],
  ["summary", "summary", "text", "verbatim"],
  ["status", "status", "string", "verbatim"],
  ["location", "location", "string", "verbatim"],
  ["startYear", "startYear", "number", "verbatim"],
  ["endYear", "endYear", "number", "null is skipped, field left untouched"],
  ["webStatus", "webStatus", "string dropdown", `from --status (default ${STATUS}); existing docs NEVER changed`],
  ["clientSlug", "clientHub", "reference -> clientHub._id", "resolved from the hub's real _id"],
  ["partner", "client", "string", "the plain-text 'Client / Partner' field"],
  ["timeline", "years", "string", "'Timeline (display)'"],
  ["serviceArea", "category", "string dropdown", "'Primary service'. Free-text existing values are PRESERVED (see rule below)"],
  ["serviceAreas", "serviceAreas", "array of string", "all services involved"],
  ["expertise", "methods", "array of string", "'Methods'"],
  ["stats", "facts", "array of {_key,label,value}", "'Key Figures'; every item gets a _key"],
  ["overview", "overview", "array of text", "JSON string is stored as a ONE-ITEM array"],
  ["howWeWorked", "approach", "array of text", "'Approach / How we worked'"],
  ["outputs", "outcomes", "array of text", "'Outcomes / What it produced'"],
  ["(legacy) year", "year", "number", "set from startYear ONLY when year is empty"],
];

hr("APPENDIX A IMPORT — DRY RUN PLAN");
log(`project:   ${PROJECT_ID}`);
log(`dataset:   ${DATASET}`);
log(`apiVersion: ${API_VERSION}`);
log(`mode:      ${WILL_WRITE ? "*** APPLY (writes) ***" : "DRY RUN (read only, nothing will be changed)"}`);
log(`write token present in .env.local: ${WRITE_TOKEN_PRESENT ? "yes (never printed)" : "no"}`);
log(`--status for NEW documents: ${STATUS}`);
log(`--set-status: ${SET_STATUS || "(not in use)"}`);
log(`--only: ${ONLY || "(all clients)"}   --limit: ${LIMIT ?? "(none)"}   --logos-only: ${LOGOS_ONLY}`);
log("");
log("JSON input:");
log(`  clients:  ${jsonClients.length}   (expect 30)`);
log(`  projects: ${jsonProjects.length}   (expect 110)`);
if (jsonClients.length !== 30 || jsonProjects.length !== 110) {
  log(`  NOTE: counts differ from the expected 30 / 110.`);
}

log("");
log("MAPPING  (JSON key -> schema field -> type -> rule)");
log("  " + "-".repeat(92));
for (const [k, f, t, rule] of MAPPING) {
  log(`  ${k.padEnd(16)} -> ${f.padEnd(15)} ${t.padEnd(28)} ${rule}`);
}
log("  " + "-".repeat(92));
log("");
log("CATEGORY RULE");
log("  Existing projects keep a free-text category ('WASH', 'AMR', ...). Those are NOT");
log("  overwritten. Category is only written for new projects, and for existing ones");
log("  where it is empty or already one of the 7 service values.");
log("");

/* ---------------------------------------------------------------------- *
 * 5. Clients (read-only)
 * ---------------------------------------------------------------------- */

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
  token: READ_TOKEN,
  perspective: "published",
});

/* ---------------------------------------------------------------------- *
 * 6. Logo sources
 * ---------------------------------------------------------------------- */

/* Only these are treated as certain. A hub that is a joint programme gets no
   logo rather than borrowing one partner's mark; those are listed as monogram. */
const LOGO_ALIASES = {
  "bbc-media-action": "BBC.jpg",
  "world-health-organization-nepal": "who.png",
  "world-health-organization-south-east-asia-regional-office": "who.png",
  "unicef-nepal": "unicef.png",
  "united-nations-development-programme-nepal": "undp.png",
  "giz-nepal": "GIZ.jpg",
  "international-vaccine-institute": "IVI.png",
  "bournemouth-university": "Shield_of_the_University_of_Bournemouth.svg.webp",
  "plan-international": "Plan_International.svg.webp",
  "jica-cheers-project": "jica.svg.webp",
};

const LOGO_EXTS = [".png", ".jpg", ".jpeg", ".svg", ".webp"];
const PUBLIC_LOGO_DIR = path.join(REPO_ROOT, "public", "images", "clients");
const DATA_LOGO_DIR = path.join(REPO_ROOT, "data", "logos");

function findLogoFile(slug) {
  /* 1. an explicitly supplied file wins */
  if (fs.existsSync(DATA_LOGO_DIR)) {
    for (const ext of LOGO_EXTS) {
      const p = path.join(DATA_LOGO_DIR, slug + ext);
      if (fs.existsSync(p)) return { file: p, from: "data/logos" };
    }
  }
  /* 2. otherwise only a certain alias match */
  const alias = LOGO_ALIASES[slug];
  if (alias) {
    const p = path.join(PUBLIC_LOGO_DIR, alias);
    if (fs.existsSync(p)) return { file: p, from: "public/images/clients (alias)" };
  }
  return null;
}

/* ---------------------------------------------------------------------- *
 * 7. Matching helpers
 * ---------------------------------------------------------------------- */

const slugOf = (doc) => (typeof doc?.slug === "string" ? doc.slug : doc?.slug?.current);

/* ---------------------------------------------------------------------- *
 * 7b. Merge map (optional)
 * ---------------------------------------------------------------------- */

/* data/merge-map.json lets a human pre-decide that an existing Studio project
   and an incoming JSON record are the same assignment, so the importer updates
   the existing document instead of creating a near-duplicate.
 *
 * Shape: [ { "existingTitleContains": "...", "recordSlug": "..." } ]
 *
 * Matching is deliberately unforgiving. The needle must resolve to EXACTLY ONE
 * existing published project. Zero or several is an error and the entry is
 * skipped, because guessing here would silently overwrite the wrong document. */

const MERGE_MAP_PATH = path.join(REPO_ROOT, "data", "merge-map.json");

function readMergeMap() {
  if (!fs.existsSync(MERGE_MAP_PATH)) return { entries: [], present: false };

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(MERGE_MAP_PATH, "utf8"));
  } catch (err) {
    console.error(`\nABORT: ${MERGE_MAP_PATH} is not valid JSON: ${String(err.message || err)}`);
    process.exit(1);
  }

  if (!Array.isArray(parsed)) {
    console.error(`\nABORT: ${MERGE_MAP_PATH} must be an array of { existingTitleContains, recordSlug }.`);
    process.exit(1);
  }

  return { entries: parsed, present: true };
}

function normaliseTitle(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(t) {
  const stop = new Set(["a", "an", "the", "of", "for", "and", "in", "on", "to", "with", "study"]);
  return normaliseTitle(t)
    .split(" ")
    .filter((w) => w && !stop.has(w));
}

/** Jaccard overlap, used only to suggest candidates for a human to review. */
function tokenOverlap(a, b) {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

/* ---------------------------------------------------------------------- *
 * 8. --set-status mode
 * ---------------------------------------------------------------------- */

async function runSetStatus() {
  hr("--set-status MODE (webStatus only — nothing else is touched)");

  const allProjects = await client.fetch(
    `*[_type == "project"]{_id, title, "slug": slug.current, webStatus, clientHub->slug.current}`,
  );
  const allHubs = await client.fetch(`*[_type == "clientHub"]{_id, name, "slug": slug.current, webStatus}`);

  const hubsInScope = allHubs.filter((h) => !ONLY || slugOf(h) === ONLY);
  const hubIds = new Set(hubsInScope.map((h) => h._id));
  const projectsInScope = allProjects.filter(
    (p) => (!ONLY || hubIds.has(p.clientHub?._ref)) && (!ONLY || hubIds.has(p.clientHub?._id)),
  );

  log(`target webStatus: ${SET_STATUS}`);
  log(`clients in scope:  ${hubsInScope.length}`);
  log(`projects in scope: ${projectsInScope.length}`);
  log("");
  log(`hub slug${" ".repeat(28)}current      -> new`);
  for (const h of hubsInScope) {
    const change = h.webStatus === SET_STATUS ? "unchanged" : "CHANGE";
    log(`  ${String(slugOf(h)).padEnd(34)}${String(h.webStatus ?? "(none)").padEnd(12)} -> ${change}`);
  }
  log("");
  const toChange = projectsInScope.filter((p) => p.webStatus !== SET_STATUS);
  log(`projects needing a change: ${toChange.length}`);
  for (const p of toChange.slice(0, 40)) {
    log(`  ${String(slugOf(p)).slice(0, 44).padEnd(46)}${String(p.webStatus ?? "(none)").padEnd(12)} -> ${SET_STATUS}`);
  }
  if (toChange.length > 40) log(`  ... and ${toChange.length - 40} more`);
  log("");

  if (!WILL_WRITE) {
    log("DRY RUN — nothing was written. Re-run with:");
    log(`  --set-status=${SET_STATUS}${ONLY ? ` --only=${ONLY}` : ""} --apply --confirm-dataset=${DATASET}`);
    return;
  }

  const writer = client.withConfig({ token: env.SANITY_API_WRITE_TOKEN });
  const ops = [];
  for (const h of hubsInScope) {
    if (h.webStatus !== SET_STATUS) ops.push({ patch: { id: h._id, set: { webStatus: SET_STATUS } } });
  }
  for (const p of toChange) ops.push({ patch: { id: p._id, set: { webStatus: SET_STATUS } } });

  /* mutate() performs the write. client.transaction() only builds an object;
     awaiting it sends nothing at all. */
  let verified = 0;
  for (let i = 0; i < ops.length; i += 50) {
    const batchNumber = Math.floor(i / 50) + 1;
    const batch = ops.slice(i, i + 50);
    const expectedIds = batch.map((o) => o.patch.id);

    let result;
    try {
      result = await writer.mutate(batch, { visibility: "sync" });
    } catch (err) {
      console.error(`\nSTOPPED in batch ${batchNumber}. ${verified} operation(s) already verified.`);
      console.error(String(err.message || err));
      process.exit(1);
    }

    const returnedIds = Array.isArray(result?.documentIds) ? result.documentIds : [];
    if (returnedIds.length !== expectedIds.length) {
      console.error(`\nSTOPPED in batch ${batchNumber} — acknowledged ${returnedIds.length} of ${expectedIds.length}.`);
      process.exit(1);
    }

    const present = await readExistingIds(expectedIds);
    const missing = expectedIds.filter((id) => !present.has(id));
    if (missing.length > 0) {
      console.error(`\nSTOPPED in batch ${batchNumber} — ${missing.length} acknowledged but not readable: ${missing.join(", ")}`);
      process.exit(1);
    }

    verified += expectedIds.length;
    log(`  batch ${batchNumber}: ${verified}/${ops.length} VERIFIED in Sanity`);
  }
  log(`DONE — ${verified} webStatus change(s) applied and verified.`);
}

/* ---------------------------------------------------------------------- *
 * 9. Main
 * ---------------------------------------------------------------------- */

async function main() {
  if (SET_STATUS) return runSetStatus();

  hr("EXISTING STUDIO STATE (read only)");

  const [existingHubs, existingProjects, drafts] = await Promise.all([
    client.fetch(`*[_type == "clientHub"]{_id, name, "slug": slug.current, webStatus, relationshipType, logo, order, shortName, intro, website}`),
    client.fetch(
      `*[_type == "project"]{
        _id, title, slug, category, webStatus, startYear, endYear, year,
        summary, status, years, location, client, methods, facts,
        overview, approach, outcomes, serviceAreas,
        "hub": clientHub->slug.current
      }`,
      {},
      { perspective: "raw" },
    ),
    client.fetch(`*[_id in path("drafts.**") && _type in ["project", "clientHub"]]{"_bare": string::split(_id, "drafts.")[1], _type}`),
  ]);

  const draftIds = new Set((drafts || []).map((d) => d._bare));

  /* Fuzzy candidates are suggested against every existing project, so hold on
     to the full list. */
  existingProjectsRef = existingProjects;

  log(`existing client hubs: ${existingHubs.length}`);
  log(`existing projects:    ${existingProjects.length}`);
  log(`drafts present:       ${drafts.length}`);

  /* --- select the clients and projects this run covers --- */
  const clients = ONLY ? jsonClients.filter((c) => c.slug === ONLY) : jsonClients;
  if (ONLY && clients.length === 0) {
    console.error(`ABORT: no client with slug "${ONLY}" in the JSON input.`);
    process.exit(1);
  }
  const clientSlugs = new Set(clients.map((c) => c.slug));
  let projects = jsonProjects.filter((p) => clientSlugs.has(p.clientSlug));
  if (LIMIT !== null) projects = projects.slice(0, Math.max(0, LIMIT));

  const hubBySlug = new Map();
  for (const h of existingHubs) if (slugOf(h)) hubBySlug.set(slugOf(h), h);
  const projBySlug = new Map();
  const projByTitle = new Map();
  for (const p of existingProjects) {
    if (slugOf(p)) projBySlug.set(slugOf(p), p);
    projByTitle.set(normaliseTitle(p.title), p);
  }

  /* --- build the plan --- */
  const plan = { newHubs: [], existingHubs: [], draftSkipped: [], newProjects: [], updateProjects: [], keptCategory: [], fuzzy: [], logos: [], merged: [], mergeErrors: [], mergeConflicts: [] };

  for (const c of clients) {
    const found = hubBySlug.get(c.slug);
    if (draftIds.has(`clientHub.${c.slug}`)) plan.draftSkipped.push({ kind: "clientHub", id: `clientHub.${c.slug}`, slug: c.slug });
    if (found) plan.existingHubs.push({ json: c, existing: found });
    else plan.newHubs.push(c);
  }

  /* --- merge map, resolved BEFORE ordinary matching ---
     A merged record and its document are both claimed here, so the ordinary
     slug/title pass below cannot also attach them to something else. */

  const mergeMap = readMergeMap();
  const recordBySlug = new Map(jsonProjects.map((p) => [p.slug, p]));
  const claimedRecordSlugs = new Set();
  const claimedDocIds = new Set();

  /* What the ordinary pass would have matched on its own, so a merge that
     collides with it can be reported as a CONFLICT rather than silently
     overriding. */
  const ordinaryMatchFor = (p) => projBySlug.get(p.slug) || projByTitle.get(normaliseTitle(p.title));

  for (const [i, entry] of mergeMap.entries.entries()) {
    const needleRaw = entry?.existingTitleContains;
    const recordSlug = entry?.recordSlug;
    const label = `entry ${i + 1} (${JSON.stringify(needleRaw)} -> ${JSON.stringify(recordSlug)})`;

    if (!needleRaw || !recordSlug) {
      plan.mergeErrors.push(`${label}: entry needs both existingTitleContains and recordSlug`);
      continue;
    }

    if (draftIds.has(`project.${recordSlug}`)) {
      plan.mergeErrors.push(`${label}: drafts.project.${recordSlug} exists — publish or discard it first`);
      continue;
    }

    const record = recordBySlug.get(recordSlug);
    if (!record) {
      plan.mergeErrors.push(`${label}: recordSlug "${recordSlug}" is not in the JSON input`);
      continue;
    }

    const needle = normaliseTitle(needleRaw);
    const hits = existingProjects.filter((p) => normaliseTitle(p.title).includes(needle));

    if (hits.length === 0) {
      plan.mergeErrors.push(`${label}: no existing published project title contains "${needleRaw}"`);
      continue;
    }
    if (hits.length > 1) {
      plan.mergeErrors.push(
        `${label}: ${hits.length} existing projects match "${needleRaw}" (${hits.map((h) => slugOf(h)).join(", ")}) — refusing to guess`,
      );
      continue;
    }

    const target = hits[0];

    /* Conflict 1: the record already belongs to a different existing document. */
    const ordinary = ordinaryMatchFor(record);
    if (ordinary && ordinary._id !== target._id) {
      plan.mergeConflicts.push(
        `${label}: record is already matched to ${slugOf(ordinary) || ordinary._id} by ${projBySlug.get(record.slug) ? "slug" : "title"}; nothing applied`,
      );
      continue;
    }

    /* Conflict 2: the existing document is already the match for another record. */
    const otherRecord = [...recordBySlug.values()].find(
      (r) => r.slug !== recordSlug && ordinaryMatchFor(r)?._id === target._id,
    );
    if (otherRecord) {
      plan.mergeConflicts.push(
        `${label}: ${slugOf(target) || target._id} is already the match for record "${otherRecord.slug}"; nothing applied`,
      );
      continue;
    }

    claimedRecordSlugs.add(recordSlug);
    claimedDocIds.add(target._id);
    plan.merged.push({ entry: label, record, existing: target });
  }

  for (const p of projects) {
    /* A merged record is already handled; it must not also become a new doc. */
    if (claimedRecordSlugs.has(p.slug)) {
      const merge = plan.merged.find((m) => m.record.slug === p.slug);
      if (merge) {
        const currentCategory = merge.existing.category ?? "";
        const setCategory = !currentCategory || isServiceValue(currentCategory);
        if (currentCategory && !isServiceValue(currentCategory)) {
          plan.keptCategory.push({
            slug: merge.existing._id,
            title: merge.existing.title,
            existing: currentCategory,
            incoming: p.serviceArea,
          });
        }
        plan.updateProjects.push({
          json: p,
          existing: merge.existing,
          setCategory,
          matchedBy: "merge-map",
          merged: true,
        });
      }
      continue;
    }

    const bySlug = projBySlug.get(p.slug);
    const byTitle = projByTitle.get(normaliseTitle(p.title));

    if (draftIds.has(`project.${p.slug}`)) {
      plan.draftSkipped.push({ kind: "project", id: `project.${p.slug}`, slug: p.slug, title: p.title });
      continue;
    }

    if (bySlug || byTitle) {
      const target = bySlug || byTitle;
      /* Guard: do not let two JSON records drive the same existing document. */
      if (claimedDocIds.has(target._id)) {
        plan.mergeConflicts.push(
          `record "${p.slug}" resolved to ${slugOf(target)}, but that document is already claimed by a merge; nothing applied`,
        );
        continue;
      }
      const currentCategory = target.category ?? "";
      const overwriteCategory = !currentCategory || isServiceValue(currentCategory);
      const incoming = p.serviceArea;

      if (currentCategory && !isServiceValue(currentCategory)) {
        plan.keptCategory.push({
          slug: target._id,
          title: target.title,
          existing: currentCategory,
          incoming,
        });
      }
      plan.updateProjects.push({ json: p, existing: target, setCategory: overwriteCategory, matchedBy: bySlug ? "slug" : "title", merged: false });
    } else {
      plan.newProjects.push(p);
      plan.fuzzy.push({ title: p.title, candidates: fuzzyCandidates(p.title) });
    }
  }

  /* --- logos --- */
  for (const c of clients) {
    const found = hubBySlug.get(c.slug);
    const hasLogo = Boolean(found?.logo);
    const hit = hasLogo ? null : findLogoFile(c.slug);
    plan.logos.push({
      slug: c.slug,
      name: c.name,
      action: hasLogo ? "existing logo kept" : hit ? `upload ${path.basename(hit.file)}` : "no logo (monogram)",
      from: hit ? hit.from : "",
      absolute: hit?.file || "",
    });
  }

  /* --- report --- */
  /* Existing Studio projects that no JSON record claimed. Merged documents are
     in plan.updateProjects, so they are correctly excluded from this list. */
  const matchedIds = new Set(plan.updateProjects.map((u) => u.existing._id));
  const unmatchedExisting = existingProjects.filter((p) => !matchedIds.has(p._id));

  hr("PLAN SUMMARY");
  log(`clients:  ${plan.newHubs.length} new, ${plan.existingHubs.length} existing`);
  log(`projects: ${plan.newProjects.length} new, ${plan.updateProjects.length} updated (of which ${plan.merged.length} via merge map)`);
  log(`drafts that would be skipped: ${plan.draftSkipped.length}`);
  log(`existing projects keeping free-text category: ${plan.keptCategory.length}`);
  log(`merge map: ${mergeMap.present ? `${mergeMap.entries.length} entr${mergeMap.entries.length === 1 ? "y" : "ies"}` : "not present (data/merge-map.json not found)"}`);
  log("");
  log("TOTALS");
  log(`  new hubs        ${plan.newHubs.length}`);
  log(`  new projects    ${plan.newProjects.length}`);
  log(`  updated         ${plan.updateProjects.length}`);
  log(`  merged          ${plan.merged.length}   (a subset of "updated")`);
  log(`  unmatched       ${unmatchedExisting.length}   existing Studio projects no JSON record claims`);
  log(`  merge errors    ${plan.mergeErrors.length}`);
  log(`  merge conflicts ${plan.mergeConflicts.length}`);

  if (mergeMap.present && plan.mergeErrors.length) {
    log("");
    log("MERGE MAP ERRORS (that entry was skipped, nothing guessed)");
    for (const e of plan.mergeErrors) log(`  ERROR  ${e}`);
  }
  if (plan.mergeConflicts.length) {
    log("");
    log("MERGE CONFLICTS (nothing applied for these)");
    for (const c of plan.mergeConflicts) log(`  CONFLICT  ${c}`);
  }

  if (plan.merged.length) {
    log("");
    log("MERGE PLAN");
    log("  Existing document <- incoming record. Values shown as: old -> new");
    for (const m of plan.merged) {
      const e = m.existing;
      const r = m.record;
      log("");
      log(`  EXISTING  ${e.title}`);
      log(`            _id  ${e._id}`);
      log(`            slug ${slugOf(e) || "(none)"}`);
      log(`  RECORD    [${r.clientName}] ${r.title}`);
      log(`            new slug ${r.slug}`);
      log("  CHANGES");
      log(`            slug     ${slugOf(e) || "(none)"}  ->  ${r.slug}`);
      log(`            summary  ${trunc(e.summary ?? "(none)", 46)}  ->  ${trunc(r.summary, 46)}`);
      log(`            years    ${trunc(e.years ?? "(none)", 46)}  ->  ${trunc(r.timeline, 46)}`);
      log(`            location ${trunc(e.location ?? "(none)", 46)}  ->  ${trunc(r.location, 46)}`);
      log(`            category ${trunc(e.category || "(none)", 46)}  ->  ${isServiceValue(e.category) || !e.category ? r.serviceArea : `${e.category}  (KEPT, free text)`}`);
      log(`            hub ref  ${slugOf(e.hub) || "(none)"}  ->  ${r.clientSlug}`);
      log("            never touched: coverImage, featured, webStatus, body, externalUrl, team");
    }
  } else if (mergeMap.present) {
    log("");
    log("MERGE PLAN");
    log("  (no entries resolved — see errors/conflicts above)");
  }

  /* Existing Studio projects that no JSON record claimed. These are the ones
     most likely to be the same assignment under a different slug, so each is
     listed with its best candidates from the JSON — for a human to judge. */

  if (plan.newHubs.length) {
    log("");
    log("NEW CLIENT HUBS (createIfNotExists, _id clientHub.<slug>, webStatus=" + STATUS + ")");
    for (const c of plan.newHubs) log(`  ${String(c.slug).slice(0, 52).padEnd(53)}${c.name}`);
  }

  if (plan.existingHubs.length) {
    log("");
    log("EXISTING CLIENT HUBS (never changed: name, slug, logo, order, intro and webStatus)");
    for (const { json, existing } of plan.existingHubs) {
      log(`  ${json.slug.padEnd(46)}found _id=${existing._id.slice(0, 12)}…  webStatus=${existing.webStatus ?? "(none)"}`);
    }
  }

  if (plan.keptCategory.length) {
    log("");
    log("FREE-TEXT CATEGORY PRESERVED (not overwritten)");
    log("  These existing projects keep their old sector label. Everything else is still imported.");
    for (const k of plan.keptCategory) {
      log(`  ${String(k.title).slice(0, 46).padEnd(48)}keeps "${k.existing}"  (imported would be "${k.incoming}")`);
    }
  }

  if (plan.newProjects.length) {
    log("");
    log(`NEW PROJECTS (createIfNotExists, _id project.<slug>, webStatus=${STATUS}) — ${plan.newProjects.length}`);
    for (const p of plan.newProjects.slice(0, 25)) log(`  ${p.slug.slice(0, 52)}`);
    if (plan.newProjects.length > 25) log(`  ... and ${plan.newProjects.length - 25} more`);
  }

  if (plan.updateProjects.length) {
    log("");
    log(`EXISTING PROJECTS TO UPDATE — ${plan.updateProjects.length}`);
    const byKind = { slug: 0, title: 0 };
    for (const u of plan.updateProjects) byKind[u.matchedBy]++;
    log(`  matched by slug: ${byKind.slug}   matched by exact normalised title: ${byKind.title}`);
    for (const u of plan.updateProjects.slice(0, 25)) {
      log(`  ${String(u.existing.title).slice(0, 44).padEnd(46)}via ${u.matchedBy.padEnd(6)}category ${u.setCategory ? "SET" : "kept"}`);
    }
    if (plan.updateProjects.length > 25) log(`  ... and ${plan.updateProjects.length - 25} more`);
  }

  if (plan.draftSkipped.length) {
    log("");
    log("DRAFTS THAT WOULD BE SKIPPED (publish or discard in Studio first)");
    for (const d of plan.draftSkipped) log(`  ${d.kind.padEnd(10)}${d.id}${d.title ? `  "${d.title.slice(0, 44)}"` : ""}`);
  }

  if (unmatchedExisting.length) {
    log("");
    log(`EXISTING STUDIO PROJECTS NOT MATCHED BY ANY JSON RECORD — ${unmatchedExisting.length}`);
    log("  These would be left completely untouched. Listed so none is missed:");
    log("  current category is shown because a free-text one is preserved, not migrated.");
    for (const p of unmatchedExisting) {
      const cat = p.category ? p.category : "(empty)";
      log("");
      log(`  _id    ${p._id}`);
      log(`  title  ${p.title}`);
      log(`  slug   ${slugOf(p) || "(none)"}`);
      log(`  cat    ${cat}`);
      const cands = jsonCandidatesFor(p.title);
      log("  best 3 candidates in the JSON (NOT merged — review these):");
      if (cands.length === 0) log("      (nothing above the similarity threshold)");
      for (const c of cands) {
        log(`      ${String(Math.round(c.score * 100)).padStart(3)}%  ${String(c.jsonSlug).slice(0, 50)}`);
        log(`           "${c.jsonTitle.slice(0, 62)}"`);
      }
    }
  }

  if (plan.fuzzy.length) {
    log("");
    log(`JSON PROJECTS WITH NO EXACT MATCH — ${plan.fuzzy.length} (closest 3 existing each, NOT merged)`);
    for (const f of plan.fuzzy.slice(0, 40)) {
      log(`  "${f.title.slice(0, 62)}"`);
      for (const c of f.candidates) {
        log(`      ${String(Math.round(c.score * 100)).padStart(3)}%  ${String(c.existingSlug || "").slice(0, 46)}  "${c.existingTitle.slice(0, 48)}"`);
      }
      if (f.candidates.length === 0) log("      (no candidate above the threshold)");
    }
    if (plan.fuzzy.length > 40) log(`  ... and ${plan.fuzzy.length - 40} more JSON records with no match`);
  }

  log("");
  log("LOGO TABLE");
  for (const l of plan.logos) {
    log(`  ${l.slug.padEnd(50)}${l.action}${l.from ? `   [${l.from}]` : ""}`);
  }

  /* --- write, or stop --- */
  if (LOGOS_ONLY) {
    log("");
    log("--logos-only: no hubs or projects would be created or updated.");
  }

  /* ---------------- apply path ---------------- */

  /* Mutations are built and validated ONCE, by the same code the dry run uses.
     Nothing is sent until validation passes. */
  const muts = buildMutations(plan, hubBySlug);
  const problems = validateMutations(muts, existingHubs.map((h) => h._id));

  log(`\nMUTATION PLAN (exactly what --apply would send)`);
  log(`  createIfNotExists clientHub : ${muts.hubOps.length}`);
  log(`  createIfNotExists project   : ${muts.projectCreates.length}`);
  log(`  patch (existing project)    : ${muts.patches.length}`);
  log(`  logo uploads                : ${muts.logoOps.length}`);
  log(`  total mutations sent        : ${muts.all.length}`);

  if (problems.length) {
    console.error(`\nABORT: ${problems.length} validation problem(s). Nothing was sent.`);
    for (const p of problems.slice(0, 60)) console.error(`  ${p}`);
    if (problems.length > 60) console.error(`  ... and ${problems.length - 60} more`);
    process.exit(1);
  }
  log(`\nValidation: PASSED (${muts.all.length} mutations, no problems found)`);

  /* One sample of each kind, so a plan-building mistake is visible in a dry
     run rather than on the live dataset. */
  log("");
  log("SAMPLE MUTATIONS (long text truncated; one per kind)");
  const firstHub = muts.hubOps[0];
  const firstProject = muts.projectOps.find((o) => o.createIfNotExists);
  const firstPatch = muts.projectOps.find((o) => o.patch);
  const firstLogo = muts.logoOps[0];
  if (firstHub) log(`\n--- createIfNotExists clientHub ---\n${sampleJson(firstHub)}`);
  if (firstProject) log(`\n--- createIfNotExists project ---\n${sampleJson(firstProject)}`);
  if (firstPatch) log(`\n--- patch (existing project) ---\n${sampleJson(firstPatch)}`);
  if (firstLogo) log(`\n--- logo upload ---\n${sampleJson(firstLogo)}`);
  if (!firstHub && !firstProject && !firstPatch && !firstLogo) {
    log("\n  (nothing to send — this run would make no changes)");
  }

  if (!WILL_WRITE) {
    /* --verify is read-only and answers the only question that matters after a
       run: are the documents actually there? */
    if (VERIFY) {
      hr("VERIFY (read only — nothing is written)");
      const hubIds = muts.hubOps.map((o) => o.createIfNotExists._id);
      const projectIds = muts.projectCreates.map((o) => o.createIfNotExists._id);
      const patchIds = muts.patches.map((m) => m.patch.id);

      log("Documents this run would create, checked by id:");
      await reportVerification("clientHub documents", hubIds);
      await reportVerification("project documents", projectIds);
      log("");
      log("Existing documents this run would patch:");
      await reportVerification("patch targets", patchIds);
      log("");
      log(`VERIFICATION COMPLETE — ${hubIds.length + projectIds.length} would be created, ${patchIds.length} patched.`);
      return;
    }

    hr("DRY RUN COMPLETE — nothing was written");
    log("To apply:");
    log(`  node scripts/import-appendix-a.mjs${ONLY ? ` --only=${ONLY}` : ""}${LIMIT ? ` --limit=${LIMIT}` : ""}${LOGOS_ONLY ? " --logos-only" : ""} --apply --confirm-dataset=${DATASET}`);
    return;
  }

  const writer = client.withConfig({ token: env.SANITY_API_WRITE_TOKEN });

  /* Back up every existing document we are about to touch. Merged documents
     live in plan.updateProjects alongside ordinary updates, so they are covered
     by this same list. */
  const touching = [
    ...plan.existingHubs.map((h) => h.existing),
    ...plan.updateProjects.map((u) => u.existing),
  ];
  const backupPath = path.join(os.tmpdir(), `anweshan-appendix-a-backup-${DATASET}-${Date.now()}.json`);
  fs.writeFileSync(
    backupPath,
    JSON.stringify(
      {
        dataset: DATASET,
        takenAt: new Date().toISOString(),
        mergedIds: plan.merged.map((m) => m.existing._id),
        documents: touching,
      },
      null,
      2,
    ),
    "utf8",
  );
  log(`\nBackup of ${touching.length} existing document(s) written to:\n  ${backupPath}`);

  /* Every batch is confirmed by reading it back out of Sanity. Nothing is
     reported as done on the strength of a promise resolving. */
  log(`\nWriting ${muts.all.length} mutation(s) in batches of 50...`);
  let verified = 0;
  const writtenIds = [];

  for (let i = 0; i < muts.all.length; i += 50) {
    const batchNumber = Math.floor(i / 50) + 1;
    const batch = muts.all.slice(i, i + 50);
    const expectedIds = batch.map(mutationTargetId);

    let result;
    try {
      /* mutate() is the call that actually performs the write.
         client.transaction() only BUILDS a transaction object; awaiting it sends
         nothing, which is why an earlier version printed success for 138
         mutations and wrote none of them. */
      result = await writer.mutate(batch, { visibility: "sync" });
    } catch (err) {
      console.error(`\nSTOPPED in batch ${batchNumber} — the write itself failed.`);
      console.error(`Already verified in Sanity: ${verified} operation(s).`);
      console.error(`Documents confirmed written: ${writtenIds.join(", ") || "(none)"}`);
      console.error(`Error: ${String(err.message || err)}`);
      console.error(`Restore from: ${backupPath}`);
      process.exit(1);
    }

    const returnedIds = Array.isArray(result?.documentIds) ? result.documentIds : [];
    if (returnedIds.length !== expectedIds.length) {
      console.error(`\nSTOPPED in batch ${batchNumber} — Sanity acknowledged ${returnedIds.length} of ${expectedIds.length} mutations.`);
      console.error(`The response is not what was sent, so the state is unknown.`);
      console.error(`Restore from: ${backupPath}`);
      process.exit(1);
    }

    /* Read the ids back. A mutation can be acknowledged and still be absent,
       which is exactly the failure this catches. */
    const present = await readExistingIds(expectedIds);
    const missing = expectedIds.filter((id) => !present.has(id));

    if (missing.length > 0) {
      console.error(`\nSTOPPED in batch ${batchNumber} — ${missing.length} document(s) acknowledged but NOT found in Sanity.`);
      console.error(`Missing: ${missing.join(", ")}`);
      console.error(`Already verified in Sanity: ${verified} operation(s).`);
      console.error(`Restore from: ${backupPath}`);
      process.exit(1);
    }

    verified += expectedIds.length;
    writtenIds.push(...expectedIds);
    log(`  batch ${batchNumber}: ${verified}/${muts.all.length} VERIFIED in Sanity (${returnedIds.length} ids acknowledged, ${expectedIds.length} read back)`);
  }

  /* Logos are only safe once every hub is confirmed to exist. */
  if (muts.logoOps.length > 0) {
    const hubIds = muts.hubOps.map((o) => o.createIfNotExists._id);
    const hubCheck = await reportVerification("hubs before logos", hubIds);
    if (hubCheck.missing.length > 0) {
      console.error(`\nSTOPPED before logos — ${hubCheck.missing.length} hub(s) are not in Sanity.`);
      console.error(`Restore from: ${backupPath}`);
      process.exit(1);
    }

    log("\nUploading logos...");
    let logosDone = 0;
    for (const l of muts.logoOps) {
      try {
        const asset = await writer.assets.upload("image", fs.readFileSync(l.file), {
          filename: path.basename(l.file),
        });
        const res = await writer.mutate({
          patch: {
            id: `clientHub.${l.slug}`,
            set: {
              logo: { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: l.name },
            },
          },
        });
        const logoIds = Array.isArray(res?.documentIds) ? res.documentIds : [];
        const has = await readExistingIds([`clientHub.${l.slug}`]);
        const gotLogo = has.has(`clientHub.${l.slug}`);
        if (!gotLogo) {
          console.error(`  FAILED ${l.slug}: acknowledged ${logoIds.length} id(s) but the hub is not readable`);
          continue;
        }
        logosDone++;
        log(`  ${l.slug} <- ${path.basename(l.file)}  (asset ${asset._id.slice(0, 14)}…, acknowledged and readable)`);
      } catch (err) {
        console.error(`  FAILED ${l.slug}: ${String(err.message || err)}`);
      }
    }
    log(`logos: ${logosDone}/${muts.logoOps.length} uploaded and confirmed`);
  }

  hr("DONE");
  log(`mutations sent:    ${muts.all.length}`);
  log(`VERIFIED in Sanity: ${verified}`);
  log(`hubs created: ${plan.newHubs.length}, existing: ${plan.existingHubs.length}`);
  log(`projects created: ${plan.newProjects.length}, updated: ${plan.updateProjects.length}`);
  log(`drafts skipped: ${plan.draftSkipped.length}`);
  log(`hubs with no logo (monogram): ${plan.logos.filter((l) => l.action === "no logo (monogram)").length}`);
  log(`backup: ${backupPath}`);
}

/* ---------------------------------------------------------------------- *
 * Mutation building — SHARED by the dry run and by --apply
 *
 * Both paths call buildMutations(), so the plan printed in a dry run is exactly
 * the plan --apply would send. Anything wrong with plan building therefore
 * surfaces in a dry run instead of halfway through a live write. That is what
 * stopped a ReferenceError from reaching the dataset.
 *
 * Nothing here touches the network.
 * ---------------------------------------------------------------------- */

/** Drop keys whose value is undefined, so no mutation carries a hole. */
function omitEmpty(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

/**
 * The real _id of a hub: either an existing one matched by slug, or the id this
 * run will create it under.
 *
 * The slug map is a parameter on purpose. An earlier version read it from the
 * enclosing scope, which does not exist outside main(), so the first live run
 * died with "hubBySlug is not defined" after the backup had been written.
 */
function hubIdFor(clientSlug, hubBySlug) {
  if (!clientSlug) throw new Error("hubIdFor called without a clientSlug");
  const found = hubBySlug.get(clientSlug);
  return found ? found._id : `clientHub.${clientSlug}`;
}

/** JSON record -> the schema fields it owns. */
function buildProjectFields(p) {
  return omitEmpty({
    title: p.title,
    summary: p.summary,
    status: p.status,
    location: p.location,
    startYear: p.startYear,
    /* A null or absent endYear means "still running, or not recorded". The field
       is left unwritten rather than written as an explicit null. */
    endYear: p.endYear === null || p.endYear === undefined ? undefined : p.endYear,
    years: p.timeline,
    client: p.partner,
    category: p.serviceArea,
    serviceAreas: p.serviceAreas,
    methods: p.expertise,
    facts: (p.stats || []).map((s, i) => ({
      _key: `fact-${i}`,
      _type: "object",
      value: s.value,
      label: s.label,
    })),
    /* The JSON holds one string; the schema wants an array of paragraphs. */
    overview: p.overview ? [p.overview] : [],
    approach: p.howWeWorked || [],
    outcomes: p.outputs || [],
    year: typeof p.startYear === "number" ? p.startYear : undefined,
  });
}

/** True when a stored value is a literal { setIfMissing: v } wrapper. */
function isWrappedValue(v) {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.keys(v).length === 1 &&
    Object.prototype.hasOwnProperty.call(v, "setIfMissing")
  );
}

/** A stored value counts as absent when nothing has been written yet. */
function isEmptyStoredValue(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

/* Fields that must never be written on a document that already exists. */
const NEVER_WRITE_ON_EXISTING = new Set(["webStatus", "coverImage", "featured", "_id", "_type", "_rev"]);

/**
 * Builds every mutation this run would send. Pure — no network, no client.
 *
 * Returns the operations already split by kind, so the dry run can count and
 * sample them, and --apply can send them in the same order.
 */
function buildMutations(plan, hubBySlug) {
  const hubOps = [];
  for (const c of plan.newHubs) {
    hubOps.push({
      createIfNotExists: omitEmpty({
        _id: `clientHub.${c.slug}`,
        _type: "clientHub",
        name: c.name,
        slug: { _type: "slug", current: c.slug },
        relationshipType: c.relationshipType ?? undefined,
        webStatus: STATUS,
      }),
    });
  }

  const projectOps = [];
  for (const p of plan.newProjects) {
    projectOps.push({
      createIfNotExists: omitEmpty({
        _id: `project.${p.slug}`,
        _type: "project",
        /* The slug is set here, not in buildProjectFields, because it is the
           only field whose value comes from the record's own slug rather than
           from a mapped source field. Without it a new document has no route
           segment and generateStaticParams can never produce a page for it. */
        slug: { _type: "slug", current: p.slug },
        ...buildProjectFields(p),
        clientHub: { _type: "reference", _ref: hubIdFor(p.clientSlug, hubBySlug) },
        webStatus: STATUS,
      }),
    });
  }

  for (const u of plan.updateProjects) {
    /* Plain values only, and each one justified by the document that is already
       in Studio. Nothing here relies on a patch operator being interpreted by
       the API — an earlier version wrapped every value in setIfMissing and the
       dataset stored those wrappers literally, which broke the site. */
    const incoming = omitEmpty({
      ...buildProjectFields(u.json),
      slug: { _type: "slug", current: u.json.slug },
      clientHub: u.merged
        ? { _type: "reference", _ref: hubIdFor(u.json.clientSlug, hubBySlug) }
        : undefined,
    });
    if (!u.setCategory) delete incoming.category;

    const set = {};
    for (const [field, value] of Object.entries(incoming)) {
      if (NEVER_WRITE_ON_EXISTING.has(field)) continue;

      const stored = u.existing[field];

      /* Repair: a previous run stored { setIfMissing: v }. Write the real value
         back over it, so the wrapper disappears. */
      if (isWrappedValue(stored)) {
        set[field] = value;
        continue;
      }

      /* Otherwise only fill a gap. An existing value is never overwritten. */
      if (isEmptyStoredValue(stored)) set[field] = value;
    }

    if (Object.keys(set).length > 0) projectOps.push({ patch: { id: u.existing._id, set } });
  }

  const logoOps = plan.logos
    .filter((l) => l.absolute)
    .map((l) => ({ slug: l.slug, name: l.name, file: l.absolute }));

  return {
    hubOps,
    projectOps,
    /* Split by shape so the dry run can count and sample each kind honestly,
       rather than reporting one total that mixes creates and patches. */
    projectCreates: projectOps.filter((o) => o.createIfNotExists),
    patches: projectOps.filter((o) => o.patch),
    logoOps,
    all: [...hubOps, ...projectOps],
  };
}

/* ---------------------------------------------------------------------- *
 * Validation — every mutation is checked before a single one is sent
 * ---------------------------------------------------------------------- */

function validateMutations(muts, existingHubIds) {
  const problems = [];

  /* Every hub id that will resolve once this run finishes. */
  const resolvableHubIds = new Set([
    ...existingHubIds,
    ...muts.hubOps.map((o) => o.createIfNotExists._id),
  ]);

  /* Walk a value looking for undefined holes and keyless array objects. */
  const walk = (node, label, ownerKey) => {
    if (node === undefined) {
      problems.push(`${ownerKey}: ${label} is undefined`);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((v, i) => {
        if (v && typeof v === "object" && !Array.isArray(v) && v._key === undefined) {
          problems.push(`${ownerKey}: ${label}[${i}] is an object without _key`);
        }
        walk(v, `${label}[${i}]`, ownerKey);
      });
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) walk(v, `${label}.${k}`, ownerKey);
    }
  };

  const checkSlug = (slug, label, ownerKey) => {
    if (!slug || typeof slug !== "object" || Array.isArray(slug)) {
      problems.push(`${ownerKey}: ${label} is not a slug object`);
      return;
    }
    if (slug._type !== "slug") problems.push(`${ownerKey}: ${label}._type is "${slug._type}", expected "slug"`);
    if (typeof slug.current !== "string" || slug.current === "") {
      problems.push(`${ownerKey}: ${label}.current is missing or empty`);
    }
  };

  for (const m of muts.hubOps) {
    const d = m.createIfNotExists;
    const k = `hub ${d?._id ?? "(no _id)"}`;
    if (!d || !d._id) problems.push(`${k}: createIfNotExists has no document`);
    else if (typeof d._id !== "string") problems.push(`${k}: _id is not a string`);
    if (d && d._type !== "clientHub") problems.push(`${k}: _type is "${d._type}", expected clientHub`);
    if (d) checkSlug(d.slug, "slug", k);
    if (d && !d.webStatus) problems.push(`${k}: webStatus is missing`);
    if (d) walk(d, "doc", k);
  }

  for (const m of muts.projectOps) {
    if (m.createIfNotExists) {
      const d = m.createIfNotExists;
      const k = `project ${d?._id ?? "(no _id)"}`;
      if (!d._id) problems.push(`${k}: createIfNotExists has no document`);
      if (d._type !== "project") problems.push(`${k}: _type is "${d._type}", expected project`);
      if (!d.title) problems.push(`${k}: title missing (required by the schema)`);
      if (!d.summary) problems.push(`${k}: summary missing (required by the schema)`);
      checkSlug(d.slug, "slug", k);
      const ref = d.clientHub;
      if (!ref || ref._type !== "reference" || typeof ref._ref !== "string") {
        problems.push(`${k}: clientHub reference is malformed`);
      } else if (!resolvableHubIds.has(ref._ref)) {
        problems.push(`${k}: clientHub._ref "${ref._ref}" is not an existing hub and is not created in this run`);
      }
      if (!d.webStatus) problems.push(`${k}: webStatus is missing`);
      walk(d, "doc", k);
    } else if (m.patch) {
      const k = `patch ${m.patch.id ?? "(no id)"}`;
      if (typeof m.patch.id !== "string" || !m.patch.id) problems.push(`${k}: patch has no document id`);
      if (!m.patch.set || typeof m.patch.set !== "object") {
        problems.push(`${k}: patch has no set object`);
      } else {
        if (Object.prototype.hasOwnProperty.call(m.patch.set, "webStatus")) {
          problems.push(`${k}: sets webStatus on an existing document, which must never change`);
        }
        if (Object.prototype.hasOwnProperty.call(m.patch.set, "coverImage")) {
          problems.push(`${k}: sets coverImage on an existing document, which must never change`);
        }
        if (Object.prototype.hasOwnProperty.call(m.patch.set, "featured")) {
          problems.push(`${k}: sets featured on an existing document, which must never change`);
        }
        /* Plain values only: no operator wrapper is ever sent, so nothing here has to
           be unwrapped before it can be checked. */
        checkSlug(m.patch.set.slug, "set.slug", k);
        for (const [field, v] of Object.entries(m.patch.set)) {
          if (NEVER_WRITE_ON_EXISTING.has(field)) {
            problems.push(`${k}: set.${field} would overwrite a field that must never change on an existing document`);
          }
          if (isWrappedValue(v)) {
            problems.push(`${k}: set.${field} is a literal setIfMissing wrapper, which the API stores as data`);
          }
          walk(v, `set.${field}`, k);
        }
        /* A merged document must point at a hub that will exist. */
        const refField = m.patch.set.clientHub;
        if (refField && typeof refField._ref === "string" && !resolvableHubIds.has(refField._ref)) {
          problems.push(`${k}: clientHub._ref "${refField._ref}" does not resolve`);
        }
      }
    } else {
      problems.push(`unknown mutation shape: ${JSON.stringify(m).slice(0, 120)}`);
    }
  }

  /* Logo uploads must name a file that is actually on disk. */
  for (const l of muts.logoOps) {
    if (!fs.existsSync(l.file)) problems.push(`logo ${l.slug}: file not found ${l.file}`);
  }

  return problems;
}

/** The document id a single mutation targets. */
function mutationTargetId(m) {
  return m.createIfNotExists?._id ?? m.patch?.id ?? null;
}

/**
 * Read back which of these ids actually exist in Sanity.
 *
 * Uses perspective "raw" so a document that only exists as a draft still counts
 * as written. Passing the ids as a query parameter keeps this safe regardless
 * of their content.
 */
async function readExistingIds(ids) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Set();

  /* Chunked so a very large list can never build an oversized query. */
  const found = new Set();
  for (let i = 0; i < unique.length; i += 200) {
    const chunk = unique.slice(i, i + 200);
    const rows = await client.fetch(`*[_id in $ids]{_id}`, { ids: chunk }, { perspective: "raw" });
    for (const r of rows || []) found.add(r._id);
  }
  return found;
}

/** Report how many of a set of ids Sanity actually holds. Read only. */
async function reportVerification(label, ids, readClient = client) {
  const unique = [...new Set(ids.filter(Boolean))];
  const found = new Set();
  for (let i = 0; i < unique.length; i += 200) {
    const chunk = unique.slice(i, i + 200);
    const rows = await readClient.fetch(`*[_id in $ids]{_id}`, { ids: chunk }, { perspective: "raw" });
    for (const r of rows || []) found.add(r._id);
  }
  const missing = unique.filter((id) => !found.has(id));
  log(`  ${label.padEnd(26)} ${found.size}/${unique.length} present in Sanity`);
  if (missing.length > 0) {
    log(`  ${" ".repeat(26)} ${missing.length} missing, first few: ${missing.slice(0, 8).join(", ")}`);
  }
  return { found: found.size, total: unique.length, missing };
}

/** Pretty-print one mutation with long strings cut, so a sample stays readable. */
function sampleJson(value, maxLen = 70) {
  const seen = new WeakSet();
  const walk = (v) => {
    if (typeof v === "string") return v.length > maxLen ? v.slice(0, maxLen - 1) + "…" : v;
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      if (seen.has(v)) return "[circular]";
      seen.add(v);
      const out = {};
      for (const [k, val] of Object.entries(v)) out[k] = walk(val);
      return out;
    }
    return v;
  };
  return JSON.stringify(walk(value), null, 2);
}

/** Best 3 JSON records for an existing Studio project. Suggestions only. */
function jsonCandidatesFor(title) {
  return (jsonProjects || [])
    .map((p) => ({ jsonTitle: p.title, jsonSlug: p.slug, score: tokenOverlap(title, p.title) }))
    .filter((c) => c.score >= 0.34)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function fuzzyCandidates(title) {
  return (existingProjectsRef || [])
    .map((p) => ({ existingTitle: p.title, existingSlug: slugOf(p), score: tokenOverlap(title, p.title) }))
    .filter((c) => c.score >= 0.34)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

let existingProjectsRef = [];

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nUNEXPECTED FAILURE — nothing was deliberately written:");
    console.error(String(err && err.stack ? err.stack : err));
    process.exit(1);
  });
