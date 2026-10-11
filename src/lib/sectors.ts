/* --------------------------------------------------------------------------
    Sectors

    One file owns the eight sectors, their order and their copy. It is the
    single source of truth for:

      - the Studio dropdown on `project.sectors` (imported by the schema)
      - the /sectors page
      - the sector filter on /projects
      - the sector chips on cards
      - the importer, which reads `value` and `label` to derive sectors

    Order here is the order everywhere else: the /sectors numbering, the filter
    row and the chip order all follow this array rather than an alphabetical
    sort, so the sequence is stable and editorially chosen.

    `description` is the exact text approved for each sector. It is data, not
    copy written into a component, so the wording can never drift between the
    index page, a card and a filter tooltip.

    Sectors are NOT documents. They are values on a project, the same way
    `CATEGORIES` is a list of values rather than `service` documents. That
    keeps a field of practice from becoming a fourth content type with its own
    publication workflow and clearance state.
   ----------------------------------------------------------------------- */

import { CATEGORIES } from "./categories";

export type Sector = {
  /** Stored on `project.sectors` and used in ?sector=<value>. Never renamed. */
  value: string;
  /** Full name: headings, page titles, the schema dropdown. */
  label: string;
  /** Compact form for chips, where space is tight. */
  short: string;
  description: string;
};

export const SECTORS: Sector[] = [
  {
    value: "public-health-health-systems",
    label: "Public health and health systems",
    short: "Public health",
    description:
      "Maternal and newborn health, reproductive health, immunisation, tuberculosis, antimicrobial resistance, emergency preparedness, laboratories, digital health and service delivery.",
  },
  {
    value: "migration-mobility",
    label: "Migration and mobility",
    short: "Migration",
    description:
      "Migrant health, pre-departure preparation, reintegration, border and cross-border mobility, communication and service access.",
  },
  {
    value: "nutrition-food-systems",
    label: "Nutrition and food systems",
    short: "Nutrition",
    description:
      "Maternal and child nutrition, food security, implementation research, multisector planning and evidence communication.",
  },
  {
    value: "water-sanitation-hygiene",
    label: "Water, sanitation and hygiene",
    short: "WASH",
    description:
      "Service functionality, sustainability, behaviour, municipal systems, learning and public communication.",
  },
  {
    value: "governance-social-inclusion",
    label: "Governance and social inclusion",
    short: "Governance & inclusion",
    description:
      "Local governance, accountability, civic participation, gender, disability, marginalisation and evidence for public policy.",
  },
  {
    value: "climate-energy-environment",
    label: "Climate, energy and environment",
    short: "Climate & energy",
    description:
      "Electric mobility, energy policy, healthcare waste, climate-sensitive health and technical public communication.",
  },
  {
    value: "education-skills",
    label: "Education and skills",
    short: "Education",
    description:
      "Graduate tracking, education outcomes, training and learning content, and evidence for universities and skills institutions.",
  },
  {
    value: "private-sector-enterprise",
    label: "Private sector and enterprise",
    short: "Private sector",
    description:
      "Corporate identity and communication, industry and trade promotion, e-commerce and evidence for businesses and producer bodies.",
  },
];

/** Shape Sanity wants for `options.list` on a string field. */
export const SECTOR_OPTIONS = SECTORS.map(({ value, label }) => ({
  value,
  title: label,
}));

export function sectorByValue(value?: string | null): Sector | undefined {
  if (!value) return undefined;
  return SECTORS.find((s) => s.value === value);
}

/**
 * Case-insensitive lookup by full label.
 *
 * This is how the importer recognises a sector inside the CMS-authored
 * `expertise` tags, where a tag reads "Public health and health systems"
 * rather than a machine value.
 */
export function sectorByLabel(label?: string | null): Sector | undefined {
  if (!label) return undefined;
  const needle = label.trim().toLowerCase();
  return SECTORS.find((s) => s.label.toLowerCase() === needle);
}

/** Full label for a stored value, falling back to the raw value. */
export function sectorLabel(value?: string | null): string {
  return sectorByValue(value)?.label ?? value ?? "";
}

/** Compact label for a stored value, falling back to the full label. */
export function sectorShort(value?: string | null): string {
  const sector = sectorByValue(value);
  return sector?.short ?? sector?.label ?? value ?? "";
}

/* --------------------------------------------------------------------------
    splitExpertise

    The CMS authors one flat `expertise` / `methods` list per project, mixing
    services ("Health systems and policy"), sectors ("Migration and mobility")
    and genuine methods ("Household and facility surveys"). Project pages show
    all three separately, so this pulls one list apart into its three kinds.

    Matching is by exact, case-insensitive equality against a known label. A
    near-miss is deliberately NOT matched: guessing that "Health systems" is the
    service "Health systems and policy" would invent a classification the editor
    did not make, and this list is classification data.

    Anything unrecognised is passed through as a method, which is the safe
    default: an unknown tag still appears on the page instead of disappearing.
   ----------------------------------------------------------------------- */

export type SplitExpertise = {
  services: string[];
  sectors: string[];
  methods: string[];
};

export function splitExpertise(tags: unknown): SplitExpertise {
  const list = Array.isArray(tags)
    ? tags.filter((t): t is string => typeof t === "string" && t.trim() !== "")
    : [];

  /* Service labels come from the single shared list in categories.ts, so a
     service renamed there is renamed here too and the two cannot drift. */
  const serviceByLabel = new Map(
    CATEGORIES.map((c) => [c.label.trim().toLowerCase(), c.value]),
  );

  const services: string[] = [];
  const sectors: string[] = [];
  const methods: string[] = [];

  for (const tag of list) {
    const trimmed = tag.trim();
    const needle = trimmed.toLowerCase();
    if (!needle) continue;

    const serviceValue = serviceByLabel.get(needle);
    const sector = sectorByLabel(trimmed);

    if (serviceValue) {
      /* Services are stored and displayed as VALUES everywhere else, so the
         value is returned rather than the label. */
      services.push(serviceValue);
    } else if (sector) {
      sectors.push(sector.value);
    } else {
      /* Unknown tags are kept as methods. Dropping them would silently delete
         an editor's words; passing them through degrades gracefully. */
      methods.push(trimmed);
    }
  }

  return {
    services: [...new Set(services)],
    sectors: [...new Set(sectors)],
    methods: [...new Set(methods)],
  };
}