import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://amanispanairobi.com",
  integrations: [
    preact(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        if (item.url === "https://amanispanairobi.com/") {
          item.changefreq = "daily";
          item.priority = 1.0;
        }
        if (item.url.includes("/services/")) {
          item.changefreq = "monthly";
          item.priority = 0.8;
        }
        if (item.url.includes("/blog/")) {
          item.changefreq = "monthly";
          item.priority = 0.6;
        }
        return item;
      },
      filter: (page) =>
        !page.includes("/admin/") &&
        !page.includes("/book/placeholder") &&
        !page.includes("/404"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 600,
    },
  },
  server: {
    headers: {
      "X-Robots-Tag": "index, follow, max-snippet:-1, max-image-preview:large",
    },
  },
});
