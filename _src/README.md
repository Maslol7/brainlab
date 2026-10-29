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

## Commands
- `node tools/build.mjs`: build `dist/` (same version)
- `node tools/build.mjs --release`: next version, build, zip for GitHub Pages
- `tests/run-all.sh`: smoke, feature and flow tests on `dist/` (Playwright)

`tools/migrate.mjs` and `tools/consolidated/` are the record of the one-time move from the old versioned files (v11 to v23). They do not run again.

## Design system
`design-system/` holds the brand book, tokens and component cards (also published as the claude.ai Design System artifact "מעבדת המוח"). `node tools/design-system.js <dir>` rebuilds them from `src/styles/app.css` and the icons.
