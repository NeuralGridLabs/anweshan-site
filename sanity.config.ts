import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

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
            S.documentTypeListItem("teamMember").title("Team members"),
            S.documentTypeListItem("publication").title("Publications"),
            S.documentTypeListItem("galleryEvent").title("Gallery events"),
          ]),
    }),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],
  schema: { types: schemaTypes },
});
