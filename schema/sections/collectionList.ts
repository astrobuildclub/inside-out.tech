import { defineField, defineType } from "sanity";
import { StackCompactIcon } from "@sanity/icons/StackCompact";
import { themeField } from "../objects/helpers";

/** Toont items uit een collectie (projecten, nieuws, modules, team). */
export default defineType({
  name: "collectionList",
  title: "Collectie",
  type: "object",
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: "collection",
      title: "Collectie",
      type: "string",
      validation: (r) => r.required(),
      options: {
        list: [
          { title: "Projecten", value: "project" },
          { title: "Nieuws", value: "news" },
          { title: "Modules (Plug & Play)", value: "module" },
          { title: "Team", value: "person" },
        ],
      },
    }),
    defineField({ name: "title", title: "Titel", type: "string" }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "layout",
      title: "Weergave",
      type: "string",
      initialValue: "grid",
      options: { layout: "radio", direction: "horizontal", list: [{ title: "Raster", value: "grid" }, { title: "Carousel", value: "carousel" }] },
    }),
    defineField({ name: "limit", title: "Maximum aantal", type: "number", description: "Leeg = alles." }),
    defineField({ name: "link", title: "Knop (bv. 'Alle projecten')", type: "link" }),
    themeField("light"),
  ],
  preview: {
    select: { title: "title", collection: "collection" },
    prepare: ({ title, collection }) => ({ title: title || "Collectie", subtitle: `Collectie: ${collection ?? "?"}` }),
  },
});
