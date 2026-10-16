import { defineField } from "sanity";

import { seoDescriptionField, seoTitleField } from "./seoFields";

/* --------------------------------------------------------------------------
    The "SEO" group.

    Every document with a page of its own gets these two optional fields
    collected into one group, so they sit at the bottom of the document as a
    labelled section instead of being scattered among the content fields.

    /cro is deliberately absent: it has no Sanity document at all, its content
    is hard-coded in src/app/cro/page.tsx, so there is nowhere to put a field
    and nothing would read one.
   ----------------------------------------------------------------------- */

export const seoGroup = defineField({
  name: "seoGroup",
  title: "SEO",
  type: "object",
  fields: [seoTitleField, seoDescriptionField],
});