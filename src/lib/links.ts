import { stegaClean } from "@sanity/client/stega";
import { hrefFor } from "./sanity/routes";
import type { Link } from "./sanity/queries";

/** Href van een link-object: interne pagina wint van een losse URL. */
export function linkHref(link?: Link | null) {
  if (!link) return undefined;
  const internal = link.internal ? hrefFor(stegaClean(link.internal._type), stegaClean(link.internal.slug)) : undefined;
  return internal ?? (stegaClean(link.href) || undefined);
}

export const isExternal = (href?: string) => !!href && /^https?:\/\//.test(href) && !href.includes("inside-out.tech");

/** Telefoonnummer voor tel:-links: alleen cijfers en +, 030… → +3130…. */
export function telHref(phone?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("0") ? `+31${digits.slice(1)}` : digits}`;
}
