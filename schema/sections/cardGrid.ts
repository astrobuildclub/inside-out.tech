import { defineArrayMember, defineField, defineType } from "sanity";
import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { imageField, themeField } from "../objects/helpers";

/** Kaarten met beeld, titel, opsomming en knop (bv. de twee oplossingen op home). */
export default defineType({
  name: "cardGrid",
  title: "Kaarten",
  type: "object",
  icon: ThLargeIcon,
  fields: [
    defineField({ name: "title", title: "Titel", type: "string" }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "cards",
      title: "Kaarten",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "card",
          fields: [
            imageField("image", "Beeld"),
            defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Tekst", type: "text", rows: 3 }),
            defineField({ name: "bullets", title: "Opsomming", type: "array", of: [{ type: "string" }] }),
            defineField({ name: "link", title: "Knop", type: "link" }),
          ],
          preview: { select: { title: "title", media: "image" } },
        }),
      ],
    }),
    themeField("light"),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: title || "Kaarten", subtitle: "Kaarten" }) },
});
