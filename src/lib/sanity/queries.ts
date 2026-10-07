// Alle GROQ-queries en de bijbehorende types. Ophalen altijd via loadQuery().
import groq from "groq";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImage } from "./image";

// ── Fragmenten ────────────────────────────────────────────────────────────────

const LINK = groq`{ _key, label, href, style, "internal": internal->{ _type, "slug": slug.current } }`;
const FILE = groq`{ "asset": { "url": asset->url } }`;

const CARD = {
  project: groq`_type, _id, title, "slug": slug.current, image, excerpt, address`,
  news: groq`_type, _id, title, "slug": slug.current, image, intro, publishedAt, linkUrl, linkLabel`,
  module: groq`_type, _id, title, "slug": slug.current, type, image, excerpt`,
  person: groq`_type, _id, "title": name, role, image, email, linkedin`,
};

const SECTIONS = groq`sections[]{
  ...,
  _type == "hero" => { videoMp4${FILE}, videoWebm${FILE} },
  buttons[]${LINK},
  link${LINK},
  cards[]{ ..., link${LINK} },
  _type == "collectionList" => {
    "items": select(
      collection == "project" => *[_type == "project" && defined(slug.current)] | order(orderRank asc, _createdAt desc){ ${CARD.project} },
      collection == "news" => *[_type == "news" && defined(slug.current)] | order(publishedAt desc){ ${CARD.news} },
      collection == "module" => *[_type == "module" && defined(slug.current)] | order(orderRank asc){ ${CARD.module} },
      collection == "person" => *[_type == "person"] | order(orderRank asc){ ${CARD.person} }
    )
  },
  _type == "steps" => { "items": *[_type == "step" && list == ^.list] | order(number asc){ _id, number, title, description } },
  _type == "logoMarquee" => {
    "clients": *[_type == "clientPartner" && kind == "client"] | order(title asc){ _id, title, logo, url },
    "partners": *[_type == "clientPartner" && kind == "partner"] | order(title asc){ _id, title, logo, url }
  }
}`;

// ── Queries ───────────────────────────────────────────────────────────────────

export const LAYOUT_QUERY = groq`{
  "settings": *[_id == "siteSettings"][0]{ ..., "logo": logo.asset->url },
  "navigation": *[_id == "navigation"][0]{
    headerCta${LINK}, main[]${LINK}, footer[]${LINK}, footerCtaText, footerCta${LINK},
    terms${FILE}, termsLabel, "privacy": privacyPage->{ title, "slug": slug.current }
  }
}`;

export const PAGE_QUERY = groq`*[_type == "page" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, seo, ${SECTIONS}
}`;

export const PROJECT_QUERY = groq`*[_type == "project" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, image, excerpt, content, address, period, client, media, seo,
  // Zwakke verwijzingen naar ongepubliceerde modules geven null: die vallen weg.
  "modules": modules[defined(@->slug.current)]->{ title, "slug": slug.current },
  "cta": *[_type == "page" && slug.current == "projecten"][0].sections[_type == "cta"][0]{ ..., link${LINK} }
}`;

export const MODULE_QUERY = groq`*[_type == "module" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, type, image, excerpt, intro, content, specs, media, seo,
  factsheet${FILE},
  "cta": *[_type == "page" && slug.current == "plug-play"][0].sections[_type == "cta"][0]{ ..., link${LINK} }
}`;

export const NEWS_QUERY = groq`*[_type == "news" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, publishedAt, _updatedAt, image, intro, content, linkUrl, linkLabel, media, seo,
  "related": related[defined(@->slug.current)]->{ ${CARD.news} }
}`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type Seo = { title?: string; description?: string; image?: SanityImage; noindex?: boolean };

export type Link = {
  _key?: string;
  label: string;
  href?: string;
  style?: "primary" | "secondary" | "text";
  internal?: { _type: string; slug?: string } | null;
};

