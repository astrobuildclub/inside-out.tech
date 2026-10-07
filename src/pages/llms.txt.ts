import type { APIRoute } from "astro";
import groq from "groq";
import { loadQuery } from "../lib/sanity/load-query";
import { routes } from "../lib/sanity/routes";

const QUERY = groq`{
  "settings": *[_id == "siteSettings"][0]{ siteName, tagline, description, llmsIntro, email, telephone },
  "pages": *[_type == "page" && defined(slug.current) && seo.noindex != true] | order(title asc){
    title, "slug": slug.current, "description": seo.description
  },
  "modules": *[_type == "module" && defined(slug.current) && seo.noindex != true] | order(orderRank asc){
    title, "slug": slug.current, "description": coalesce(seo.description, excerpt)
  },
  "projects": *[_type == "project" && defined(slug.current) && seo.noindex != true] | order(orderRank asc){
    title, "slug": slug.current, "description": coalesce(seo.description, excerpt)
  },
  "news": *[_type == "news" && defined(slug.current) && seo.noindex != true] | order(publishedAt desc)[0...30]{
    title, "slug": slug.current, "description": coalesce(seo.description, intro)
  }
}`;

type Item = { title: string; slug: string; description?: string };

export const GET: APIRoute = async ({ site }) => {
  const { data } = await loadQuery<{
    settings: { siteName: string; tagline?: string; description?: string; llmsIntro?: string; email?: string; telephone?: string };
    pages: Item[];
    modules: Item[];
    projects: Item[];
    news: Item[];
  }>({ query: QUERY });

  const { settings, pages, modules, projects, news } = data;
  const link = (path: string, i: Item) =>
    `- [${i.title}](${new URL(path, site).href})${i.description ? `: ${i.description.replace(/\s+/g, " ").trim()}` : ""}`;
  const section = (title: string, items: Item[], route: (slug: string) => string) =>
    items.length ? ["", `## ${title}`, "", ...items.map((i) => link(route(i.slug), i))] : [];

  const body = [
    `# ${settings.siteName}`,
    "",
    `> ${settings.tagline ?? settings.description ?? ""}`,
    "",
    settings.llmsIntro ?? settings.description ?? "",
    [settings.email && `E-mail: ${settings.email}`, settings.telephone && `Telefoon: ${settings.telephone}`].filter(Boolean).join(" · "),
    ...section("Pagina's", pages, routes.page),
    ...section("Plug & Play-modules", modules, routes.module),
    ...section("Projecten", projects, routes.project),
    ...section("Nieuws", news, routes.news),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
};
