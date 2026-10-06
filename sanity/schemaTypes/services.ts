import { defineArrayMember, defineField, defineType } from "sanity";

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
      description:
        "Order here is the order shown on the page. Title and description are the only required fields; everything below is optional so a short service does not have to be padded out to match a long one.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "description",
              title: "Description",
              description: "The short summary shown in the services section.",
              type: "text",
              rows: 3,
            }),
            defineField({ name: "icon", title: "Icon name (lucide)", type: "string" }),

            defineField({
              name: "image",
              title: "Service image",
              description:
                "Shown beside the title in the services section. Optional — a service without one still renders, it just loses the image panel.",
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alternative text",
                  description: "Describes the image for screen readers.",
                  type: "string",
                }),
              ],
            }),

            /* --- detail page --- */

            defineField({
              name: "slug",
              title: "Slug",
              description:
                "Forms the page URL /services/<slug> and the band anchor #<slug>. Needed whenever this service has a detail page.",
              type: "slug",
              options: { source: "title", maxLength: 96 },
            }),
            defineField({
              name: "hasDetailPage",
              title: "Has detail page",
              description:
                "Turn on to give this service its own page at /services/<slug> and a Learn more link on its band. Needs a slug, tagline, detail paragraph and capabilities.",
              type: "boolean",
              initialValue: false,
            }),

            /* --- detail page content: shown on the service's own page only,
                   never on its band in the services list --- */

            defineField({
              name: "tagline",
              title: "Tagline",
              type: "string",
              description:
                'The short italic line under the title on the service detail page, for example "Evidence designed around the decision". Shown only on the detail page, not on the band.',
              validation: (r) =>
                r.max(70).warning(
                  "Taglines past 70 characters wrap to two lines under the title.",
                ),
            }),
            defineField({
              name: "detailBody",
              title: "Detail paragraph",
              type: "text",
              rows: 4,
              description:
                "The intro paragraph on the service detail page. Shown only on the detail page, not on the band.",
              validation: (r) =>
                r.max(450).warning(
                  "Paragraphs past 450 characters are hard to read on the detail page.",
                ),
            }),
            defineField({
              name: "capabilities",
              title: "Capabilities",
              type: "array",
              description:
                'The "What this includes" bullet list on the service detail page. Shown only on the detail page, not on the band.',
              of: [
                defineArrayMember({
                  type: "string",
                  validation: (r) =>
                    r.max(80).warning("Bullets past 80 characters wrap onto two lines."),
                }),
              ],
              validation: (r) =>
                r.max(8).warning("The detail page lists up to eight capabilities; extra ones are ignored."),
            }),

            /* --- call to action: shown on both the band and the detail page --- */

            defineField({
              name: "ctaLabel",
              title: "Button label",
              type: "string",
              description:
                "Label for this service's button. Shown on both its band in the services list and on its detail page.",
              validation: (r) =>
                r.max(40).warning("Shorter labels suit the pill button better."),
            }),
            defineField({
              name: "ctaLink",
              title: "Button link",
              type: "string",
              description:
                'Where the button goes: an internal path such as "/contact", or a full https URL. Shown on both the band and the detail page.',
            }),

            /* --- long-form content, all optional --- */

            defineField({
              name: "highlights",
              title: "Highlights",
              description:
                "Short chips shown under the description in the services section.",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
            /* --- retired --- */

            /* Superseded by tagline, detailBody and capabilities above. Kept in the
               schema so existing documents keep their data, but hidden so no one
               edits it and nothing new is written against it. */
            defineField({
              name: "sections",
              title: "Detail sections",
              hidden: true,
              description:
                "Long-form content for the detail page: a heading, an optional paragraph, and optional bullets. Every part is optional, so a section can be just a heading plus bullets.",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({ name: "heading", title: "Heading", type: "string" }),
                    defineField({ name: "body", title: "Body", type: "text", rows: 4 }),
                    defineField({
                      name: "bullets",
                      title: "Bullet points",
                      type: "array",
                      of: [defineArrayMember({ type: "string" })],
                    }),
                  ],
                  preview: {
                    select: { title: "heading", body: "body" },
                    prepare: ({ title, body }) => ({
                      title: title || "(untitled section)",
                      subtitle: body
                        ? String(body).slice(0, 60)
                        : "No body text",
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title", slug: "slug", hasDetail: "hasDetailPage" },
            prepare: ({ title, slug, hasDetail }) => ({
              title: title || "(untitled service)",
              subtitle: `${slug?.current || "no slug"} · Detail page ${hasDetail ? "on" : "off"}`,
            }),
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Services" }) },
});
