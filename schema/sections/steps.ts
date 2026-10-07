import { defineField, defineType } from "sanity";
import { OlistIcon } from "@sanity/icons/Olist";
import { imageField, themeField } from "../objects/helpers";

/** Uitklapbare stappen (RGS-fasen of stappenplan installatiepartners). */
export default defineType({
  name: "steps",
  title: "Stappen (accordion)",
  type: "object",
  icon: OlistIcon,
  fields: [
    defineField({ name: "title", title: "Titel", type: "string" }),
    defineField({ name: "intro", title: "Tekst boven de stappen", type: "richText" }),
    defineField({
      name: "list",
      title: "Welke stappen",
      type: "string",
      validation: (r) => r.required(),
      options: {
        list: [
          { title: "RGS-fasen", value: "rgs" },
          { title: "Stappenplan installatiepartners", value: "installatiepartners" },
        ],
      },
    }),
    imageField("image", "Beeld"),
    defineField({
      name: "imagePosition",
      title: "Positie beeld",
      type: "string",
      initialValue: "right",
      options: { layout: "radio", direction: "horizontal", list: [{ title: "Links", value: "left" }, { title: "Rechts", value: "right" }] },
    }),
    themeField("light"),
  ],
  preview: {
    select: { title: "title", list: "list", media: "image" },
    prepare: ({ title, list, media }) => ({ title: title || "Stappen", subtitle: `Stappen: ${list ?? "?"}`, media }),
  },
});
