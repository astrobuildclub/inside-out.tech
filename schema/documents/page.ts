import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";
import { HomeIcon } from "@sanity/icons/Home";
import { contentGroups, seoField, slugField } from "../objects/helpers";
import { sectionNames } from "../sections";

export default defineType({
  name: "page",
  title: "Pagina",
  type: "document",
  icon: DocumentIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", group: "content", validation: (r) => r.required() }),
    { ...slugField(), group: "content", description: "De homepage heeft slug 'home'." },
    defineField({ name: "sections", title: "Secties", type: "array", group: "content", of: sectionNames }),
    seoField(),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({
      title,
      subtitle: slug === "home" ? "/" : `/${slug ?? ""}`,
      media: slug === "home" ? HomeIcon : DocumentIcon,
    }),
  },
});
