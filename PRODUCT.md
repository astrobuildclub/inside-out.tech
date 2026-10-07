# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Drie gelijkwaardige doelgroepen, elk met een eigen route op de site:

- **Vastgoed** (woningcorporaties, VvE's, vastgoedbeheerders; pagina "Bouwpartners", `/vastgoedbeheer`): moeten bestaand vastgoed verduurzamen, vaak hoogbouw en gestapelde woningbouw in bewoonde staat, en zoeken voorspelbare kosten, planning en prestaties.
- **Bouwpartners** (aannemers, bouwteams; `/op-maat`): zoeken een oplossing die inpasbaar is in planvorming, tenders, RGS-trajecten en BIM.
- **Installatiepartners** (installateurs; `/installateur`): zoeken prefab modules die snel te monteren zijn, met minder faalkosten en een voorspelbaar proces.

De site is Nederlandstalig en zakelijk (B2B). Bezoekers oriënteren zich voor een project of tender, of controleren Inside Out als partner.

## Product Purpose

inside-out.tech is de website van Inside Out Technologies B.V. (Utrecht). Inside Out ontwikkelt prefab Plug & Play energiesystemen voor verwarming, warm water, energieopslag en duurzame opwekking. De site legt de aanpak en de modules uit en laat projecten zien.

Succes is tweeledig en weegt even zwaar:

1. **Leads**: adviesgesprekken en afspraken ("Gratis adviesgesprek", "Maak een afspraak", contactformulier).
2. **Geloofwaardigheid**: projecten, nieuws en partners als bewijs voor partners en tenders.

## Positioning

Inside Out verplaatst installaties vanuit het hart van de woning naar de gevel of het dak. De systemen worden prefab geleverd en direct gemonteerd. Daardoor ontstaat binnen meer ruimte, blijft overlast minimaal en is renoveren in bewoonde staat mogelijk, snel en voorspelbaar. Inside Out combineert bouwtechniek, installatietechniek en energietechniek. De ambitie: hoogbouw energiepositief maken.

Er zijn twee leveringsvormen:

- **Plug & Play**: standaardoplossingen voor gebouwen die aan de opgestelde kwaliteitseisen voldoen.
- **Plug & Play op maat**: een geïntegreerde totaaloplossing op basis van dezelfde modules, met BIM-coördinatie van planvorming tot prestatiemonitoring.

## Operating Context

- Projecten: hoogbouw, gestapelde woningbouw, utiliteitsgebouwen en kantoorpanden. Renovatie vaak in bewoonde staat.
- Bezoekers gebruiken de site naast tenderdocumenten, RGS-trajecten (bouwteams) en BIM-coördinatie.
- Contact via telefoon (030-3403908), info@inside-out.tech, het contactformulier (Netlify Forms) en het kantoor aan de Tennesseedreef 15B in Utrecht.

## Capabilities and Constraints

- **Modules** (vaste namen, NAVO-alfabet, schrijfwijze "io Alpha"):
  - io Alpha: zonnepanelenframe voor gevel of dak
  - io Bravo: compleet verwarmingssysteem met warmtepomp, warm tapwater, opslag en sturing
  - io Charlie: radiator, decentrale ventilatie en zonnepaneel in één unit
  - io Delta: slimme gevel die isoleert, verwarmt, ventileert en opwekt
  - io Echo: isoleert, verwarmt, ventileert en wekt duurzame energie op
  - io Foxtrot: monitoring en aansturing
- **Terminologie:** "Plug & Play", "Plug & Play op maat", "Bouwpartners" (route vastgoed), "Installatiepartners".
- **URL's** zijn gelijk aan de Webflow-site en blijven zo (zie `src/lib/sanity/routes.ts`).
- **Content** komt uit Sanity. De bron is de live site inside-out.tech, niet de Webflow-testexport.
- **Techniek:** Astro + Sanity, Netlify. De repo is public, dus geen gelicenseerde fonts, tokens of klantdocumenten in git.
- **Privacy:** tracking (Google Analytics, Google Ads) alleen na toestemming via de cookiebanner (AVG).
- **Taal:** UI-teksten en content in het Nederlands.

## Brand Commitments

- De huisstijl ligt vast. Kleuren, het lettertype Haffer SQ, het logo en de handgetekende lemon-markeerstreep blijven. Design polish verfijnt binnen deze huisstijl en vervangt haar niet.
- Identity en website zijn van All This.

## Evidence on Hand

- **Projecten** (Sanity, `/projecten`):
  - Henriëttedreef, Utrecht: de eerste gerenoveerde energieleverende flat van Europa
  - Noordertogtflat, Alkmaar (Woonwaard)
  - Westgate II (hoofdkantoor PwC, Zuidas)
  - Albert Meijnsstraat, Wormerveer (80 woningen)
  - Lumifield
  - De Werf, Almere
  - De Wilde Metaal, Bilthoven
- **Nieuws** (`/nieuws`):
  - bezoek van de Koning en de minister aan Henriëttedreef
  - interview door Techniek Nederland met founders Paul en Joris
  - Woonwaard kiest voor Inside Out
  - ARV-project (4 miljoen euro Europese subsidie, Green Deal)
- **Team** met foto's op `/over-ons`. Logo's van opdrachtgevers en partners staan in de logo-marquee.
- **Beeld:** projectfoto's en een hero-video in Sanity. Veel beelden hebben nog geen alt-tekst.
- **Ontbreekt, en mag niet verzonnen worden:** klantquotes en testimonials, prijzen, en kwantitatieve prestatieclaims die niet in de bestaande content staan.

## Product Principles

1. **Elke doelgroep een eigen, gelijkwaardige route.** Vastgoed, bouw en installatie vinden direct hun eigen ingang. Geen enkele route is ondergeschikt.
2. **Bewijs boven beloftes.** Echte projecten, partners en nieuws dragen de claims. De woorden "snel", "voorspelbaar" en "minimale overlast" moeten onderbouwd worden.
3. **Altijd een volgende stap.** Een adviesgesprek of afspraak is vanaf elke pagina bereikbaar, zonder te duwen.
4. **Technisch, maar begrijpelijk.** Systemen en modules worden concreet uitgelegd voor beslissers die geen installateur zijn.

## Accessibility & Inclusion

WCAG 2.2 AA (projectafspraak in `AGENTS.md`). Semantische HTML, zichtbare focus en respect voor `prefers-reduced-motion`.
