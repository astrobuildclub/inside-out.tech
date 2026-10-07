import { defineField, defineType } from "sanity";
import { OlistIcon } from "@sanity/icons/Olist";

/** Eén stap in de RGS-fasen of het stappenplan voor installatiepartners. */
export default defineType({
  name: "step",
  title: "Stap",
  type: "document",
  icon: OlistIcon,
  fields: [
    defineField({
      name: "list",
      title: "Hoort bij",
      type: "string",
      validation: (r) => r.required(),
      options: {
        layout: "radio",
        list: [
          { title: "RGS-fasen", value: "rgs" },
          { title: "Stappenplan installatiepartners", value: "installatiepartners" },
        ],
      },
    }),
    defineField({ name: "number", title: "Nummer", type: "number", validation: (r) => r.required().integer().min(0) }),
    defineField({ name: "title", title: "Titel", type: "string", description: "Zonder nummer; dat komt uit het veld Nummer.", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Beschrijving", type: "richText" }),
  ],
  orderings: [{ title: "Nummer", name: "number", by: [{ field: "list", direction: "asc" }, { field: "number", direction: "asc" }] }],
  preview: {
    select: { title: "title", number: "number", list: "list" },
    prepare: ({ title, number, list }) => ({ title: `${number ?? "?"}. ${title}`, subtitle: list === "rgs" ? "RGS-fasen" : "Stappenplan installatiepartners" }),
  },
});
