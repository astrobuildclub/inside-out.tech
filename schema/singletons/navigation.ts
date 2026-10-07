import { defineArrayMember, defineField, defineType } from "sanity";
import { MenuIcon } from "@sanity/icons/Menu";

/** Hoofdmenu, footer en de vaste CTA in de footer. Sitebrede gegevens staan in siteSettings. */
export default defineType({
  name: "navigation",
  title: "Navigatie",
  type: "document",
  icon: MenuIcon,
  fields: [
    defineField({ name: "headerCta", title: "Knop in de header", type: "link" }),
    defineField({ name: "main", title: "Hoofdmenu", type: "array", of: [defineArrayMember({ type: "link" })] }),
    defineField({ name: "footer", title: "Footer-menu", type: "array", of: [defineArrayMember({ type: "link" })] }),
    defineField({ name: "footerCtaText", title: "Footer: tekst bij de knop", type: "text", rows: 2 }),
    defineField({ name: "footerCta", title: "Footer: knop", type: "link" }),
    defineField({ name: "terms", title: "Algemene voorwaarden (PDF)", type: "file", options: { accept: "application/pdf" } }),
    defineField({ name: "termsLabel", title: "Label voorwaarden", type: "string", initialValue: "Alg. voorwaarden" }),
    defineField({ name: "privacyPage", title: "Privacypagina", type: "reference", to: [{ type: "page" }] }),
  ],
  preview: { prepare: () => ({ title: "Navigatie" }) },
});
