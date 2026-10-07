#!/usr/bin/env node
/**
 * Eenmalige import van de Webflow-site naar Sanity.
 *
 *   npm run import:webflow -- --dry-run   # niets uploaden, resultaat in scripts/.cache/dry-run.json
 *   npm run import:webflow                # echt importeren (SANITY_API_WRITE_TOKEN nodig, rol Editor)
 *
 * Bronnen: _webflow-export/csv/*.csv (CMS) en _webflow-export/*.html + images/ (vaste pagina's).
 * Herhaalbaar: vaste _id's (`project-<slug>`) + createOrReplace. Beelden worden één keer geüpload
 * (cache op bron-URL in scripts/.cache/assets.json). Webflow-drafts worden Sanity-drafts.
 * Na afloop: write-token intrekken in sanity.io/manage.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";
import { parse } from "csv-parse/sync";
import { createClient } from "@sanity/client";
import { htmlToBlocks } from "@portabletext/block-tools";
import { compileSchema, defineSchema } from "@portabletext/schema";
import { JSDOM } from "jsdom";

const ROOT = new URL("..", import.meta.url).pathname;
const EXPORT = join(ROOT, "_webflow-export");
const CACHE = join(ROOT, "scripts/.cache");
const DRY = process.argv.includes("--dry-run");

const { PUBLIC_SANITY_PROJECT_ID: projectId, PUBLIC_SANITY_DATASET: dataset = "production", SANITY_API_WRITE_TOKEN: token } = process.env;
if (!DRY && (!projectId || !token)) {
  console.error("PUBLIC_SANITY_PROJECT_ID en SANITY_API_WRITE_TOKEN zijn nodig (of gebruik --dry-run).");
  process.exit(1);
}
const client = DRY ? null : createClient({ projectId, dataset, apiVersion: "2025-01-01", token, useCdn: false });

// ── Hulpfuncties ──────────────────────────────────────────────────────────────

const key = () => randomUUID().replaceAll("-", "").slice(0, 12);
const withKeys = (arr) => arr.map((item) => ({ _key: key(), ...item }));
const date = (s) => (s ? new Date(s.replace(/ \(.*\)$/, "")).toISOString() : undefined);
const bool = (s) => s === "true";
const list = (s) => (s ? s.split(";").map((x) => x.trim()).filter(Boolean) : []);
const clean = (obj) => JSON.parse(JSON.stringify(obj)); // undefined-velden weg

async function readCsv(name) {
  const { readdir } = await import("node:fs/promises");
  const file = (await readdir(join(EXPORT, "csv"))).find((f) => f.includes(` - ${name} - `));
  if (!file) throw new Error(`CSV niet gevonden: ${name}`);
  return parse(await readFile(join(EXPORT, "csv", file), "utf8"), { columns: true, skip_empty_lines: true });
}

// HTML → Portable Text, volgens het richText-schema (schema/objects/richText.ts)
const ptSchema = compileSchema(
  defineSchema({
    styles: [{ name: "normal" }, { name: "h2" }, { name: "h3" }, { name: "h4" }, { name: "lead" }],
    lists: [{ name: "bullet" }, { name: "number" }],
    decorators: [{ name: "strong" }, { name: "em" }, { name: "sub" }, { name: "sup" }],
    annotations: [{ name: "link", fields: [{ name: "href", type: "string" }] }],
  }),
);
const ZWJ = /[\u200d\u2028]/g;
function pt(html) {
  if (!html?.trim()) return undefined;
  // Webflow: h5/h6 bestaan niet in ons schema → h4. Lege alinea's (alleen \u200d) weg.
  const normalized = html.replace(/<(\/?)h[56]\b/g, "<$1h4").replace(/ id=""/g, "");
  const blocks = htmlToBlocks(normalized, ptSchema, { parseHtml: (h) => new JSDOM(h).window.document })
    .map((b) => (b.children ? { ...b, children: b.children.map((c) => (c.text ? { ...c, text: c.text.replace(ZWJ, " ").replace(/\s+$/, "") } : c)) } : b))
    .filter((b) => !b.children || b.children.some((c) => c.text?.trim()));
  return blocks.length ? blocks : undefined;
}

// ── Assets ────────────────────────────────────────────────────────────────────

let assetCache = {};
if (existsSync(join(CACHE, "assets.json"))) assetCache = JSON.parse(await readFile(join(CACHE, "assets.json"), "utf8"));
const saveCache = () => writeFile(join(CACHE, "assets.json"), JSON.stringify(assetCache, null, 2));

/** Upload een beeld/bestand (URL of pad in de export) en geef de asset-id terug. */
async function asset(source, kind = "image") {
  if (!source) return undefined;
  if (assetCache[source]) return assetCache[source];
  const isUrl = /^https?:\/\//.test(source);
  const filename = decodeURIComponent(basename(new URL(source, "file:///").pathname)).replace(/^[0-9a-f]{24}_/, "");
  if (DRY) return (assetCache[source] = `${kind}-dry-${filename}`);

  const buffer = isUrl ? Buffer.from(await (await fetch(source)).arrayBuffer()) : await readFile(join(EXPORT, source));
  const doc = await client.assets.upload(kind, buffer, { filename, source: { name: "webflow", id: source, url: isUrl ? source : undefined } });
  assetCache[source] = doc._id;
  await saveCache();
  console.log(`  ↑ ${filename}`);
  return doc._id;
}

