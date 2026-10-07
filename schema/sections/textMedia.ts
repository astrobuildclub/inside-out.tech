import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { imageField, themeField } from "../objects/helpers";

/** Tekst in één of twee kolommen, optioneel met beeld ernaast. */
export default defineType({
  name: "textMedia",
  title: "Tekst (+ beeld)",
  type: "object",
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: "title", title: "Titel", type: "string" }),
    defineField({ name: "body", title: "Tekst", type: "richText" }),
    defineField({ name: "bodySecondary", title: "Tweede kolom", type: "richText" }),
    imageField("image", "Beeld"),
    defineField({
      name: "imagePosition",
      title: "Positie beeld",
      type: "string",
      initialValue: "right",
      options: { layout: "radio", direction: "horizontal", list: [{ title: "Links", value: "left" }, { title: "Rechts", value: "right" }] },
    }),
    defineField({ name: "buttons", title: "Knoppen", type: "array", of: [defineArrayMember({ type: "link" })] }),
    themeField("light"),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title: title || "Tekst", subtitle: "Tekst (+ beeld)", media }),
  },
});
