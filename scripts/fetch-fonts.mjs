#!/usr/bin/env node
/**
 * Haalt de Haffer SQ-fonts op vóór de build (npm "prebuild").
 *
 * De fonts zijn gelicenseerd en staan daarom niet in de (openbare) repo. De bestanden staan
 * als assets in Sanity; de URL's staan in de env-var FONT_URLS (JSON: { "bestand.otf": "https://…" }),
 * in Netlify en desgewenst in .env. Lokaal staan ze meestal al in public/fonts/ (gitignored).
 * Ontbreekt een font en is FONT_URLS leeg, dan bouwt de site met het fallback-font.
 */
import { mkdir, writeFile, access } from "node:fs/promises";

const DIR = new URL("../public/fonts/", import.meta.url);
const urls = JSON.parse(process.env.FONT_URLS || "{}");
const exists = (f) => access(new URL(f, DIR)).then(() => true, () => false);

await mkdir(DIR, { recursive: true });
const files = Object.keys(urls);
if (!files.length) {
  console.log("fetch-fonts: FONT_URLS is leeg, bestaande fonts in public/fonts/ worden gebruikt.");
  process.exit(0);
}
for (const file of files) {
  if (await exists(file)) continue;
  const res = await fetch(urls[file]);
  if (!res.ok) throw new Error(`fetch-fonts: ${file} → HTTP ${res.status}`);
  await writeFile(new URL(file, DIR), Buffer.from(await res.arrayBuffer()));
  console.log(`fetch-fonts: ${file}`);
}
