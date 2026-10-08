/* -------------------------------------------------------------------------- *
    Sanity value guards

    CMS fields are edited by hand in the Studio, so a field that the code
    expects to be a string can turn up as an object — for example when a
    mutation wrapper was stored literally instead of being interpreted.

    These helpers are the single place that tolerates that. They are applied at
    the boundaries where documents enter the app (the project resolver, the
    shared card, the clients pages) so one malformed field cannot take a whole
    page down.
   ----------------------------------------------------------------------- */

/**
 * If a value is a `{ setIfMissing: value }` wrapper, return the inner value.
 * Anything else is returned untouched.
 */
export function unwrapMutationValue<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 1 && keys[0] === "setIfMissing") {
      return (value as unknown as { setIfMissing: T }).setIfMissing;
    }
  }
  return value;
}

/** A value guaranteed to be safe to render as text. */
export function textOf(value: unknown, fallback = ""): string {
  const unwrapped = unwrapMutationValue(value);

  if (typeof unwrapped === "string") return unwrapped;
  if (typeof unwrapped === "number" || typeof unwrapped === "boolean") {
    return String(unwrapped);
  }
  return fallback;
}

/** A value guaranteed to be an array of plain strings, with junk removed. */
export function textListOf(value: unknown): string[] {
  const unwrapped = unwrapMutationValue(value);
  if (!Array.isArray(unwrapped)) return [];

  return unwrapped
    .map((item) => textOf(item))
    .filter((item) => item.trim() !== "");
}

/** A value guaranteed to be an array of plain strings, or undefined if empty. */
export function textListOrUndefined(value: unknown): string[] | undefined {
  const list = textListOf(value);
  return list.length > 0 ? list : undefined;
}
