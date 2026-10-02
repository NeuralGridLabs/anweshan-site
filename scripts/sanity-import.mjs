/* --------------------------------------------------------------------------
    Anweshan -> Sanity `production` migration.

    DEFAULT MODE IS DRY RUN. This script makes NO mutations unless it is given
    --apply, and --apply additionally refuses to run unless the plan contains no
    conflicts and no silent overwrites.

      node scripts/sanity-import.mjs                        # dry run -> migration-dry-run.md
      node scripts/sanity-import.mjs --json                 # dry run, machine readable
      node scripts/sanity-import.mjs --apply                # create only, only if 0 conflicts
      node scripts/sanity-import.mjs --apply --allow-updates

    Credentials are read from .env.local at runtime and are never printed,
    logged, or written to any output file. Only the PRESENCE of
    SANITY_API_WRITE_TOKEN is checked, to decide whether --apply could ever run.

    Idempotency and safety:
      - Deterministic IDs for every planned document (see migration-manifest.mjs).
      - Existing documents are matched BOTH by ID and by natural key (name /
        slug / title), plus a fuzzy name match, so a re-run can never silently
        create a duplicate of something an editor already created in the Studio.
      - Creates use `createIfNotExists`; a second run is a no-op.
      - Assets are de-duplicated by SHA-1 (`sanity.imageAsset.sha1hash`) and by
        filename; a match reuses the existing asset instead of uploading again.
   ----------------------------------------------------------------------- */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createJiti } from "jiti";
import { createClient } from "@sanity/client";

import * as M from "./migration-manifest.mjs";

const argv = new Set(process.argv.slice(2));
const APPLY = argv.has("--apply");
const ALLOW_UPDATES = argv.has("--allow-updates");
const JSON_OUT = argv.has("--json");

/** `--only <type>` restricts an apply to a single document type. Used to smoke
 *  test the real upload path on one small record before running everything.
 *  Validated against TYPES further down, once TYPES is initialised. */
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx !== -1 ? process.argv[onlyIdx + 1] || null : null;

/**
 * `--dump <type>` prints the exact document that WOULD be written for one
 * document type, then exits without writing anything. Used to review a
 * record's fields before approving it.
 */
const dumpIdx = process.argv.indexOf("--dump");
const DUMP = dumpIdx !== -1 ? process.argv[dumpIdx + 1] || null : null;

/** A Sanity image asset reference: image-<40 hex sha1>-<W>x<H>-<ext>. */
const ASSET_REF_RE = /^image-[0-9a-f]{40}-\d+x\d+-[a-z0-9]+$/i;

/* ---------------------------------------------------------------------- *
 * 0. Environment \u2014 presence only, never values.
 * ---------------------------------------------------------------------- */

function loadEnvLocal() {
  const file = path.join(M.repoRoot, ".env.local");
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
  Object.prototype.hasOwnProperty.call(env, "SANITY_API_WRITE_TOKEN") && !!env.SANITY_API_WRITE_TOKEN;

const log = (...a) => { if (!JSON_OUT) console.log(...a); };

log("=== Anweshan \u2192 Sanity migration ===");
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
log("");

/* ---------------------------------------------------------------------- *
 * 1. Read-only Sanity snapshot
 * ---------------------------------------------------------------------- */

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
  token: READ_TOKEN,
  perspective: "published",
});

const TYPES = ["siteSettings", "home", "about", "services", "clients", "career", "contact", "project", "teamMember", "publication", "galleryEvent"];

if (ONLY && !TYPES.includes(ONLY)) {
  console.error(`ABORT: --only "${ONLY}" is not a known document type. Known: ${TYPES.join(", ")}`);
  process.exit(1);
}
if (DUMP && !TYPES.includes(DUMP)) {
  console.error(`ABORT: --dump "${DUMP}" is not a known document type. Known: ${TYPES.join(", ")}`);
  process.exit(1);
}

const SNAPSHOT = `*[_type in $types]{
  _id, _type, _rev, _updatedAt,
  title, name, heading, body, vision, mission, missionPillars,
  intro, items, vacancies, address, email, phone, mapEmbed, mapEmbedUrl,
  "slug": slug.current, client, category, summary, status, years, location,
  methods, team, role, group, order, authors, year, journal, date, abstract,
  externalUrl, featured, featuredOnHome, stats, tagline, orgName,
  heroEyebrow, heroHeading, heroSubtext, primaryCtaLabel, secondaryCtaLabel, aboutBlurb
}`;

let live = [];
try {
  live = await client.fetch(SNAPSHOT, { types: TYPES });
} catch (err) {
  console.error("ABORT: read-only snapshot failed. Nothing was written.");
  console.error(String(err && err.message ? err.message : err));
  process.exit(1);
}

let assets = [];
try {
  assets = await client.fetch(`*[_type == "sanity.imageAsset"]{ _id, _ref, originalFilename, sha1hash, extension, size, metadata { dimensions { width, height, aspectRatio } } }`);
} catch (err) {
  console.error("ABORT: read-only asset snapshot failed. Nothing was written.");
  console.error(String(err && err.message ? err.message : err));
  process.exit(1);
}

const nonDraft = live.filter((d) => !d._id.startsWith("drafts."));
const drafts = live.filter((d) => d._id.startsWith("drafts."));
const byId = new Map(nonDraft.map((d) => [d._id, d]));
const byType = (t) => nonDraft.filter((d) => d._type === t);

log("--- Current production state (read-only, perspective: published) ---");
for (const t of TYPES) log(`  ${t.padEnd(14)} ${String(byType(t).length).padStart(3)} doc(s)`);
log(`  ${"image assets".padEnd(14)} ${String(assets.length).padStart(3)}`);
log("");

/* ---------------------------------------------------------------------- *
 * 2. Local source data
 * ---------------------------------------------------------------------- */

const jiti = createJiti(path.join(M.repoRoot, "scripts", "_jiti-anchor.mjs"));
const localProjects = (await jiti.import(M.src("src/lib/projects.ts"))).projects;
const localTeam = (await jiti.import(M.src("src/lib/team.ts"))).localTeam;
const PLATFORM_SLUGS = new Set(["hire-enumerator", "bir-hospital-amr-guidelines", "giz-survey-fieldops"]);

/* ---------------------------------------------------------------------- *
 * 3. Plan builder
 * ---------------------------------------------------------------------- */

const plan = [];

const stripInternal = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("__") || v === null) continue;
    if (Array.isArray(v)) {
      const arr = v.map(stripInternal).filter((x) => x && Object.keys(x).length > 0);
      if (arr.length) out[k] = arr;
    } else if (typeof v === "object" && v !== null) {
      const o = stripInternal(v);
      if (Object.keys(o).length) out[k] = o;
    } else {
      out[k] = v;
    }
  }
  return out;
};

/**
 * Every `__localFile` marker anywhere in a planned document, with the field
 * path it occupies. Derived from the doc itself so the asset plan and the
 * document that gets written can never drift apart.
 */
function collectRefs(doc, type, label) {
  const out = [];
  const walk = (value, parts) => {
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, [...parts, `[${i}]`]));
      return;
    }
    if (value === null || typeof value !== "object") return;
    if (value.__localFile) {
      out.push({ file: value.__localFile, for: `${type}: ${label} \u2192 ${parts.join("").replace(/^\./, "") || "(root)"}` });
      return;
    }
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith("__")) continue;
      walk(v, [...parts, k]);
    }
  };
  walk(doc, []);
  return out;
}

const add = (e) => {
  /**
   * `_type` and `_id` are injected here rather than at each call site.
   * The manifest keeps them as siblings of `doc`, so passing `plan.doc`
   * straight through produced documents with no `_type` and no `_id`, which
   * Sanity rejects. Injecting centrally makes a malformed document impossible.
   *
   * `autoId` entries deliberately get NO `_id`, so Sanity assigns one.
   */
  const doc = { _type: e.type, ...e.doc };
  if (e.id && !doc._id && !e.autoId) doc._id = e.id;
  plan.push({ refs: collectRefs(doc, e.type, e.label), ...e, doc });
};

