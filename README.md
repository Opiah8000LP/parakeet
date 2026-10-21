# DWEEB bio

Static site for GitHub Pages. No build step, no dependencies, no external requests.

## Edit your info
Open `js/config.js`. Name, caption, sections, rows, links and the track list are all there.

## Redactions
Write `<REDACTED_7>` in any text in `config.js` (or `&lt;REDACTED_7&gt;` in `index.html`).
It becomes a black bar exactly 7 characters wide. Only the marker exists in the source.

## Music
Put audio files in `assets/music/` and add them to `player.tracks` in `config.js`.
The page reaction needs the site served over http(s) (GitHub Pages is fine). Opening
`index.html` straight from disk still plays music but the reaction stays still.

## Icons
All icons are PNG files in `assets/icons/`. Replace a file, or change its path under
`assets.icons` in `config.js`. Favicon: `assets/favicon.png`.

## Publish
Push the folder to a GitHub repo, then Settings > Pages > deploy from branch.
Set `osUrl` and `links` in `config.js` to your DWEEB // OS address.

## Credits
Code style follows DWEEB // OS (IIFE modules on a shared `DW` namespace). The tree walker /
MutationObserver text-replacement pattern and the Web Audio analyser setup are standard
browser API patterns from the MDN documentation (https://developer.mozilla.org). No
third-party code is bundled.
