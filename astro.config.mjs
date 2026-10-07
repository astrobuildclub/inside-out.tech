// @ts-check
import { defineConfig } from "astro/config";
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import { loadEnv } from "vite";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  site: "https://inside-out.tech",
  trailingSlash: "never",
  output: "server",
  adapter: netlify({ imageCDN: false }),
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID || "cf1ukp64",
      dataset: PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2025-01-01",
      useCdn: false,
      studioBasePath: "/admin",
      stega: { studioUrl: "/admin" },
    }),
    react(),
  ],
  vite: {
    css: {
      preprocessorOptions: {
        // utopia-core-scss gebruikt nog de oude if(); die waarschuwing komt uit een dependency.
        scss: { quietDeps: true },
      },
    },
    ssr: { noExternal: ["styled-components"] },
    optimizeDeps: { include: ["styled-components"] },
  },
});
