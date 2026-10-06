import { defineArrayMember, defineField, defineType } from "sanity";

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
  defineField({
      name: "storyEyebrow",
      title: "Story eyebrow",
      type: "string",
      description:
        "Optional. The small uppercase label above the Story section on /about. Leave empty and no label is shown.",
      validation: (r) => r.max(40).warning("Eyebrows read best short."),
    }),
    defineField({
      name: "storyParagraphs",
      title: "Story paragraphs",
      type: "array",
      description:
        "Optional. The Story section on /about, directly under the page header. The first paragraph is set larger on the left, the rest on the right. Leave empty and the section is hidden.",
      of: [
        defineArrayMember({
          type: "text",
          rows: 4,
          validation: (r) =>
            r.max(700).warning("Paragraphs over 700 characters grow very tall."),
        }),
      ],
    }),
  defineField({
      name: "purposeEyebrow",
      title: "Purpose eyebrow",
      type: "string",
      description:
        "Optional. The small uppercase label above the purpose statement in the promises section on /about. Leave empty and no label is shown.",
      validation: (r) => r.max(40).warning("Eyebrows read best short."),
    }),
    defineField({
      name: "purpose",
      title: "Purpose statement",
      type: "text",
      rows: 4,
      description:
        "Optional. The lead statement in the promises section on /about. Leave empty to fall back to the objectives section below it.",
      validation: (r) =>
        r.max(400).warning("Statements over 400 characters run to several lines at reading size."),
    }),
    defineField({
      name: "promisesHeading",
      title: "Promises heading",
      type: "string",
      description:
        "Optional. The heading above the promises list on /about. Leave empty to fall back to the objectives section.",
    }),
    defineField({
      name: "promises",
      title: "Promises",
      type: "array",
      description:
        "Optional. The numbered commitments on /about. Up to six. Leave empty and the existing objectives section is shown instead.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (r) => r.max(60).warning("Titles over 60 characters wrap to three lines."),
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 3,
              validation: (r) => r.max(200).warning("Text over 200 characters fills the tile."),
            }),
          ],
          preview: {
            select: { title: "title", text: "text" },
            prepare: ({ title, text }) => ({
              title: title || "(untitled promise)",
              subtitle: text ? String(text).slice(0, 60) : "No text",
            }),
          },
        }),
      ],
      validation: (r) =>
        r.max(6).warning("The commitments row holds up to six; extra ones are ignored."),
    }),
  defineField({
      name: "howWeWorkHeading",
      title: "How we work heading",
      type: "string",
      description:
        "Optional. The heading on the How we work band on /about. Leave empty and the band is hidden.",
    }),
    defineField({
      name: "howWeWorkSteps",
      title: "How we work steps",
      type: "array",
      description:
        "Optional. The numbered steps on the dark band of /about. Up to six, shown as columns. Leave empty and the band is hidden.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 3,
              validation: (r) => r.max(200).warning("Text over 200 characters fills the column."),
            }),
          ],
          preview: {
            select: { title: "title", text: "text" },
            prepare: ({ title, text }) => ({
              title: title || "(untitled step)",
              subtitle: text ? String(text).slice(0, 60) : "No text",
            }),
          },
        }),
      ],
      validation: (r) =>
        r.max(6).warning("The steps row holds up to six; extra ones are ignored."),
    }),
  defineField({
      name: "valuesHeading",
      title: "Values heading",
      type: "string",
      description:
        "Optional. The heading on the values tiles of /about. Leave empty and the section is hidden.",
    }),
    defineField({
      name: "values",
      title: "Values",
      type: "array",
      description:
        "Optional. The tiles on /about, one to three across. Up to eight. Leave empty and the section is hidden.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (r) => r.max(60).warning("Titles over 60 characters wrap to three lines."),
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 3,
              validation: (r) => r.max(200).warning("Text over 200 characters fills the tile."),
            }),
          ],
          preview: {
            select: { title: "title", text: "text" },
            prepare: ({ title, text }) => ({
              title: title || "(untitled value)",
              subtitle: text ? String(text).slice(0, 60) : "No text",
            }),
          },
        }),
      ],
      validation: (r) =>
        r.max(8).warning("Up to eight values; extra ones are ignored."),
    }),
    defineField({
      name: "whyHeading",
      title: "Why Anweshan heading",
      type: "string",
      description:
        "Optional. The heading on the closing check-list of /about. Leave empty and the section is hidden.",
    }),
    defineField({
      name: "whyItems",
      title: "Why Anweshan items",
      type: "array",
      description:
        "Optional. The closing check-list on /about, two across. Up to eight. Leave empty and the section is hidden.",
      of: [
        defineArrayMember({
          type: "string",
          validation: (r) =>
            r.max(200).warning("Items over 200 characters run to several lines."),
        }),
      ],
      validation: (r) =>
        r.max(8).warning("Up to eight items; extra ones are ignored."),
    }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});
