import { defineField } from "sanity";

/** Afbeelding met hotspot en alt-tekst (zie ~/Code/_standards/IMAGES.md §3). */
export const imageField = (name: string, title: string, extra: Record<string, unknown> = {}) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alternatieve tekst",
        type: "string",
        description: "Beschrijf wat je ziet. Laat leeg voor puur decoratieve beelden.",
      }),
    ],
    ...extra,
  });

/** Kleurthema van een sectie; komt overeen met [data-theme] in src/styles/themes.css. */
export const themeField = (initialValue = "light") =>
  defineField({
    name: "theme",
    title: "Kleurthema",
    type: "string",
    initialValue,
    options: {
      layout: "radio",
      direction: "horizontal",
      list: [
        { title: "Licht (concrete)", value: "light" },
        { title: "Wit", value: "white" },
        { title: "Groen", value: "green" },
        { title: "Lemon", value: "lemon" },
        { title: "Donker", value: "dark" },
      ],
    },
  });

export const slugField = (source = "title") =>
  defineField({
    name: "slug",
    title: "Slug",
    type: "slug",
    options: { source, maxLength: 96 },
    validation: (r) => r.required(),
  });

export const seoField = () => defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" });

export const contentGroups = [
  { name: "content", title: "Content", default: true },
  { name: "seo", title: "SEO" },
];
