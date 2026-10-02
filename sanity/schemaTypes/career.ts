import { defineField, defineType } from "sanity";

export const career = defineType({
  name: "career",
  title: "Career",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Section heading", type: "string" }),
    defineField({ name: "intro", title: "Intro text", type: "text" }),
    defineField({
      name: "vacancies",
      title: "Open vacancies",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "group",
              title: "Practice group",
              type: "string",
              description: "Used to count distinct practice groups in the page header.",
            }),
            defineField({ name: "location", title: "Location", type: "string" }),
            defineField({ name: "type", title: "Employment type", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text" }),
          ],
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Career" }) },
});
