import { defineArrayMember, defineField, defineType } from "sanity";
import { CaseIcon } from "@sanity/icons/Case";
import { contentGroups, imageField, seoField, slugField } from "../objects/helpers";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: CaseIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", title: "Naam", type: "string", group: "content", validation: (r) => r.required() }),
    { ...slugField(), group: "content" },
    { ...imageField("image", "Hoofdbeeld"), group: "content" },
    defineField({ name: "excerpt", title: "Samenvatting", type: "text", rows: 3, group: "content" }),
    defineField({ name: "content", title: "Tekst", type: "richText", group: "content" }),
    defineField({ name: "address", title: "Adres / locatie", type: "string", group: "content" }),
    defineField({ name: "period", title: "Looptijd", type: "string", group: "content", description: "Bv. 2023–2025" }),
    defineField({ name: "client", title: "Opdrachtgever", type: "string", group: "content" }),
    defineField({
      name: "modules",
      title: "Gebruikte producten",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "module" }] })],
    }),
    defineField({ name: "media", title: "Beelden", type: "array", group: "content", of: [defineArrayMember({ type: "mediaItem" })], options: { layout: "grid" } }),
    defineField({ name: "orderRank", title: "Volgorde", type: "number", group: "content", hidden: true }),
    seoField(),
  ],
  orderings: [{ title: "Volgorde", name: "order", by: [{ field: "orderRank", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "address", media: "image" } },
});
