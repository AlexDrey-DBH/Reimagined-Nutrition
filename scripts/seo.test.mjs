import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const config = JSON.parse(readFileSync(join(root, "seo.json"), "utf8"));
const read = (file) => readFileSync(join(root, file), "utf8");
const url = (file) => new URL(file === "index.html" ? "./" : file, config.siteUrl).href;
const canonicalUrls = config.pages.map((p) => url(p.file));

test("every public page has unique metadata, a working canonical, and valid structured service links", () => {
  assert.equal(new Set(config.pages.map((p) => p.title)).size, config.pages.length);
  assert.equal(new Set(config.pages.map((p) => p.description)).size, config.pages.length);
  for (const page of config.pages) {
    const html = read(page.file);
    const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
    for (const pattern of [/<title>/g, /name="description"/g, /rel="canonical"/g, /property="og:url"/g, /name="twitter:card"/g]) {
      assert.equal((head.match(pattern) || []).length, 1, `${page.file}: duplicate or missing metadata`);
    }
    assert.ok(head.includes(`<link rel="canonical" href="${url(page.file)}">`));
    assert.ok(head.includes(`<meta property="og:url" content="${url(page.file)}">`));
    assert.doesNotMatch(head, /noindex/);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    assert.equal(blocks.length, 1);
    const graph = JSON.parse(blocks[0][1])["@graph"];
    const ids = new Set(graph.map((node) => node["@id"]));
    const walk = (node) => {
      if (!node || typeof node !== "object") return;
      if (node["@id"]) assert.ok(ids.has(node["@id"]), `Unresolved entity: ${node["@id"]}`);
      Object.values(node).forEach(walk);
    };
    graph.forEach(walk);
    const services = graph.filter((node) => node["@type"] === "Service");
    assert.equal(services.length, page.file === "index.html" ? config.pages.filter((p) => p.service).length : page.service ? 1 : 0);
    for (const service of services) {
      assert.ok(canonicalUrls.includes(service.url));
      assert.equal(service.provider["@id"], `${config.siteUrl}#organization`);
    }
    for (const asset of [config.image, config.logo]) {
      assert.ok(existsSync(join(root, asset)));
      assert.ok(head.includes(new URL(asset, config.siteUrl).href));
    }
  }
});

test("sitemap covers public services but excludes hidden and private pages", () => {
  const sitemap = read("sitemap.xml");
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations, canonicalUrls);
  assert.doesNotMatch(sitemap, /rooted|changelog|patch-notes|wix-embed/);
  assert.match(read("rooted/index.html"), /<meta name="robots" content="noindex, nofollow">/);
  assert.ok(read("robots.txt").includes(`Sitemap: ${new URL("sitemap.xml", config.siteUrl).href}`));
  for (const service of config.pages.filter((p) => p.service)) {
    assert.ok(read("index.html").includes(`href="${service.file}"`), `Service lacks a crawlable homepage link: ${service.file}`);
  }
});
