# מעבדת המוח: source

The app is plain JavaScript in classic scripts. The build joins them, in the order of `src/order.json`, into one page.
Every function has exactly one definition. Do not add "wrapper" layers (`const _f = f; f = function () {...}`); change the function itself.

## Layout
- `src/00-core`: profile, small utilities, constants, icons, sound
- `src/10-content`: question generators and banks. `registry.js` says which generator runs for each category.
- `src/20-learn`: lessons, rating, mistakes notebook, bug reports, think mode, praise, guided lessons, road to gifted
- `src/30-state`: sandbox, the saved state and its repair, backup
- `src/40-game`: progress, rewards, diamonds, the mission flow (start, answer, finish), arcade, songs, boss mini-games
- `src/50-family`: parent area, report, dad's notes and phone, check-in, gender text, profiles, guest
- `src/60-cloud`: Firebase sync and the parent channel
- `src/70-ui`: screens and binding
- `src/99-main`: start-up: one-time migrations and listeners
- `src/styles/app.css`, `src/static/*`: page head, PWA files

## סלטה: Romi's English app (`romi/`)
A second app, built by the same `tools/build.mjs` into `pwa/romi/` (https://maslol7.github.io/brainlab/romi/). It shares `src/00-core/util.js` and `sound.js`; everything else is in `romi/src` (order in `romi/order.json`) and `romi/styles.css`.
- Words: class lists come from the parent area (paste the teacher's message; words, Hebrew, emoji and date are read from it). `LIST0` in `romi/src/10-words.js` is the first list. Bonus packs and spelling families are in the same file.
- Engine (`30-engine.js`): every word climbs 7 steps (meet, meaning, spot the spelling, build from letters, hear and type, Hebrew to English, write the Hebrew meaning). A wrong answer steps down one and asks her to type the word again. Learned words come back after 1, 2, 4, 7 days.
- In-app keyboards on purpose: the iPhone keyboard autocorrects spelling.
- Cloud: same Firebase as the main app, its own family code. Romi's phone writes `brainlab/<code>.json`; dad's phone writes only `brainlab/<code>-p.json` (lists, note, messages, candies). Dad's voice recordings: `brainlab/<code>-v/<word>.json`, one child per word.
- Look: competition floor. Tokens at the top of `romi/styles.css` (light and dark). Fonts: Secular One (headings, scores), Heebo (Hebrew), Andika (English words, school letters).
- Dad's voice in one take (`82-vrec.js`): the words show one by one, dad taps after each; the recording is split at the taps, trimmed to the voice, normalized and kept as 12 kHz WAV per word. `splitByMarks` is the pure part.
- Test prep (`66-wand.js`): the Magic E wand game (listen and choose, long-vowel spelling, complete the sentence). Lists that ship with a version (`LIST_1104`, `LIST_EXAM`) are added once to phones that already have data (`S.seen.exam1123`).
- Extras (`75-extras.js`): birthday 3 April 2017 (gift, banner, countdown), general review, the speaking game (only where the browser has speech recognition), self-update (reloads once on the home screen when `version.json` changes).
- Tests: `romi/tests/run.sh` (flow and cloud), `node romi/tests/shots.js <url> <dir>` for screenshots.

## Commands
- `node tools/build.mjs`: build `dist/` (same version)
- `node tools/build.mjs --release`: next version, build, zip for GitHub Pages
- `tests/run-all.sh`: smoke, feature and flow tests on `dist/` (Playwright)

`tools/migrate.mjs` and `tools/consolidated/` are the record of the one-time move from the old versioned files (v11 to v23). They do not run again.

## Design system
`design-system/` holds the brand book, tokens and component cards (also published as the claude.ai Design System artifact "מעבדת המוח"). `node tools/design-system.js <dir>` rebuilds them from `src/styles/app.css` and the icons.
