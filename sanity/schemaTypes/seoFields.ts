import { defineField } from "sanity";

/* --------------------------------------------------------------------------
    Reusable SEO fields.

    Every document that has a page of its own gets the same two optional
    fields, so an editor can override the title and description a route would
    otherwise take from its built-in default. Both are optional everywhere: an
    empty field must never blank out real copy, which is why the pages fall
    back rather than rendering an empty tag.

    The length limits are WARNINGS, not errors. A page with a long description
    is still better than a page with none, and blocking a publish over a
    character count pushes people to write something shorter and worse rather
    than leaving it alone. The warning is there to catch the common accident of
    pasting a paragraph.
   ----------------------------------------------------------------------- */

export const seoTitleField = defineField({
  name: "seoTitle",
  title: "SEO title",
  type: "string",
  description:
    "Optional. Overrides the browser tab and the share-card title for this page. Leave empty to use the default written into the page. Google truncates around 60 characters, so anything past that may be cut.",
  validation: (r) =>
    r.max(60).warning("Titles over 60 characters are usually truncated in search results."),
});

export const seoDescriptionField = defineField({
  name: "seoDescription",
  title: "SEO description",
  type: "text",
  rows: 3,
  description:
    "Optional. Overrides the meta description and the share-card text for this page. Leave empty to use the default written into the page. Search engines truncate around 160 characters.",
  validation: (r) =>
    r.max(160).warning("Descriptions over 160 characters are usually truncated in search results."),
});