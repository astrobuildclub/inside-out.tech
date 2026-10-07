import { defineArrayMember, defineField, defineType } from "sanity";
import { PackageIcon } from "@sanity/icons/Package";
import { contentGroups, imageField, seoField, slugField } from "../objects/helpers";

/** Plug & Play-module (product). */
export default defineType({
  name: "module",
  title: "Module",
  type: "document",
  icon: PackageIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", title: "Naam", type: "string", group: "content", validation: (r) => r.required() }),
    { ...slugField(), group: "content" },
    defineField({ name: "type", title: "Type", type: "string", group: "content", description: "Bv. 'Hybride warmtepomp + boiler'" }),
    { ...imageField("image", "Beeld"), group: "content" },
    defineField({ name: "excerpt", title: "Samenvatting (overzicht)", type: "text", rows: 3, group: "content" }),
    defineField({ name: "intro", title: "Intro (detailpagina)", type: "text", rows: 4, group: "content" }),
    defineField({ name: "content", title: "Tekst", type: "richText", group: "content" }),
    defineField({ name: "specs", title: "Specificaties", type: "richText", group: "content" }),
    defineField({ name: "factsheet", title: "Factsheet (PDF)", type: "file", group: "content", options: { accept: "application/pdf" } }),
    defineField({ name: "media", title: "Beelden", type: "array", group: "content", of: [defineArrayMember({ type: "mediaItem" })], options: { layout: "grid" } }),
    defineField({ name: "orderRank", title: "Volgorde", type: "number", group: "content", hidden: true }),
    seoField(),
  ],
  orderings: [{ title: "Volgorde", name: "order", by: [{ field: "orderRank", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "type", media: "image" } },
});
