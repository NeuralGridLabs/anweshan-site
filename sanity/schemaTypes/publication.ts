import { defineField, defineType } from "sanity";
import type { SanityDocument } from "sanity";

import { isPublicationReachable } from "../../src/lib/publication-delivery";

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
    defineField({ name: "authors", title: "Authors", type: "string", description: "Comma separated." }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({ name: "journal", title: "Journal / venue", type: "string" }),
    defineField({ name: "abstract", title: "Abstract", type: "text" }),
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
  /* Document-level rule: a publication has to be reachable somehow, either as an
     uploaded file or as a link out. Validating on the document keeps the two
     alternatives in one place and surfaces a single error, instead of marking
     each field individually optional-but-required. The predicate is shared with
     the public page so the Studio and the site can never disagree. */
  validation: (Rule) =>
    Rule.custom((doc: SanityDocument | undefined) => {
      if (isPublicationReachable({ file: doc?.file, externalUrl: doc?.externalUrl })) {
        return true;
      }

      return "Add a downloadable file or an external URL so this publication can be reached.";
    }),
  preview: { select: { title: "title", subtitle: "authors", media: "coverImage" } },
});
