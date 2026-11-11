import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const BASE = "/exile-focus/";

/**
 * Публичный адрес сайта для canonical, Open Graph и sitemap.
 * SITE_URL задаётся явно, иначе в GitHub Actions берётся из имени репозитория.
 */
function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/?$/, "/");
  const repo = process.env.GITHUB_REPOSITORY; // "owner/exile-focus"
  if (repo) {
    const [owner] = repo.split("/");
    return `https://${owner.toLowerCase()}.github.io${BASE}`;
  }
  return "";
}

function seo(): Plugin {
  const url = siteUrl();
  return {
    name: "exile-focus-seo",
    transformIndexHtml(html) {
      if (url) return html.replaceAll("%SITE_URL%", url);
      // Адрес неизвестен (локальная сборка): убираем теги, которым нужен абсолютный URL.
      return html
        .split("\n")
        .filter((line) => !line.includes("%SITE_URL%") || line.includes('"url"'))
        .join("\n")
        .replace('"url": "%SITE_URL%",', "");
    },
    generateBundle() {
      const robots = ["User-agent: *", "Allow: /", ...(url ? [`Sitemap: ${url}sitemap.xml`] : [])].join("\n");
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots + "\n" });
      if (url) {
        const today = new Date().toISOString().slice(0, 10);
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>
</urlset>
`,
        });
      }
    },
  };
}

export default defineConfig({
  base: BASE,
  server: { host: true },
  plugins: [react(), seo()],
});
