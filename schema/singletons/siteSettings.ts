import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

export default defineType({
  name: "siteSettings",
  title: "Site-instellingen",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "algemeen", title: "Algemeen", default: true },
    { name: "organisatie", title: "Organisatie" },
    { name: "seo", title: "SEO" },
    { name: "ai", title: "AI" },
  ],
  fields: [
    // Algemeen
    defineField({ name: "siteName", title: "Sitenaam", type: "string", group: "algemeen", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Payoff", type: "string", group: "algemeen" }),
    defineField({ name: "logo", title: "Logo", type: "image", group: "algemeen" }),
    defineField({
      name: "companyName",
      title: "Statutaire naam",
      description: "Bv. Inside Out Technologies B.V. Staat in de footer.",
      type: "string",
      group: "organisatie",
    }),

    // Organisatie (voedt JSON-LD; zie SEO.md)
    defineField({
      name: "entityType",
      title: "Wie staat er achter de site?",
      type: "string",
      group: "organisatie",
      initialValue: "Organization",
      options: {
        layout: "radio",
        list: [
          { title: "Persoon", value: "Person" },
          { title: "Organisatie", value: "Organization" },
          { title: "Lokaal bedrijf (met adres/bezoek)", value: "LocalBusiness" },
        ],
      },
    }),
    defineField({ name: "email", title: "E-mail", type: "string", group: "organisatie" }),
    defineField({ name: "telephone", title: "Telefoon", type: "string", group: "organisatie" }),
    defineField({
      name: "address",
      title: "Adres",
      type: "object",
      group: "organisatie",
      fields: [
        { name: "street", title: "Straat + nummer", type: "string" },
        { name: "postalCode", title: "Postcode", type: "string" },
        { name: "city", title: "Plaats", type: "string" },
        { name: "country", title: "Land (ISO)", type: "string", initialValue: "NL" },
      ],
    }),
    defineField({ name: "kvk", title: "KvK-nummer", type: "string", group: "organisatie" }),
    defineField({ name: "vat", title: "Btw-nummer", type: "string", group: "organisatie" }),
    defineField({
      name: "sameAs",
      title: "Profielen (LinkedIn, Instagram, …)",
      description: "Volledige URL's. Helpt zoekmachines en AI om de site aan de juiste persoon of organisatie te koppelen.",
      type: "array",
      of: [{ type: "url" }],
      group: "organisatie",
    }),

    // SEO-defaults
    defineField({
      name: "titleTemplate",
      title: "Titelpatroon",
      description: "%s wordt de paginatitel, bv. \"%s • Inside Out\".",
      type: "string",
      group: "seo",
      validation: (r) => r.custom((v) => !v || v.includes("%s") || "Moet %s bevatten"),
    }),
    defineField({
      name: "description",
      title: "Standaardbeschrijving",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (r) => r.max(160).warning("Zoekmachines tonen ongeveer 155 tekens"),
    }),
    defineField({
      name: "shareImage",
      title: "Standaard deelafbeelding",
      description: "Wordt bijgesneden tot 1200×630.",
      type: "image",
      group: "seo",
      fields: [{ name: "alt", title: "Alt-tekst", type: "string" }],
    }),
    defineField({
      name: "noindex",
      title: "Hele site verbergen voor zoekmachines",
      description: "Alleen voor sites die nog niet live mogen.",
      type: "boolean",
      initialValue: false,
      group: "seo",
    }),

    // AI
    defineField({
      name: "llmsIntro",
      title: "Uitleg voor AI-assistenten",
      description: "Twee à drie zinnen: wie, wat, voor wie, waar. Komt bovenaan /llms.txt.",
      type: "text",
      rows: 4,
      group: "ai",
    }),
    defineField({
      name: "allowAiTraining",
      title: "AI-modellen mogen de content gebruiken voor training",
      description: "Uit = training-crawlers (GPTBot, ClaudeBot, Google-Extended, …) worden geblokkeerd. AI-zoekfuncties blijven toegestaan. Bespreek dit met de klant.",
      type: "boolean",
      initialValue: true,
      group: "ai",
    }),
  ],
  preview: { prepare: () => ({ title: "Site-instellingen" }) },
});
