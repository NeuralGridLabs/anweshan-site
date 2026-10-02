/* --------------------------------------------------------------------------
    Service images -> Sanity `production`.

    Uploads the supplied images and attaches each to its service, so they are
    managed in the Studio from now on rather than living in the frontend.

      node scripts/services-images.mjs           # dry run
      node scripts/services-images.mjs --apply   # upload + attach

    DRY RUN BY DEFAULT. In dry run no bytes leave the machine and no document is
    written; it reports what would be uploaded and which service each file would
    attach to.

    Every service's `description` is preserved: the write merges the asset
    reference onto the existing item and never rewrites other fields.
   ----------------------------------------------------------------------- */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const APPLY = new Set(process.argv.slice(2)).has("--apply");
const log = (...a) => console.log(...a);
const repoRoot = process.cwd();

const SOURCE_DIR = path.join(
  process.env.USERPROFILE || "C:\\Users\\Admin",
  "Downloads",
  "services"
);

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

/* file -> service. Matched on the item's title, not its _key, so the mapping
   survives a reordering or a re-key in the Studio.

   `policy` is the "Research and Policy Dialogue" image; the file has no
   extension but its bytes are a PNG, which the uploader reads from the data,
   not the name. */
const ASSIGNMENT = [
  { file: "clinical.png", titleContains: "Clinical Research", alt: "Clinical research setting" },
  { file: "Q-researhch.jpg", titleContains: "Q-Squared", alt: "Field research and survey data collection" },
  { file: "policy", titleContains: "Policy Dialogue", alt: "Stakeholders in policy discussion" },
  { file: "health.jpg", titleContains: "Development Communication", alt: "Health communication materials" },
  { file: "information.jpg", titleContains: "Information Technology", alt: "Data and information systems" },
  { file: "political.jpg", titleContains: "Political Economic", alt: "Policy and institutional analysis" },
];

/* Content type from the file's magic bytes, not its name. Three of the supplied
   files carry a `.jpg` extension but are actually PNG, and one (`policy`) has no
   extension at all, so sniffing the data is the only reliable way to label them. */
function sniffType(b) {
  if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
  if (b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (b.slice(0, 4).toString("latin1") === "RIFF") return "image/webp";
  return null;
}

/* Reuse an asset already in the dataset rather than uploading a second copy. */
function findBySha(sha1) {
  return readClient.fetch(
    `*[_type == "sanity.imageAsset" && sha1hash == $sha][0]{ _id, _ref, originalFilename }`,
    { sha: sha1 }
  ).catch(() => null);
}

(async () => {
  log("=== Service images -> Sanity ===");
  log(`source     : ${SOURCE_DIR}`);
  log(`project    : ${PROJECT_ID}  dataset: ${DATASET}`);
  log(`mode       : ${APPLY ? "APPLY (will upload + patch)" : "DRY RUN (no uploads, no writes)"}\n`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`ABORT: source folder not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const svc = await readClient.fetch(`*[_type == "services"][0]{ _id, _rev, items[]{ _key, title, "hasImage": defined(image.asset) } }`);
  if (!svc) { console.error("ABORT: no `services` document in this dataset."); process.exit(1); }

  log("--- current service images in the CMS ---");
  for (const i of svc.items || []) log(`  ${i._key}  image=${i.hasImage}  ${i.title.slice(0, 52)}`);
  log("");

  const plan = [];
  const unmapped = [];

  for (const a of ASSIGNMENT) {
    const file = path.join(SOURCE_DIR, a.file);
    if (!fs.existsSync(file)) { unmapped.push(`${a.file} (file not found)`); continue; }

    const item = (svc.items || []).find((i) =>
      String(i.title).toLowerCase().includes(a.titleContains.toLowerCase())
    );
    if (!item) { unmapped.push(`${a.file} -> no service titled like "${a.titleContains}"`); continue; }

    const bytes = fs.readFileSync(file);
    const crypto = await import("node:crypto");
    const sha1 = crypto.createHash("sha1").update(bytes).digest("hex");
    const existing = await findBySha(sha1);

    plan.push({
      ...a,
      path: file,
      size: bytes.length,
      bytes,
      contentType: sniffType(bytes),
      itemKey: item._key,
      itemTitle: item.title,
      replaceExisting: !!item.hasImage,
      existingAsset: existing ? existing._ref : null,
    });
  }

  log("--- plan ---");
  for (const p of plan) {
    log(`  ${p.file.padEnd(20)} -> ${p.itemKey}  ${p.itemTitle.slice(0, 44)}`);
    log(`      ${(p.size / 1024).toFixed(0)} KB  type=${p.contentType || "unknown"}${p.existingAsset ? `  (asset already in dataset, will reuse ${p.existingAsset.slice(0, 24)}...)` : "  (new upload)"}${p.replaceExisting ? "  [REPLACES an existing image]" : ""}`);
  }
  if (unmapped.length) {
    log("\n  UNMAPPED:");
    for (const u of unmapped) log(`    ${u}`);
  }

  log(`\n  ${plan.length} of ${ASSIGNMENT.length} images mapped`);
  const missing = ASSIGNMENT.length - plan.length;

  if (!APPLY) {
    log("\nDry run. Nothing uploaded, nothing written. Re-run with --apply.");
    process.exit(missing === 0 ? 0 : 1);
  }

  /* Upload each file (or reuse a matching asset), then attach by _key. */
  let uploaded = 0, reused = 0;
  for (const p of plan) {
    let ref = p.existingAsset;

    if (ref) {
      reused++;
      log(`\nreusing existing asset for ${p.file}`);
    } else {
      log(`\nuploading ${p.file} (${(p.size / 1024).toFixed(0)} KB)...`);
      ref = await writeClient.assets.upload("image", p.bytes, {
        filename: p.file,
        contentType: p.contentType || undefined,
      });
      uploaded++;
      log(`  -> ${ref._ref || ref._id}`);
    }

    await writeClient
      .patch(svc._id)
      .set({ [`items[_key=="${p.itemKey}"].image`]: { _type: "image", asset: { _type: "reference", _ref: ref._ref || ref._id }, alt: p.alt } })
      .commit();

    log(`  attached to ${p.itemKey}`);
  }

  log(`\nuploads: ${uploaded}   reuses: ${reused}`);
  const after = await readClient.fetch(`*[_type == "services"][0]{ items[]{ _key, title, "img": image.asset._ref, "alt": image.alt } }`);
  log("\n--- verify ---");
  for (const i of after.items || []) {
    log(`  ${i._key}  ${i.img ? "image OK" : "no image"}  ${i.alt ? `alt="${i.alt}"` : ""}  ${String(i.title).slice(0, 46)}`);
  }

  /* Descriptions must be untouched by this run. */
  const descs = await readClient.fetch(`*[_type == "services"][0]{ items[]{ _key, "len": string::length(description) } }`);
  const bad = (descs.items || []).filter((d) => !d.len);
  log(`\n  services with an intact description: ${(descs.items || []).length - bad.length}/${(descs.items || []).length}${bad.length ? " — INVESTIGATE" : ""}`);
})().catch((e) => { console.error("ERR:", e.message || e); process.exit(1); });
