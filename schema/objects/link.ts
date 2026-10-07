import { defineField, defineType } from "sanity";
import { LinkIcon } from "@sanity/icons/Link";

/** Knop of link: naar een document in de site, een externe URL of een bestand. */
export default defineType({
  name: "link",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "internal",
      title: "Interne pagina",
      type: "reference",
      to: [{ type: "page" }, { type: "project" }, { type: "module" }, { type: "news" }],
    }),
    defineField({
      name: "href",
      title: "Externe URL, anker of mailto:/tel:",
      type: "string",
      description: "Alleen als er geen interne pagina gekozen is.",
    }),
    defineField({
      name: "style",
      title: "Stijl",
      type: "string",
      initialValue: "primary",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Primair", value: "primary" },
          { title: "Secundair", value: "secondary" },
          { title: "Tekstlink", value: "text" },
        ],
      },
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});
