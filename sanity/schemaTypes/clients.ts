import { defineField, defineType } from "sanity";

export const clients = defineType({
  name: "clients",
  title: "Clients",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Section heading", type: "string" }),
    defineField({
      name: "items",
      title: "Clients",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
          ],
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Clients" }) },
});
