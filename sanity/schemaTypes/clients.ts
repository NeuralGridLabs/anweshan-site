import { defineField, defineType } from "sanity";

export const clients = defineType({
  name: "clients",
  title: "Clients",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label above the heading on the /clients page.",
    }),
    defineField({
      name: "heading",
      title: "Section heading",
      type: "string",
      description: "The large heading on the /clients page.",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      description: "Short paragraph under the heading on the /clients page.",
    }),
    defineField({
      name: "note",
      title: "Note",
      type: "text",
      rows: 2,
      description:
        "Small print shown below the client grid, for example about confidentiality. Leave empty to hide it.",
    }),
    defineField({
      name: "ctaLabel",
      title: "Button label",
      type: "string",
      description: "Label for the button below the client grid.",
      validation: (r) => r.max(40).warning("Shorter labels suit the pill button better."),
    }),
    defineField({
      name: "ctaLink",
      title: "Button link",
      type: "string",
      description:
        'Where that button goes: an internal path such as "/contact", or a full https URL.',
    }),
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
          preview: {
            select: { title: "name", media: "logo" },
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Clients" }) },
});
