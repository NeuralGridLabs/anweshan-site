/* --------------------------------------------------------------------------
    Service categories

    One shared list, used in three places:
      - the project schema's Category dropdown (sanity/schemaTypes/project.ts)
      - the queries, so grouping and counting agree with the Studio options
      - the UI, via `categoryLabel()` / `categoryShort()` / `categoryOptions()`

    `value` is what is stored on a project. `label` is the long form for headings
    and eyebrows, `short` is the compact form for chips, where space is tight.

    A category is added here once and appears everywhere. Values are never
    renamed: a rename would orphan every project already tagged with it.
   ----------------------------------------------------------------------- */

export type Category = {
  value: string;
  label: string;
  short: string;
};

export const CATEGORIES: Category[] = [
  {
    value: "research-evaluation-surveys",
    label: "Research, evaluation and surveys",
    short: "Research & evaluation",
  },
  {
    value: "health-systems-policy",
    label: "Health systems and policy",
    short: "Health systems & policy",
  },
  {
    value: "digital-health-data-systems",
    label: "Digital health and data systems",
    short: "Digital health",
  },
  {
    value: "social-behaviour-change",
    label: "Social and behaviour change",
    short: "Behaviour change",
  },
  {
    value: "evidence-communication",
    label: "Evidence communication and knowledge products",
    short: "Evidence communication",
  },
  {
    value: "programme-implementation-support",
    label: "Programme implementation support",
    short: "Implementation support",
  },
  {
    value: "clinical-research-cro",
    label: "Clinical research and CRO services",
    short: "Clinical research",
  },
];

/** Shape Sanity wants for `options.list` on a string field. */
export const CATEGORY_OPTIONS = CATEGORIES.map(({ value, label }) => ({
  value,
  title: label,
}));

/** Long label for a stored value, or the raw value when it is not in the list. */
export function categoryLabel(value?: string | null): string {
  if (!value) return "";
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/** Compact label for chips, falling back to the long form then the raw value. */
export function categoryShort(value?: string | null): string {
  if (!value) return "";
  const match = CATEGORIES.find((c) => c.value === value);
  return match?.short ?? match?.label ?? value;
}