// node tools/design-system.js <out-dir>: rebuilds the design-system files for מעבדת המוח from the app's real CSS and icons.
const fs = require('fs'), vm = require('vm'), path = require('path');
const SRC = '/home/claude/brainlab-src/src', OUT = process.argv[2];
const w = (p, s) => { fs.mkdirSync(path.dirname(OUT + '/project/' + p), { recursive: true }); fs.writeFileSync(OUT + '/project/' + p, s); };
const css = fs.readFileSync(SRC + '/styles/app.css', 'utf8');
// bundle.css = the app stylesheet without the token block (tokens.json is the one source for those values)
const a = css.indexOf(':root{\n  color-scheme:dark;'), b = css.indexOf('}', a) + 1;
const bundle = '/* מעבדת המוח: component styles, copied from src/styles/app.css. Token values live in tokens.json. */\n:root{color-scheme:dark}\n' + css.slice(0, a).replace(/^\/\*[\s\S]*?\*\/\n/, '') + css.slice(b);
w('components/bundle.css', bundle);
// icons from src/00-core/icons.js and the diamond
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(SRC + '/00-core/icons.js', 'utf8').replace(/^const IC/m, 'IC').replace(/^const coinS[^\n]*\n/m, '') + ';this.IC=IC;', ctx);
const IC = ctx.IC, DIA = /const DIA = '([^']+)'/.exec(fs.readFileSync(SRC + '/40-game/diamonds.js', 'utf8'))[1];

