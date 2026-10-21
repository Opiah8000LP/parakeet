# DWEEB bio

Static site for GitHub Pages. No build step, no dependencies, no external requests.

## Edit your info
Open `js/config.js`. Name, caption, sections, rows, links and the track list are all there.

## Music
Drop `1.mp3` and `1.png` (or `.jpg` / `.jpeg` / `.webp`) in any of the folders listed under
`player.folders` in `config.js`, then add `'1.mp3'` to `player.tracks`. That is all.
The player looks for the song in each folder in order, then for the cover with the same name
right next to it. The cover shows in the player and faintly behind the name, always in greys.

GitHub Pages cannot list folders, so a browser can only check places you name. Add your own
folder to `player.folders` if yours is not in the list. A name with a slash in it
(`'stuff/1.mp3'`) is used exactly as written.

Open the site through GitHub Pages or any web server. Opened straight from disk the music
plays but the page can only fake the reaction, because browsers hide the sound from files.

## How the page reacts
- Your cursor is the only light. It follows slowly and wanders when you stop.
- Every word listens to one slice of the music (left = bass, right = treble), so the text
  itself is the spectrum analyser. The bass opens the light and spreads the name.
- Redaction bars are made of one cell per hidden character. The music lights the cells.
  There is no text behind them, it is only the marker `<REDACTED_n>`.
- Clicking a redaction answers ACCESS DENIED.

## Redactions
Write `<REDACTED_7>` in any text in `config.js` (or `&lt;REDACTED_7&gt;` in `index.html`).
It becomes a bar exactly 7 characters wide. `js/redact.js` is standalone and reusable.

## Icons
All icons are PNG files in `assets/icons/`. Replace a file or change its path under
`assets.icons` in `config.js`. Favicon: `assets/favicon.png`.

## Files
- `js/config.js` your info and songs
- `js/redact.js` the redaction feature
- `js/player.js` draggable player, path finding, covers, music measuring
- `js/alive.js` the light, the words, the readouts
- `js/main.js` builds the page from the config

## Credits
Code style follows DWEEB // OS (IIFE modules on a shared `DW` namespace). Standard browser
APIs documented on MDN (Web Audio AnalyserNode, TreeWalker, MutationObserver, Pointer
Events). Spacing uses Fibonacci numbers and the layout splits at the golden ratio.
No third-party code is bundled.
