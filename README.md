# Reimagined Nutrition Wix Embed

Static source for a Reimagined Nutrition embed intended to be used inside a Wix HTML embed block.

## Files

- `wix-embed.html` - paste-ready embed code for Wix.
- `index.html`, `styles.css`, `script.js` - current standalone site files kept as source/reference.
- `assets/` - local image assets used by the standalone page.

The current Wix embed was pulled from the public Claude artifact at:
https://claude.ai/public/artifacts/ddaa59e3-87cd-4d5d-b48a-b524d0d52e17

## Wix Embed Workflow

1. Edit and test `wix-embed.html` locally.
2. In Wix, add an **Embed HTML** element.
3. Paste the contents of `wix-embed.html` into the embed code field.
4. Set the embed element height in Wix so the full content is visible.

If the embed uses images, host them publicly first and reference absolute `https://` URLs. Local files in `assets/` will not load from inside Wix unless they are uploaded or hosted.

## Local Preview

Open `wix-embed.html` directly in a browser for a quick preview. The standalone homepage can be previewed by opening `index.html`.
