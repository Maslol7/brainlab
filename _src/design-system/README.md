The look and the voice of מעבדת המוח, a phone game that trains a 12-year-old for the gifted exam. One dark night sky, five worlds that change only the accent, three surface tiers, big 3D buttons, and short warm Hebrew. It should feel like a polished phone game, not a web page. Everything here is copied from the app's code (`src/styles/app.css`, `src/00-core/icons.js`).

## Content fundamentals

- **Language:** Hebrew, right to left. Numbers, equations and Latin text sit in an `ltr` span so `14 + 1 = 15` never flips.
- **Who speaks:** the game talks to the kid in second person, singular, by name ("יאללה, יונתן!"). Dad's notes speak as dad ("אבא גאה בך").
- **Gender:** every string has a male and a female form (Romi's profile). Never write "את/ה".
- **Sentences:** short, plain, one idea each. No em-dash, no exclamation chains, no emoji.
- **Praise the process, not the talent:** "עצרת, קראת, וזה עבד" rather than "אתה גאון". Cheers on a correct answer are one or two words: "בול!", "נכון!", "על האש!".
- **Mistakes are safe:** "יום קשה קורה לכולם. כל טעות נשמרה במחברת ותחזור אליך." Never shame, never red text alone.
- **Solutions teach:** the rule in one line, then the full calculation, one step per line.
- **Buttons are verbs from the kid's side:** "לשאלה הבאה", "לקרב!", "לא היום".

## Visual foundations

- **Ground:** `bg0` with a soft gradient to `bg1` and a fixed field of small stars. Never a light page.
- **Worlds:** the theme is the world (air, water, earth, fire, master). Only `acc` and `acc2` change. In the app, set `data-w` on `<html>`; here the themes mirror it.
- **Surfaces:** depth comes from three tiers, not from borders. `s1` is the card (lists, stats, tiles): a `line` hairline, the `hi` top highlight and a soft `sh1`. `s2` is raised: the one hero of a screen, the question card, modals; solid, with an accent wash from the top corner (`--hc`) and a real `sh2` shadow. `s3` is a well sunk into a surface: question visuals, inputs, progress tracks, the tab bar. Never nest two s1 cards.
- **Colour roles:** `acc` = go forward. `gold` = rewards and diamonds only. `violet` = boss fights and exam simulations. `good` / `bad` = right and wrong, always with a word or a shake as well.
- **Type:** titles, numbers and buttons in `display` (Fredoka, rounded); everything else in `body` (Rubik). One scale: 38 hero, 28 screen, 22 section, 18 card and button, 19 question, 16 body, 13 small, 12 eyebrow. Headings are heavy and tight; second lines are calm, in `muted`. Numbers are always tabular.
- **Spacing:** a 4px grid. 16px is the rhythm: `pad-card`, `gap-stack` and the side gutter. 24px above a section title. Rows use `gap-row`. Keep `nav-clearance` free at the bottom of every screen.
- **Radii:** `radius-hero` for raised surfaces, `radius-card` for cards, `radius-button` for buttons and options, `radius-pill` for chips, tags and the HUD capsule. Nothing is square.
- **Depth:** buttons stand on a solid 5px press (`press-primary`, `press-gold`, `press-boss`) and sink 3px when tapped. Disabled buttons lose colour and press. Surfaces lift with `sh1` and `sh2`; coloured glow comes only from `acc`, `gold` and `good`.
- **Touch:** every tap target is at least 44px; main buttons are 56px.
- **Motion:** quick and springy (0.3 to 0.6s). One entrance per screen: when a screen opens, its blocks rise in order once (not on every re-render). A new question slides in once. A correct answer pops, a wrong one shakes once, rewards burst into confetti. Always honour `prefers-reduced-motion`.
- **Chrome:** the HUD is the avatar ring, the name, and one capsule with streak, coins and diamonds. The bottom nav floats, with the current place in an `acc` pill.
- **Focus:** a 3px `acc` outline with a 2px offset.

## Iconography

- The app's own inline SVG set (`IC`), drawn on a 24px grid. Line icons take `currentColor`; flame, coin, star, cake, heart and the diamond carry their own colours.
- Characters (the kid's avatar, the bosses) are SVG built in code from simple shapes.
- No emoji in the interface.
