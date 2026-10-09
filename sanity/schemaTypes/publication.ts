import { defineField, defineType } from "sanity";
import type { SanityDocument } from "sanity";

import { isPublicationReachable } from "../../src/lib/publication-delivery";
import {
  ANWESHAN_ROLES,
  PUBLICATION_TYPES,
  ACCESS_STATUSES,
} from "../../src/lib/publication-options";

/* Re-exported so existing imports from this file keep working. */
export { ANWESHAN_ROLES, PUBLICATION_TYPES, ACCESS_STATUSES };
export type {
  AnweshanRole,
  PublicationType,
  AccessStatus,
} from "../../src/lib/publication-options";

export const publication = defineType({
  name: "publication",
  title: "Publication",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "authors", title: "Authors", type: "string", description: "Comma separated as printed in the publication." }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({ name: "journal", title: "Journal / venue", type: "string" }),
    defineField({ name: "abstract", title: "Abstract", type: "text" }),

    defineField({
      name: "type",
      title: "Publication type",
      type: "string",
      description: "The kind of output this is. Drives filtering on the Publications page.",
      options: { list: PUBLICATION_TYPES.map((t) => ({ title: t.title, value: t.value })) },
      initialValue: "journal-article",
    }),
    defineField({
      name: "topic",
      title: "Topic / keywords",
      type: "array",
      of: [{ type: "string" }],
      description: "Topics for filtering (e.g., AMR, maternal health, migration). Add one per tag.",
      options: { layout: "tags" },
    }),
    defineField({
      name: "geography",
      title: "Geography",
      type: "array",
      of: [{ type: "string" }],
      description: "Countries, regions or sub-national areas (e.g., Nepal, Karnali Province, South-East Asia).",
      options: { layout: "tags" },
    }),
    defineField({
      name: "anweshanRole",
      title: "Anweshan's role",
      type: "string",
      description: "How Anweshan contributed. This is a controlled vocabulary — pick the one that best matches the evidence.",
      options: { list: ANWESHAN_ROLES.map((r) => ({ title: r.title, value: r.value })) },
      initialValue: "co-authored",
    }),
    defineField({
      name: "roleExplanation",
      title: "Role explanation (one sentence)",
      type: "string",
      description: "Brief note expanding on the role label (e.g., 'Led process evaluation and co-authored the manuscript').",
    }),
    defineField({
      name: "client",
      title: "Direct client",
      type: "string",
      description: "The organisation that commissioned the work.",
    }),
    defineField({
      name: "partner",
      title: "Consortium / research partner",
      type: "string",
      description: "Collaborating institution or consortium partner.",
    }),
    defineField({
      name: "funder",
      title: "Funder",
      type: "string",
      description: "Funding agency or donor.",
    }),
    defineField({
      name: "citation",
      title: "Full citation",
      type: "string",
      description: "Journal, volume, issue, pages and DOI, or report publisher and place.",
    }),
    defineField({
      name: "doi",
      title: "DOI",
      type: "url",
      description: "Digital Object Identifier (e.g., https://doi.org/10.xxxx/xxxxx).",
    }),
    defineField({
      name: "accessStatus",
      title: "Access status",
      type: "string",
      description: "How the publication can be reached.",
      options: { list: ACCESS_STATUSES.map((a) => ({ title: a.title, value: a.value })) },
      initialValue: "open-access",
    }),
    defineField({
      name: "relatedProject",
      title: "Related project / assignment",
      type: "reference",
      description: "Link to the project or case study this publication came from.",
      to: [{ type: "project" }],
    }),

    defineField({
      name: "file",
      title: "Downloadable file (PDF / Word / Excel)",
      type: "file",
      options: {
        accept: ".pdf,.doc,.docx,.xls,.xlsx",
      },
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      description:
        "Link to the publication hosted elsewhere, e.g. a publisher page or repository. Use this when there is no file to upload, or to add a second way to reach the work.",
    }),
    defineField({ name: "coverImage", title: "Cover / thumbnail", type: "image", options: { hotspot: true } }),
    defineField({
      name: "featuredOnHome",
      title: "Feature on homepage",
      type: "boolean",
      description:
        "Show this publication in the homepage preview, newest first, capped at three. This flag is specific to publications and is independent of the featured toggle on projects.",
      initialValue: false,
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  /* A publication has to be reachable somehow: an uploaded file or a link out.
     The predicate is shared with the public page so Studio and site agree. */
  validation: (Rule) =>
    Rule.custom((doc: SanityDocument | undefined) => {
      if (isPublicationReachable({ file: doc?.file, externalUrl: doc?.externalUrl })) {
        return true;
      }

      return "Add a downloadable file or an external URL so this publication can be reached.";
    }),
  preview: { select: { title: "title", subtitle: "authors", media: "coverImage" } },
});