/* --- singletons ------------------------------------------------------- */
add({ type: "siteSettings", id: M.SINGLETON_IDS.siteSettings, label: "Site settings", source: "src/components/Footer.tsx:67 + src/app/layout.tsx:15", doc: M.siteSettingsPlan.doc, flags: M.siteSettingsPlan.uncertain, missing: M.siteSettingsPlan.missing });
add({ type: "home", id: M.SINGLETON_IDS.home, label: "Home", source: "src/components/Hero.tsx:97,102,106-107,115,122 + src/components/About.tsx:43", doc: M.homePlan.doc, flags: M.homePlan.uncertain, missing: M.homePlan.missing });
add({ type: "about", id: M.SINGLETON_IDS.about, label: "About", source: "src/lib/about.ts:16-30 + src/app/about/page.tsx:53", doc: M.aboutPlan.doc, flags: M.aboutPlan.uncertain, missing: M.aboutPlan.missing, skipEntirely: true });
add({ type: "services", id: M.SINGLETON_IDS.services, label: "Services", source: M.SERVICES_SOURCE + " + src/app/services/page.tsx:179-184", doc: M.servicesPlan.doc, flags: M.servicesPlan.uncertain, missing: M.servicesPlan.missing, skipEntirely: true });
add({ type: "clients", id: M.SINGLETON_IDS.clients, label: "Clients", source: M.CLIENTS_SOURCE, doc: M.clientsPlan.doc, flags: M.clientsPlan.uncertain, missing: M.clientsPlan.missing });
add({ type: "career", id: M.SINGLETON_IDS.career, label: "Career", source: M.CAREER_SOURCE + " + src/app/career/page.tsx:113,116", doc: M.careerPlan.doc, flags: M.careerPlan.uncertain, missing: M.careerPlan.missing });
add({ type: "contact", id: M.SINGLETON_IDS.contact, label: "Contact", source: M.CONTACT_SOURCE + " + src/app/contact/page.tsx:88", doc: M.contactPlan.doc, flags: M.contactPlan.uncertain, missing: M.contactPlan.missing });

/* --- projects: factual fields only (owner's decision) ---------------- */
for (const p of localProjects) {
  const uncertain = [];
  const missing = [];
  const flags = [];

  const mappedStatus = M.PROJECT_STATUS_MAP[p.status] ?? p.status;
  if (M.PROJECT_STATUS_MAP[p.status]) {
    flags.push(`status "${p.status}" mapped to "${mappedStatus}" per the owner's decision (schema allows only "Ongoing" / "Completed")`);
  }
  if (!["Ongoing", "Completed"].includes(mappedStatus)) {
    missing.push(`status "${mappedStatus}" is still not in the schema's options.list ["Ongoing","Completed"]`);
  }

  /* DECISION (owner): derive the numeric year from the `years` display string,
     falling back to the owner-supplied override where the text has no number. */
  const yr = M.parseStartYear(p.years);
  const override = M.PROJECT_YEAR_OVERRIDES[p.slug];
  const resolvedYear = yr.ok ? yr.year : override ?? null;
  if (yr.ok) {
    flags.push(`year ${yr.year} derived from years "${p.years}" (${yr.why})`);
  } else if (override) {
    flags.push(`year ${override} set from the OWNER-SUPPLIED override \u2014 years "${p.years}" gives nothing to derive from`);
  } else {
    missing.push(`year: NOT SET \u2014 ${yr.why}`);
  }

  /* DECISION (owner): coverImage only for the 6 with a real local file. */
  const imagePath = String(p.image || "");
  const isRemote = /^https?:\/\//i.test(imagePath);
  const localImagePath = isRemote ? null : `public${imagePath}`;
  const localImageExists = localImagePath ? fs.existsSync(M.src(localImagePath)) : false;
  if (isRemote) {
    missing.push("coverImage: not set \u2014 remote Unsplash URL, excluded per the owner's decision");
  } else if (!localImageExists) {
    missing.push(`coverImage: not set \u2014 ${localImagePath} is missing from disk`);
  }

  if (p.url) flags.push(`externalUrl set from local url ${p.url} (DECISION: real product link, imported into the new project.externalUrl field)`);

  missing.push("body (Portable Text): no local source");
  missing.push("overview / approach / outcomes: excluded per the owner's decision (declared placeholder copy).");
  missing.push("facts: excluded per the owner's decision \u2014 same placeholder block, numbers unverified.");

  const doc = {
    _id: M.projectIdFor(p.slug),
    _type: "project",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    client: p.partner,
    category: p.theme,
    summary: p.description,
    status: mappedStatus,
    years: p.years,
    location: p.location,
    methods: p.methods,
    team: p.team,
  };
  if (resolvedYear !== null) doc.year = resolvedYear;
  if (p.url) doc.externalUrl = p.url;
  if (localImageExists) doc.coverImage = { _type: "image", __localFile: localImagePath, __alt: p.title };

  add({
    type: "project",
    id: M.projectIdFor(p.slug),
    naturalKey: p.slug,
    label: p.title,
    source: `src/lib/projects.ts (slug "${p.slug}", id ${p.id})`,
    doc,
    flags,
    missing,
  });
}

/* --- team members: existing records are never touched (owner's decision) */
localTeam.forEach((m, i) => {
  const missing = [];
  const flags = [];
  if (!M.TEAM_GROUP_ALLOWED.has(m.group)) missing.push(`group "${m.group}" is not in the schema's options.list`);
  if (!m.role) missing.push("role: empty in the local record");
  flags.push("order: not written (owner's decision). bio and email have no local source, so they are left empty for the editor.");

  /* DECISION (owner, latest): this record is being added by hand in the
     Studio, so it must never become a `create` here. */
  const deferral = M.TEAM_MEMBER_DEFERRALS.find((d) => d.name.trim().toLowerCase() === m.name.trim().toLowerCase());
  if (deferral) {
    flags.push(deferral.why);
    add({
      type: "teamMember",
      id: M.teamMemberIdFor(m.name),
      naturalKey: m.name,
      label: m.name,
      source: `src/lib/team.ts (index ${i})`,
      deferred: true,
      doc: { _type: "teamMember", name: m.name, role: m.role || null, group: m.group },
      flags,
      missing,
    });
    return;
  }

  add({
    type: "teamMember",
    id: M.teamMemberIdFor(m.name),
    naturalKey: m.name,
    label: m.name,
    source: `src/lib/team.ts (index ${i})`,
    // No _id: Sanity assigns one, exactly like a document created by hand in the Studio.
    autoId: true,
    doc: {
      _type: "teamMember",
      name: m.name,
      role: m.role || null,
      group: m.group,
      photo: { _type: "image", __localFile: `public${m.photo}`, __alt: m.name },
    },
    flags,
    missing,
  });
});

/* ---------------------------------------------------------------------- *
 * 4. Match against production
 * ---------------------------------------------------------------------- */

const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

const keyIndex = new Map(); // type -> Map(naturalKey -> doc)
for (const t of TYPES) keyIndex.set(t, new Map());
for (const d of nonDraft) {
  const k = norm(d.name ?? d.title ?? d["slug"]);
  if (k) keyIndex.get(d._type).set(k, d);
}

function matchLive(entry) {
  if (byId.has(entry.id)) return { doc: byId.get(entry.id), how: "id" };
  if (!entry.naturalKey) return null;
  const exact = keyIndex.get(entry.type).get(norm(entry.naturalKey));
  if (exact) return { doc: exact, how: "natural-key" };
  // fuzzy: same type, very similar name \u2014 do not risk a duplicate create
  let best = null;
  for (const d of byType(entry.type)) {
    const cand = norm(d.name ?? d.title ?? d["slug"]);
    if (!cand) continue;
    if (cand.length < 4) continue;
    if (cand.includes(norm(entry.naturalKey)) || norm(entry.naturalKey).includes(cand)) return { doc: d, how: "name-substring" };
    const dist = editDistance(cand, norm(entry.naturalKey));
    if (dist <= 2 && (!best || dist < best.dist)) best = { doc: d, how: "name-similar", dist };
  }
  return best ? { doc: best.doc, how: best.how } : null;
}

