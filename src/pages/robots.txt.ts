import type { APIRoute } from "astro";
import groq from "groq";
import { loadQuery } from "../lib/sanity/load-query";

const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent"];

export const GET: APIRoute = async ({ site }) => {
  const { data } = await loadQuery<{ allowAiTraining?: boolean } | null>({
    query: groq`*[_id == "siteSettings"][0]{ allowAiTraining }`,
  });

  const lines = ["User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /api/", "Disallow: /__forms.html"];

  if (data?.allowAiTraining === false) {
    for (const bot of TRAINING_BOTS) lines.push("", `User-agent: ${bot}`, "Disallow: /");
  }

  lines.push("", `Sitemap: ${new URL("/sitemap.xml", site).href}`);

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
};