const image = async (source, extra = {}) => {
  const id = await asset(source);
  return id ? { _type: "image", asset: { _type: "reference", _ref: id }, ...extra } : undefined;
};
const file = async (source) => {
  const id = await asset(source, "file");
  return id ? { _type: "file", asset: { _type: "reference", _ref: id } } : undefined;
};
const media = async (urls) => {
  const items = [];
  for (const url of list(urls)) items.push({ _key: key(), _type: "mediaItem", asset: { _type: "reference", _ref: await asset(url) } });
  return items.length ? items : undefined;
};

// Referentie; naar een Webflow-draft zwak, zodat publiceren niet faalt (wordt sterk zodra het doel gepubliceerd is).
const ref = (id, type, drafts) =>
  drafts.has(id) ? { _type: "reference", _ref: id, _weak: true, _strengthenOnPublish: { type } } : { _type: "reference", _ref: id };

// ── CMS-collecties ────────────────────────────────────────────────────────────

const docs = [];
const draftIds = new Set();
const add = (doc, isDraft) => docs.push(clean({ ...doc, _id: isDraft ? `drafts.${doc._id}` : doc._id }));

async function importCollections() {
  const modules = await readCsv("Modules");
  const projects = await readCsv("Projecten");
  const news = await readCsv("Nieuws");
  const people = await readCsv("People");
  const logos = await readCsv("Clients & Partners");
  const rgs = await readCsv("RGS Fasens");
  const stappen = await readCsv("Stappenplan installatiepartners");
  // Doelgroepen wordt nergens meer gebruikt: niet geïmporteerd (zie AGENTS.md).

  for (const r of modules) if (bool(r.Draft)) draftIds.add(`module-${r.Slug}`);
  for (const r of news) if (bool(r.Draft)) draftIds.add(`news-${r.Slug}`);

  console.log("Modules");
  for (const [i, r] of modules.entries()) {
    add(
      {
        _id: `module-${r.Slug}`,
        _type: "module",
        title: r.Title,
        slug: { _type: "slug", current: r.Slug },
        type: r.Type,
        image: await image(r.Afbeelding),
        excerpt: r.Excerpt,
        intro: r.Intro,
        content: pt(r.Content),
        specs: pt(r.Specificaties),
        factsheet: await file(r.Factsheet),
        media: await media(r.Media),
        orderRank: i,
      },
      bool(r.Draft),
    );
  }

  console.log("Projecten");
  for (const [i, r] of projects.entries()) {
    add(
      {
        _id: `project-${r.Slug}`,
        _type: "project",
        title: r.Name,
        slug: { _type: "slug", current: r.Slug },
        image: await image(r["Featured Image"]),
        excerpt: r.Excerpt,
        content: pt(r.Content),
        address: r.Adres,
        period: r.Looptijd.replace(/\s*[—-]\s*/, "–"),
        client: r.Opdrachtgever,
        modules: withKeys(list(r.Modules).map((s) => ref(`module-${s}`, "module", draftIds))),
        media: await media(r.Media),
        orderRank: i,
      },
      bool(r.Draft),
    );
  }

  console.log("Nieuws");
  for (const r of news) {
    add(
      {
        _id: `news-${r.Slug}`,
        _type: "news",
        title: r.Name,
        slug: { _type: "slug", current: r.Slug },
        publishedAt: date(r["Published On"]) ?? date(r["Created On"]),
        image: await image(r.Featured),
        intro: r.Intro?.trim(),
        linkUrl: r["Link URL"],
        linkLabel: r["Link Label"],
        content: pt(r.Content),
        media: await media(r.Media),
        related: withKeys(list(r["Related news"]).map((s) => ref(`news-${s}`, "news", draftIds))),
      },
      bool(r.Draft),
    );
  }

  console.log("Team");
  for (const [i, r] of people.entries()) {
    add(
      {
        _id: `person-${r.Slug}`,
        _type: "person",
        name: r.Name,
        role: r.Role,
        image: await image(r.Image),
        email: r["E-mail"]?.toLowerCase(),
        linkedin: r.LinkedIn,
        orderRank: i,
      },
      bool(r.Draft),
    );
  }

  console.log("Opdrachtgevers & partners");
  for (const r of logos) {
    add(
      {
        _id: `clientPartner-${r.Slug}`,
        _type: "clientPartner",
        title: r.Title,
        kind: r.Type === "Partner" ? "partner" : "client",
        logo: await image(r.Logo),
      },
      bool(r.Draft),
    );
  }

  console.log("Stappen");
  // Nummer uit de titel ("2. Planuitwerking" → 2); zonder nummer (Initiatieffase) → 0.
  const step = (r, listName) => {
    const m = r.Title.match(/^(\d+)\.\s*(.*)$/);
    return {
      _id: `step-${listName}-${r.Slug}`,
      _type: "step",
      list: listName,
      number: m ? Number(m[1]) : 0,
      title: (m ? m[2] : r.Title).trim(),
      description: pt(r.Description),
    };
  };
  for (const r of rgs) add(step(r, "rgs"), bool(r.Draft) || bool(r.Hide));
  for (const r of stappen) add(step(r, "installatiepartners"), bool(r.Draft) || bool(r.Hide));
}