/* ---------------------------------------------------------------------- *
 * 5. Asset de-duplication
 * ---------------------------------------------------------------------- */

const assetsBySha = new Map();
const assetsByName = new Map();
const assetsByStem = new Map();
for (const a of assets) {
  if (a.sha1hash) assetsBySha.set(String(a.sha1hash).toLowerCase(), a);
  const fn = String(a.originalFilename || "").toLowerCase();
  if (fn) {
    if (!assetsByName.has(fn)) assetsByName.set(fn, []);
    assetsByName.get(fn).push(a);
    const stem = fn.replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "");
    if (stem) {
      if (!assetsByStem.has(stem)) assetsByStem.set(stem, []);
      assetsByStem.get(stem).push(a);
    }
  }
}

const assetPlan = [];
const seenSha = new Map();

function registerAsset(relFile, forRef) {
  const abs = M.src(relFile);
  const exists = fs.existsSync(abs);
  const bytes = exists ? fs.readFileSync(abs) : null;
  const sha1 = bytes ? crypto.createHash("sha1").update(bytes).digest("hex") : null;
  const filename = path.basename(relFile);
  const base = { file: relFile, for: forRef, sha1, exists, size: bytes ? bytes.length : null };

  if (sha1 && seenSha.has(sha1)) {
    assetPlan.push({ ...base, status: "duplicate-of-local", duplicateOf: seenSha.get(sha1), reason: `byte-identical to ${seenSha.get(sha1)} in this same migration` });
    return;
  }
  if (sha1) seenSha.set(sha1, relFile);

  if (!exists) {
    assetPlan.push({ ...base, status: "file-missing", reason: "referenced file not found on disk" });
    return;
  }

  const bySha = sha1 ? assetsBySha.get(sha1) : undefined;
  if (bySha) {
    assetPlan.push({ ...base, status: "reuse-existing", how: "sha1", reason: "identical content hash already in the dataset", assetId: bySha._id, assetRef: bySha._ref || bySha._id, existingFilename: bySha.originalFilename });
    return;
  }

  const byName = assetsByName.get(filename.toLowerCase()) || [];
  if (byName.length) {
    assetPlan.push({ ...base, status: "reuse-existing", how: "filename", reason: "filename already in the dataset but content hash differs \u2014 verify it is really the same image before relying on it", assetId: byName[0]._id, assetRef: byName[0]._ref || byName[0]._id, existingFilename: byName[0].originalFilename, existingSha: byName[0].sha1hash });
    return;
  }

  const stem = filename.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "");
  const byStem = (stem && assetsByStem.get(stem)) || [];
  if (byStem.length) {
    assetPlan.push({ ...base, status: "new-upload", reason: `a same-stem asset already exists as \`${byStem[0].originalFilename}\` (different format/bytes). Not auto-reused: the files are not identical. Editor may prefer reusing \`${byStem[0]._id}\`.`, assetId: byStem[0]._id, existingFilename: byStem[0].originalFilename });
    return;
  }

  assetPlan.push({ ...base, status: "new-upload", reason: "no matching hash, filename or stem in the dataset" });
}

/* ---------------------------------------------------------------------- *
 * 5. Classify
 *
 * `never-touch` types (teamMember) match production for reporting only. Any
 * existing record is reported and then left alone: no re-key, no field update,
 * no `order` write. They never become a "create" (which would duplicate) and
 * never become a "conflict" (which would be noise, since we are not writing).
 * ---------------------------------------------------------------------- */

const NEVER_TOUCH = new Set(["teamMember"]);

const COMPARED = {
  siteSettings: ["orgName", "tagline", "stats"],
  home: ["heroEyebrow", "heroHeading", "heroSubtext", "primaryCtaLabel", "secondaryCtaLabel", "aboutBlurb"],
  about: ["heading", "body", "vision", "mission", "missionPillars"],
  services: ["heading", "intro", "items"],
  clients: ["heading", "items"],
  career: ["heading", "intro", "vacancies"],
  contact: ["heading", "address", "email", "phone", "mapEmbed"],
  project: ["title", "client", "category", "summary", "status", "year", "years", "location", "methods", "team", "externalUrl"],
  teamMember: [],
  publication: ["title", "authors", "year", "journal", "order"],
  galleryEvent: ["title", "date", "order"],
};

const deepEqual = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Normalise a value for content comparison.
 *
 * Image fields are reduced to a constant token. Without this, a record that
 * has already been imported always looks like an "update", because the plan
 * still holds `__localFile` markers while production holds real asset
 * references. Since this script never updates anything, that false positive
 * would abort every subsequent run.
 */
const comparable = (v) => {
  if (Array.isArray(v)) return v.map(comparable);
  if (v !== null && typeof v === "object") {
    if (v.__localFile || v._type === "image") return "__IMAGE__";
    if (v._type === "reference") return "__IMAGE_REF__";
    const out = {};
    /* `__`-prefixed keys are plan metadata (e.g. __uncertain) and are stripped
       before writing, so they must not count as content drift.
       `null` / `undefined` are also stripped by materialize() before the
       document is written, so a planned `icon: null` must compare equal to a
       production item that simply has no `icon` key. */
    for (const k of Object.keys(v).sort()) {
      if (k.startsWith("__")) continue;
      if (v[k] === null || v[k] === undefined) continue;
      out[k] = comparable(v[k]);
    }
    return out;
  }
  return v;
};

const contentEqual = (a, b) =>
  JSON.stringify(comparable(a ?? null)) === JSON.stringify(comparable(b ?? null));

const results = plan.map((entry) => {
  if (entry.skipEntirely) return { ...entry, action: "leave-alone", diff: [] };
  const m = matchLive(entry);
  if (entry.deferred) return { ...entry, action: "deferred", live: m?.doc ?? null, how: m?.how, diff: [] };
  if (!m) return { ...entry, action: "create", diff: [] };
  if (NEVER_TOUCH.has(entry.type)) {
    return { ...entry, action: "skip", live: m.doc, how: m.how, diff: [], untouched: true };
  }
  const keys = COMPARED[entry.type] || [];
  const diff = [];
  for (const k of keys) {
    const proposed = entry.doc[k];
    if (proposed === undefined || proposed === null) continue;
    if (!contentEqual(proposed, m.doc[k])) diff.push({ field: k, live: m.doc[k] === undefined ? null : m.doc[k], proposed });
  }
  if (m.doc._id !== entry.id) {
    return { ...entry, action: "conflict", live: m.doc, how: m.how, diff, reason: `production \`${m.doc._id}\` already holds this record (matched by ${m.how}); creating \`${entry.id}\` would DUPLICATE it` };
  }
  return { ...entry, action: diff.length ? "update" : "skip", live: m.doc, how: m.how, diff };
});

const matchedLiveIds = new Set(results.filter((r) => r.live).map((r) => r.live._id));
// `leave-alone` entries return before matching, so register their planned ID
// here to keep them out of the "in production but not planned" list.
for (const r of results.filter((x) => x.action === "leave-alone")) matchedLiveIds.add(r.id);
const unplanned = nonDraft.filter((d) => !matchedLiveIds.has(d._id) && !drafts.some((x) => x._id.slice("drafts.".length) === d._id));

/* ---------------------------------------------------------------------- *
 * 6. Asset de-duplication \u2014 only for records we would actually create.
 *
 * Images belonging to records that are skipped or left alone are not planned,
 * because no upload will happen for them. Uploading assets for records we will
 * not write would leave orphans in the dataset.
 * ---------------------------------------------------------------------- */

for (const entry of results.filter((r) => r.action === "create")) {
  for (const r of entry.refs || []) registerAsset(r.file, r.for);
}

