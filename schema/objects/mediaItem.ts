import { defineField, defineType } from "sanity";
import { ImageIcon } from "@sanity/icons/Image";

/** Beeld in een galerij/carousel, met optioneel bijschrift. */
export default defineType({
  name: "mediaItem",
  title: "Beeld",
  type: "image",
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Alternatieve tekst", type: "string" }),
    defineField({ name: "caption", title: "Bijschrift", type: "string" }),
  ],
});
