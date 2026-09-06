import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("404.html", root), "utf8");

test("404 keeps assets and navigation rooted at the homepage for nested missing URLs", () => {
  assert.match(html, /<base href="\/">/);
  assert.match(html, /href="\/">Back to homepage<\/a>/);
  assert.match(html, /Our new site just launched/);
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.match(html, /data-header/);
  assert.match(html, /data-site-footer/);
  assert.doesNotMatch(html, /http-equiv="refresh"/);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const resolved = new URL(match[1], new URL("/", "https://reimaginednutrition.com/old/nested/page"));
    assert.ok(existsSync(fileURLToPath(new URL(resolved.pathname.slice(1) || "index.html", root))), resolved.href);
  }
  assert.ok(!readFileSync(new URL("sitemap.xml", root), "utf8").includes("404.html"));
  assert.match(readFileSync(new URL(".github/workflows/deploy-pages.yml", root), "utf8"), /cp 404\.html _site\//);
});
