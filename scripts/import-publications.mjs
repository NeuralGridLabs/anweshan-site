import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

console.log("Starting script execution...");
console.log("Project ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "MISSING!");
console.log("Dataset:", process.env.NEXT_PUBLIC_SANITY_DATASET || "production");
console.log("Token present:", Boolean(process.env.SANITY_API_WRITE_TOKEN));

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
  console.error("❌ Error: Missing env variables in .env.local!");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: "2025-01-01",
  useCdn: false,
});

let rows = [];
try {
  rows = JSON.parse(readFileSync("scripts/publications.json", "utf8"));
  console.log(`Loaded ${rows.length} records from JSON.`);
} catch (err) {
  console.error("❌ Failed to read scripts/publications.json:", err.message);
  process.exit(1);
}

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const CHUNK = 50;

for (let i = 0; i < rows.length; i += CHUNK) {
  console.log(`Uploading chunk ${i / CHUNK + 1}...`);
  const tx = client.transaction();
  for (const r of rows.slice(i, i + CHUNK)) {
    tx.createOrReplace({
      _id: `pub-${r.year ?? "nd"}-${slug(r.title)}`,
      _type: "publication",
      ...r,
    });
  }
  await tx.commit();
  console.log(`✅ Successfully imported ${Math.min(i + CHUNK, rows.length)} / ${rows.length}`);
}

console.log("Done!");