const C = (name, value, usage) => ({ name, value, usage });
const themes = [['air', 'אוויר (עולם 1)'], ['water', 'מים (עולם 2)'], ['earth', 'אדמה (עולם 3)'], ['fire', 'אש (עולם 4)'], ['master', 'עולם האלוף (5)']];
const accs = { air: ['#7fe3d6', '#c2f5ee'], water: ['#53a8ff', '#b5daff'], earth: ['#a6d45e', '#ddf2b8'], fire: ['#ff7a3d', '#ffc2a1'], master: ['#c9a7ff', '#efe4ff'] };
const per = i => Object.fromEntries(themes.map(([t]) => [t, accs[t][i]]));
const tokens = {
  name: 'מעבדת המוח', version: 1,
  meta: { source: 'code', paths: { tokens: ['src/styles/app.css'], icons: ['src/00-core/icons.js'] }, synced: '2026-10-29' },
  color: {
    note: 'One dark night-sky look. Each theme is a world of the journey: only the accent changes. In the app the world is set with data-w on <html>.',
    themes: themes.map(([id, name]) => ({ id, name })),
    tokens: [
      C('bg0', '#0a0f24', 'Page ground: the night sky. Also the ink on bright fills (on-acc).'),
      C('bg1', '#121a3c', 'Lower part of the sky gradient.'),
      C('bg2', '#1a2350', 'Raised dark fills, such as the nav bar.'),
      C('panel', 'rgba(255,255,255,0.065)', 'Glass panel fill: cards, answer options, chips. Always over bg0 with a 6px blur.'),
      C('panel2', 'rgba(255,255,255,0.1)', 'A slightly stronger glass: ghost buttons, the answer letter.'),
      C('edge', 'rgba(255,255,255,0.12)', 'Panel border.'),
      C('edge2', 'rgba(255,255,255,0.2)', 'Border of the hero card and other first-in-line panels.'),
      C('ink', '#f3f6ff', 'All main text, on bg0, bg1, bg2 and on panels.'),
      C('muted', '#a3aed6', 'Second-level text: explanations, captions, eyebrows. On bg0 and panels (8:1).'),
      C('dim', '#6b76a6', 'Quiet labels only, 14px and up or bold. About 4:1 on bg0: never for body text.'),
      C('acc', { air: accs.air[0], water: accs.water[0], earth: accs.earth[0], fire: accs.fire[0], master: accs.master[0] }, 'The world accent: primary buttons, the current progress dot, tags, focus ring, glows. Text on it uses on-acc.'),
      C('acc2', per(1), 'The light end of the primary button gradient (acc2 to acc).'),
      C('on-acc', '#0a0f24', 'Text and icons on acc and acc2 fills (over 9:1 in every world).'),
      C('air', '#7fe3d6', 'World colour: air. World banners, map, element icons.'),
      C('water', '#53a8ff', 'World colour: water.'),
      C('earth', '#a6d45e', 'World colour: earth.'),
      C('fire', '#ff7a3d', 'World colour: fire.'),
      C('gold', '#ffc845', 'Rewards only: diamonds talk, coins, stars, the champion question, the mistakes notebook, streak combo. Text on gold uses #2e2100.'),
      C('violet', '#a98bff', 'Boss fights and exam simulations: boss button, boss hero, the sim tile.'),
      C('good', '#46e0a0', 'Correct answer: option border, feedback box, progress dot, the celebration ring and sticker.'),
      C('bad', '#ff5c7a', 'Wrong answer and errors. Always with a word ("התשובה:") or a shake, never colour alone.'),
      C('paper', '#fffbf2', 'Reading passages: the paper card a story is printed on.'),
      C('paper-ink', '#2a2a33', 'Text on paper (13:1).'),
    ],
  },
  type: {
    fonts: [],
    families: { display: "'Fredoka', 'Rubik', 'Arial Hebrew', system-ui, sans-serif", body: "'Rubik', 'Arial Hebrew', 'Segoe UI', system-ui, sans-serif" },
    groups: [
      { name: 'Display', family: 'display', styles: [
        { name: 'hero-title', fontSize: '36.8px', lineHeight: 1, fontWeight: 700, sample: 'יאללה, יונתן!', usage: 'The big line of the hero card on the home screen.' },
        { name: 'stat-number', fontSize: '32px', lineHeight: 1, fontWeight: 700, sample: '78', usage: 'Big numbers in stat tiles: days to the exam, streak, missions.' },
        { name: 'screen-title', fontSize: '27.2px', lineHeight: 1, fontWeight: 700, sample: 'יונתן', usage: 'The name in the HUD at the top of each screen.' },
        { name: 'section-title', fontSize: '24px', lineHeight: 1.2, fontWeight: 700, sample: 'המסע', usage: 'Section headers (sec-h h3).' },
        { name: 'card-title', fontSize: '18.4px', lineHeight: 1.3, fontWeight: 700, sample: 'נכון! +15', usage: 'Feedback titles, tile titles, small card headings.' },
        { name: 'button', fontSize: '17.6px', lineHeight: 1.2, fontWeight: 700, sample: 'לשאלה הבאה', usage: 'Every .btn.' },
      ] },
      { name: 'Text', family: 'body', styles: [
        { name: 'question', fontSize: '17.9px', lineHeight: 1.55, fontWeight: 500, sample: 'איזה מספר מתאים במקום סימן השאלה?', usage: 'The question prompt.' },
        { name: 'answer', fontSize: '16.6px', lineHeight: 1.4, fontWeight: 400, sample: 'כשסוף סוף הופיעו עננים כהים, הם שמחו מאוד.', usage: 'Answer options.' },
        { name: 'body', fontSize: '16px', lineHeight: 1.5, fontWeight: 400, sample: 'כל טעות נשמרת במחברת וחוזרת אליך אחרי יום.', usage: 'Running text.' },
        { name: 'small', fontSize: '13.1px', lineHeight: 1.5, fontWeight: 400, sample: 'סונכרן לפני 2 דקות', usage: 'Captions and secondary lines, in muted.' },
        { name: 'eyebrow', fontSize: '11.8px', lineHeight: 1.4, fontWeight: 700, letterSpacing: '0.06em', sample: 'אוויר · משימה 12/75', usage: 'The label above a title, in muted.' },
      ] },
    ],
  },
  spacing: { tokens: [
    { name: 'gap-dots', value: '3px', usage: 'Between progress dots and level dots.' },
    { name: 'gap-chips', value: '8px', usage: 'Between chips and between stacked small cards.' },
    { name: 'gap-row', value: '10px', usage: 'Default gap inside a row (.row).' },
    { name: 'pad-option', value: '12px', usage: 'Inside an answer option.' },
    { name: 'gap-stack', value: '16px', usage: 'Between blocks of a screen (.stack).' },
    { name: 'pad-card', value: '16px', usage: 'Inside a card. The side gutter of the screen is the same 16px.' },
    { name: 'pad-hero', value: '18px', usage: 'Inside the hero card.' },
    { name: 'nav-clearance', value: '104px', usage: 'Bottom space so the fixed nav and the quiz footer never cover content.' },
  ] },
  radius: { tokens: [
    { name: 'radius-letter', value: '9px', usage: 'The letter square (א ב ג ד) inside an answer option.' },
    { name: 'radius-button', value: '16px', usage: 'Buttons, answer options, feedback box, hint box.' },
    { name: 'radius-card', value: '20px', usage: 'Cards and banners (--r in the code).' },
    { name: 'radius-tile', value: '22px', usage: 'Arcade tiles.' },
    { name: 'radius-pill', value: '999px', usage: 'Chips, tags, the combo badge, the celebration sticker.' },
  ] },
  shadow: { tokens: [
    { name: 'press-primary', value: '0 5px 0 #40726b, 0 10px 24px -8px rgba(127,227,214,0.45)', usage: 'The 3D press under a primary button (air world; the app mixes it from acc). On press it drops to 2px and the button moves down 3px.' },
    { name: 'press-gold', value: '0 5px 0 #a07510', usage: 'Under gold buttons (rewards, shop).' },
    { name: 'press-boss', value: '0 5px 0 #4b2fa3, 0 10px 24px -8px rgba(138,99,242,0.6)', usage: 'Under boss and simulation buttons.' },
    { name: 'glow-correct', value: '0 0 0 2px #46e0a0, 0 0 26px rgba(70,224,160,0.45)', usage: 'A correct answer while it celebrates.' },
  ] },
};
w('tokens.json', JSON.stringify(tokens, null, 1));

