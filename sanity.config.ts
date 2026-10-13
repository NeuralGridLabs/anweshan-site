"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/* Vision is a GROQ query console with a raw result viewer. Useful while
   writing a query, and not something to hand a content editor or a visitor on
   a public route - the Studio is mounted at /admin, so the tool ships in the
   client bundle that anyone can load.

   NODE_ENV is inlined at build time, so in a production build this resolves to
   an empty array and the tool is dropped rather than merely hidden. */
const devOnly = process.env.NODE_ENV === "development";

export default defineConfig({
  name: "default",
  title: "Anweshan CMS",
  projectId,
  dataset,
  basePath: "/admin",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site settings")
              .id("siteSettings")
              .child(
                S.document().schemaType("siteSettings").documentId("siteSettings"),
              ),
            S.listItem()
              .title("Home")
              .id("home")
              .child(S.document().schemaType("home").documentId("home")),
            S.listItem()
              .title("About")
              .id("about")
              .child(S.document().schemaType("about").documentId("about")),
            S.listItem()
              .title("Services")
              .id("services")
              .child(
                S.document().schemaType("services").documentId("services"),
              ),
            S.listItem()
              .title("Clients")
              .id("clients")
              .child(S.document().schemaType("clients").documentId("clients")),
            S.listItem()
              .title("Career")
              .id("career")
              .child(S.document().schemaType("career").documentId("career")),
            S.listItem()
              .title("Contact")
              .id("contact")
              .child(S.document().schemaType("contact").documentId("contact")),
            S.divider(),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("clientHub").title("Client hubs"),
            /* Visible in the desk so the eight sector documents stay editable.
               The FRONTEND does not read them - /sectors uses the fixed list in
               src/lib/sectors.ts - but the documents are real data an editor
               filled in, so hiding the type made them unreachable and looked
               like data loss. */
            S.documentTypeListItem("sector").title("Sectors"),
            S.documentTypeListItem("teamMember").title("Team members"),
            S.documentTypeListItem("publication").title("Publications"),
            S.documentTypeListItem("galleryEvent").title("Gallery events"),
          ]),
    }),
    ...(devOnly ? [visionTool({ defaultApiVersion: "2024-01-01" })] : []),
  ],
  schema: { types: schemaTypes },
});
