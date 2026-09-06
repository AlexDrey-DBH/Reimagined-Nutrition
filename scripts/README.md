# Shared Navigation

Edit `navigation.json` to change header and footer link labels, destinations, or order globally. Do not edit generated navigation inside individual pages or `footer.js`.

Run `node scripts/sync-navigation.mjs` to refresh local pages, then `node scripts/sync-navigation.mjs --check` to verify they match. Publishing runs the generator automatically, so a change to `navigation.json` alone updates every published header and the shared footer.

Headers remain static HTML, including each page's active-link state and mobile menu controls. Footer links use the same labels and order, with Home added first. The hidden Rooted menu keeps its separate menu-category navigation and stays out of the public menu.

# Search Metadata

Edit `seo.json` for page titles, search descriptions, service definitions, and the current site base URL. Run `node scripts/sync-seo.mjs` and `node --test scripts/seo.test.mjs`. Publishing regenerates metadata, structured service URLs, and the nine-page sitemap without changing visible copy.

The business domain still serves Wix as of September 6, 2026. Until the domain is connected to this site, `siteUrl` uses the actual GitHub Pages address; do not point canonical URLs at unavailable business-domain pages. At domain cutover, change `siteUrl` once to the confirmed HTTPS root and regenerate. All canonical URLs, social URLs, service links, and sitemap URLs follow it.

Submit the sitemap in Google Search Console after verifying the final domain. GitHub project hosting serves this robots.txt below a path; Google only uses robots.txt at the hostname root. It will take effect at the root after the custom domain is connected. Rooted remains crawlable for its noindex tag, but is excluded from the sitemap and service catalog. Private logs and the legacy Wix embed are not deployed.

Google selects sitelinks automatically; metadata cannot force a specific set. The old Wix URLs need a reviewed redirect plan at cutover, especially `/about`, `/catering`, `/book-online`, `/testimonials`, `/calendar`, and `/shop`. Do not redirect unrelated old pages to arbitrary services or the homepage. No DNS, Search Console, Business Profile, or Wix changes are made by these scripts.
