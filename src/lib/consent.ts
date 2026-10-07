// Cookie-consent (vanilla-cookieconsent v3). Vervangt Finsweet Cookie Consent uit Webflow.
// Google Analytics (GA4) en Google Ads laden pas na toestemming voor hun categorie.
// ID's staan in .env (PUBLIC_, want ze komen toch in de browser); leeg = niets laden.
import * as CookieConsent from "vanilla-cookieconsent";

const GA_ID = import.meta.env.PUBLIC_GA_ID as string | undefined;
const ADS_ID = import.meta.env.PUBLIC_GOOGLE_ADS_ID as string | undefined;

type Gtag = (...args: unknown[]) => void;
const w = window as unknown as { dataLayer: unknown[]; gtag?: Gtag };

function gtag(...args: unknown[]) {
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(args);
}

function loadGtag(id: string) {
  if (!document.getElementById("gtag-js")) {
    const s = document.createElement("script");
    s.id = "gtag-js";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.append(s);
    w.gtag = gtag;
    gtag("js", new Date());
  }
  gtag("config", id, { anonymize_ip: true });
}

const loaded = new Set<string>();
function applyConsent() {
  if (GA_ID && !loaded.has(GA_ID) && CookieConsent.acceptedCategory("analytics")) {
    loaded.add(GA_ID);
    loadGtag(GA_ID);
  }
  if (ADS_ID && !loaded.has(ADS_ID) && CookieConsent.acceptedCategory("marketing")) {
    loaded.add(ADS_ID);
    loadGtag(ADS_ID);
  }
}

/** Paginaweergave na een ClientRouter-navigatie doorgeven (alleen als GA al geladen is). */
export function trackPageView() {
  if (GA_ID && loaded.has(GA_ID)) gtag("event", "page_view", { page_location: location.href, page_title: document.title });
}

let started = false;

export function initConsent(privacyHref = "/privacy") {
  if (started) return;
  started = true;

  CookieConsent.run({
    guiOptions: {
      consentModal: { layout: "box", position: "bottom left", equalWeightButtons: true },
      preferencesModal: { layout: "box", equalWeightButtons: true },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: { autoClear: { cookies: [{ name: /^_ga/ }, { name: "_gid" }] } },
      marketing: { autoClear: { cookies: [{ name: /^_gcl/ }] } },
    },
    onConsent: applyConsent,
    onChange: ({ changedCategories }) => {
      // Al geladen scripts kun je niet netjes uitzetten: na intrekken herladen.
      if (changedCategories.some((c) => !CookieConsent.acceptedCategory(c))) location.reload();
      else applyConsent();
    },
    language: {
      default: "nl",
      translations: {
        nl: {
          consentModal: {
            title: "Cookies",
            description: `We gebruiken noodzakelijke cookies om de site te laten werken. Met jouw toestemming meten we ook het bezoek (Google Analytics) en de resultaten van advertenties (Google Ads). <a href="${privacyHref}">Privacyverklaring</a>`,
            acceptAllBtn: "Alles toestaan",
            acceptNecessaryBtn: "Alleen noodzakelijk",
            showPreferencesBtn: "Instellingen",
          },
          preferencesModal: {
            title: "Cookie-instellingen",
            acceptAllBtn: "Alles toestaan",
            acceptNecessaryBtn: "Alleen noodzakelijk",
            savePreferencesBtn: "Keuze opslaan",
            closeIconLabel: "Sluiten",
            sections: [
              {
                description: `Kies welke cookies je toestaat. Je kunt je keuze altijd aanpassen via 'Cookie-instellingen' onderaan de pagina. Meer in onze <a href="${privacyHref}">privacyverklaring</a>.`,
              },
              { title: "Noodzakelijk", description: "Nodig om je keuze en het kleurthema te onthouden.", linkedCategory: "necessary" },
              { title: "Statistiek", description: "Google Analytics: hoe bezoekers de site gebruiken. IP-adressen worden geanonimiseerd.", linkedCategory: "analytics" },
              { title: "Marketing", description: "Google Ads: meten welke advertenties tot contact leiden.", linkedCategory: "marketing" },
            ],
          },
        },
      },
    },
  });
}

export const showPreferences = () => CookieConsent.showPreferences();
