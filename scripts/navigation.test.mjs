import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const source = fileURLToPath(new URL("../", import.meta.url));

test("one navigation source updates every static header and the footer", (t) => {
  const root = mkdtempSync(join(tmpdir(), "reimagined-navigation-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "scripts"));
  mkdirSync(join(root, "changelog"));
  copyFileSync(join(source, "scripts/sync-navigation.mjs"), join(root, "scripts/sync-navigation.mjs"));
  copyFileSync(join(source, "navigation.json"), join(root, "navigation.json"));
  copyFileSync(join(source, "footer.js"), join(root, "footer.js"));
  const links = JSON.parse(readFileSync(join(root, "navigation.json"), "utf8"));
  const pages = ["index.html", "404.html", ...links.map((link) => link.href), "food-service-consulting.html", "meal-plans-for-aging-parents-and-spouses.html", "changelog/index.html"];
  const fixture = '<!doctype html><header class="site-header" data-header>Old navigation</header><main>Keep page content.</main><script src="footer.js"></script>';
  for (const page of pages) writeFileSync(join(root, page), fixture);
  const run = (...args) => spawnSync(process.execPath, [join(root, "scripts/sync-navigation.mjs"), ...args], { encoding: "utf8" });

  assert.equal(run("--check").status, 1);
  assert.equal(readFileSync(join(root, "index.html"), "utf8"), fixture);
  assert.equal(run().status, 0);
  assert.equal(run("--check").status, 0);
  for (const page of pages) {
    const html = readFileSync(join(root, page), "utf8");
    assert.match(html, /<main>Keep page content\.<\/main>/);
    assert.match(html, /aria-controls="site-nav"/);
    assert.match(html, /footer\.js\?v=[a-f0-9]{12}/);
    assert.equal((html.match(/aria-current="page"/g) || []).length, links.some((link) => link.href === page) ? 1 : 0);
    for (const link of links) {
      const prefix = page.startsWith("changelog/") ? "../" : "";
      assert.ok(html.includes(`href="${prefix}${link.href}"`));
      assert.ok(html.includes(`>${link.label}</a>`));
    }
  }

  links[1].label = "Office & Teams";
  writeFileSync(join(root, "navigation.json"), JSON.stringify(links));
  assert.equal(run("--check").status, 1);
  assert.equal(run().status, 0);
  for (const page of [...pages, "footer.js"]) {
    assert.ok(readFileSync(join(root, page), "utf8").includes(">Office &amp; Teams</a>"));
  }
  assert.equal(run("--check").status, 0);

  links[1].href = "missing.html";
  writeFileSync(join(root, "navigation.json"), JSON.stringify(links));
  assert.notEqual(run().status, 0);
});
