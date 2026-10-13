import { createClient } from "@sanity/client";
import type { QueryParams } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

// A placeholder keeps client construction from throwing when env vars are
// absent (e.g. during a module graph walk before the Studio is connected).
// A fetch never gets that far: fetchSanity throws on a missing projectId, so
// a build without configuration fails instead of quietly producing empty pages.
const safeProjectId = projectId || "placeholder";

export const sanityClient = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN || undefined,
});

export { projectId, dataset, apiVersion };

/* Keep the response cacheable so pages stay statically prerenderable, but do not
   let it outlive a deployment. Zero would mean "cache forever" in Next, so this
   is a short, explicit window instead. See fetchSanity for why. */
const SANITY_FETCH_OPTIONS = {
  next: { revalidate: 60 },
} as const;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function responseBody(error: unknown): unknown {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }
  const { response } = error as { response?: { body?: unknown } };
  return response?.body;
}

/**
 * Fetches a GROQ query, returning `null` when the request fails, so callers
 * can render their own empty state.
 *
 * `T` is the projected result type — see the interfaces in ./types.ts. Always
 * pass it explicitly: an omitted type argument infers `unknown` and the result
 * loses all shape information.
 *
 * MISSING CONFIGURATION THROWS. A missing NEXT_PUBLIC_SANITY_PROJECT_ID is not
 * a transient failure, it is a broken deployment, and swallowing it is how you
 * get a green build that ships an empty website: every page would take the
 * `?? []` path, prerender successfully, and deploy with nothing on it, with
 * nothing but a line in the build log to say why. Throwing fails the build
 * where someone is watching.
 *
 * A failed REQUEST still returns null. That is a different case: Sanity being
 * briefly unreachable, or a rate limit, should not take the whole build down.
 * The pages own their empty states for that.
 *
 * CACHING: the client's default `fetch` is Next's cached fetch, and in a static
 * build that cache is written into `.next`. The symptom it caused was subtle:
 * content published in Studio after a build would not appear in the next build,
 * because the build replayed the stored response while still logging a
 * successful fetch — so a rebuild looked healthy and served stale content.
 *
 * `cache: "no-store"` is NOT the fix: it opts the whole route out of static
 * rendering and fails the build with "Dynamic server usage". Instead the
 * response stays cacheable but is given a short lifetime, so a build that runs
 * more than that after a deploy refetches rather than replaying an old
 * snapshot. In practice Netlify and local builds start from a clean `.next`, and
 * this is the backstop for the case where a `.next` directory is reused.
 *
 * Pages stay statically prerendered, which is what keeps builds fast.
 */
export async function fetchSanity<T>(
  query: string,
  params?: QueryParams,

): Promise<T | null> {
  if (!projectId) {
    throw new Error(
      "[Sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Copy .env.example " +
        "to .env.local and fill it in, or set the variable in the deploy " +
        "environment. Refusing to fetch: without it every page would " +
        "prerender as its empty state and deploy a silently empty site.",
    );
  }

  try {
    // The client's overloads distinguish "no params" from "params", so an empty
    // object is passed in place of undefined to keep the options argument third.
    return await sanityClient.fetch<T>(query, params ?? {}, SANITY_FETCH_OPTIONS);
  } catch (error) {
    console.error("[Sanity] Fetch error:", errorMessage(error));
    console.error("[Sanity] Response:", responseBody(error));
    return null;
  }
}