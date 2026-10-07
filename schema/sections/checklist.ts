import { defineArrayMember, defineField, defineType } from "sanity";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { themeField } from "../objects/helpers";

/** Titel + lijst met vinkjes + knop ("Waarom kiezen voor ons?"). */
export default defineType({
  name: "checklist",
  title: "Checklist",
  type: "object",
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({ name: "title", title: "Titel", type: "string" }),
    defineField({ name: "items", title: "Punten", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "link", title: "Knop", type: "link" }),
    themeField("lemon"),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: title || "Checklist", subtitle: "Checklist" }) },
});