// tokens.css as the page compiles it (first file only; the page owns it after the first save)
let tc = '/* מעבדת המוח — generated from tokens.json */\n:root, [data-theme="air"] {\n';
tokens.color.tokens.forEach(t => { tc += `  --${t.name}: ${typeof t.value === 'string' ? t.value : t.value.air};\n`; });
tokens.shadow.tokens.forEach(t => { tc += `  --${t.name}: ${t.value};\n`; }); tc += '}\n';
themes.slice(1).forEach(([id]) => { tc += `[data-theme="${id}"] {\n  --acc: ${accs[id][0]};\n  --acc2: ${accs[id][1]};\n}\n`; });
tc += ':root {\n'; tokens.spacing.tokens.concat(tokens.radius.tokens).forEach(t => { tc += `  --${t.name}: ${t.value};\n`; });
tc += `  --font-display: ${tokens.type.families.display};\n  --font-body: ${tokens.type.families.body};\n}\n`;
tokens.type.groups.forEach(g => g.styles.forEach(s => { tc += `.${s.name} { font-family: var(--font-${g.family}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ''} }\n`; }));
w('tokens.css', tc);

// previews: the app's own markup, styled by bundle.css
const head = (group, h, sub) => `<!-- @dsCard group="${group}" height=${h}${sub ? ` subtitle="${sub}"` : ''} -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Rubik:wght@400;500;600;700&display=swap">
<style>:root{--f-display:var(--font-display);--f-body:var(--font-body);--r:var(--radius-card)}body{margin:0;padding:16px;background:var(--bg0);color:var(--ink);font-family:var(--font-body)}.demo{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}.lbl{font-size:12px;color:var(--muted);margin:0 0 6px}</style>
<div dir="rtl" lang="he">`;
const end = '</div>\n';
const P = {};
P.Button = head('Actions', 230) + `<div class="stack" style="max-width:420px"><button class="btn btn-primary btn-wide">יאללה, יונתן!</button><div class="row"><button class="btn btn-gold" style="flex:1">להמיר</button><button class="btn btn-boss" style="flex:1">לקרב!</button></div><div class="row"><button class="btn btn-ghost" style="flex:1">לא היום</button><button class="btn btn-primary" style="flex:1" disabled>בדיקה</button></div></div>` + end;
P.Chip = head('Actions', 120) + `<div class="demo"><button class="chip">+1</button><button class="chip hot">רצף 7</button><span class="tag">מילולי</span><span class="tag rev">מהמחברת · גרסה קלה</span><span class="combo">${IC.flame}3</span></div>` + end;
P.Card = head('Surfaces', 330) + `<div class="stack" style="max-width:440px"><section class="card hero"><div class="eyebrow">אוויר · משימה 12/75</div><div class="stage"><div class="grow"><div class="bubble">מי שעוצר לחשוב, מנצח.</div></div></div><h2>משימה 12</h2><p>קלאסי · 10 שאלות · 2 מהמחברת</p><button class="btn btn-primary btn-wide">יאללה, יונתן!</button></section><section class="card"><div class="eyebrow">לפי פרקים</div><p class="small muted" style="margin:6px 0 0">כרטיס רגיל: זכוכית כהה מעל השמיים.</p></section></div>` + end;
P.Banner = head('Surfaces', 200) + `<div class="stack" style="max-width:440px"><div class="banner">${DIA.replace('<svg', '<svg style="width:44px;height:44px;flex:none"')}<div class="grow"><b>+2 יהלומים של אבא!</b><div class="small muted">3 כוכבים במשימה 12 · משימה מושלמת</div></div></div><div class="banner">${IC.cake}<div class="grow">עוד 5 ימים ליום ההולדת!</div></div></div>` + end;
P.AnswerOption = head('Quiz', 400, 'States: open, selected, correct (celebrating), wrong, removed after a first wrong try') + `<div class="stack" style="max-width:440px;gap:10px">
<button class="opt"><span class="lt">א</span><span class="ob">הם התלוננו שיש יותר מדי מים בשדות.</span></button>
<button class="opt sel"><span class="lt">ב</span><span class="ob">נבחרה, עוד לא נבדקה</span></button>
<button class="opt ok yay" disabled><span class="lt">ג</span><span class="ob">כשסוף סוף הופיעו עננים כהים, הם שמחו מאוד.</span></button>
<button class="opt no" disabled><span class="lt">ד</span><span class="ob">לכן הם הפסיקו להסתכל על השמיים.</span></button>
<button class="opt gone" disabled><span class="lt">ה</span><span class="ob">נוסתה ונפסלה: נשארת אפורה בניסיון השני</span></button>
<div class="yay-sticker k-hit" style="position:relative;animation:none;align-self:flex-start"><span class="ys-ic">${IC.star}</span><b>בול!</b></div></div>` + end;
P.Feedback = head('Quiz', 380) + `<div class="stack" style="max-width:440px"><div class="fb ok"><h4>נכון! +15 <span class="tchip ok">32 שנ׳</span></h4><div class="rule"><span class="rt">הכלל</span>מוצאים את ההפרש בין כל שני מספרים, ואז את החוק של ההפרשים.</div></div>
<div class="fb no"><h4>התשובה: ג</h4><p class="solx">סדרת הפרשים: ההפרש בין כל שני מספרים גדל ב-2 בכל צעד.<span class="calc"><span><span class="ltr" dir="ltr">14 + 1 = 15</span></span><span><span class="ltr" dir="ltr">15 + 3 = 18</span></span><span><span class="ltr" dir="ltr">18 + 5 = 23</span></span><span><span class="ltr" dir="ltr">23 + 7 = <b>30</b></span></span></span></p><button class="qbug">יש בעיה בשאלה?</button></div></div>` + end;
P.Stats = head('Progress', 230) + `<div class="stack" style="max-width:440px"><div class="mini"><div><b>78</b><span>ימים למבחן</span></div><div><b>4</b><span>ימים ברצף</span></div><div><b>12/75</b><span>משימות</span></div></div>
<div class="pdots" style="display:flex"><i class="ok"></i><i class="ok"></i><i class="no"></i><i class="cur"></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
<div class="row"><span class="lvl">רמה <i class="on"></i><i class="on"></i><i></i><i></i></span></div></div>` + end;
P.Tile = head('Games', 260) + `<div class="tiles" style="max-width:440px"><button class="tile" style="--tc:var(--water)"><span class="ti">${IC.calc}</span><h4>ספרינט חשבון</h4><p>60 שניות של תרגילים בראש</p><span class="best">שיא: 14</span></button><button class="tile" style="--tc:var(--violet)"><span class="ti">${IC.keys}</span><h4>זיכרון פסנתר</h4><p>שמע, זכור, נגן בחזרה</p><span class="best">שיא: 7</span></button></div>` + end;
P.Nav = head('Navigation', 110) + `<div style="position:relative;height:80px"><nav class="nav four" style="position:absolute"><div class="in">${[['מסע', IC.home, 1], ['משחקים', IC.game], ['התקדמות', IC.chart], ['חנות', IC.shop]].map(([n, ic, on]) => `<button class="${on ? 'on' : ''}">${ic}${n}</button>`).join('')}</div></nav></div>` + end;
P.Icons = head('Foundations', 170, 'The app\'s inline SVG set (src/00-core/icons.js) and the diamond') + `<div class="demo" style="color:var(--ink)">${Object.entries(Object.assign({}, IC, { diamond: DIA })).map(([k, s]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:58px"><span style="width:28px;height:28px;display:block">${s.replace('<svg', '<svg style="width:28px;height:28px;display:block"')}</span><span class="lbl" style="margin:0" dir="ltr">${k}</span></div>`).join('')}</div>` + end;
P.Hint = head('Quiz', 300, 'The hint before an answer, and the stronger one after a first wrong try') + `<div class="stack" style="max-width:440px"><div class="hintbox"><span class="hi">${IC.bulb}</span><div><b>רמז</b><p>כתבו מה קורה בכל צעד: כמה עולה או יורד מ-3 ל-6, ומ-6 ל-11?</p></div></div><div class="retry"><span class="hi">${IC.bulb}</span><div><b>כמעט.</b> נסה שוב.<span class="rh"><span class="ltr" dir="ltr">3 × 2 = 6</span><br><span class="ltr" dir="ltr">6 + 5 = 11</span><br>שימו לב: יש שתי פעולות שמתחלפות.</span></div></div></div>` + end;
const docs = {
  Button: ['Button', 'The one tap target that moves the kid forward; a 3D press that sinks 3px when tapped.', `- \`btn-primary\`: the next step on a screen (start, next question, check). One per screen. Fill: \`acc2\` to \`acc\`, text \`on-acc\`, shadow \`press-primary\`.
- \`btn-gold\`: spending or getting rewards (shop, exchange, champion question). Shadow \`press-gold\`.
- \`btn-boss\`: boss fights and full simulations only. Shadow \`press-boss\`.
- \`btn-ghost\`: the quiet way out ("לא היום", "דלג"). Fill \`panel2\`.
- Add \`btn-wide\` for the main action of a card. Height is at least 54px: a 12-year-old thumb on a phone.
- Labels are short verbs from the kid's side: "יאללה!", "לשאלה הבאה", "לקרב!". No "אישור/ביטול" language in the game.`],
  Chip: ['Chip', 'Small rounded labels: `chip` is tappable, `tag` names a category, `combo` counts a streak.', `- \`chip\`: secondary choices (amounts, reasons, filters). \`chip.hot\` (gold) marks the one that matters now.
- \`tag\`: the category of a question, in the world accent. \`tag.rev\` (gold) marks a question from the mistakes notebook.
- \`combo\`: flame + number, gold, only from 2 correct answers in a row.`],
  Card: ['Card', 'Glass panels over the night sky; `hero` is the one card that says what to do next.', `- \`card\`: fill \`panel\`, border \`edge\`, radius \`radius-card\`, padding \`pad-card\`, 6px backdrop blur.
- \`hero\`: one per screen, at the top of the home screen: eyebrow, a speech bubble, a big title (\`hero-title\`), one line, one wide primary button. \`hero.boss\` uses violet.
- Do not nest cards. Do not give every block a card: section headers and lists sit on the sky.`],
  Banner: ['Banner', 'A warm gold strip for news the kid should feel good about: diamonds won, a birthday, a new song.', `- An icon at 44px, then one or two short lines. Bold the number or the thing won.
- Gold strip = good news. Errors never use a banner; they use \`bad\` text in place.
- At most two banners above a result.`],
  AnswerOption: ['AnswerOption', 'One answer of a multiple-choice question, with its letter (א ב ג ד) and its states.', `- States: open, \`sel\` (simulations: chosen, not judged), \`ok\` (correct, plus \`yay\` while it celebrates), \`no\` (wrong, a short shake), \`gone\` (tried and removed before the second try).
- The letter square keeps the option findable when the text is long. Pictures switch the list to a 2-column grid (\`opts grid\`).
- Correct answers celebrate: a \`good\` ring, a sticker with a short cheer ("בול!", "על האש!"), small confetti from the option. A streak of 3, a hard question or the champion question gets the gold sticker and more confetti. Respect reduced motion.`],
  Feedback: ['Feedback', 'The box under a question after it is answered: the result, the rule, and the full solution.', `- Title: a cheer and the points when correct, "התשובה: ג" when wrong, plus the time chip.
- \`rule\`: the one-line rule of this question type (\`LESSONS\`). "כלל חדש" the first time.
- The solution shows the calculation, one line per step, in a \`calc\` block. Numbers and math are always wrapped in \`ltr\`; the answer is bold gold.
- Correct: the solution is folded under "איך פותרים". Wrong: it is open.
- Ends with the quiet "יש בעיה בשאלה?" link.`],
  Stats: ['Stats', 'Numbers the kid tracks: the three mini stats, the progress dots of a mission, the level dots.', `- \`mini\`: three numbers in \`stat-number\`, a \`small\` label under each. Days to the exam always first.
- Progress dots: \`good\`, \`bad\`, current in \`acc\` with a glow, simulations in \`muted\` (no judgement until the end).
- Level dots: gold, 1 to 4.`],
  Tile: ['Tile', 'A game in the arcade: icon, name, one line, the best score.', `- Each tile sets \`--tc\` to a world colour or \`violet\`; the fill and the icon square mix from it.
- Two per row; \`wide\` spans the row for the notebook and the simulations.`],
  Nav: ['Nav', 'The fixed bottom bar with the four main places: journey, games, progress, shop.', `- Four items, icon over a word. The current one takes \`acc\`.
- Fixed to the bottom with the safe-area inset; screens keep \`nav-clearance\` free under their content.`],
  Hint: ['Hint', 'The question\'s own hint: a gold note with a bulb, written for this exact question.', `- Two levels, both from \`q.hint\`: the first when the kid taps "רמז" (points the eye), the second after a first wrong try (does the first step).
- A hint names this question\'s own numbers, words or parts. A tip that could fit any question of the type is not a hint.
- Never the answer. Numbers and math sit in \`ltr\` spans, one step per line.
- Gold (\`gold\`) marks help; it is never used for wrong answers.`],
  Icons: ['Icons', 'The app\'s own inline SVG icons, drawn on a 24px grid.', `- Inline SVG strings in \`IC\` (src/00-core/icons.js). Most take \`currentColor\`; flame, coin, star, cake and heart carry their own colours.
- Default 24px; 44px in banners, 66–70px in hero art.
- No emoji anywhere in the app.`],
};
for (const [k, html] of Object.entries(P)) w(`components/${k}/preview.html`, html);
for (const [k, [n, sum, body]] of Object.entries(docs)) w(`components/${k}/README.md`, `# ${n}\n\n${sum}\n\n${body}\n`);
console.log('ok', Object.keys(P).length);
