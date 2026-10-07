# AGENTS.md: inside-out.tech

Instructies voor AI-agents (Claude Code, Cursor, Codex) en ontwikkelaars die aan dit project werken.
Lees eerst `README.md` voor context en `CHANGELOG.md` voor recente wijzigingen.

## Project
- Klant: Inside Out Technologies B.V. · Bedrijf: All This · SLA: TODO
- Stack: Astro 7.3, Sanity 6.18 (Studio op `/admin`), Node 22 (zie `.nvmrc`)

## Werkwijze
- Werk nooit direct op `main`. Branch → PR → deploy preview → merge.
- Branchnamen: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- Commit nooit `.env`-bestanden of tokens. Nieuwe variabelen: naam toevoegen aan `.env.example` en de README-tabel.
- Variabelen met `PUBLIC_` komen in de browser terecht: nooit voor tokens.

## Documentatie bijhouden (verplicht)
- Elke wijziging die je commit: voeg een regel toe onder `## [Unreleased]` in `CHANGELOG.md`.
- Bij een merge naar `main`: zet `[Unreleased]` om naar een datumkop.
- Verandert setup, env, stack of deploy? Werk `README.md` bij.

## Conventies
- Moderne CSS: custom properties, OKLCH-kleuren, logical properties, container queries waar zinvol.
- Toegankelijkheid: WCAG 2.2 AA. Semantische HTML, focus-states, `prefers-reduced-motion` respecteren.
- AVG: geen tracking of third-party embeds zonder consent.
- Taal van UI-teksten en code-comments: Nederlands.
- Sanity: content altijd via `loadQuery()`. Site-instellingen, SEO-velden en Visual Editing volgens `~/Code/_standards/SANITY.md`.
- Afbeeldingen: profiel **Website** (q75, max 2560) volgens `~/Code/_standards/IMAGES.md`, via `SanityImg.astro` / `imageProps()`.
- SEO en AI readiness (meta, JSON-LD, sitemap, robots, `llms.txt`) volgens `~/Code/_standards/SEO.md`.

## Projectspecifiek
- **Nieuw sectietype:** schema in `schema/sections/` → registreren in `schema/sections/index.ts` → type in `src/lib/sanity/queries.ts` (`Section`) → component in `src/components/sections/` → map in `SectionRenderer.astro`. Extra data (collecties, logo's) haal je op in de `SECTIONS`-projectie in `queries.ts`, niet in het component.
- **URL's** per documenttype staan op één plek: `src/lib/sanity/routes.ts` (gebruikt door links, sitemap, llms.txt en `resolve.ts`). Alle paden zijn gelijk aan Webflow: `/vastgoedbeheer` (Bouwpartners), `/installateur` (Installatiepartners), `/modules/<slug>`, `/projecten/<slug>`, `/nieuws/<slug>`.
- **Kleurthema's:** secties zetten `data-theme` (`white`, `light`, `green`, `lemon`, `dark`), zie `src/styles/themes.css`. Merkkleuren als tokens in `tokens.scss`; geen hex-waarden in componenten.
- **Stega:** strings die in logica, classes of URL's belanden altijd door `stegaClean()` (zie `LinkButton`, `links.ts`).
- **Scripts** initialiseren op `astro:page-load` vanwege de `<ClientRouter />`.
- **Formulier:** Netlify Forms. Velden in `src/components/sections/Contact.astro` en `public/__forms.html` gelijk houden.
- **Consent:** nieuwe tracking alleen via `src/lib/consent.ts` in een categorie (`analytics` / `marketing`).
- **Bron van content is live (inside-out.tech), niet de testexport.** "Draft" in de Webflow-CSV betekent: heeft niet-gepubliceerde wijzigingen. Gepubliceerd = live; afwijkende export-versies staan als Sanity-draft (zie `LIVE` in `scripts/import-webflow.mjs`).
- **Stappen:** nummer 0 = zonder nummer (Initiatieffase); anders toont de site "1. Titel".
- **Niet gemigreerd:** Webflow-collectie Doelgroepen (nergens meer gebruikt), lege detailtemplates, `cookie.html`, verborgen nav-items "Resources/Docs".
- **Fonts:** Haffer SQ is gelicenseerd en staat **niet** in git (de repo is openbaar). `public/fonts/` is gitignored; `scripts/fetch-fonts.mjs` (npm `prebuild`) haalt de bestanden op via `FONT_URLS` (Netlify env, bestanden als Sanity-assets). Nooit fonts committen. TODO: woff2.
- **Repo is public** (Netlify gratis team bouwt geen private org-repo's). Dus: geen tokens, klantdocumenten of gelicenseerde bestanden committen.
