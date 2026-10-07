// Eén plek voor de URL-opbouw per documenttype. Gebruikt door links, sitemap, llms.txt en resolve.ts.
export const routes = {
  page: (slug: string) => (slug === "home" ? "/" : `/${slug}`),
  project: (slug: string) => `/projecten/${slug}`,
  module: (slug: string) => `/plug-play/${slug}`,
  news: (slug: string) => `/nieuws/${slug}`,
} as const;

export type RoutableType = keyof typeof routes;

export function hrefFor(type: string | undefined, slug: string | undefined) {
  if (!type || !slug || !(type in routes)) return undefined;
  return routes[type as RoutableType](slug);
}
