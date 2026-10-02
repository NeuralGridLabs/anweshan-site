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
                "Used for the detail page URL. Only needed when this service has a detail page.",
              type: "slug",
              options: { source: "title", maxLength: 96 },
            }),
            defineField({
              name: "hasDetailPage",
              title: "Has detail page",
              description:
                "When on, the card links to /services/<slug> and the long-form sections below are rendered there. Leave off for services that have no long-form content yet — this is how a detail page gets enabled later, without a code change.",
              type: "boolean",
              initialValue: false,
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
            defineField({
              name: "sections",
              title: "Detail sections",
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
            select: { title: "title", hasDetail: "hasDetailPage" },
            prepare: ({ title, hasDetail }) => ({
              title: title || "(untitled service)",
              subtitle: hasDetail ? "Has detail page" : "Overview only",
            }),
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Services" }) },
});
