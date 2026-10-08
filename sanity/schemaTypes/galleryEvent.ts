import { defineField, defineType } from "sanity";

export const galleryEvent = defineType({
  name: "galleryEvent",
  title: "Gallery event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Event title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Section",
      type: "string",
      options: {
        list: [
          { title: "Events, Training & Workshops", value: "events-training" },
          { title: "Team Celebrations", value: "celebrations" },
        ],
        layout: "radio",
      },
      description:
        "Which section of the Gallery page this event belongs under. Required, because the page groups events by it.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", title: "Event date", type: "date" }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({
      name: "images",
      title: "Photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { layout: "grid" },
    }),
    defineField({ name: "coverImage", title: "Cover image (optional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "title", subtitle: "date", media: "coverImage" } },
});
