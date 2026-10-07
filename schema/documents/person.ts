import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons/User";
import { imageField } from "../objects/helpers";

export default defineType({
  name: "person",
  title: "Teamlid",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({ name: "name", title: "Naam", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Functie", type: "string" }),
    imageField("image", "Foto"),
    defineField({ name: "email", title: "E-mail", type: "string", validation: (r) => r.email() }),
    defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
    defineField({ name: "orderRank", title: "Volgorde", type: "number" }),
  ],
  orderings: [{ title: "Volgorde", name: "order", by: [{ field: "orderRank", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "role", media: "image" } },
});
