/* --------------------------------------------------------------------------
   Publication delivery rules

   A publication can be reached two ways: an uploaded file, an external URL, or
   both. The Studio schema and the public page must agree on what counts as
   "reachable", so the decision lives here and is imported by both.

   Deliberately dependency-free (no env, no Sanity client) so the Studio bundle
   stays clean and the rules can be exercised directly in tests.
   ----------------------------------------------------------------------- */

export type PublicationFileValue = {
  asset?: { _ref?: unknown } | null;
} | null;

export type PublicationActions = {
  /** Resolved CDN URL of the uploaded file, when one is attached. */
  fileUrl: string | null;
  /** Trimmed external URL, when one is set. */
  externalUrl: string | null;
  /** Whether a "Download" action should render. */
  showFile: boolean;
  /** Whether a "View online" action should render. */
  showExternal: boolean;
  /** Whether any action should render at all. */
  showAny: boolean;
};

/**
 * True when a `file` field holds a completed upload. A picked-but-still-uploading
 * file has no `asset._ref` yet, so it must not count as reachable.
 */
export function hasUploadedFile(file: unknown): boolean {
  if (!file || typeof file !== "object") return false;

  const ref = (file as PublicationFileValue)?.asset?._ref;

  return typeof ref === "string" && ref.trim().length > 0;
}

/** True when `externalUrl` holds a non-blank string. */
export function hasExternalUrl(externalUrl: unknown): boolean {
  return typeof externalUrl === "string" && externalUrl.trim().length > 0;
}

/**
 * Builds the action set for one publication. `fileUrl` is passed in already
 * resolved (it depends on the configured project, so it cannot be derived here).
 */
export function publicationActions(input: {
  fileUrl: string | null | undefined;
  externalUrl: unknown;
}): PublicationActions {
  const fileUrl = input.fileUrl || null;
  const externalUrl = hasExternalUrl(input.externalUrl)
    ? (input.externalUrl as string).trim()
    : null;

  return {
    fileUrl,
    externalUrl,
    showFile: Boolean(fileUrl),
    showExternal: externalUrl !== null,
    showAny: Boolean(fileUrl) || externalUrl !== null,
  };
}

/** True when a publication is reachable by at least one route. */
export function isPublicationReachable(input: {
  file?: unknown;
  externalUrl?: unknown;
}): boolean {
  return hasUploadedFile(input.file) || hasExternalUrl(input.externalUrl);
}
