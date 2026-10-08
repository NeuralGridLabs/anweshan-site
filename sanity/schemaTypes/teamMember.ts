import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "role", title: "Role / title", type: "string" }),
    defineField({
      name: "group",
      title: "Group",
      type: "string",
      description:
        "Must match one of the group headings on /team, otherwise the member is listed under Other. Kept in sync with teamGroups in src/lib/team.ts.",
      options: {
        list: [
          "Leadership",
          "Advisor and specialist",
          "Research and Programmes",
          "Data",
          "Operations",
          "IT team",
          "Office Support",
        ],
      },
    }),
    defineField({ name: "bio", title: "Short bio", type: "text" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
