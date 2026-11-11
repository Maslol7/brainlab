# Card

Three surface tiers over the night sky; `hero` is the one raised card that says what to do next.

- `card` (tier s1): fill `s1`, a `line` edge, the `hi` top highlight and `sh1`, radius `radius-card`, padding `pad-card`, 8px backdrop blur.
- Tier s2 (raised): `hero`, `res-hero`, `me-hero`, `intro-card`, the question card (`qcard`), modals and the diamonds box. Fill `s2` plus an accent wash from the top corner, radius `radius-hero`, shadow `sh2`. One per screen.
- Tier s3 (well): sunk areas inside a surface: question visuals, inputs, progress tracks, the tab bar, the intro's rules box.
- `hero`: eyebrow with a coloured dot, a speech bubble that points at the avatar, a big title (`hero-title`), one line, one wide primary button. The wash colour is `--hc` (the world accent by default; gold for the notebook, violet for boss and sims).
- `mini`: three numbers in one card, split by `line2` dividers, not three boxes.
- Do not nest cards. Do not give every block a card: section headers and lists sit on the sky.
