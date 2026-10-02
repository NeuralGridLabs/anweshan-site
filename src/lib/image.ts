import { dataset, projectId } from "./sanity";
import type { SanityFile, SanityImage } from "./types";

/* --------------------------------------------------------------------------
   Sanity asset URL helpers

   The project ID and dataset come from the configured environment, so local
   preview without credentials simply yields no URL rather than pointing at
   whichever project happens to be hardcoded in a template string.
   ----------------------------------------------------------------------- */

const IMAGE_EXTENSION = /-(jpg|jpeg|png|webp|gif|avif|svg)$/;
const FILE_EXTENSION = /-([a-z0-9]+)$/i;

function assetBase(kind: "images" | "files"): string | null {
  if (!projectId) return null;
  return `https://cdn.sanity.io/${kind}/${projectId}/${dataset}`;
}

/** Resolves a projected Sanity image to a CDN URL, or `null` if unavailable. */
export function sanityImageUrl(image: SanityImage | null | undefined): string | null {
  const base = assetBase("images");
  const ref = image?.asset?._ref;
  if (!base || !ref) return null;
  return `${base}/${ref.replace(/^image-/, "").replace(IMAGE_EXTENSION, ".$1")}`;
}

/**
 * Resolves a projected Sanity file (PDF/Word/Excel) to a CDN URL.
 *
 * The queries project `url` explicitly via `file.asset->url`, so when that key is
 * present it is trusted outright: it is the asset document's own URL. A `null`
 * there means the referenced asset does not exist (deleted, or an upload that
 * never completed), and this returns `null` so the caller can hide the link
 * rather than point it at a dead path.
 *
 * Reconstructing a URL from `asset._ref` is only a fallback for a projection
 * that does not carry `url` at all. It must flip the extension separator: a file
 * `_ref` ends `-pdf`, but the CDN path ends `.pdf`. Omitting that conversion is
 * what made every Download link 404 against cdn.sanity.io.
 */
export function sanityFileUrl(file: SanityFile | null | undefined): string | null {
  if (!file) return null;

  if ("url" in file) {
    return file.url?.trim() || null;
  }

  const base = assetBase("files");
  const ref = file.asset?._ref;

  if (!base || !ref) return null;

  return `${base}/${ref.replace(/^file-/, "").replace(FILE_EXTENSION, ".$1")}`;
}

/** Lowercase extension of a file asset (`"pdf"`), for badges and icon choice. */
export function sanityFileExtension(file: SanityFile | null | undefined): string | null {
  const direct = file?.extension?.trim().toLowerCase();

  if (direct) return direct;

  const fromRef = file?.asset?._ref?.match(FILE_EXTENSION)?.[1]?.toLowerCase();

  return fromRef ?? null;
}
