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
  /** Where "View online" should point: the external URL if set, else the PDF. */
  viewUrl: string | null;
  /** Whether a "Download" action should render. */
  showFile: boolean;
  /** Whether a "View online" action should render. */
  showView: boolean;
  /** Whether the publication's own external URL is set (publisher landing page). */
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
 * resolved (it comes from the Sanity asset's `url` via the query, so it cannot
 * be derived here).
 *
 * "View online" prefers the editor's external link — a DOI or publisher page is
 * a better reading experience than the raw PDF — and falls back to the file URL
 * so the action still leads somewhere real when no external URL was set. Either
 * way it only ever renders with a URL in hand, never as a dead link.
 */
export function publicationActions(input: {
  fileUrl: string | null | undefined;
  externalUrl: unknown;
}): PublicationActions {
  const fileUrl = input.fileUrl || null;
  const externalUrl = hasExternalUrl(input.externalUrl)
    ? (input.externalUrl as string).trim()
    : null;
  const viewUrl = externalUrl ?? fileUrl;

  return {
    fileUrl,
    externalUrl,
    viewUrl,
    showFile: Boolean(fileUrl),
    showView: viewUrl !== null,
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
