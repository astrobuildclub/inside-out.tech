import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { contentGroups, imageField, seoField, slugField } from "../objects/helpers";

export default defineType({
  name: "news",
  title: "Nieuwsbericht",
  type: "document",
  icon: DocumentsIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", group: "content", validation: (r) => r.required() }),
    { ...slugField(), group: "content" },
    defineField({
      name: "publishedAt",
      title: "Publicatiedatum",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    { ...imageField("image", "Hoofdbeeld"), group: "content" },
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3, group: "content" }),
    defineField({ name: "content", title: "Tekst", type: "richText", group: "content" }),
    defineField({ name: "linkUrl", title: "Bron (URL)", type: "url", group: "content", description: "Externe link, bv. het originele artikel." }),
    defineField({ name: "linkLabel", title: "Bron (label)", type: "string", group: "content" }),
    defineField({ name: "media", title: "Beelden", type: "array", group: "content", of: [defineArrayMember({ type: "mediaItem" })], options: { layout: "grid" } }),
    defineField({
      name: "related",
      title: "Gerelateerd nieuws",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "news" }] })],
      validation: (r) => r.max(3),
    }),
    seoField(),
  ],
  orderings: [{ title: "Nieuwste eerst", name: "dateDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "publishedAt", media: "image" } },
});
