# inside-out.tech

> Nieuwe website voor Inside Out Technologies (Utrecht): prefab Plug & Play energiesystemen, projecten, nieuws en contact. Migratie van Webflow naar Astro + Sanity.

| | |
|---|---|
| **Klant** | Inside Out Technologies B.V. (TODO contactpersoon) |
| **Bedrijf** | All This |
| **Status** | WIP: migratie vanaf Webflow (`insideout-test.webflow`) |
| **SLA** | TODO |
| **Live** | https://inside-out.tech (nog Webflow) |
| **Netlify** | team All This, site TODO |
| **CMS** | Sanity project `cf1ukp64`, dataset `production`, Studio op `/admin` |
| **Repo** | TODO: `github.com/astrobuildclub/inside-out.tech` (nog alleen lokaal) |
| **Notion** | TODO |

## Stack

- Astro 7.3 · Sanity 6.18 (Studio ingebouwd) · Node 22 (`.nvmrc`) · SSR (`output: 'server'`, Netlify-adapter)
- Styling: eigen CSS met cascade layers, Utopia-tokens (`utopia-core-scss`), OKLCH, light/dark via `light-dark()` · Font: Haffer SQ (OTF, lokaal)
- Animatie: geen GSAP; CSS + IntersectionObserver (fade-in), scroll-snap-carousel, CSS-marquee
- Consent: `vanilla-cookieconsent` v3 (Google Analytics en Google Ads pas na toestemming) · Formulier: Netlify Forms · Hosting: Netlify

## Lokaal starten

```bash
nvm use
npm install
cp .env.example .env   # vul de waarden in, zie tabel
npm run dev            # http://localhost:4321, Studio op /admin
```

Overige scripts: `npm run build`, `npm run preview`, `npm run check`, `npm run import:webflow` (eenmalig, zie hieronder).

### Environment-variabelen

| Naam | Waarvoor | Waar te vinden |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Sanity project (`cf1ukp64`) | sanity.io/manage |
| `PUBLIC_SANITY_DATASET` | Dataset (`production`) | sanity.io/manage |
| `SANITY_API_READ_TOKEN` | Drafts / Visual Editing (geheim, rol Viewer) | sanity.io/manage → API → Tokens |
| `SANITY_API_WRITE_TOKEN` | Alleen lokaal voor de Webflow-import (rol Editor), daarna intrekken | sanity.io/manage → API → Tokens |
| `PUBLIC_GA_ID` | Google Analytics 4, laadt pas na toestemming | Google Analytics |
| `PUBLIC_GOOGLE_ADS_ID` | Google Ads-tag, laadt pas na toestemming | Google Ads |

Waarden staan nooit in git. Productiewaarden: Netlify → Site configuration → Environment variables (let op deploy contexts).

## Structuur

```
schema/             Sanity-schema's: documents/, sections/ (page builder), objects/, singletons/
sanity.config.ts    Studio: structuur, singletons, Presentation tool
src/
  components/       Header, Footer, SiteMeta, kaarten, carousel
  components/sections/  Eén component per page-builder-sectie
  layouts/          BaseLayout
  lib/sanity/       load-query, queries (GROQ + types), image, routes, resolve, visual editing
  pages/            index, [slug] (pagina's), projecten/, plug-play/, nieuws/, sitemap/robots/llms
  styles/           tokens.scss, themes.css, base/layout/components
scripts/            import-webflow.mjs (eenmalige migratie)
public/__forms.html Formulierdefinitie voor Netlify Forms (de site zelf is SSR)
_webflow-export/    Originele Webflow-export (niet in git)
```

## Content en CMS

- **Pagina's** (page builder): home, over ons, contact, nieuws, projecten, installatiepartners (`/installateur`), bouwpartners (`/vastgoedbeheer`), plug & play, op maat, privacy. Secties: hero, paginakop, tekst (+ beeld), kaarten, voordelen, checklist, call-to-action, collectie, logo's, stappen, contactformulier.
- **Collecties:** projecten (`/projecten/<slug>`), modules (`/modules/<slug>`), nieuws (`/nieuws/<slug>`), team, opdrachtgevers & partners, stappen (RGS-fasen en stappenplan installatiepartners).
- **Site-instellingen** en **Navigatie** als singletons.
- Site-instellingen, SEO-velden en Visual Editing volgens `~/Code/_standards/SANITY.md`: ja.

### Webflow-import

`scripts/import-webflow.mjs` zet de CSV's uit `_webflow-export/csv/` en de teksten van de vaste pagina's om naar Sanity-documenten. Beelden komen van de Webflow-CDN en uit `_webflow-export/images/`, de homevideo uit `_webflow-export/videos/`.

```bash
npm run import:webflow -- --dry-run   # controleren, schrijft scripts/.cache/dry-run.json
npm run import:webflow                # echt importeren (SANITY_API_WRITE_TOKEN in .env)
```

Herhaalbaar (vaste `_id`'s, `createOrReplace`), maar overschrijft dan wijzigingen uit de Studio. Webflow-drafts worden Sanity-drafts.

## Privacy, toegankelijkheid en SEO

- Consent: Google Analytics (statistiek) en Google Ads (marketing) laden pas na toestemming. Geen reCAPTCHA meer: het formulier gebruikt een honeypot.
- WCAG 2.2 AA: skip-link, menu in `<dialog>`, pauzeknop op de homevideo, `prefers-reduced-motion` voor video, marquee, carousel en fade-ins, doelgrootte ≥ 44 px.
- SEO en AI readiness volgens `~/Code/_standards/SEO.md`: SiteMeta, JSON-LD (Organization, WebSite, Article, BreadcrumbList), `/sitemap.xml`, `/robots.txt`, `/llms.txt`.

## Deploy

- `main` → productie (Netlify) · pull requests → deploy preview
- Werkwijze: branch → PR → preview checken → merge

## Bekende issues en afspraken

- Zie `AGENTS.md` → Projectspecifiek, en de open punten in `CHANGELOG.md`.

---

Eigenaar: All This · Wat er gedaan is: zie [`CHANGELOG.md`](CHANGELOG.md) · Werkafspraken voor ontwikkelaars en AI-agents: [`AGENTS.md`](AGENTS.md)