// ── Vaste pagina's (teksten uit de Webflow-HTML) ──────────────────────────────

const pageRef = (slug) => ({ _type: "reference", _ref: `page-${slug}` });
const link = (label, slug, style) => clean({ _key: key(), _type: "link", label, internal: slug ? pageRef(slug) : undefined, style });
const extLink = (label, href, style) => ({ _key: key(), _type: "link", label, href, style });
const section = (type, fields) => clean({ _key: key(), _type: type, ...fields });
const seo = (description) => ({ _type: "seo", description });

const CTA_ADVIES = (title) =>
  section("cta", {
    title,
    text: "Of je nu advies nodig hebt over het verduurzamen of een specifieke vraag over een van onze producten of diensten. Ons team staat voor je klaar.",
    link: link("Plan gratis adviesgesprek", "contact"),
    theme: "white",
  });

async function ctaDuurzaam() {
  return section("cta", {
    title: "Samen gaan we voor duurzaam.",
    text: "Weten hoe onze Plug & Play modules jou kunnen helpen om sneller, voorspelbaarder en efficiënter te verduurzamen?",
    link: link("Maak een afspraak", "contact"),
    image: await image("images/pauldas.png", { alt: "Paul Das van Inside Out" }),
    theme: "light",
  });
}

async function importPages() {
  console.log("Pagina's");
  const page = (slug, title, sections, description, extra = {}) =>
    add({ _id: `page-${slug}`, _type: "page", title, slug: { _type: "slug", current: slug }, sections, seo: clean({ ...seo(description), ...extra }) });

  page(
    "home",
    "Home",
    [
      section("hero", {
        title: "Plug & Play *energiesystemen* voor *snelle verduurzaming* en toekomstbestendig vastgoed.",
        buttons: [link("Gratis adviesgesprek", "contact", "primary"), link("Over ons", "over-ons", "secondary")],
        videoMp4: await file("videos/Video-homepage-website_mp4.mp4"),
        videoWebm: await file("videos/Video-homepage-website_webm.webm"),
        image: await image("videos/Video-homepage-website_poster.0000000.jpg", { alt: "" }),
      }),
      section("textMedia", {
        title: "Wij ontwikkelen Plug & Play energiesystemen voor verwarming, warm water, energieopslag en duurzame opwekking.",
        body: pt(
          "<p>Door installaties naar de buitenschil te verplaatsen, ontstaat binnen meer ruimte en wordt overlast tot een minimum beperkt. De systemen worden prefab geleverd voor directe montage, zodat verduurzaming snel, voorspelbaar en efficiënt verloopt. Geschikt voor hoogbouw, gestapelde woningbouw, utiliteitsgebouwen en kantoorpanden.</p><p>Leverbaar als standaard Plug &amp; Play oplossing of op maat.</p>",
        ),
        buttons: [link("Voor bouwpartners", "vastgoedbeheer", "secondary"), link("Voor installatiepartners", "installateur", "secondary")],
        theme: "lemon",
      }),
      section("cardGrid", {
        theme: "white",
        cards: [
          {
            _key: key(),
            image: await image("images/Bravo-2new.avif", { alt: "Plug & Play-module io Bravo" }),
            title: "Plug & Play",
            bullets: [
              "Standaardoplossingen voor snelle verduurzaming.",
              "Direct inpasbaar in gebouwen die voldoen aan de opgestelde kwaliteitseisen.",
              "Eenvoudig te monteren, zonder verrassingen in planning of kosten.",
            ],
            link: link("Bekijk onze oplossingen", "plug-play", "secondary"),
          },
          {
            _key: key(),
            image: await image("images/InsideOut-Bravo-Climate-Module.png", { alt: "Inside Out Bravo-klimaatmodule" }),
            title: "Plug & Play op maat",
            bullets: [
              "Een resultaatgerichte, geïntegreerde totaaloplossing voor verduurzaming van vastgoed, gebouwd op onze Plug & Play modules.",
              "Afgestemd op gebouw, energieambitie, gebruiksprofiel én ontwerp.",
              "Coördinatie met BIM. Van planvorming tot uitvoering en prestatiemonitoring: efficiënt, beheersbaar en toekomstbestendig.",
            ],
            link: link("Bekijk onze oplossingen", "op-maat", "secondary"),
          },
        ],
      }),
      section("checklist", {
        title: "Waarom kiezen voor ons?",
        items: [
          "Geschikt voor seriematige renovaties én grote projecten",
          "Direct inzetbaar binnen planning en capaciteit",
          "Grip op uitvoering, proces én kosten",
          "Inzicht in én optimaliseren van energieprestaties",
        ],
        link: link("Maak een afspraak", "contact"),
        theme: "white",
      }),
      section("collectionList", {
        collection: "project",
        title: "Projecten",
        intro: "Wij combineren bouwtechniek, installatietechniek en energietechniek om hoogwaardige projecten te ontwikkelen samen met bouw- & installatiepartners.",
        layout: "carousel",
        link: link("Alle projecten", "projecten", "secondary"),
        theme: "white",
      }),
    ],
    "Wij maken hoogbouw energiepositief. Door duurzame plug & play modules die ieder huis transformeren in een slim en comfortabel thuis.",
    { title: "Inside Out • Prefab duurzame modules voor energie-efficiënte renovaties" },
  );

  page(
    "over-ons",
    "Over ons",
    [
      section("pageHeader", { eyebrow: "Over ons", title: "Complexe vraagstukken eenvoudig maken", image: await image("images/Visual.webp", { alt: "" }), theme: "green" }),
      section("textMedia", {
        body: pt(
          '<p>Wij houden van complexe vraagstukken eenvoudig maken. Dat is precies waarom wij Inside Out Technologies hebben opgericht: om de gebouwde omgeving versneld te verduurzamen met oplossingen die écht werken in de praktijk.</p><p>Sinds 2022 ontwikkelen wij plug&amp;play energiesystemen die de energietransitie in appartementen en kantoorpanden werkbaar en betaalbaar maken. Wij ontwerpen het energiesysteem, ontwikkelen prefab modules en zorgen dat alles snel en met minimale overlast geïnstalleerd kan worden. Samen met vastgoedonderhoudsbedrijven en installateurs brengen wij onze oplossingen — zoals <a href="https://warmeflat.nl">Warmeflat</a> — naar woningcorporaties en VvE\'s in heel Nederland.</p><p>Wij geloven dat standaardisatie de sleutel is tot schaalbare verduurzaming — en dat je met plug&amp;play systemen meer kunt bereiken met minder vakmensen.</p>',
        ),
        image: await image("images/thumb_Foto-Inside-Out---Joris-en-Paul.avif", { alt: "Joris en Paul van Inside Out" }),
        theme: "white",
      }),
      section("textMedia", {
        title: "Wat we leveren",
        body: pt(
          "<ul><li>Innovatieve modules voor duurzame energieoplossingen</li><li>BIM-systeemontwerp afgestemd op gebouwstructuur en renovatieopgave</li><li>Technische ondersteuning in planfase, aanbesteding en uitvoering</li><li>Slimme Plug &amp; Play modules met warmtepomp, ventilatie, afgifte en PV-opwekking</li><li>Meer leefruimte, minder overlast, kortere doorlooptijd</li></ul>",
        ),
        bodySecondary: pt(
          "<p>Door installaties naar gevel of dak te verplaatsen ontstaat meer leefruimte in de woning, minder hinder tijdens uitvoering en een efficiënter renovatieproces. Zo dragen onze Plug &amp; Play oplossingen bij aan duurzame waarde voor huurders, opdrachtgevers én uitvoerende partners.</p>",
        ),
        theme: "light",
      }),
      section("collectionList", {
        collection: "person",
        title: "Het team",
        intro:
          "Inside Out is een team van jonge, technische ontwikkelaars met een gedeelde missie: de energietransitie uitvoerbaar maken met Plug & Play energiesystemen. We combineren expertise in bouwkunde, installatietechniek en systeemintegratie met een scherpe focus op praktische toepasbaarheid.",
        layout: "grid",
        theme: "white",
      }),
      section("logoMarquee", { clientsTitle: "Opdrachtgevers", partnersTitle: "Partners", theme: "white" }),
      CTA_ADVIES("Benieuwd wat de modules voor jou kunnen betekenen?"),
    ],
    "Inside Out maakt hoogbouw energiepositief door plug & play modules die ieder huis omtovert naar een comfortabel en zuinig thuis. We brengen installaties vanuit het hart van de woning naar de gevel of het dak.",
  );

  page(
    "contact",
    "Contact",
    [
      section("pageHeader", {
        eyebrow: "Contact",
        title: "Wil je meer weten?",
        intro: "Over de modules, onze werkwijze of iets anders? Neem dan contact met ons op.",
        theme: "green",
      }),
      section("contact", {
        formTitle: "Stuur een bericht",
        successMessage: "Bedankt! We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op.",
        openingHours: "Maandag t/m vrijdag 8:00–17:00. Ons hoofdkantoor en de productieafdeling zijn gevestigd op bedrijventerrein Nieuw Overvecht.",
        mapImage: await image("images/contact-map.png", { alt: "" }),
        mapUrl: "https://goo.gl/maps/kvMSDDULyNz5cDxH6",
      }),
    ],
    "Neem contact op met Inside Out. Bel 030-3403908, mail info@inside-out.tech of bezoek ons op Tennesseedreef 15B, 3565 CK Utrecht.",
  );

  page(
    "nieuws",
    "Nieuws",
    [
      section("pageHeader", {
        eyebrow: "Nieuws",
        title: "Kennis delen",
        intro: "Kennisdeling staat bij ons voorop. We houden je graag op de hoogte van het laatste nieuws en ontwikkelingen rondom duurzame transformatie van hoogbouw.",
        theme: "green",
      }),
      section("collectionList", { collection: "news", layout: "grid", theme: "light" }),
      CTA_ADVIES("Benieuwd wat de modules voor jou kunnen betekenen?"),
    ],
    "We delen graag onze kennis rondom duurzame transformatie in de hoogbouw. Bekijk hier onze laatste artikelen.",
  );

  page(
    "projecten",
    "Projecten",
    [
      section("pageHeader", {
        eyebrow: "Projecten",
        title: "Van hoogbouwflat tot kantoorpand",
        intro:
          "Onze Plug & Play energiesystemen worden toegepast in uiteenlopende gebouwtypes: van hoogbouwflats en gestapelde woningbouw tot utiliteitsgebouwen. In elk project brengen we bouwkunde en installatietechniek vanaf de planfase samen in één geïntegreerd energiesysteem, zodat de verduurzaming snel, voorspelbaar en technisch beheersbaar verloopt.",
        theme: "green",
      }),
      section("collectionList", { collection: "project", layout: "grid", theme: "light" }),
      CTA_ADVIES("Weten wat een Plug & Play energiesysteem kan betekenen voor jouw gebouw of project?"),
    ],
    "Bekijk hier de projecten waarin onze hoogbouwmodules het verschil maken.",
  );

  page(
    "installateur",
    "Installatiepartners",
    [
      section("pageHeader", { eyebrow: "Installatiepartners", title: "Plug & Play modules: klaar voor snelle verduurzaming van gestapelde bouw", theme: "green" }),
      section("textMedia", {
        body: pt(
          "<p>Onze Plug &amp; Play modules voorzien in duurzame verwarming, warm water, energieopslag en duurzame opwekking, speciaal ontworpen voor snelle plaatsing en minimale overlast.</p><p>Het is onze ambitie om systemen te ontwikkelen met een hoog niveau van inpasbaarheid. De hoogte van het inpasbaarheidsniveau bepaalt de geschiktheid voor opschaling.</p>",
        ),
        bodySecondary: pt(
          '<p>Om tot compleet gestandaardiseerde systemen te komen worden er criteria gesteld aan het gebouw en de toepassing ervan. Om het systeem op te schalen wordt er een commercieel concept ontwikkeld dat samen met installatiepartners wordt uitgerold in de markt.</p><p>Het eerste concept dat wordt uitgerold is <a href="https://www.warmeflat.nl/">Warmeflat</a>. Installatiepartners kunnen zich aanmelden om samen projecten te realiseren.</p>',
        ),
        image: await image("images/inpasbaarheid.png", { alt: "Schema van het inpasbaarheidsniveau van Plug & Play-systemen" }),
        theme: "green",
      }),
      section("uspGrid", {
        theme: "green",
        items: withKeys([
          { title: "Prefab en direct inzetbaar zonder engineering", text: "Gestandaardiseerd ontwerp op basis van vergelijkbare woningtypes. Geen extra tekenwerk of complexe technische voorbereiding nodig." },
          { title: "Snelle installatie met minimale overlast", text: "De Plug & Play modules worden zoveel mogelijk buiten de woning geplaatst. Minimale ingrepen binnen zorgen dat bewoners thuis kunnen blijven tijdens de uitvoering." },
          { title: "Inzicht in energieprestaties en kosten", text: "Slimme aansluitingen en vaste posities zorgen voor een vlot proces met minder risico’s en minder afstemming op locatie. Installatiepartners krijgen technische ondersteuning gedurende het hele traject." },
          { title: "Standaardisatie met maatwerk", text: "Geïntegreerde systemen met warmtepomp, ventilatie en PV, getest in de praktijk en voorbereid op monitoring en prestatie-optimalisatie in de gebruiksfase." },
        ]),
      }),
      section("steps", {
        title: "Stappenplan voor installatiepartners",
        list: "installatiepartners",
        image: await image("images/Bravo-2.0-sq.png", { alt: "Plug & Play-module io Bravo 2.0" }),
        theme: "light",
      }),
      await ctaDuurzaam(),
    ],
    "Inside Out prefab modules: Plug & Play verwarming en energieopslag voor appartementen. Snelle installatie, minder faalkosten, voorspelbaar proces.",
  );

  page(
    "vastgoedbeheer",
    "Bouwpartners",
    [
      section("pageHeader", { eyebrow: "Bouwpartners", title: "Plug & Play energiesystemen als basis voor snelle en voorspelbare verduurzaming", theme: "green" }),
      section("textMedia", {
        body: pt(
          "<p>Wij ontwikkelen energiesystemen die de verduurzaming van vastgoed versnellen en voorspelbaar maken. Door bouwkunde en installatietechniek vanaf de planfase te combineren ontstaat een oplossing die direct toepasbaar is zonder ingrijpende aanpassingen.</p><p>Hierdoor kunnen wij duidelijkheid geven op het gebied van installaties &amp; energie en de kosten, risico’s en prestaties hiervan.</p><p>Dit doen wij binnen RGS-trajecten waar wij aanhaken vanaf de initiatieffase in samenwerking met de strategische partner, of binnen tendertrajecten.</p>",
        ),
        image: await image("images/aanpak.png", { alt: "Schema van de aanpak van Inside Out" }),
        theme: "green",
      }),
      section("uspGrid", {
        theme: "green",
        items: withKeys([
          { title: "Inpasbaar in planvorming en voor tendertrajecten", text: "Ontwikkelen samen met ketenpartners, binnen RGS-trajecten en tenders, met planvorming tot en met de beheerfase." },
          { title: "Van ambitie naar technisch systeemontwerp", text: "Doelen worden in de planfase vertaald naar een Plug & Play energiesysteem dat technisch aansluit op gebouwstructuur en renovatie-eisen." },
          { title: "Inzicht in energieprestaties en kosten", text: "Door standaardisatie met onze plug&play oplossingen worden investeringskosten en prestaties opgehaald uit gerealiseerde projecten, waardoor risico’s worden geminimaliseerd." },
          { title: "Standaardisatie met maatwerk", text: "Standaardisatie zorgt voor tempo, kwaliteit en schaalbare proposities, en met plug&play systemen kun je meer bereiken met minder vakmensen." },
        ]),
      }),
      await ctaDuurzaam(),
    ],
    "Versnel de verduurzaming van uw vastgoed met Plug & Play energiesystemen van Inside Out Technologies. Voorspelbare kosten en prestaties.",
  );

  page(
    "plug-play",
    "Plug & Play",
    [
      section("pageHeader", {
        eyebrow: "Plug & Play",
        title: "De basis van elk duurzaam energiesysteem",
        intro:
          "Onze Plug & Play modules zijn standaard inpasbaar bij de juiste bouwkundige voorwaarden en flexibel aanpasbaar waar nodig. Elke prefab module integreert bouwkunde en installatietechniek in één compacte energieoplossing, klaar voor gevel- of dakmontage, met minimale ingrepen op locatie en een voorspelbaar installatieproces.",
        theme: "green",
      }),
      section("cta", {
        title: "Ontdek Plug & Play op maat",
        text: "Prefab modules aanpasbaar op energie, gebouw & gebruikersvoorwaarden.",
        link: link("Bekijk Plug & Play op maat", "op-maat"),
        theme: "white",
      }),
      section("collectionList", { collection: "module", layout: "grid", theme: "white" }),
      await ctaDuurzaam(),
    ],
    "Plug & Play energiemodules: prefab duurzame energieoplossingen voor gevel en dak. Geïntegreerde bouwkunde en installatietechniek, snelle montage.",
  );

  page(
    "op-maat",
    "Plug & Play op maat",
    [
      section("pageHeader", {
        eyebrow: "Maatwerk",
        title: "Plug & Play op maat",
        intro:
          "Met op maat gemaakte prefab Plug & Play energiesystemen maken we verduurzaming van gebouwen structureel uitvoerbaar. Binnen het bouwteam ontwikkelen we het technische BIM-model, gevolgd door prefab productie, installatie en monitoring.",
        theme: "green",
      }),
      section("textMedia", {
        body: pt(
          "<p class=\"lead\">Bouwkundige en installatietechnische oplossingen worden vanaf het ontwerp gecombineerd. Zo wordt verduurzaming integraal uitvoerbaar, met voorspelbare prestaties, heldere samenwerking en een korte doorlooptijd.</p>",
        ),
        buttons: [link("Plan Plug & Play maatwerktraject", "contact", "primary")],
        theme: "white",
      }),
      section("steps", {
        title: "RGS-fasen met Inside Out als energiesysteem-ontwikkelaar",
        intro: pt(
          "<h3>Resultaatgericht Samenwerken</h3><p>Binnen de RGS-methodiek (Resultaatgericht Samenwerken) wordt verduurzaming uitgevoerd in vaste fasen. Dit proces biedt planvoorbereiders en onderhoudsbedrijven een slimme, geïntegreerde totaaloplossing voor vastgoedverduurzaming.</p>",
        ),
        list: "rgs",
        image: await image("images/Inside-Out-Website.jpg", { alt: "" }),
        theme: "light",
      }),
      section("textMedia", {
        title: "Waarom deze aanpak werkt",
        body: pt(
          "<ul><li><strong>Transparantie, grip en samenwerking:</strong> RGS garandeert samenhang in planning, uitvoering en eigenaarschap, vooral dankzij procesintegratie binnen het bouwteam.</li><li><strong>Prefab Plug &amp; Play modules:</strong> zorgen voor snellere realisatie, minder faalkosten en consistente kwaliteit, dankzij prefab productie en installatie.</li></ul>",
        ),
        bodySecondary: pt(
          "<h3>Inside Out als ontwikkelaar &amp; partner</h3><ul><li><strong>BIM-integratie in het bouwteam:</strong> bouwkundige en installatietechnische kennis worden naadloos geïntegreerd in het BIM-ontwerp vanaf de eerste fase.</li><li><strong>BIM geoptimaliseerd voor integratie:</strong> door digitale coördinatie worden fouten, faalkosten en uitvoeringsrisico’s voorkomen, waardoor realisatie efficiënt verloopt.</li><li><strong>RGS binnen engineering:</strong> heldere samenwerking, risicobeheersing en prestaties vanaf ontwerp tot uitvoering.</li></ul>",
        ),
        theme: "light",
      }),
      section("logoMarquee", { clientsTitle: "Opdrachtgevers", partnersTitle: "Partners", theme: "white" }),
      section("cta", {
        title: "Wil je verduurzaming op een structurele en beheersbare manier realiseren binnen het bouwteam?",
        text: "Vraag jouw Plug & Play maatwerktraject aan.",
        link: link("Neem contact op", "contact"),
        theme: "white",
      }),
    ],
    "Plug & Play op maat: prefab energiesystemen binnen RGS-trajecten, met BIM-integratie in het bouwteam. Voorspelbare prestaties en korte doorlooptijd.",
  );

  page(
    "privacy",
    "Privacyverklaring",
    [
      section("pageHeader", { title: "Privacyverklaring", theme: "green" }),
      section("textMedia", {
        body: pt(
          "<p>TODO: de privacyverklaring van Inside Out Technologies B.V. volgt. Vragen over privacy? Mail naar <a href=\"mailto:info@inside-out.tech\">info@inside-out.tech</a>.</p>",
        ),
        theme: "white",
      }),
    ],
    "Hoe Inside Out Technologies B.V. omgaat met persoonsgegevens.",
    { noindex: true },
  );
}

