import { defineField, defineType } from "sanity";
import { BellIcon } from "@sanity/icons/Bell";
import { imageField, themeField } from "../objects/helpers";

/** Call-to-action: titel, tekst, knop en optioneel een foto. */
export default defineType({
  name: "cta",
  title: "Call-to-action",
  type: "object",
  icon: BellIcon,
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", description: "Zet woorden tussen *sterretjes* voor de lemon-streep eronder.", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Tekst", type: "text", rows: 3 }),
    defineField({ name: "link", title: "Knop", type: "link" }),
    imageField("image", "Foto (optioneel)"),
    themeField("green"),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title, subtitle: "Call-to-action", media }),
  },
});
