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

### Gewijzigd
- Tweede vergelijkingsronde met live (screenshots in `_webflow-export/screens/`): kopfoto min. 480px op desktop; standaard witte achtergrond (intro en voordelen Installatiepartners/Bouwpartners op wit); inpasbaarheidsbeeld groot op groen; stappenplan zonder eigen titel in één witte kaart; Over ons met "Wat we leveren" en "Het team" in één tekstkolom, teamfoto's tot de rand, logo's in omlijnde vakken en eigen CTA-tekst; moduledetail zonder kruimelpad met blauwe specificatiekaart; projectdetail met smal feitenblok, grotere galerij en CTA "Benieuwd wat de modules…"; projectkaarten met wit tekstvlak; contactgegevens en kaart in één lemon-kaart; smallere footer.
- Fade-in robuuster: content wordt pas verborgen als het script draait, en het script start ook als het na het eerste `astro:page-load` laadt.
- `npm run import:webflow -- --only=page` schrijft alleen de opgegeven documenttypen.
- Dark mode voorlopig uit: de site is altijd licht (`color-scheme: light`). De tokens houden hun `light-dark()`-waarden, zodat dark mode later terug kan.
- Containerbreedte max. 1344px (`--container-width`) voor header, footer en secties.
- Witruimte: alleen twee secties met dezelfde achtergrond na elkaar delen hun ruimte (de content plakte tegen de projectkop).
- Uit de vergelijking met live: modulekaart blauw bij hover, feitenblok projecten breder met "Adres" en blauwe pill, kruimelpad zonder onderstreping, actief menu-item als pill, footer met logo bovenaan, CTA-foto op lichtblauw vlak (op wit), grotere titel in de lemon-CTA, neutrale overlay over kopfoto's, "contact" en "*Samen* … *duurzaam*" zoals live.
- Live (inside-out.tech) is de bron: gepubliceerde content gelijk aan live (stappenplan installatiepartners, RGS-fase 3, io Charlie/Echo gepubliceerd, nieuwsbronnen en -datums, volgorde projecten en team, paginatitels). Waar de testexport afwijkt staat die versie als Sanity-draft.
- Layout gelijkgetrokken met live: paginakoppen (stacked/split, wit/licht/groen), kleinere typografie, gecentreerde lemon-intro en -CTA, projectkaarten zonder vlak (2 kolommen), modules 3 kolommen, team 4 kolommen met e-mail, nieuws als brede kaarten met bron, voordelen in 2 kolommen, stappen als witte kaarten, moduledetail met beeld links, feitenblok projecten als groene kaart, contactgegevens in lemon-kaart.
- Modules staan op `/modules/<slug>` (zelfde pad als Webflow).
- Nieuwe schemavelden: paginakop `layout`, tekst `align`, checklist `text`, stappen `imagePosition`; `*woord*` in CTA-titels geeft de lemon-streep.
- Webflow-content geïmporteerd in Sanity (`cf1ukp64/production`): 63 documenten, beelden, homevideo en voorwaarden-PDF.
- Sectie-attribuut heet nu `data-tone` (was `data-theme`, botste met de licht/donker-keuze op `<html>`); lichte tones zetten kleurschema en rollen expliciet terug, zodat een wit vlak in een groene sectie niet donker wordt.
- Geen fade-in meer op hero en paginakop (sneller zichtbaar boven de vouw).

### Opgelost
- Projectpagina gaf een fout bij verwijzingen naar ongepubliceerde modules (io Charlie/Echo): die worden nu overgeslagen.
- Logo en paginakop-stijlen bereikten de onderliggende componenten niet (scoped CSS); kopfoto werd volledig afgedekt door de overlay.

### Opgelost (t.o.v. Webflow)
- Social links in het menu wezen naar google.com; telefoonlink miste een cijfer; e-maillink op contact was `#`.
- Knop "Plan Plug & Play maatwerktraject" op Op maat was geen link; "Get Started" op modules wees naar `#` (nu factsheet-download als die er is).
- Lorem-ipsum-kaart op Over ons en placeholder-richtext in de accordions verwijderd.
- Copyrightjaar staat niet meer vast op 2025.

### Onderhoud
- `npm audit` meldt kwetsbaarheden in transitive dependencies van `sanity`/`@astrojs/netlify` (o.a. sharp, js-yaml, smol-toml). Meenemen in de update-ronde volgens `_standards/UPDATES.md`.

### Open punten
- Privacyverklaring: tekst nodig van de klant (pagina staat er met noindex).
- Alt-teksten bij CMS-beelden (projecten, nieuws, modules) ontbreken in Webflow: aanvullen in de Studio.
- Live-URL's van Webflow controleren voor redirects (Webflow-CMS-paden kunnen afwijken).
- Fonts naar woff2, video comprimeren (nu 14 + 20 MB).
- Netlify-site, GitHub-repo `astrobuildclub/inside-out.tech`, CORS-origins en read-token nog inrichten.
