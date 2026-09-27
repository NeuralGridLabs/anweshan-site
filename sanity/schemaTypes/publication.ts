import { defineField, defineType } from "sanity";

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
    defineField({ name: "journal", title: "Journal / publisher", type: "string" }),
    defineField({ name: "abstract", title: "Abstract", type: "text" }),
    defineField({
      name: "file",
      title: "Downloadable file (PDF / Word / Excel)",
      type: "file",
      options: {
        accept: ".pdf,.doc,.docx,.xls,.xlsx",
      },
    }),
    defineField({ name: "coverImage", title: "Cover / thumbnail", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "title", subtitle: "authors", media: "coverImage" } },
});
