The look and the voice of מעבדת המוח, a phone game that trains a 12-year-old for the gifted exam. One dark night sky, five worlds that change only the accent, glass cards, big 3D buttons, and short warm Hebrew. Everything here is copied from the app's code (`src/styles/app.css`, `src/00-core/icons.js`).

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
- **Glass:** cards and options use `panel` with an `edge` border and a 6px backdrop blur. `edge2` marks the first card in line (the hero).
- **Colour roles:** `acc` = go forward. `gold` = rewards and diamonds only. `violet` = boss fights and exam simulations. `good` / `bad` = right and wrong, always with a word or a shake as well.
- **Type:** titles, numbers and buttons in `display` (Fredoka, rounded); everything else in `body` (Rubik). Use the styles `hero-title`, `section-title`, `card-title`, `button`, `question`, `answer`, `body`, `small`, `eyebrow`.
- **Spacing:** 16px is the rhythm: `pad-card`, `gap-stack` and the side gutter. Rows use `gap-row`. Keep `nav-clearance` free at the bottom of every screen.
- **Radii:** `radius-card` for cards, `radius-button` for buttons and options, `radius-pill` for chips and tags. Nothing is square.
- **Depth:** buttons stand on a solid 5px press (`press-primary`, `press-gold`, `press-boss`) and sink 3px when tapped. Cards have no drop shadow; glow comes only from `acc`, `gold` and `good`.
- **Touch:** every tap target is at least 44px; main buttons are 54px.
- **Motion:** quick and springy (0.3 to 0.6s). A correct answer pops, a wrong one shakes once, rewards burst into confetti. Always honour `prefers-reduced-motion`.
- **Focus:** a 3px `acc` outline with a 2px offset.

## Iconography

- The app's own inline SVG set (`IC`), drawn on a 24px grid. Line icons take `currentColor`; flame, coin, star, cake, heart and the diamond carry their own colours.
- Characters (the kid's avatar, the bosses) are SVG built in code from simple shapes.
- No emoji in the interface.