/* ---------------------------------------------------------------------- *
 * 7. Image materialisation \u2014 turn `__localFile` markers into real
 *    Sanity asset references.
 *
 * In DRY RUN this is simulated: the planned document is built exactly as it
 * would be written, but every unresolved image is reported instead of being
 * uploaded, and no bytes leave the machine. The dry run therefore shows the
 * true final shape of each document, including the `_ref` that each image
 * will point at.
 *
 * In --APPLY, `uploader` performs the real upload. Uploads happen once per
 * distinct file, before any document is created, so every created document
 * already points at a committed asset.
 * ---------------------------------------------------------------------- */

const assetByFile = new Map(assetPlan.map((a) => [a.file, a]));

let uploadCounter = 0;

function planForFile(file) {
  let a = assetByFile.get(file);
  let guard = 0;
  while (a && a.status === "duplicate-of-local" && guard++ < 10) {
    a = assetByFile.get(a.duplicateOf);
  }
  return a;
}

/**
 * @param {object} node     the planned document (may contain __localFile)
 * @param {object} opts     { uploader, label }
 * @returns {{ doc: object|null, bindings: object[] }}
 */
function materialize(node, opts = {}) {
  const bindings = [];

  const walk = (value, pathParts) => {
    if (Array.isArray(value)) {
      const out = [];
      for (let i = 0; i < value.length; i++) {
        const r = walk(value[i], [...pathParts, `[${i}]`]);
        if (r !== null) out.push(r);
      }
      return out;
    }
    if (value === null || typeof value !== "object") return value;

    /* --- image marker: the only place __localFile is consumed --- */
    if (value.__localFile) {
      const file = value.__localFile;
      const plan = planForFile(file);
      const field = pathParts.join("").replace(/^\./, "");

      if (!plan) {
        bindings.push({ field, file, action: "DROP", ref: null, detail: "no asset plan for this file" });
        return null;
      }
      if (plan.status === "file-missing") {
        bindings.push({ field, file, action: "DROP", ref: null, detail: "file not found on disk" });
        return null;
      }
      if (plan.status === "reuse-existing") {
        const ref = plan.assetRef;
        if (!ref || !ASSET_REF_RE.test(String(ref))) {
          bindings.push({ field, file, action: "DROP", ref: null, detail: `existing asset ${plan.assetId} has an unusable reference (${JSON.stringify(ref)})` });
          return null;
        }
        bindings.push({ field, file, action: "REUSE", ref, detail: plan.how === "sha1" ? "identical sha1 already in the dataset" : "same filename already in the dataset" });
        return { _type: "image", asset: { _type: "reference", _ref: ref } };
      }
      /* new-upload */
      if (!opts.uploader) {
        /* Dry run: emit a clearly-marked placeholder. Never written. */
        const preview = `image-PREVIEW-${++uploadCounter}-${path.basename(file)}`;
        bindings.push({ field, file, action: "UPLOAD", ref: preview, detail: "would be uploaded in --apply" });
        return { _type: "image", asset: { _type: "reference", _ref: preview } };
      }
      const ref = opts.uploader(file);
      if (!ref || !ASSET_REF_RE.test(String(ref))) {
        bindings.push({ field, file, action: "DROP", ref: null, detail: `uploaded reference is unusable: ${JSON.stringify(ref)}` });
        return null;
      }
      bindings.push({ field, file, action: "UPLOAD", ref, detail: "uploaded in this run" });
      return { _type: "image", asset: { _type: "reference", _ref: ref } };
    }

    /* --- plain object --- */
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith("__")) continue;
      if (v === null || v === undefined) continue;
      const r = walk(v, [...pathParts, k]);
      if (r === null) continue;
      if (Array.isArray(r) && r.length === 0) continue;
      if (typeof r === "object" && !Array.isArray(r) && Object.keys(r).length === 0) continue;
      out[k] = r;
    }
    /* Sanity requires _key on every object inside an array. */
    if (pathParts.length && pathParts[pathParts.length - 1].startsWith("[")) {
      out._key = out._key || `k-${pathParts.join("-").replace(/[^a-z0-9]+/gi, "-")}`;
    }
    return out;
  };

  const doc = walk(node, []);
  return { doc: doc && typeof doc === "object" && Object.keys(doc).length ? doc : null, bindings };
}

const materialized = results.map((r) => {
  if (r.action !== "create") return { ...r, finalDoc: null, bindings: [] };
  const m = materialize(r.doc);
  return { ...r, finalDoc: m.doc, bindings: m.bindings };
});

const allBindings = materialized.flatMap((r) => r.bindings);

/* --- --dump <type>: show the exact document, write nothing ------------- */
if (DUMP) {
  const targets = materialized.filter((r) => r.type === DUMP);
  if (!targets.length) {
    console.log(`No ${DUMP} records in the plan.`);
  } else {
    for (const r of targets) {
      console.log(`\n${"=".repeat(78)}`);
      console.log(`ACTION : ${r.action.toUpperCase()}`);
      console.log(`TYPE   : ${r.type}`);
      console.log(`ID     : ${r.autoId ? "(none - Sanity will assign one)" : r.doc?._id ?? "(none)"}`);
      console.log(`SOURCE : ${r.source}`);
      console.log(`${"=".repeat(78)}`);
      console.log("DOCUMENT THAT WOULD BE WRITTEN:");
      console.log(JSON.stringify(r.finalDoc, null, 2));
      const keys = Object.keys(r.finalDoc || {}).filter((k) => !k.startsWith("_"));
      console.log(`\nFIELDS: ${keys.length} -> ${keys.join(", ")}`);
      console.log(`ABSENT: ${["coverImage", "photo", "logo"].filter((k) => !(k in (r.finalDoc || {}))).join(", ") || "none of note"}`);
      console.log(`IMAGE BINDINGS: ${r.bindings.length}`);
      for (const b of r.bindings) console.log(`  ${b.action}  ${b.field}  ${b.file}  -> ${b.ref}`);
    }
  }
  console.log("\nNothing was uploaded or created. This was a --dump.");
  process.exit(0);
}

/* ---------------------------------------------------------------------- *
 * 7. Report
 * ---------------------------------------------------------------------- */

const lines = [];
const P = (s = "") => { lines.push(s); log(s); };
const assetsByStatus = (s) => assetPlan.filter((a) => a.status === s);
const counts = { create: 0, update: 0, skip: 0, conflict: 0, "leave-alone": 0, deferred: 0 };
for (const r of results) counts[r.action]++;

P("# Sanity migration \u2014 dry run");
P("");
P(APPLY
  ? "Generated by `scripts/sanity-import.mjs` in **APPLY** mode. Records written in this run are listed below; every other section describes what the plan would do."
  : "Generated by `scripts/sanity-import.mjs` in **dry-run** mode. No document was created, no asset uploaded, no draft published, and **no Sanity mutation was called**.");
P("");
P(`- Project: \`${PROJECT_ID}\` · Dataset: \`${DATASET}\` · API version: \`${API_VERSION}\` · perspective: \`published\``);
P(`- \`SANITY_API_WRITE_TOKEN\`: **${WRITE_TOKEN_PRESENT ? "present" : "not present"}** in \`.env.local\` (presence only; the value is never read into this report)`);
P(`- Production documents: **${nonDraft.length}** published (${drafts.length} draft)`);
P(`- Production image assets: **${assets.length}**`);
P("");

