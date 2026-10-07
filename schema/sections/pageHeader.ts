import { defineField, defineType } from "sanity";
import { InlineElementIcon } from "@sanity/icons/InlineElement";
import { imageField, themeField } from "../objects/helpers";

/** Paginakop: kleine label-tekst, titel, intro en optioneel beeld. */
export default defineType({
  name: "pageHeader",
  title: "Paginakop",
  type: "object",
  icon: InlineElementIcon,
  fields: [
    defineField({ name: "eyebrow", title: "Label boven de titel", type: "string" }),
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "layout",
      title: "Opmaak",
      type: "string",
      initialValue: "stacked",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Onder elkaar", value: "stacked" },
          { title: "Titel links, intro rechts", value: "split" },
        ],
      },
    }),
    imageField("image", "Achtergrondbeeld"),
    themeField("light"),
  ],
  preview: { select: { title: "title", subtitle: "eyebrow", media: "image" } },
});
