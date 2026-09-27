import { defineField, defineType } from "sanity";

export const services = defineType({
  name: "services",
  title: "Services",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Section heading", type: "string" }),
    defineField({ name: "intro", title: "Intro text", type: "text" }),
    defineField({
      name: "items",
      title: "Service offerings",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "description", title: "Description", type: "text" }),
            defineField({ name: "icon", title: "Icon name (lucide)", type: "string" }),
          ],
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Services" }) },
});
