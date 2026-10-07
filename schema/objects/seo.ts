import { defineField, defineType } from "sanity";

export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      description: "Leeg = paginatitel.",
      type: "string",
      validation: (r) => r.max(60).warning("Zoekmachines tonen ongeveer 60 tekens"),
    }),
    defineField({
      name: "description",
      title: "Beschrijving",
      description: "Leeg = intro van de pagina of de standaardbeschrijving.",
      type: "text",
      rows: 3,
      validation: (r) => r.max(160).warning("Zoekmachines tonen ongeveer 155 tekens"),
    }),
    defineField({
      name: "image",
      title: "Deelafbeelding",
      description: "Leeg = hoofdafbeelding of de standaard deelafbeelding.",
      type: "image",
      fields: [{ name: "alt", title: "Alt-tekst", type: "string" }],
    }),
    defineField({
      name: "noindex",
      title: "Verbergen voor zoekmachines",
      description: "Ook uit sitemap en llms.txt.",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