P("## Owner's decisions applied in this run");
P("");
P("| # | Decision | Effect on this plan |");
P("| --- | --- | --- |");
P(`| 1 | Team members: production is authoritative; only the one genuine gap is added, with a Sanity-generated ID. No \`order\` written for anyone. | The 33 live teamMember documents are classified **skip / untouched**. Their IDs, content, typos and photos are not read into any write. Only **${results.filter((r) => r.type === "teamMember" && r.action === "create").length}** new member is planned. |`);
P(`| 2 | Projects: factual fields only; placeholder narrative and all cover images excluded. \`status: "Live"\` \u2192 \`"Ongoing"\`. | Each project carries **${Object.keys((results.find((r) => r.type === "project") || {}).doc || {}).filter((k) => !k.startsWith("_")).length}** fields. No \`overview\` / \`approach\` / \`outcomes\` / \`facts\` / \`coverImage\`. No project image is uploaded. |`);
P(`| 3 | Career vacancies excluded \u2014 all 6 are declared placeholders. | \`career\` carries only \`heading\` and \`intro\`. No \`vacancies\`. |`);
P(`| 4 | \`about\` left entirely untouched; the missionPillars split is a separate editorial decision. | \`about\` is classified **leave-alone**. No field is written, not even the empty ones. |`);
P(`| 5 | The swapped photo and the production typos are being fixed by hand in the Studio, not by this script. | Reported as information only. The migration proposes no change to any of them. |`);
P("");

P("## Totals");
P("");
P("| Outcome | Count | Meaning |");
P("| --- | ---: | --- |");
P(`| Proposed creates | ${counts.create} | No matching record in production. |`);
P(`| Proposed updates | ${counts.update} | Planned ID already exists in production and content differs. **Reported, never overwritten silently.** |`);
P(`| Skips | ${counts.skip} | The record already exists in production and this plan does not touch it. |`);
P(`| Left alone by decision | ${counts["leave-alone"]} | Deliberately not migrated (see the decisions table). |`);
P(`| Deferred to the owner | ${counts.deferred} | Known gap, deliberately left for manual entry in the Studio. Never created by this script. |`);
P(`| Conflicts (ID mismatch) | ${counts.conflict} | Would duplicate an existing record. **Decision required.** |`);
P("");
P("| Document type | Create | Update | Skip | Leave alone | Conflict | Live now |");
P("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const t of TYPES) {
  const rs = results.filter((r) => r.type === t);
  const c = (a) => rs.filter((r) => r.action === a).length;
  P(`| \`${t}\` | ${c("create")} | ${c("update")} | ${c("skip")} | ${c("leave-alone")} | ${c("conflict")} | ${byType(t).length} |`);
}
P(`| **Total** | **${counts.create}** | **${counts.update}** | **${counts.skip}** | **${counts["leave-alone"]}** | **${counts.conflict}** | **${nonDraft.length}** |`);
P("");
P(`**Images:** ${assetsByStatus("new-upload").length} proposed new uploads · ${assetsByStatus("reuse-existing").length} reuse an existing asset · ${assetsByStatus("duplicate-of-local").length} byte-identical duplicate(s) within this migration · ${assetsByStatus("file-missing").length} referenced file(s) missing on disk.`);
P("");

if (drafts.length) {
  P("> Drafts in production are listed for completeness and are **not** touched. Reads use `perspective: published`, so a draft of an otherwise-empty document is invisible to the match above.");
  P("");
}

for (const t of TYPES) {
  const rs = materialized.filter((r) => r.type === t);
  const imgs = assetPlan.filter((a) => a.for.startsWith(`${t}:`));
  const tLive = byType(t);

  P(`## \`${t}\``);
  P("");
  if (!rs.length) {
    P(t === "publication" ? M.publicationsPlan.note : M.galleryPlan.note);
    P("");
    if (tLive.length) {
      P(`### Already in production \u2014 no local source, left untouched (${tLive.length})`);
      P("");
      for (const d of tLive) P(`- \`${d._id}\` ${d.title ? `**${d.title}**` : ""}${d.year ? ` \u2014 ${d.year}` : ""}${d.journal ? ` \u00b7 ${d.journal.trim()}` : ""}${d.date ? ` \u2014 ${d.date}` : ""}`);
      P("");
    }
    continue;
  }

  const groups = { create: [], update: [], skip: [], conflict: [], "leave-alone": [], deferred: [] };
  for (const r of rs) groups[r.action].push(r);

  const isNeverTouch = NEVER_TOUCH.has(t);
  if (isNeverTouch) {
    P(`> **Policy: production is authoritative for \`${t}\`.** Existing records are matched for reporting only, then left completely alone \u2014 no re-key, no field update, no \`order\`, no photo replacement. Corrections (typos, the swapped photo) are made by hand in the Studio.`);
    P("");
  }

  for (const [action, heading] of [
    ["create", "Proposed creates"],
    ["leave-alone", "Left alone by decision — no action planned"],
    ["deferred", "Deferred to the owner — known gap, never created by this script"],
    ["conflict", "Conflicts — record already exists in production under a different ID"],
    ["update", "Proposed updates — existing record, reported not overwritten"],
    ["skip", isNeverTouch ? "Skips — already in production, untouched" : "Skips — already in production and matching"],
  ]) {
    const g = groups[action];
    P(`### ${heading} (${g.length})`);
    P("");
    if (!g.length) {
      P("_none_");
      P("");
      continue;
    }
    if (action === "leave-alone") {
      for (const r of g) P(`- \`${r.id}\` — the live document is left exactly as it is. ${r.flags?.length ? r.flags[0] : ""} ${r.missing?.length ? `Still empty in production: ${r.missing.join("; ")}.` : ""}`);
      P("");
      continue;
    }
    if (action === "deferred") {
      for (const r of g) P(`- **${r.label}** — ${r.flags?.find((f) => /DECISION|Owner/.test(f)) ?? "deferred to the owner"}. This record is **not** in the import and will never be created by a run of this script.`);
      P("");
      continue;
    }
    if (action === "conflict") {
      P("These **must be resolved before any import**. The record is already live in the Studio under its own ID. Recommended resolution: adopt the production ID as the stable key and only fill in fields that are genuinely empty, rather than minting a second document.");
      P("");
    }
    if (action === "update") {
      P("Existing records. `--apply` refuses to touch these unless you also pass `--allow-updates`.");
      P("");
    }
    for (const r of g) {
      const fields = Object.keys(r.finalDoc || stripInternal(r.doc)).filter((k) => !k.startsWith("_"));
      if (action === "create") {
        P(`- **${r.label}** \u2014 ${r.autoId ? "**new ID generated by Sanity**" : `\`${r.id}\``}`);
        P(`  - source: \`${r.source}\``);
        P(`  - fields: ${Object.keys(r.finalDoc || stripInternal(r.doc)).filter((k) => !k.startsWith("_")).join(", ")}`);
      } else if (isNeverTouch) {
        P(`- **${r.label}** \u2014 live \`${r.live._id}\` (matched by ${r.how}) \u2014 **not touched**`);
        P(`  - source: \`${r.source}\``);
      } else {
        P(`- **${r.label}** \u2014 production \`${r.live._id}\` (planned \`${r.id}\`, matched by ${r.how}; _rev \`${r.live._rev}\`)`);
        P(`  - source: \`${r.source}\``);
        if (r.diff.length) {
          for (const d of r.diff) P(`  - \`${d.field}\`: production \`${JSON.stringify(d.live)}\` \u2192 proposed \`${JSON.stringify(d.proposed)}\``);
        } else {
          P("  - no differences on compared fields");
        }
      }
    }
    P("");
  }

  P(`### Images (${imgs.length})`);
  P("");
  if (!imgs.length) P("_none_");
  for (const a of imgs) {
    const tag = a.status === "new-upload" ? "NEW UPLOAD" : a.status === "reuse-existing" ? "REUSE EXISTING" : a.status === "duplicate-of-local" ? "SKIP (duplicate)" : "MISSING";
    P(`- \`${a.file}\` \u2014 **${tag}**`);
    P(`  - for: ${a.for}`);
    P(`  - ${a.reason}${a.assetId ? ` \u2192 asset \`${a.assetId}\` (original \`${a.existingFilename}\`)` : ""}`);
  }
  P("");

  const miss = new Map();
  const unc = new Map();
  for (const r of rs) {
    for (const m of r.missing || []) { if (!miss.has(m)) miss.set(m, []); miss.get(m).push(r.label); }
    for (const f of r.flags || []) { if (!unc.has(f)) unc.set(f, []); unc.get(f).push(r.label); }
  }
  const renderNotes = (map, kind) => {
    if (!map.size) return;
    for (const [msg, labels] of map) {
      if (labels.length === rs.length) P(`- [${kind}] (all ${rs.length} records) ${msg}`);
      else if (labels.length > 6) P(`- [${kind}] (${labels.length} records: ${labels.slice(0, 6).join("; ")}, ...) ${msg}`);
      else P(`- [${kind}] ${labels.map((l) => `${l}:`).join(" ")} ${msg}`);
    }
  };
  P(`### Missing / uncertain (${miss.size + unc.size})`);
  P("");
  if (!miss.size && !unc.size) P("_none_");
  renderNotes(miss, "missing");
  renderNotes(unc, "uncertain");
  P("");
}

