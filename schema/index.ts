import siteSettings from "./singletons/siteSettings";
import navigation from "./singletons/navigation";
import page from "./documents/page";
import project from "./documents/project";
import module from "./documents/module";
import news from "./documents/news";
import person from "./documents/person";
import clientPartner from "./documents/clientPartner";
import step from "./documents/step";
import seo from "./objects/seo";
import link from "./objects/link";
import richText from "./objects/richText";
import mediaItem from "./objects/mediaItem";
import { sectionTypes } from "./sections";

export const singletonTypes = new Set(["siteSettings", "navigation"]);

export const schemaTypes = [
  siteSettings,
  navigation,
  page,
  project,
  module,
  news,
  person,
  clientPartner,
  step,
  seo,
  link,
  richText,
  mediaItem,
  ...sectionTypes,
];
