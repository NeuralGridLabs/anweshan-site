import { defineField, defineType } from "sanity";

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
    defineField({ name: "client", title: "Client / Partner", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({ name: "category", title: "Category / Theme", type: "string" }),
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
    defineField({ name: "featured", title: "Featured on home", type: "boolean", initialValue: false }),
  ],
  preview: { select: { title: "title", subtitle: "client", media: "coverImage" } },
});
