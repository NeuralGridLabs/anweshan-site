import { defineField, defineType } from "sanity";

/* --------------------------------------------------------------------------
    Client hub

    One organisation Anweshan has worked with, and the parent of its
    assignments. Distinct from the `clients` singleton, which holds the logo
    carousel on the home page: that one is a flat list of logos for a marquee,
    this one is structured content that owns a page of its own.

    Every field except name and slug is optional, so a half-finished hub is
    harmless: it simply never appears on the site (see webStatus).
   ----------------------------------------------------------------------- */

export const RELATIONSHIP_TYPES = [
  { title: "Client", value: "Client" },
  { title: "Consortium or research partner", value: "Consortium or research partner" },
  { title: "Government counterpart", value: "Government counterpart" },
  { title: "Funder", value: "Funder" },
];

export const WEB_STATUSES = [
  { title: "Ready to publish", value: "ready" },
  { title: "Needs clearance", value: "needs-clearance" },
];

export const WEB_STATUS_DESCRIPTION =
  "Only 'ready' hubs appear on the website. Set to ready after client permission, confidentiality and logo approval are confirmed.";

/** Shared so `project` and `clientHub` can never drift apart. */
export function webStatusField() {
  return defineField({
    name: "webStatus",
    title: "Web status",
    type: "string",
    description: WEB_STATUS_DESCRIPTION,
    options: { list: WEB_STATUSES, layout: "radio" },
    initialValue: "needs-clearance",
  });
}

export const clientHub = defineType({
  name: "clientHub",
  title: "Client hub",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Full name of the organisation.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Forms the page URL /clients/<slug>. Needed for the hub to have a page.",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Shown on the client's page and on their card.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          description: "Describes the logo for screen readers.",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "shortName",
      title: "Short name",
      type: "string",
      description:
        "Used for the monogram tile when no logo is set, e.g. \"BBC\". Leave empty and initials of the name are used instead.",
      validation: (r) => r.max(12).warning("Short names suit a monogram tile best."),
    }),
    defineField({
      name: "relationshipType",
      title: "Relationship type",
      type: "string",
      description: "How this organisation relates to Anweshan.",
      options: { list: RELATIONSHIP_TYPES },
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      description:
        "Optional. When empty, the page writes a short sentence from the client's name and service areas instead.",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      description: "Link to the organisation's own website. Must start with https.",
      validation: (r) =>
        r.uri({ scheme: ["https"] }).warning("Use a full https:// address."),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description:
        "Lower numbers come first on /clients. Leave empty to sort alphabetically.",
    }),
    webStatusField(),
  ],
  preview: {
    select: {
      title: "name",
      webStatus: "webStatus",
      relationship: "relationshipType",
      media: "logo",
    },
    prepare: ({ title, webStatus, relationship }) => ({
      title: title || "(unnamed client)",
      /* Clearance is the thing that decides whether a hub is visible, so it is
         shown on every row rather than being buried inside the document. */
      subtitle:
        (webStatus === "needs-clearance" ? "Needs clearance" : "Ready") +
        (relationship ? ` · ${relationship}` : ""),
    }),
  },
});