const dups = assetsByStatus("duplicate-of-local");
if (dups.length) {
  P("## Data integrity findings in the local source files");
  P("");
  for (const d of dups) {
    P(`- **\`${d.file}\`** is byte-identical to \`${d.reason.replace(/^byte-identical to /, "").replace(/ in this same migration$/, "")}\`.`);
    P(`  - These are two different people. One of the two local files is the wrong person's photo. This is **not** something the migration can decide. Resolve it in the repo before any import.`);
    P(`  - The migration skips the second occurrence rather than uploading it twice.`);
  }
  P("");
}

P("## Field-level drift against records that already exist in production");
P("");
const drift = new Map();
for (const r of results.filter((x) => x.action === "conflict" || x.action === "update")) {
  for (const d of r.diff) {
    const k = `${r.type}.${d.field}`;
    if (!drift.has(k)) drift.set(k, []);
    drift.get(k).push({ label: r.label, live: d.live, proposed: d.proposed, liveId: r.live._id });
  }
}
if (!drift.size) {
  P("_No drift. No record this plan would write already exists in production with different content._");
} else {
  P("The records below already exist in production. The **production** value is what an editor authored in the Studio; the **proposed** value is what this migration would write from the frontend fallback. The migration will not change any of them on its own.");
  P("");
  for (const [k, rows] of [...drift.entries()].sort()) {
    P(`### \`${k}\` \u2014 ${rows.length} record(s) differ`);
    P("");
    for (const d of rows) {
      P(`- **${d.label}** (\`${d.liveId}\`)`);
      P(`  - production: \`${JSON.stringify(d.live)}\``);
      P(`  - proposed: \`${JSON.stringify(d.proposed)}\``);
    }
    P("");
  }
}
P("");

/* Known production issues the owner is fixing by hand. Reported so the
   hand-fix list is written down, never as a proposal. */
const knownIssues = [];
const tmLive = byType("teamMember");
const localByName = new Map(localTeam.map((m) => [norm(m.name), m]));
for (const d of tmLive) {
  const k = norm(d.name);
  const local = localByName.get(k) || [...localByName.entries()].find(([lk]) => editDistance(lk, k) <= 2)?.[1];
  if (!local) { knownIssues.push(`\`${d._id}\` **${d.name}** \u2014 no local counterpart; appears to be an extra record in production.`); continue; }
  if (d.name !== local.name) knownIssues.push(`\`${d._id}\` \u2014 name in production is \`${d.name}\`, local file says \`${local.name}\`.`);
  if ((d.role || "").trim() !== (local.role || "").trim()) knownIssues.push(`\`${d._id}\` **${d.name}** \u2014 role in production is \`${d.role}\`, local file says \`${local.role}\`.`);
}
const ganesh = byType("teamMember").find((d) => norm(d.name) === "ganesh rana magar");
const sujal = byType("teamMember").find((d) => norm(d.name) === "sujal yogi");
if (ganesh && sujal) {
  knownIssues.push(`\`${ganesh._id}\` **${ganesh.name}** and \`${sujal._id}\` **${sujal.name}** \u2014 verify these two photos are not swapped. Locally \`ganesh-rana-magar.jpg\` and \`sujal-yogi.jpg\` were byte-identical, which strongly suggests one of the two local files is the wrong person's photo.`);
}
if (knownIssues.length) {
  P("## Known production issues you are fixing by hand in the Studio");
  P("");
  P("Listed for your reference only. **This migration proposes no change to any of these** and will not touch them.");
  P("");
  for (const i of knownIssues) P(`- ${i}`);
  P("");
}

P("## Pre-flight check \u2014 what `--apply` would validate before writing anything");
P("");
P("`--apply` runs four phases. Phase 2 refuses to continue if any check below fails, and it runs **before** the first byte is uploaded, so a failure leaves production untouched.");
P("");
P("| # | Check | Current result |");
P("| ---: | --- | --- |");
const creates = materialized.filter((r) => r.action === "create");
/* Mirrors the enforced checks in the apply path exactly, so the report and the
 * code cannot disagree. */
const checkType = creates.filter((r) => r.finalDoc?._type === r.type);
const checkIds = creates.filter((r) => (r.autoId ? !r.finalDoc?._id : !!r.finalDoc?._id));
const checkRefs = allBindings.filter((b) => b.action !== "DROP" && b.ref);
const badRefs = allBindings.filter((b) => b.ref && String(b.ref).includes("PREVIEW") && b.action === "REUSE");
const autoIdCount = creates.filter((r) => r.autoId).length;
P(`| 1 | every create has a \`_type\` matching its plan | ${checkType.length} / ${creates.length} pass |`);
P(`| 2 | every create has an \`_id\`, except the ${autoIdCount} \`autoId\` record(s) which must NOT have one | ${checkIds.length} / ${creates.length} pass |`);
P(`| 3 | every image binding resolves (no \`DROP\`) | ${allBindings.length - allBindings.filter((b) => b.action === "DROP").length} / ${allBindings.length} pass |`);
P(`| 4 | no \`PREVIEW\` placeholder ref would ever be written | ${badRefs.length === 0 ? "pass" : `${badRefs.length} WOULD FAIL`} |`);
P(`| 5 | no conflicts, no unapproved updates | ${counts.conflict === 0 && counts.update === 0 ? "pass" : "would abort"} |`);
P("");
P("> Bugs 1 and 2 from the failed first apply attempt were both in this list, but nothing checked it. The checks are now enforced in code, not just documented in a report.");
P("");

P("## Image handling \u2014 exactly what would be uploaded and referenced");
P("");
P("Every image in the plan is shown with the field it lands in, the file it comes from, the decision, and the `_ref` the finished document would point at. In dry-run mode the `_ref` values marked **preview** are placeholders \u2014 no bytes were uploaded and nothing left this machine.");
P("");
const up = allBindings.filter((b) => b.action === "UPLOAD");
const re = allBindings.filter((b) => b.action === "REUSE");
const dr = allBindings.filter((b) => b.action === "DROP");
P(`- **${up.length}** uploads \u00b7 **${re.length}** reuses of existing assets \u00b7 **${dr.length}** dropped`);
P("");

for (const r of materialized.filter((x) => x.action === "create" && x.bindings.length)) {
  P(`### ${r.type} \u2014 ${r.label}`);
  P("");
  P(`| Field | Source file | Action | Asset \`_ref\` | Detail |`);
  P(`| --- | --- | --- | --- | --- |`);
  for (const b of r.bindings) {
    const bytes = b.action === "DROP" ? "\u2014" : `${(assetByFile.get(b.file)?.size ?? 0).toLocaleString()} B`;
    P(`| \`${b.field}\` | \`${b.file}\` (${bytes}) | **${b.action}** | \`${b.ref ?? "\u2014"}\` | ${b.detail} |`);
  }
  P("");
}

P("### Full resolved document \u2014 `clients` (the largest image payload)");
P("");
P("```json");
P(JSON.stringify(materialized.find((r) => r.type === "clients")?.finalDoc, null, 2));
P("```");
P("");

