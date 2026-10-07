import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { CogIcon } from "@sanity/icons/Cog";
import { MenuIcon } from "@sanity/icons/Menu";
import { OlistIcon } from "@sanity/icons/Olist";
import { schemaTypes, singletonTypes } from "./schema";
import { resolve } from "./src/lib/sanity/resolve";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? "production";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);
const previewOrigin = typeof location !== "undefined" ? location.origin : "http://localhost:4321";

export default defineConfig({
  name: "inside-out",
  title: "Inside Out",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.documentTypeListItem("page").title("Pagina's"),
            S.divider(),
            S.documentTypeListItem("project").title("Projecten"),
            S.documentTypeListItem("module").title("Modules (Plug & Play)"),
            S.documentTypeListItem("news").title("Nieuws"),
            S.divider(),
            S.documentTypeListItem("person").title("Team"),
            S.documentTypeListItem("clientPartner").title("Opdrachtgevers & partners"),
            S.listItem()
              .title("Stappen")
              .icon(OlistIcon)
              .child(
                S.list()
                  .title("Stappen")
                  .items([
                    S.listItem()
                      .title("RGS-fasen")
                      .child(S.documentTypeList("step").title("RGS-fasen").filter('_type == "step" && list == "rgs"')
                        .initialValueTemplates([S.initialValueTemplateItem("step-rgs")])),
                    S.listItem()
                      .title("Stappenplan installatiepartners")
                      .child(S.documentTypeList("step").title("Stappenplan installatiepartners").filter('_type == "step" && list == "installatiepartners"')
                        .initialValueTemplates([S.initialValueTemplateItem("step-installatiepartners")])),
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title("Navigatie")
              .id("navigation")
              .icon(MenuIcon)
              .child(S.document().schemaType("navigation").documentId("navigation")),
            S.listItem()
              .title("Site-instellingen")
              .id("siteSettings")
              .icon(CogIcon)
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
          ]),
    }),
    presentationTool({
      resolve,
      previewUrl: {
        initial: previewOrigin,
        previewMode: { enable: "/api/preview", disable: "/api/preview/disable" },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
      { id: "step-rgs", title: "RGS-fase", schemaType: "step", value: { list: "rgs" } },
      { id: "step-installatiepartners", title: "Stap installatiepartners", schemaType: "step", value: { list: "installatiepartners" } },
    ],
  },
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
});
