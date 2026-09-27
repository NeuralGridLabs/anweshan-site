import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "orgName",
      title: "Organization name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Short line shown under the logo / in the browser context.",
    }),
    defineField({
      name: "logo",
      title: "Logo (dark text version)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "logoLight",
      title: "Logo (light version, for dark bands)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "stats",
      title: "Headline stats (home band)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
