// Titel, beschrijving en JSON-LD. Fallbacks: document → site-instellingen. Zie ~/Code/_standards/SEO.md.
import type { SiteSettings } from "./sanity/settings";

type Seo = { title?: string; description?: string };

export function pageTitle(settings: SiteSettings, title: string, seo?: Seo, isHome = false) {
  if (isHome) return seo?.title || [settings.siteName, settings.tagline].filter(Boolean).join(" • ");
  const pattern = settings.titleTemplate || `%s • ${settings.siteName}`;
  return pattern.replace("%s", seo?.title || title);
}

export function pageDescription(settings: SiteSettings, seo?: Seo, fallback?: string) {
  const text = seo?.description || fallback || settings.description || settings.tagline || "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 160 ? `${clean.slice(0, 157).trimEnd()}…` : clean;
}

/** Wie staat er achter de site: Person, Organization of LocalBusiness. */
export function entityJsonLd(settings: SiteSettings, site: URL) {
  const isPerson = settings.entityType === "Person";
  const a = settings.address;
  return {
    "@context": "https://schema.org",
    "@type": settings.entityType ?? "Organization",
    "@id": new URL("/#entity", site).href,
    name: settings.siteName,
    ...(settings.companyName && !isPerson && { legalName: settings.companyName }),
    url: site.href,
    ...(settings.tagline && { description: settings.tagline }),
    ...(settings.logo && (isPerson ? { image: settings.logo } : { logo: settings.logo })),
    ...(settings.email && { email: settings.email }),
    ...(settings.telephone && { telephone: settings.telephone }),
    ...(!isPerson && a?.city && {
      address: {
        "@type": "PostalAddress",
        streetAddress: a.street,
        postalCode: a.postalCode,
        addressLocality: a.city,
        addressCountry: a.country ?? "NL",
      },
    }),
    ...(!isPerson && settings.kvk && { identifier: { "@type": "PropertyValue", name: "KvK", value: settings.kvk } }),
    ...(!isPerson && settings.vat && { vatID: settings.vat }),
    ...(settings.sameAs?.length && { sameAs: settings.sameAs }),
  };
}

export function websiteJsonLd(settings: SiteSettings, site: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": new URL("/#website", site).href,
    url: site.href,
    name: settings.siteName,
    inLanguage: "nl-NL",
    publisher: { "@id": new URL("/#entity", site).href },
  };
}

export function articleJsonLd(
  post: { title: string; publishedAt: string; updatedAt?: string; image?: string; description?: string },
  url: URL,
  site: URL,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(post.description && { description: post.description }),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    ...(post.image && { image: post.image }),
    author: { "@id": new URL("/#entity", site).href },
    publisher: { "@id": new URL("/#entity", site).href },
    mainEntityOfPage: url.href,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], site: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, site).href,
    })),
  };
}
