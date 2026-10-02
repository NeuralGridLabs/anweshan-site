import { defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({ name: "body", title: "Body", type: "text" }),
    defineField({ name: "image", title: "Feature image", type: "image" }),
    defineField({
      name: "vision",
      title: "Our vision",
      type: "text",
      rows: 4,
      description:
        "Shown in the vision band on /about. Falls back to the copy from the original site when empty.",
    }),
    defineField({
      name: "mission",
      title: "Our mission",
      type: "text",
      rows: 4,
      description:
        "Shown in the mission section on /about. Falls back to the copy from the original site when empty.",
    }),
    defineField({
      name: "missionPillars",
      title: "Mission pillars",
      type: "array",
      description:
        "Title is optional; the original site labels only the first pillar.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "text", title: "Text", type: "text", rows: 4 }),
          ],
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});
