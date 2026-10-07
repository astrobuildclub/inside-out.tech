import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";
import { themeField } from "../objects/helpers";

/** Lopende band met logo's van opdrachtgevers en partners (uit "Opdrachtgevers & partners"). */
export default defineType({
  name: "logoMarquee",
  title: "Logo's",
  type: "object",
  icon: UsersIcon,
  fields: [
    defineField({ name: "clientsTitle", title: "Titel opdrachtgevers", type: "string", initialValue: "Opdrachtgevers" }),
    defineField({ name: "partnersTitle", title: "Titel partners", type: "string", initialValue: "Partners" }),
    themeField("white"),
  ],
  preview: { prepare: () => ({ title: "Logo's opdrachtgevers & partners" }) },
});
