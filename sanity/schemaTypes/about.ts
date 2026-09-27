import { defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({ name: "body", title: "Body", type: "text" }),
    defineField({ name: "image", title: "Feature image", type: "image" }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});
