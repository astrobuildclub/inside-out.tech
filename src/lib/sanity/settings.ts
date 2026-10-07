import { loadQuery } from "./load-query";
import { LAYOUT_QUERY, type Navigation } from "./queries";

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  logo?: string;
  companyName?: string;
  entityType: "Person" | "Organization" | "LocalBusiness";
  email?: string;
  telephone?: string;
  address?: { street?: string; postalCode?: string; city?: string; country?: string };
  kvk?: string;
  vat?: string;
  sameAs?: string[];
  titleTemplate?: string;
  description?: string;
  shareImage?: { alt?: string; asset?: { _ref: string } };
  noindex?: boolean;
  llmsIntro?: string;
  allowAiTraining?: boolean;
}

/** Site-instellingen + navigatie in één request; de layout haalt dit per pagina op. */
export async function getLayoutData() {
  const { data } = await loadQuery<{ settings: SiteSettings | null; navigation: Navigation | null }>({ query: LAYOUT_QUERY });
  if (!data.settings) throw new Error("Site-instellingen ontbreken: maak het document aan in de Studio.");
  return { settings: data.settings, navigation: data.navigation ?? {} };
}

export async function getSettings() {
  return (await getLayoutData()).settings;
}
