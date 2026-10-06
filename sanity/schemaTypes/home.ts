import { defineArrayMember, defineField, defineType } from "sanity";

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
      name: "primaryCtaLink",
      title: "Primary button link",
      type: "string",
      description:
        'Optional. Where the first hero button goes: "#id" scrolls to that section, "/path" or a full URL navigates. Leave empty to keep the default scroll to the Our featured work section.',
    }),
    defineField({
      name: "secondaryCtaLink",
      title: "Secondary button link",
      type: "string",
      description:
        'Optional. Where the second hero button goes: "#id" scrolls to that section, "/path" or a full URL navigates. Leave empty to keep the default link to /clients.',
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
            defineField({
              name: "alt",
              title: "Image alt text",
              type: "string",
              description:
                "Optional. Describes the hero slide image for screen readers. Leave empty to fall back to the Caption above.",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "aboutBlurb",
      title: "About section blurb (home)",
      type: "text",
    }),
    defineField({
      name: "aboutEyebrow",
      title: "About section eyebrow",
      type: "string",
      description:
        "Optional. The small uppercase label at the top of the About band on the home page. Leave empty to keep “ANWESHAN”.",
    }),
    defineField({
      name: "aboutBadge",
      title: "About section badge",
      type: "string",
      description:
        "Optional. The white chip beside the eyebrow, above the About band image on the home page. Leave empty to keep “Working since 2016”.",
    }),
    defineField({
      name: "aboutHeading",
      title: "About section heading",
      type: "string",
      description:
        "Optional. The large heading in the About band on the home page. Leave empty to keep the current heading.",
      validation: (r) =>
        r.max(70).warning(
          "Headings past 70 characters wrap to three or more lines on mobile.",
        ),
    }),
    defineField({
      name: "aboutHeadingHighlight",
      title: "About heading highlight",
      type: "string",
      description:
        "Optional. The exact phrase inside the About heading to colour. It must match the heading text character for character, including any full stop. Leave empty for no coloured words.",
    }),
    defineField({
      name: "aboutCtaLabel",
      title: "About button label",
      type: "string",
      description:
        "Optional. The label on the About band button on the home page. The button always links to /about. Leave empty to keep “About Us”.",
      validation: (r) =>
        r.max(40).warning("Shorter labels suit the pill button better."),
    }),
    defineField({
      name: "proofItems",
      title: "Proof bar items",
      type: "array",
      description:
        "Optional. Short credibility markers in the slim strip directly under the hero on the home page, for example years working or studies delivered. Up to four. Leave empty and no strip is shown.",
      of: [
        defineArrayMember({
          type: "string",
          validation: (r) =>
            r.max(40).warning("Items over 40 characters crowd the strip."),
        }),
      ],
      validation: (r) =>
        r.max(4).warning("The strip holds up to four items; extra ones are ignored."),
    }),
    defineField({
      name: "clientsEyebrow",
      title: "Clients eyebrow",
      type: "string",
      description:
        "Shown in the Our clients band on the home page, below Publications.",
    }),
    defineField({
      name: "clientsHeading",
      title: "Clients heading",
      type: "string",
      description:
        "Shown in the Our clients band on the home page, below Publications.",
    }),
    defineField({
      name: "clientsIntro",
      title: "Clients intro",
      type: "text",
      description:
        "Shown in the Our clients band on the home page, below Publications.",
    }),
    defineField({
      name: "clientsCtaLabel",
      title: "Clients button label",
      type: "string",
      description:
        "Shown in the Our clients band on the home page, below Publications.",
      validation: (r) =>
        r.max(40).warning("Shorter labels suit the pill button better."),
    }),
    defineField({
      name: "clientsCtaLink",
      title: "Clients button link",
      type: "string",
      description:
        "Shown in the Our clients band on the home page, below Publications.",
    }),
  ],
  preview: { prepare: () => ({ title: "Home" }) },
});
