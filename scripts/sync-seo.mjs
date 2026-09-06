import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const config = JSON.parse(readFileSync(join(root, "seo.json"), "utf8"));
const base = new URL(config.siteUrl);
if (base.protocol !== "https:" || !base.pathname.endsWith("/") || base.search || base.hash) throw new Error("siteUrl must be an HTTPS base URL ending in /.");
const check = process.argv.includes("--check");
const xml = (s) => s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const absolute = (file) => new URL(file === "index.html" ? "./" : file, base).href;
const orgId = `${base.href}#organization`;
const websiteId = `${base.href}#website`;
const pages = config.pages;
if (new Set(pages.map((p) => p.file)).size !== pages.length) throw new Error("Duplicate SEO pages.");
for (const p of pages) {
  if (!/^[a-z0-9-]+\.html$/.test(p.file) || !existsSync(join(root, p.file)) || !p.title || !p.description || !p.name) throw new Error(`Invalid SEO page: ${p.file}`);
}
for (const asset of [config.image, config.logo]) if (!existsSync(join(root, asset))) throw new Error(`Missing SEO asset: ${asset}`);

const services = pages.filter((p) => p.service).map((p) => ({
  "@type": "Service", "@id": `${absolute(p.file)}#service`,
  name: p.name, serviceType: p.service, description: p.description,
  url: absolute(p.file), provider: { "@id": orgId }, areaServed: config.areaServed
}));

function metadata(page) {
  const url = absolute(page.file);
  const home = page.file === "index.html";
  const org = {
    "@type": "Organization", "@id": orgId, name: config.name, url: base.href,
    logo: absolute(config.logo), telephone: config.telephone, areaServed: config.areaServed
  };
  if (home) org.hasOfferCatalog = {
    "@type": "OfferCatalog", name: "Reimagined Nutrition services",
    itemListElement: services.map((service) => ({ "@type": "Offer", itemOffered: { "@id": service["@id"] } }))
  };
  const webpage = {
    "@type": page.type || "WebPage", "@id": `${url}#webpage`, url,
    name: page.title, description: page.description, inLanguage: "en-US",
    isPartOf: { "@id": websiteId }, about: { "@id": orgId }
  };
  if (page.service) webpage.mainEntity = { "@id": `${url}#service` };
  const graph = [org, {
    "@type": "WebSite", "@id": websiteId, url: base.href, name: config.name,
    publisher: { "@id": orgId }, inLanguage: "en-US"
  }, webpage, ...(home ? services : services.filter((s) => s.url === url))];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replaceAll("<", "\\u003c");
  return `<!-- Generated SEO: edit seo.json, then run scripts/sync-seo.mjs. -->
    <title>${xml(page.title)}</title>
    <meta name="description" content="${xml(page.description)}">
    <link rel="canonical" href="${xml(url)}">
    <link rel="sitemap" type="application/xml" href="${xml(absolute("sitemap.xml"))}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${xml(config.name)}">
    <meta property="og:locale" content="en_US">
    <meta property="og:title" content="${xml(page.title)}">
    <meta property="og:description" content="${xml(page.description)}">
    <meta property="og:url" content="${xml(url)}">
    <meta property="og:image" content="${xml(absolute(config.image))}">
    <meta property="og:image:alt" content="Chef-prepared ingredients and meal planning materials.">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${xml(page.title)}">
    <meta name="twitter:description" content="${xml(page.description)}">
    <meta name="twitter:image" content="${xml(absolute(config.image))}">
    <script type="application/ld+json" id="site-seo">${json}</script>
    <!-- End generated SEO -->`;
}

const changed = [];
function output(file, content) {
  const path = join(root, file);
  const before = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (before.replaceAll("\r\n", "\n") !== content) {
    changed.push(file);
    if (!check) writeFileSync(path, before.includes("\r\n") ? content.replaceAll("\n", "\r\n") : content);
  }
}

for (const page of pages) {
  const html = readFileSync(join(root, page.file), "utf8").replaceAll("\r\n", "\n");
  const pattern = /<!-- Generated SEO:[\s\S]*?<!-- End generated SEO -->/;
  let updated;
  if (pattern.test(html)) updated = html.replace(pattern, () => metadata(page));
  else {
    if (!/<title>[^<]*<\/title>/.test(html)) throw new Error(`Missing title in ${page.file}`);
    updated = html.replace(/\s*<meta name="description" content="[^"]*">/, "")
      .replace(/<title>[^<]*<\/title>/, () => metadata(page));
  }
  output(page.file, updated);
}
output("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${xml(absolute(p.file))}</loc></url>`).join("\n")}\n</urlset>\n`);
output("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${absolute("sitemap.xml")}\n`);
if (check && changed.length) {
  console.error(`SEO output needs regeneration: ${changed.join(", ")}`);
  process.exitCode = 1;
} else console.log(check ? "All SEO metadata is in sync." : `Updated ${changed.length} SEO files.`);