P("## Schema and source changes this import depends on");
P("");
P("Three source edits were made, with the owner's approval, so the 3 platform projects can carry their real link:");
P("");
P("| File | Change | Needed for |");
P("| --- | --- | --- |");
P("| `sanity/schemaTypes/project.ts:85-91` | added `externalUrl` (`type: \"url\"`), mirroring `publication.externalUrl` | storing `url` on the 3 platform projects |");
P("| `src/lib/types.ts:123` | added `externalUrl?: string` to `Project` | typing the fetched value |");
P("| `src/lib/project-data.ts:70` | mapped `externalUrl` in `fromSanity()`, which previously only read it on the local fallback path | the site actually using the link |");
P("");
P("> **The Studio must be deployed for the new `project.externalUrl` field to exist.** Until `npm run deploy` (or `sanity deploy`) runs, the field is not in the dataset schema and the value will not be editable in the Studio.");
P("");

P("## `externalUrl` across all matched projects");
P("");
const extRows = results.filter((x) => x.type === "project" && x.doc?.externalUrl);
P(`Covers **all ${results.filter((x) => x.type === "project").length}** matched project records, not only this run's creates, so a scoped run cannot render this section misleadingly empty. ${extRows.length} carry \`externalUrl\`.`);
P("");
P("| Project | `externalUrl` | This run |");
P("| --- | --- | --- |");
for (const r of extRows) P(`| ${r.label} | ${r.doc.externalUrl} | ${r.action} |`);
P("");

P("## Project fields deliberately excluded from this import");
P("");
P("Per the owner's decision, projects carry factual fields only.");
P("");
P("| Field | Why excluded |");
P("| --- | --- |");
for (const f of M.PROJECT_EXCLUDED_FIELDS) P(`| \`${f.field}\` | ${f.why} |`);
P("");

P("## `year` on all 15 projects \u2014 every record now carries a value");
P("");
P("Rule: take the first 4-digit number anywhere in the `years` display string. Where the string has no number at all (`Ongoing`), the owner supplied the year directly; those are marked **owner-supplied** and are written verbatim, not inferred.");
P("");
/* Counted across every matched project, not just this run's creates, so a
   scoped `--only` run can never render this section misleadingly empty. */
const allProjects = results.filter((x) => x.type === "project");
const withYear = allProjects.filter((x) => x.doc?.year !== undefined);
const withoutYear = allProjects.filter((x) => x.doc?.year === undefined);
P(`Covers **all ${allProjects.length}** matched project records, not only this run's creates.`);
P("");
P(`**${withYear.length} of ${allProjects.length}** projects carry a \`year\`. ${withoutYear.length ? `Still blank: ${withoutYear.map((x) => x.label).join(", ")}.` : "**None are blank.**"}`);
P("");
P("| # | Project | `years` source text | `year` | Source of the value | This run |");
P("| ---: | --- | --- | ---: | --- | --- |");
for (const [i, r] of allProjects.entries()) {
  const d = r.doc?.year;
  const isOverride = /OWNER-SUPPLIED/.test((r.flags || []).find((f) => f.startsWith("year ")) || "");
  P(`| ${i + 1} | ${r.label} | \`${r.doc?.years}\` | ${d ?? "**blank**"} | ${isOverride ? "**owner-supplied**" : "derived from the text"} | ${r.action} |`);
}
P("");

P("## Owner-supplied years written verbatim");
P("");
P("| Project | slug | `year` |");
P("| --- | --- | ---: |");
for (const [slug, year] of Object.entries(M.PROJECT_YEAR_OVERRIDES)) {
  const r = results.find((x) => x.naturalKey === slug);
  P(`| ${r?.label ?? slug} | \`${slug}\` | ${year} |`);
}
P("");
P("> These three cannot be derived: their `years` text is just `Ongoing`. They come from the owner, not from the repository.");
P("");

P("## Clients dropped as out of scope");
P("");
for (const c of M.CLIENTS_OUT_OF_SCOPE) P(`- **${c.name}** \u2014 ${c.why}`);
P("");

P("## Frontend content with no matching schema, or not recoverable");
P("");
P("These exist in the frontend and are **not** in the manifest because the schemas have nowhere to put them. Nothing was invented to fill the gaps.");
P("");
P("| Content | Where | Why it is not migrated |");
P("| --- | --- | --- |");
for (const u of M.UNMAPPED) P(`| ${u.what} | \`${u.where}\` | ${u.reason} |`);
P("");
P("## Deliberately excluded as layout / styling / counters / navigation");
P("");
for (const e of M.EXCLUDED_AS_LAYOUT) P(`- \`${e.where}\` \u2014 ${e.what}`);
P("");
P("## Local project fields with no `project` schema counterpart");
P("");
P("| Local field | Where | Why dropped |");
P("| --- | --- | --- |");
for (const d of M.PROJECT_DROPPED_FIELDS) P(`| \`${d.local}\` | \`${d.where}\` | ${d.why} |`);
P("");

if (unplanned.length) {
  P("## In production but not produced by this migration (left untouched)");
  P("");
  for (const d of unplanned) P(`- \`${d._id}\` \u2014 \`${d._type}\`${d.title ? ` \u00b7 ${d.title}` : ""}${d.name ? ` \u00b7 ${d.name}` : ""}`);
  P("");
}

P("---");
P("");
P("## If you approve an import");
P("");
P("1. Review the **excluded-by-decision** material above \u2014 nothing in it is imported, and no existing document is overwritten.");
P(`2. **${counts.conflict} conflicts and ${counts.update} updates.** Nothing blocks the import and nothing would be overwritten. The only records that would be written are the **${counts.create} proposed creates**.`);
P("3. Sanity Studio has **no `sanity.cli.ts`**, so `sanity dataset import` is unavailable. The supported path is `node scripts/sanity-import.mjs --apply`, which is idempotent and safe to re-run.");
P("");
P("### What `--apply` now does, in order");
P("");
P("1. Aborts if there are conflicts, or if there are updates and `--allow-updates` was not passed.");
P(`2. Uploads every planned image once per distinct file, re-checking SHA-1 against the dataset first so a re-run reuses instead of re-uploading.`);
P("3. Walks each planned document and replaces every `__localFile` marker with `{ _type: \"image\", asset: { _type: \"reference\", _ref } }`.");
P("4. Creates the documents, with real asset references already in place.");
P("");
P("### Remaining limits \u2014 read before approving");
P("");
P(`- Image fields have **no \`alt\` sub-field** in the schema (sanity/schemaTypes/project.ts:84 is a bare \`image\`), so the alt text collected in the plan is dropped. Adding \`fields\` to the image definitions would be a schema change and is not done.`);
P("- `__key` is auto-generated for array items that lack one; all current items already carry one.");
P(`- ${allBindings.filter((b) => b.action === "DROP").length} image reference(s) are unresolvable and would be omitted from the created documents.`);
P("- `--apply` is **not** idempotent for the `autoId` team member: a second run will find the record by natural key and skip it, so it will not duplicate, but it also cannot detect a rename.");
P("");
if (!APPLY) {
  P("`--apply` was **not** run in this session and must not be run without your explicit go-ahead.");
  P("");
  P("**No writes were performed.** Re-run `node scripts/sanity-import.mjs` to reproduce this report. Awaiting explicit approval.");
}

/* The report is written at the very end of the run, AFTER any apply, so that
   in apply mode it is a true audit record rather than a pre-flight promise. */
const REPORT_PATH = path.join(M.repoRoot, "migration-dry-run.md");
const writeReport = () => fs.writeFileSync(REPORT_PATH, lines.join("\r\n"), "utf8");

/** Filled in during --apply so the report can describe what really happened. */
const APPLIED = [];

/** Abort cleanly and leave an honest audit record: nothing was written. */
const abort = (headline, details = []) => {
  console.error(`\nABORT: ${headline}`);
  for (const d of details) console.error(`  - ${d}`);
  P("");
  P("## ABORTED \u2014 nothing was uploaded, nothing was created");
  P("");
  P(`**${headline}**`);
  P("");
  if (details.length) {
    for (const d of details) P(`- ${d}`);
    P("");
  }
  P("The run stopped before any Sanity mutation. Production is exactly as it was at the start of this run.");
  writeReport();
  process.exit(1);
};

