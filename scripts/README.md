# Shared Navigation

Edit `navigation.json` to change header and footer link labels, destinations, or order globally. Do not edit generated navigation inside individual pages or `footer.js`.

Run `node scripts/sync-navigation.mjs` to refresh local pages, then `node scripts/sync-navigation.mjs --check` to verify they match. Publishing runs the generator automatically, so a change to `navigation.json` alone updates every published header and the shared footer.

Headers remain static HTML, including each page's active-link state and mobile menu controls. Footer links use the same labels and order, with Home added first. The hidden Rooted menu keeps its separate menu-category navigation and stays out of the public menu.
