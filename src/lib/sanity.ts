import { createClient } from "@sanity/client";
import type { QueryParams } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

// A placeholder keeps client construction from throwing when env vars are
// absent (e.g. during a build before the Studio is connected). Real fetches
// are gated on `projectId` below, so nothing hits Sanity until a project is
// actually configured.
const safeProjectId = projectId || "placeholder";

export const sanityClient = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN || undefined,
});

export { projectId, dataset, apiVersion };

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
 * Fetches a GROQ query, returning `null` when Sanity is not configured or the
 * request fails, so callers can fall back to local content.
 *
 * `T` is the projected result type — see the interfaces in ./types.ts. Always
 * pass it explicitly: an omitted type argument infers `unknown` and the result
 * loses all shape information.
 */
export async function fetchSanity<T>(
  query: string,
  params?: QueryParams,

): Promise<T | null> {
  if (!projectId) {
    console.warn("Sanity projectId not configured, skipping fetch");
    return null;
  }

  try {
    console.log("[Sanity] Fetching:", query.substring(0, 100));
    // The client's overloads distinguish "no params" from "params", so the
    // second argument is omitted rather than passed as undefined.
    const result = params
      ? await sanityClient.fetch<T>(query, params)
      : await sanityClient.fetch<T>(query);
    console.log(
      "[Sanity] Success, got:",
      Array.isArray(result) ? result.length : "single",
    );
    return result;
  } catch (error) {
    console.error("[Sanity] Fetch error:", errorMessage(error));
    console.error("[Sanity] Response:", responseBody(error));
    return null;
    return null;
  }
}