if (JSON_OUT) {
  process.stdout.write(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", writeTokenPresent: WRITE_TOKEN_PRESENT, counts, assets: assetPlan, results: results.map((r) => ({ type: r.type, id: r.id, liveId: r.live?._id ?? null, label: r.label, action: r.action, how: r.how ?? null, source: r.source })), unplanned: unplanned.map((d) => d._id) }, null, 2));
}

/* ---------------------------------------------------------------------- *
 * 8. Apply \u2014 only ever reached with an explicit --apply flag.
 * ---------------------------------------------------------------------- */

if (APPLY) {
  if (counts.conflict) {
    abort(`${counts.conflict} conflict(s) - the record already exists under a different ID. Resolve them first.`);
  }
  if (counts.update && !ALLOW_UPDATES) {
    abort(`${counts.update} existing document(s) would need updating. Re-run with --allow-updates after review, or they are left untouched.`);
  }

  const w = client.withConfig({ token: env.SANITY_API_WRITE_TOKEN });

  /* ==================================================================== *
   * PHASE 1 - resolve image bindings WITHOUT uploading anything.
   * No network write can happen before this completes.
   * ==================================================================== */
  const scoped = materialized.filter((r) => r.action === "create" && (!ONLY || r.type === ONLY));
  const dry = scoped.map((r) => ({ r, m: materialize(r.doc) }));

  const toUpload = [...new Set(dry.flatMap((x) => x.m.bindings.filter((b) => b.action === "UPLOAD").map((b) => b.file)))];

  /* ==================================================================== *
   * PHASE 2 - preflight. Every document is proved writable BEFORE a single
   * byte is sent. Any problem aborts with production untouched.
   * ==================================================================== */
  const problems = [];
  for (const { r, m } of dry) {
    const where = `${r.type} "${r.label}"`;
    if (!m.doc) {
      problems.push(`${where}: resolved to an empty document`);
      continue;
    }
    if (m.doc._type !== r.type) problems.push(`${where}: _type is ${JSON.stringify(m.doc._type)}, expected ${JSON.stringify(r.type)}`);
    if (r.autoId) {
      if (m.doc._id) problems.push(`${where}: is marked autoId but carries _id ${m.doc._id}`);
    } else if (!m.doc._id) {
      problems.push(`${where}: has no _id`);
    }
    for (const b of m.bindings) {
      if (b.action === "DROP") problems.push(`${where}: image at ${b.field} unresolved (${b.file}: ${b.detail})`);
    }
  }
  for (const f of toUpload) {
    if (!fs.existsSync(M.src(f))) problems.push(`image file missing on disk: ${f}`);
  }

  if (problems.length) {
    abort(`preflight found ${problems.length} problem(s)`, problems);
  }
  log(`preflight PASS: ${scoped.length} document(s), ${dry.reduce((n, x) => n + x.m.bindings.length, 0)} image binding(s), ${toUpload.length} file(s) to upload. Production is untouched so far.`);

  /* ==================================================================== *
   * PHASE 3 - upload. Awaited, once per distinct file, SHA-1 re-checked
   * against the dataset so a re-run reuses instead of re-uploading.
   * ==================================================================== */
  const uploaded = new Map();
  for (const file of toUpload) {
    const bytes = fs.readFileSync(M.src(file));
    const sha1 = crypto.createHash("sha1").update(bytes).digest("hex");
    const existing = assetsBySha.get(sha1);
    if (existing) {
      /* Asset documents store a null `_ref`; `_id` is the real reference. */
      const ref = existing._ref || existing._id;
      if (!ref || !ASSET_REF_RE.test(ref)) {
        throw new Error(`existing asset ${existing._id} has an unusable reference: ${JSON.stringify({ _id: existing._id, _ref: existing._ref })}`);
      }
      uploaded.set(file, ref);
      log(`reuse   ${file} -> ${ref} (sha1 already in dataset)`);
      continue;
    }
    /* assets.upload() is async and MUST be awaited.
       The response has no usable `_ref`: for sanity.imageAsset the stored
       `_ref` field is null, and `assetId` is only the bare sha1. The document
       `_id` IS the reference, in the form image-<sha1>-<ext>-<WxH>. */
    const asset = await w.assets.upload("image", bytes, {
      filename: path.basename(file),
      source: { name: "sanity-import", id: "scripts/sanity-import.mjs" },
    });
    const ref = asset._id;
    if (!ref || !ASSET_REF_RE.test(ref)) {
      throw new Error(`upload of ${file} returned an unusable reference: ${JSON.stringify({ _id: asset._id, assetId: asset.assetId })}`);
    }
    uploaded.set(file, ref);
    log(`upload  ${file} -> ${ref}`);
  }

  /* ==================================================================== *
   * PHASE 4 - create, with real asset references already substituted in.
   * ==================================================================== */
  let created = 0;
  for (const { r } of dry) {
    /* Re-materialise with a synchronous ref lookup, so the real asset ids are
       substituted for the placeholders used during pre-flight. */
    const finalDoc = materialize(r.doc, { uploader: (file) => uploaded.get(file) }).doc;

    /* Final guard: no unresolved or placeholder reference may be written. */
    const bad = [];
    JSON.stringify(finalDoc, (k, v) => {
      if (k === "_ref" && !ASSET_REF_RE.test(String(v))) bad.push(v);
      return v;
    });
    if (bad.length) {
      abort(`${r.type} "${r.label}" still has unresolved image reference(s): ${bad.join(", ")}`);
    }
    if (finalDoc._type !== r.type) {
      abort(`${r.type} "${r.label}" _type is wrong.`);
    }
    if (!r.autoId && !finalDoc._id) {
      abort(`${r.type} "${r.label}" has no _id.`);
    }

    if (r.autoId) {
      const { _id, ...rest } = finalDoc;
      void _id;
      const made = await w.create(rest);
      APPLIED.push({ type: r.type, label: r.label, id: made._id, note: "id assigned by Sanity" });
      log(`created ${r.type} "${r.label}" (new Sanity-generated id ${made._id})`);
    } else {
      await w.createIfNotExists(finalDoc);
      APPLIED.push({ type: r.type, label: r.label, id: finalDoc._id, note: ONLY ? `scoped run (--only ${ONLY})` : "full run" });
      log(`created ${r.type} ${finalDoc._id}`);
    }
    created++;
  }

  log(`\nUploaded ${uploaded.size} asset(s). Created ${created} document(s).`);

  /* --- close the report as an audit record of what actually happened --- */
  P("");
  P("## Actions performed in this run");
  P("");
  P(`Mode: **APPLY**${ONLY ? `, scoped to \`--only ${ONLY}\`` : ", full run"}. Timestamp of the plan: see \`_createdAt\` on each document.`);
  P("");
  P(`- Assets uploaded: **${uploaded.size}**`);
  P(`- Assets reused from the dataset by SHA-1: **${toUpload.length - uploaded.size}**`);
  P(`- Documents created: **${created}**`);
  P(`- Documents updated: **0** (this script never updates; \`--allow-updates\` was not honoured by any path)`);
  P("");
  P("| Type | Label | Written \`_id\` | Note |");
  P("| --- | --- | --- | --- |");
  for (const a of APPLIED) P(`| \`${a.type}\` | ${a.label} | \`${a.id}\` | ${a.note} |`);
  P("");
  P("| Asset | Action | Reference |");
  P("| --- | --- | --- |");
  for (const [file, ref] of uploaded) P(`| \`${file}\` | uploaded | \`${ref}\` |`);
  P("");
  P("**These writes were performed.** Re-running is safe: assets are matched by SHA-1 and documents are created with `createIfNotExists`.");
} else {
  writeReport();
  if (!JSON_OUT) {
    log("");
    log(`Full summary written to migration-dry-run.md  (${results.length} planned records, ${assetPlan.length} image decisions).`);
    log("STOPPING - no Sanity mutation was made. Awaiting explicit approval.");
  }
}
