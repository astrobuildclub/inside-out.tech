// Koppelt documenten aan URL's voor de Presentation tool. URL-opbouw: routes.ts.
import { defineDocuments, defineLocations, type PresentationPluginOptions } from "sanity/presentation";
import { routes } from "./routes";

const overview = { project: "/projecten", module: "/plug-play", news: "/nieuws" } as const;

const locationsFor = (type: "project" | "module" | "news", label: string) =>
  defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        { title: doc?.title || "Zonder titel", href: routes[type](doc?.slug) },
        { title: label, href: overview[type] },
      ],
    }),
  });

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    page: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({ locations: doc?.slug ? [{ title: doc.title || "Zonder titel", href: routes.page(doc.slug) }] : [] }),
    }),
    project: locationsFor("project", "Projecten"),
    module: locationsFor("module", "Plug & Play"),
    news: locationsFor("news", "Nieuws"),
    siteSettings: defineLocations({ message: "Wordt op elke pagina gebruikt", locations: [{ title: "Home", href: "/" }] }),
    navigation: defineLocations({ message: "Header en footer op elke pagina", locations: [{ title: "Home", href: "/" }] }),
  },
  mainDocuments: defineDocuments([
    { route: "/", filter: `_type == "page" && slug.current == "home"` },
    { route: "/projecten/:slug", filter: `_type == "project" && slug.current == $slug` },
    { route: "/modules/:slug", filter: `_type == "module" && slug.current == $slug` },
    { route: "/nieuws/:slug", filter: `_type == "news" && slug.current == $slug` },
    { route: "/:slug", filter: `_type == "page" && slug.current == $slug` },
  ]),
};
