import { defineArrayMember, defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons/Play";
import { imageField } from "../objects/helpers";

/** Grote opener met achtergrondvideo of -beeld (home). */
export default defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "text",
      rows: 3,
      description: "Zet woorden tussen *sterretjes* om ze in de accentkleur te tonen.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "buttons", title: "Knoppen", type: "array", of: [defineArrayMember({ type: "link" })] }),
    defineField({
      name: "videoMp4",
      title: "Video (mp4)",
      type: "file",
      options: { accept: "video/mp4" },
      description: "Zonder geluid, max. ~10 MB. Speelt niet af bij 'beperkte beweging'.",
    }),
    defineField({ name: "videoWebm", title: "Video (webm, optioneel)", type: "file", options: { accept: "video/webm" } }),
    imageField("image", "Poster / achtergrondbeeld"),
  ],
  preview: { select: { title: "title", media: "image" }, prepare: ({ title, media }) => ({ title, subtitle: "Hero", media }) },
});
