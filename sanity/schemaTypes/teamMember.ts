import { defineField, defineType } from "sanity";

import { teamGroups } from "../../src/lib/team";

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
        "Pick a value from the list. It is matched against the headings on /team after normalising case, spacing, \"&\" and advisor/adviser, so older hand-edited values like \"Advisor & specialist\" still file correctly. A value that matches nothing is listed under Other. The list below is teamGroups from src/lib/team.ts, so the two cannot drift apart.",
      /* Derived from teamGroups rather than typed out again. This is the same
         single-source-of-truth trick project.ts and about.ts already use for
         CATEGORY_OPTIONS and SECTOR_OPTIONS, and it is what stops the schema
         offering a value the page does not have a heading for - the original
         cause of advisers being filed under Other. */
      options: { list: teamGroups.map((g) => g.name) },
    }),
    defineField({ name: "bio", title: "Short bio", type: "text" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
