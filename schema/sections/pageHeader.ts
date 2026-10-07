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
    imageField("image", "Beeld"),
    themeField("light"),
  ],
  preview: { select: { title: "title", subtitle: "eyebrow", media: "image" } },
});
