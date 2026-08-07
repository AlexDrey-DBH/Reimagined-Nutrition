# Reimagined Nutrition Website

Static source for the Reimagined Nutrition website. The site is plain HTML, CSS, and JavaScript, so there is no build step required for local preview.

## Files

- `index.html` - homepage.
- `specialized-recovery-meals.html` - specialized and recovery meals page.
- `corporate-meals-office-lunches.html` - corporate meals and office lunches page.
- `full-service-catering-events.html` - catering and events page.
- `nutrition-counseling.html` - nutrition counseling page.
- `food-service-consulting.html` - food service consulting page.
- `about.html` - Ali Senatore bio page.
- `contact-and-inquiry.html` - split nutrition and catering inquiry page.
- `styles.css` and `script.js` - shared site styling and form behavior.
- `assets/` - image assets used by the site.
- `reimagined-nutrition-website-copy-v2.md` - working copy strategy and review document.
- `wix-embed.html` - older Wix embed reference, not part of the GitHub Pages deployment workflow.

## Local Preview

Open `index.html` directly in a browser.

## GitHub Pages Deployment

This repo includes `.github/workflows/deploy-pages.yml`, which deploys the static site to GitHub Pages when changes are pushed to `main`.

The workflow publishes only the production site files:

- the eight public HTML pages
- `styles.css`
- `script.js`
- the currently used logo, icon, and hero assets

It intentionally does not publish the working copy document, the older Wix embed reference, screenshots, or unused saved images.

Before pushing, create a GitHub repository, add it as `origin`, and enable GitHub Pages with **GitHub Actions** as the source.
