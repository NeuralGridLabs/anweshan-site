import { dataset, projectId } from "./sanity";
import type { SanityFile, SanityImage } from "./types";

/* --------------------------------------------------------------------------
   Sanity asset URL helpers

   The project ID and dataset come from the configured environment, so local
   preview without credentials simply yields no URL rather than pointing at
   whichever project happens to be hardcoded in a template string.
   ----------------------------------------------------------------------- */

const IMAGE_EXTENSION = /-(jpg|jpeg|png|webp|gif|avif|svg)$/;

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

/** Resolves a projected Sanity file (PDF/Word/Excel) to a CDN URL. */
export function sanityFileUrl(file: SanityFile | null | undefined): string | null {
  const base = assetBase("files");
  const ref = file?.asset?._ref;
  if (!base || !ref) return null;
  return `${base}/${ref.replace(/^file-/, "")}`;
}
