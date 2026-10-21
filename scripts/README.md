# Shared Navigation

Edit `navigation.json` to change header and footer link labels, destinations, or order globally. Do not edit generated navigation inside individual pages or `footer.js`.

Run `node scripts/sync-navigation.mjs` to refresh local pages, then `node scripts/sync-navigation.mjs --check` to verify they match. Publishing runs the generator automatically, so a change to `navigation.json` alone updates every published header and the shared footer.

Headers remain static HTML, including each page's active-link state and mobile menu controls. Footer links use the same labels and order, with Home added first. The hidden Rooted menu keeps its separate menu-category navigation and stays out of the public menu.

# Search Metadata

Edit `seo.json` for page titles, search descriptions, service definitions, and the current site base URL. Run `node scripts/sync-seo.mjs` and `node --test scripts/seo.test.mjs`. Publishing regenerates metadata, structured service URLs, and the nine-page sitemap without changing visible copy.

Live browser checks on September 6, 2026 confirmed that GitHub Pages and www redirect to https://reimaginednutrition.com/, which serves this site. Google results and cached search fetches still showed the old Wix content. `siteUrl` uses the confirmed HTTPS root. All canonical URLs, social URLs, service links, and sitemap URLs follow it.

Submit the sitemap in Google Search Console after verifying ownership. The custom domain serves robots.txt at the hostname root. Rooted remains crawlable for its noindex tag, but is excluded from the sitemap and service catalog. Private logs and the legacy Wix embed are not deployed.

Google selects sitelinks automatically; metadata cannot force a specific set. Google currently links Catering to `/services-1` and Book Online to `/book-online`; both returned 404 during the audit. `seo.json` maps those legacy paths to the current Catering and Contact & Inquiry pages using instant meta-refresh redirects, supported on static GitHub Pages. `/about` already resolves to the current About page. Review `/testimonials` and other removed Wix pages separately; do not redirect unrelated pages to arbitrary services or the homepage. No DNS, Search Console, Business Profile, or Wix changes are made by these scripts.
