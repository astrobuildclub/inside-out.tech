import { defineField, defineType } from "sanity";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { imageField } from "../objects/helpers";

/** Contactformulier + contactgegevens (adres, telefoon en e-mail komen uit de site-instellingen). */
export default defineType({
  name: "contact",
  title: "Contactformulier",
  type: "object",
  icon: EnvelopeIcon,
  fields: [
    defineField({ name: "formTitle", title: "Titel formulier", type: "string" }),
    defineField({ name: "successMessage", title: "Bedankt-melding", type: "string", initialValue: "Bedankt! We nemen zo snel mogelijk contact met je op." }),
    defineField({ name: "openingHours", title: "Bereikbaarheid", type: "string", initialValue: "Maandag t/m vrijdag 8:00–17:00" }),
    imageField("mapImage", "Kaartbeeld"),
    defineField({ name: "mapUrl", title: "Link naar kaart (Google Maps)", type: "url" }),
  ],
  preview: { prepare: () => ({ title: "Contactformulier" }) },
});
