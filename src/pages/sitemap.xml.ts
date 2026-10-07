import type { APIRoute } from "astro";
import groq from "groq";
import { loadQuery } from "../lib/sanity/load-query";
import { routes } from "../lib/sanity/routes";

// SSR: @astrojs/sitemap ziet de Sanity-routes niet, daarom een eigen endpoint (SEO.md §4).
const QUERY = groq`*[_type in $types && defined(slug.current) && seo.noindex != true]{
  _type, "slug": slug.current, _updatedAt
}`;

export const GET: APIRoute = async ({ site }) => {
  const { data } = await loadQuery<{ _type: keyof typeof routes; slug: string; _updatedAt: string }[]>({
    query: QUERY,
    params: { types: Object.keys(routes) },
  });

  const urls = data
    .map((d) => `  <url><loc>${new URL(routes[d._type](d.slug), site).href}</loc><lastmod>${d._updatedAt}</lastmod></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } },
  );
};