export type SanityFile = { asset?: { url?: string } } | null;

export type CardItem = {
  _type: "project" | "news" | "module" | "person";
  _id: string;
  title: string;
  slug?: string;
  image?: SanityImage;
  excerpt?: string;
  intro?: string;
  address?: string;
  type?: string;
  publishedAt?: string;
  linkUrl?: string;
  linkLabel?: string;
  role?: string;
  email?: string;
  linkedin?: string;
};

export type Theme = "light" | "white" | "green" | "lemon" | "dark";
type Base<T extends string> = { _type: T; _key: string; theme?: Theme };

export type Section =
  | (Base<"hero"> & { title: string; buttons?: Link[]; videoMp4?: SanityFile; videoWebm?: SanityFile; image?: SanityImage })
  | (Base<"pageHeader"> & { eyebrow?: string; title: string; intro?: string; image?: SanityImage })
  | (Base<"textMedia"> & {
      title?: string;
      body?: PortableTextBlock[];
      bodySecondary?: PortableTextBlock[];
      image?: SanityImage;
      imagePosition?: "left" | "right";
      buttons?: Link[];
    })
  | (Base<"cardGrid"> & {
      title?: string;
      intro?: string;
      cards?: { _key: string; image?: SanityImage; title: string; text?: string; bullets?: string[]; link?: Link }[];
    })
  | (Base<"uspGrid"> & { title?: string; items?: { _key: string; title: string; text?: string }[] })
  | (Base<"checklist"> & { title?: string; items?: string[]; link?: Link })
  | (Base<"cta"> & { title: string; text?: string; link?: Link; image?: SanityImage })
  | (Base<"collectionList"> & {
      collection: CardItem["_type"];
      title?: string;
      intro?: string;
      layout?: "grid" | "carousel";
      limit?: number;
      link?: Link;
      items?: CardItem[];
    })
  | (Base<"logoMarquee"> & {
      clientsTitle?: string;
      partnersTitle?: string;
      clients?: Logo[];
      partners?: Logo[];
    })
  | (Base<"steps"> & {
      title?: string;
      intro?: PortableTextBlock[];
      list: string;
      image?: SanityImage;
      items?: { _id: string; number: number; title: string; description?: PortableTextBlock[] }[];
    })
  | (Base<"contact"> & { formTitle?: string; successMessage?: string; openingHours?: string; mapImage?: SanityImage; mapUrl?: string });

export type Logo = { _id: string; title: string; logo?: SanityImage; url?: string };

export type Page = { _id: string; title: string; slug: string; seo?: Seo; sections?: Section[] };

export type CtaSection = Extract<Section, { _type: "cta" }>;

export type Project = {
  _id: string;
  title: string;
  slug: string;
  image?: SanityImage;
  excerpt?: string;
  content?: PortableTextBlock[];
  address?: string;
  period?: string;
  client?: string;
  media?: SanityImage[];
  modules?: { title: string; slug: string }[];
  seo?: Seo;
  cta?: CtaSection | null;
};

export type Module = {
  _id: string;
  title: string;
  slug: string;
  type?: string;
  image?: SanityImage;
  excerpt?: string;
  intro?: string;
  content?: PortableTextBlock[];
  specs?: PortableTextBlock[];
  factsheet?: SanityFile;
  media?: SanityImage[];
  seo?: Seo;
  cta?: CtaSection | null;
};

export type News = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  _updatedAt: string;
  image?: SanityImage;
  intro?: string;
  content?: PortableTextBlock[];
  linkUrl?: string;
  linkLabel?: string;
  media?: SanityImage[];
  related?: CardItem[];
  seo?: Seo;
};

export type Navigation = {
  headerCta?: Link;
  main?: Link[];
  footer?: Link[];
  footerCtaText?: string;
  footerCta?: Link;
  terms?: SanityFile;
  termsLabel?: string;
  privacy?: { title: string; slug: string } | null;
};
