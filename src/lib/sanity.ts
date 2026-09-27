import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

// A placeholder keeps client construction from throwing when env vars are
// absent during builds before the Studio is connected.
const safeProjectId = projectId || "placeholder";

export const sanityClient = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN || undefined,
});

export const urlFor = (source: unknown) =>
  imageUrlBuilder({
    projectId: safeProjectId,
    dataset,
  } as Parameters<typeof imageUrlBuilder>[0]).image(source as never);

export { projectId, dataset, apiVersion };

// Helper function to fetch data with error handling
export async function fetchSanity<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  if (!projectId) {
    console.warn("Sanity projectId not configured, skipping fetch");
    return null;
  }

  try {
    console.log("[Sanity] Fetching:", query.substring(0, 100));

    let result: T;

    if (params) {
      result = await sanityClient.fetch<T>(query, params as never);
    } else {
      result = await sanityClient.fetch<T>(query);
    }

    console.log(
      "[Sanity] Success, got:",
      Array.isArray(result) ? result.length : "single"
    );

    return result;
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      response?: {
        body?: unknown;
      };
    };

    console.error("[Sanity] Fetch error:", err?.message || error);
    console.error("[Sanity] Response:", err?.response?.body || err?.response);

    return null;
  }
}