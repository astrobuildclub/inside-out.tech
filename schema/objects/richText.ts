import { defineArrayMember, defineField, defineType } from "sanity";

/** Lopende tekst. Bewust beperkt: koppen h2–h4, lijsten, nadruk en links. */
export default defineType({
  name: "richText",
  title: "Tekst",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normaal", value: "normal" },
        { title: "Kop 2", value: "h2" },
        { title: "Kop 3", value: "h3" },
        { title: "Kop 4", value: "h4" },
        { title: "Intro", value: "lead" },
      ],
      lists: [
        { title: "Opsomming", value: "bullet" },
        { title: "Genummerd", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Vet", value: "strong" },
          { title: "Cursief", value: "em" },
          { title: "Subscript", value: "sub" },
          { title: "Superscript", value: "sup" },
        ],
        annotations: [
          defineField({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({ name: "href", title: "URL", type: "string", validation: (r) => r.required() }),
            ],
          }),
        ],
      },
    }),
  ],
});
