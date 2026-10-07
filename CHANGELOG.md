# Changelog

Alle noemenswaardige wijzigingen aan dit project. Nieuwste bovenaan.
Format gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/).

Categorieën: **Toegevoegd**, **Gewijzigd**, **Opgelost**, **Verwijderd**, **Beveiliging**, **Onderhoud**.

## [Unreleased]

### Toegevoegd
- Astro 7 + Sanity 6-project (SSR op Netlify) als vervanger van de Webflow-site, met Studio op `/admin` (project `cf1ukp64`).
- Sanity-schema: page builder (11 secties), projecten, modules, nieuws, team, opdrachtgevers & partners, stappen, site-instellingen en navigatie.
- Visual Editing via de Presentation tool volgens `_standards/SANITY.md`.
- Design-tokens op basis van het Webflow-design (OKLCH, Utopia, Haffer SQ), sectiethema's en light/dark mode.
- Header met toegankelijk menu (`<dialog>`), footer, detailpagina's voor projecten, modules en nieuws.
- SEO: SiteMeta, JSON-LD, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, 404.
- Contactformulier via Netlify Forms met honeypot (vervangt Webflow Forms + reCAPTCHA).
- Cookie-consent (`vanilla-cookieconsent`) met GA4 en Google Ads pas na toestemming (vervangt Finsweet).
- Importscript `scripts/import-webflow.mjs` voor CSV-content, vaste pagina's, beelden, video en PDF.

### Opgelost (t.o.v. Webflow)
- Social links in het menu wezen naar google.com; telefoonlink miste een cijfer; e-maillink op contact was `#`.
- Knop "Plan Plug & Play maatwerktraject" op Op maat was geen link; "Get Started" op modules wees naar `#` (nu factsheet-download als die er is).
- Lorem-ipsum-kaart op Over ons en placeholder-richtext in de accordions verwijderd.
- Copyrightjaar staat niet meer vast op 2025.

### Onderhoud
- `npm audit` meldt kwetsbaarheden in transitive dependencies van `sanity`/`@astrojs/netlify` (o.a. sharp, js-yaml, smol-toml). Meenemen in de update-ronde volgens `_standards/UPDATES.md`.

### Open punten
- Privacyverklaring: tekst nodig van de klant (pagina staat er met noindex).
- Stappenplan installatiepartners staat in Webflow volledig op Draft: publiceren of sectie weghalen.
- Alt-teksten bij CMS-beelden (projecten, nieuws, modules) ontbreken in Webflow: aanvullen in de Studio.
- Live-URL's van Webflow controleren voor redirects (Webflow-CMS-paden kunnen afwijken).
- Fonts naar woff2, video comprimeren (nu 14 + 20 MB).
- Netlify-site, GitHub-repo `astrobuildclub/inside-out.tech`, CORS-origins en read-token nog inrichten.
