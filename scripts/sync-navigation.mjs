import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = fileURLToPath(new URL("../", import.meta.url));
const links = JSON.parse(readFileSync(join(root, "navigation.json"), "utf8"));
const version = createHash("sha256").update(JSON.stringify(links)).digest("hex").slice(0, 12);
const check = process.argv.includes("--check");
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

if (!Array.isArray(links) || !links.length) throw new Error("Navigation must contain links.");
const destinations = new Set();
for (const link of links) {
  if (typeof link.label !== "string" || !link.label.trim() || !/^[a-z0-9-]+\.html$/.test(link.href)) {
    throw new Error("Each navigation entry needs a label and a local HTML destination.");
  }
  if (!existsSync(join(root, link.href)) || destinations.has(link.href)) {
    throw new Error(`Missing or duplicate navigation destination: ${link.href}`);
  }
  destinations.add(link.href);
}

function renderHeader(page) {
  const prefix = relative(dirname(join(root, page)), root).split(sep).join("/");
  const url = (href) => escape(prefix ? `${prefix}/${href}` : href);
  const anchors = links.map(({ label, href }) => `        <a href="${url(href)}"${page === href ? ' aria-current="page"' : ""}>${escape(label)}</a>`).join("\n");
  return `<header class="site-header" data-header>
      <!-- Generated from navigation.json by scripts/sync-navigation.mjs. -->
      <a class="brand" href="${url("index.html")}" aria-label="Reimagined Nutrition home">
        <img class="brand-logo" src="${url("assets/reimagined-nutrition-logo-transparent.png")}" alt="Reimagined Nutrition">
      </a>
      <button class="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="site-nav" data-nav-toggle><span></span><span></span></button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation" data-nav>
${anchors}
      </nav>
    </header>`;
}

const updates = [];
function update(file, transform) {
  const path = join(root, file);
  const before = readFileSync(path, "utf8");
  const normalized = before.replaceAll("\r\n", "\n");
  const after = transform(normalized);
  if (normalized !== after) {
    updates.push(file);
    if (!check) writeFileSync(path, before.includes("\r\n") ? after.replaceAll("\n", "\r\n") : after);
  }
}

// Keep complete static headers in HTML; publishing refreshes these from one source.
const pages = readdirSync(root).filter((file) => file.endsWith(".html"));
if (existsSync(join(root, "changelog/index.html"))) pages.push("changelog/index.html");
for (const page of pages) {
  update(page, (html) => {
    const headers = html.match(/<header\b[^>]*\bdata-header[^>]*>[\s\S]*?<\/header>/g) || [];
    if (headers.length > 1) throw new Error(`Multiple shared headers in ${page}`);
    return headers.length ? html.replace(headers[0], renderHeader(page))
      .replace(/(<script src="(?:\.\.\/)*footer\.js)(?:\?[^"\s]*)?("[^>]*><\/script>)/g, `$1?v=${version}$2`) : html;
  });
}

update("footer.js", (source) => {
  const footerLinks = [{ label: "Home", href: "index.html" }, ...links];
  const markup = `<nav class="footer-links" aria-label="Footer navigation">
      <!-- Generated from navigation.json by scripts/sync-navigation.mjs. -->
${footerLinks.map(({ label, href }) => `      <a href="${escape(href)}">${escape(label)}</a>`).join("\n")}
    </nav>`;
  const pattern = /<nav class="footer-links"[^>]*>[\s\S]*?<\/nav>/;
  if (!pattern.test(source)) throw new Error("Shared footer navigation was not found.");
  return source.replace(pattern, markup);
});

if (check && updates.length) {
  console.error(`Navigation needs regeneration: ${updates.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(check ? "All shared navigation is in sync." : `Updated ${updates.length} navigation files.`);
}
