import { defineArrayMember, defineField, defineType } from "sanity";
import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { themeField } from "../objects/helpers";

/** Voordelen/USP's: korte titel + tekst in een raster. */
export default defineType({
  name: "uspGrid",
  title: "Voordelen",
  type: "object",
  icon: BulbOutlineIcon,
  fields: [
    defineField({ name: "title", title: "Titel", type: "string" }),
    defineField({
      name: "items",
      title: "Voordelen",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "usp",
          fields: [
            defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Tekst", type: "text", rows: 3 }),
          ],
        }),
      ],
    }),
    themeField("green"),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: title || "Voordelen", subtitle: "Voordelen" }) },
});
