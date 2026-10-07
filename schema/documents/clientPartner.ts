import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";
import { imageField } from "../objects/helpers";

export default defineType({
  name: "clientPartner",
  title: "Opdrachtgever / partner",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({ name: "title", title: "Naam", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "kind",
      title: "Soort",
      type: "string",
      validation: (r) => r.required(),
      options: { layout: "radio", list: [{ title: "Opdrachtgever", value: "client" }, { title: "Partner", value: "partner" }] },
    }),
    imageField("logo", "Logo"),
    defineField({ name: "url", title: "Website", type: "url" }),
  ],
  preview: {
    select: { title: "title", kind: "kind", media: "logo" },
    prepare: ({ title, kind, media }) => ({ title, subtitle: kind === "partner" ? "Partner" : "Opdrachtgever", media }),
  },
});