// ── Singletons ────────────────────────────────────────────────────────────────

async function importSingletons() {
  console.log("Site-instellingen en navigatie");
  add({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: "Inside Out",
    tagline: "Prefab duurzame modules voor energie-efficiënte renovaties",
    companyName: "Inside Out Technologies B.V.",
    entityType: "Organization",
    email: "info@inside-out.tech",
    telephone: "030-3403908",
    address: { street: "Tennesseedreef 15B", postalCode: "3565 CK", city: "Utrecht", country: "NL" },
    sameAs: ["https://www.linkedin.com/company/inside-out-tech", "https://www.instagram.com/insideout.tech"],
    titleTemplate: "%s • Inside Out",
    description: "Inside Out ontwikkelt prefab Plug & Play energiesystemen voor snelle verduurzaming van hoogbouw, gestapelde woningbouw en utiliteitsgebouwen.",
    shareImage: await image("images/og-image-default.png", { alt: "Inside Out" }),
    noindex: false,
    llmsIntro:
      "Inside Out Technologies (Utrecht) ontwikkelt prefab Plug & Play energiesystemen voor verwarming, warm water, energieopslag en duurzame opwekking. De modules worden op de gevel of het dak geplaatst, zodat gebouwen snel en met minimale overlast verduurzamen. Voor woningcorporaties, VvE's, bouw- en installatiepartners.",
    allowAiTraining: true,
  });

  add({
    _id: "navigation",
    _type: "navigation",
    headerCta: link("Contact", "contact", "secondary"),
    main: [
      link("Bouwpartners", "vastgoedbeheer"),
      link("Installatiepartners", "installateur"),
      link("Projecten", "projecten"),
      link("Plug & Play", "plug-play"),
      link("Over ons", "over-ons"),
    ],
    footer: [
      link("Bouwpartners", "vastgoedbeheer"),
      link("Installatiepartners", "installateur"),
      link("Plug & Play", "plug-play"),
      link("Op maat", "op-maat"),
      link("Projecten", "projecten"),
      link("Nieuws", "nieuws"),
      link("Over ons", "over-ons"),
      link("Contact", "contact"),
    ],
    footerCtaText: "Weten wat een Plug & Play energiesysteem kan betekenen voor jouw gebouw of project?",
    footerCta: link("Maak een afspraak", "contact"),
    terms: await file("documents/23.118-Algemene-leveringsvoorwaarden-installerende-bedrijven-ALIB-2024.pdf"),
    termsLabel: "Alg. voorwaarden",
    privacyPage: pageRef("privacy"),
  });
}

// ── Uitvoeren ─────────────────────────────────────────────────────────────────

await mkdir(CACHE, { recursive: true });
await importCollections();
await importPages();
await importSingletons();

if (DRY) {
  await writeFile(join(CACHE, "dry-run.json"), JSON.stringify(docs, null, 2));
  console.log(`\nDry run: ${docs.length} documenten in scripts/.cache/dry-run.json`);
} else {
  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit({ visibility: "async" });
  console.log(`\nKlaar: ${docs.length} documenten geïmporteerd in ${projectId}/${dataset}. Vergeet niet het write-token in te trekken.`);
}
