import { defineField, defineType } from "sanity";

export const home = defineType({
  name: "home",
  title: "Home",
  type: "document",
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Hero eyebrow",
      type: "string",
      description: "Small uppercase label above the hero heading.",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero heading",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroSubtext",
      title: "Hero subtext",
      type: "text",
    }),
    defineField({
      name: "primaryCtaLabel",
      title: "Primary button label",
      type: "string",
    }),
    defineField({
      name: "secondaryCtaLabel",
      title: "Secondary button label",
      type: "string",
    }),
    defineField({
      name: "slides",
      title: "Hero image slides",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
            defineField({ name: "label", title: "Caption", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "aboutBlurb",
      title: "About section blurb (home)",
      type: "text",
    }),
  ],
  preview: { prepare: () => ({ title: "Home" }) },
});
