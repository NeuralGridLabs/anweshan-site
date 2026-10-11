import { defineArrayMember, defineField, defineType } from "sanity";

import { CATEGORY_OPTIONS } from "../../src/lib/categories";
import { SECTOR_OPTIONS } from "../../src/lib/sectors";
import { webStatusField } from "./clientHub";

/* Field-name note, because it is easy to trip over:

   `client` here is a plain string holding the partner's name, and it predates
   the client hub. It is left exactly as it is. The structured link to a
   clientHub document is the separate `clientHub` reference below, so no
   existing project loses its client text and the hub can be linked without
   renaming anything.

   Likewise these already carry the meaning the site needs, so they are reused
   rather than duplicated: `years` is the timeline, `client` is the partner,
   `methods` is the expertise list, `facts` is the stats row, `approach` is
   "How we worked" and `outcomes` is "What it produced". */

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "clientHub",
      title: "Client hub",
      type: "reference",
      description:
        "Links this project to a Client hub, which gives both a shared page. Leave empty and the project simply has no client page.",
      to: [{ type: "clientHub" }],
    }),
    defineField({ name: "client", title: "Client / Partner", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({
      name: "category",
      title: "Primary service",
      type: "string",
      description:
        "The one service this assignment is primarily about. Drives which service page it leads with, and the filter chips on a client's page.",
      options: { list: CATEGORY_OPTIONS },
    }),
    defineField({
      name: "serviceAreas",
      title: "All services involved",
      type: "array",
      description:
        "Every service this assignment involved. Drives which service pages list it. Leave empty when it is the same as the primary service.",
      of: [defineArrayMember({ type: "string" })],
      options: { list: CATEGORY_OPTIONS, layout: "tags" },
    }),
    defineField({
      name: "sectors",
      title: "Sectors",
      type: "array",
      description:
        "The fields of work this assignment belongs to. Shown as tags on project cards and the project page, and used for the sector filter.",
      of: [defineArrayMember({ type: "string" })],
      options: { list: SECTOR_OPTIONS, layout: "tags" },
    }),
    defineField({
      name: "startYear",
      title: "Start year",
      type: "number",
      description:
        "Year the assignment began. Used for ordering and for the timeline on a client's page.",
      validation: (r) =>
        r.min(1900).max(2100).warning("Enter a four-digit year."),
    }),
    defineField({
      name: "endYear",
      title: "End year",
      type: "number",
      description:
        "Year the assignment finished. Leave empty when it is still running or the year is the same as the start.",
      validation: (r) =>
        r
          .min(1900)
          .max(2100)
          .warning("Enter a four-digit year.")
          /* Compared against the sibling start year. Sanity has no warning-level
             custom rule, so this one surfaces as a message on the field; the
             range checks above stay soft warnings. */
          .custom((endYear, context) => {
            const startYear = (context.document as { startYear?: number } | undefined)
              ?.startYear;

            if (
              typeof endYear === "number" &&
              typeof startYear === "number" &&
              endYear < startYear
            ) {
              return "End year is earlier than the start year.";
            }

            return true;
          }),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["Ongoing", "Completed"], layout: "radio" },
      initialValue: "Ongoing",
    }),
    defineField({ name: "years", title: "Timeline (display)", type: "string", description: "e.g., '2022 - 2023' or '2022 - present'" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "methods",
      title: "Methods",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({ name: "team", title: "Team Description", type: "string" }),
    defineField({
      name: "overview",
      title: "Overview",
      type: "array",
      of: [{ type: "text" }],
      description: "Paragraphs for the overview section",
    }),
    defineField({
      name: "approach",
      title: "Approach / How we worked",
      type: "array",
      of: [{ type: "text" }],
      description: "Steps in the approach",
    }),
    defineField({
      name: "outcomes",
      title: "Outcomes / What it produced",
      type: "array",
      of: [{ type: "text" }],
      description: "Key outcomes",
    }),
    defineField({
      name: "facts",
      title: "Key Figures",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
        },
      ],
      options: { layout: "grid" },
    }),
    defineField({ name: "body", title: "Body (Portable Text)", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      description:
        "Link to a live product or platform hosted elsewhere, e.g. a web app. Use this for the Anweshan-operated platforms, which link out instead of to an internal project route.",
    }),
    defineField({ name: "featured", title: "Featured on home", type: "boolean", initialValue: false }),
    webStatusField(),
  ],
  preview: {
    select: {
      title: "title",
      hubName: "clientHub->name",
      webStatus: "webStatus",
      media: "coverImage",
    },
    prepare: ({ title, hubName, webStatus }) => ({
      title: title || "(untitled project)",
      /* The hub and the clearance state together, so a row answers "is this
         visible, and on whose page does it appear?" at a glance. */
      subtitle:
        (hubName || "No client hub") +
        " · " +
        (webStatus === "needs-clearance" ? "Needs clearance" : "Ready"),
    }),
  },
});
