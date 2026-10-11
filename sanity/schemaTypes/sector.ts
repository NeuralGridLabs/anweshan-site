import { defineField, defineType } from "sanity";

import { webStatusField } from "./clientHub";

/* --------------------------------------------------------------------------
    Sector

    One field of practice. Sectors are deliberately separate from services and
    from client hubs: a service is what Anweshan does, a client hub is who it
    did it for, and a sector is the public-interest context the work sits in.

    Distinct from the `services` and `clients` singletons, which hold prose for
    their own page. Sectors are a real collection: many documents, one page each.

    Four fields is the whole contract: title, slug, description and an order.
    Everything else the page needs is derived, so an editor cannot leave a
    sector in a half-configured state that breaks the page.

    There are no references to projects or clients on purpose. The sector page
    links to /projects and /clients as whole destinations rather than claiming a
    relationship the dataset does not yet hold; adding one later means adding a
    field here, not reworking this page.
   ----------------------------------------------------------------------- */

export const sector = defineType({
  name: "sector",
  title: "Sector",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "The sector name, e.g. \"Public health and health systems\". This is the heading visitors read, so use the full name rather than an abbreviation.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Forms the page URL /sectors/<slug>. Type it by hand so the URL stays readable and stable once published.",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description:
        "One paragraph naming the questions, systems and evidence in this field. Shown on both /sectors and the sector's own page.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description:
        "Lower numbers come first on /sectors. 1 to 8 for the current set. Leave empty to sort alphabetically.",
    }),
    webStatusField(),
  ],
  /* The big numerals on /sectors are 01, 02, 03 … by position, so the preview
     shows the position it will occupy rather than only the name. */
  preview: {
    select: {
      title: "title",
      order: "order",
      webStatus: "webStatus",
    },
    prepare: ({ title, order, webStatus }) => ({
      title: title || "(unnamed sector)",
      subtitle:
        (typeof order === "number"
          ? `Position ${order}`
          : "No display order set") +
        (webStatus === "needs-clearance"
          ? " · Needs clearance"
          : " · Ready"),
    }),
  },
});