/* ---------- words: the class lists, bonus packs, spelling families, and the parser for the teacher's message ---------- */
const W = (en, he, em) => ({ en, he: Array.isArray(he) ? he : [he], em: em || '' });
/* the first list, from the teacher's message (dictation on 18.11.2026) */
const LIST0 = {
  id: 'c-2026-11-18', t: 'הכתבה 18.11', date: '2026-11-18', src: 'class', he: true,
  words: [W('Neighbor', ['שכן', 'שכנה'], '🏡'), W('Flower', 'פרח', '🌷'), W('Road', 'כביש', '🛣️'), W('Plane', 'מטוס', '✈️'), W('Mountain', 'הר', '⛰️'), W('Below', 'מתחת', '⬇️'), W('Between', 'בין', '↔️'), W('Grass', 'דשא', '🌱')],
};
/* bonus packs: her world. Hebrew writing is not asked here, only the English */
const PACKS = [
  { id: 'p-acro', t: 'אקרובטיקה', em: '🤸‍♀️', c: 'var(--pink)', words: [W('jump', 'לקפוץ', '🦘'), W('flip', ['סלטה', 'היפוך'], '🔄'), W('balance', 'שיווי משקל', '⚖️'), W('strong', ['חזק', 'חזקה'], '💪'), W('team', ['נבחרת', 'קבוצה'], '👯‍♀️'), W('coach', ['מאמן', 'מאמנת'], '📣'), W('stretch', ['מתיחה', 'למתוח'], '🧘‍♀️'), W('medal', 'מדליה', '🥇'), W('trophy', 'גביע', '🏆'), W('practice', ['אימון', 'להתאמן'], '⏱️')] },
  { id: 'p-sweet', t: 'ממתקים', em: '🍬', c: 'var(--gold)', words: [W('candy', ['ממתק', 'סוכרייה'], '🍬'), W('chocolate', 'שוקולד', '🍫'), W('sugar', 'סוכר', '🧂'), W('cookie', 'עוגייה', '🍪'), W('sweet', 'מתוק', '🍭'), W('honey', 'דבש', '🍯'), W('cupcake', 'קאפקייק', '🧁'), W('lollipop', 'סוכרייה על מקל', '🍭'), W('donut', 'סופגנייה', '🍩')] },
  { id: 'p-friends', t: 'חברות', em: '👭', c: 'var(--mint)', words: [W('friend', ['חבר', 'חברה'], '👭'), W('together', 'ביחד', '🤝'), W('share', ['לשתף', 'לחלוק'], '🍪'), W('laugh', 'לצחוק', '😂'), W('secret', 'סוד', '🤫'), W('play', 'לשחק', '🎲'), W('hug', 'חיבוק', '🤗'), W('happy', ['שמח', 'שמחה'], '😊'), W('party', 'מסיבה', '🎉')] },
  { id: 'p-elements', t: 'ארבעה יסודות', em: '🌀', c: 'var(--sky)', words: [W('air', 'אוויר', '💨'), W('water', 'מים', '💧'), W('earth', ['אדמה', 'כדור הארץ'], '🌍'), W('fire', 'אש', '🔥'), W('wind', 'רוח', '🌬️'), W('wave', 'גל', '🌊'), W('stone', 'אבן', '🪨'), W('flame', 'להבה', '🕯️'), W('arrow', 'חץ', '🏹'), W('sky', 'שמיים', '☁️')] },
  { id: 'p-bday', t: 'יום הולדת', em: '🎂', words: [W('birthday', 'יום הולדת', '🎂'), W('cake', 'עוגה', '🍰'), W('candle', 'נר', '🕯️'), W('gift', 'מתנה', '🎁'), W('balloon', 'בלון', '🎈'), W('wish', 'משאלה', '🌠'), W('ten', 'עשר', '🔟'), W('celebrate', 'לחגוג', '🥳')] },
  { id: 'p-dad', t: 'אבא ואני', em: '❤️', c: 'var(--rose)', words: [W('dad', 'אבא', '👨'), W('love', 'אהבה', '❤️'), W('family', 'משפחה', '👨‍👩‍👧‍👦'), W('home', 'בית', '🏠'), W('proud', ['גאה', 'גאים'], '🌟'), W('smile', 'חיוך', '😊'), W('kiss', 'נשיקה', '😘'), W('brother', 'אח', '👦')] },
];
/* spelling families: a chunk from her class words, with a short tip and more words that share it */
const FAMILIES = [
  { id: 'f-ee', ch: 'ee', test: w => /ee/.test(w), tip: 'שתי e ביחד נשמעות כמו "אִי" ארוך.', words: [W('tree', 'עץ', '🌳'), W('green', 'ירוק', '🟢'), W('sleep', 'לישון', '😴'), W('sweet', 'מתוק', '🍬'), W('queen', 'מלכה', '👸'), W('feet', 'רגליים', '🦶')] },
  { id: 'f-be', ch: 'be', test: w => /^be/.test(w), tip: 'הרבה מילים של מקום וזמן מתחילות ב-be.', words: [W('behind', 'מאחורי', '🔙'), W('before', 'לפני', '⏮️'), W('beside', ['ליד', 'לצד'], '👫'), W('begin', 'להתחיל', '🏁'), W('because', ['כי', 'בגלל'], '🤔')] },
  { id: 'f-owo', ch: 'ow', test: w => /ow$/.test(w), tip: 'ow בסוף מילה נשמע לרוב כמו "אוֹ".', words: [W('snow', 'שלג', '❄️'), W('slow', 'לאט', '🐢'), W('grow', 'לגדול', '🌱'), W('yellow', 'צהוב', '💛'), W('window', 'חלון', '🪟'), W('rainbow', 'קשת בענן', '🌈')] },
  { id: 'f-owa', ch: 'ow', test: w => /ow(er|n)/.test(w), tip: 'ow באמצע מילה נשמע לפעמים כמו "אַאוּ". אותן אותיות, צליל אחר.', words: [W('tower', 'מגדל', '🗼'), W('power', 'כוח', '⚡'), W('shower', 'מקלחת', '🚿'), W('town', 'עיירה', '🏘️'), W('clown', 'ליצן', '🤡'), W('crown', 'כתר', '👑')] },
  { id: 'f-oa', ch: 'oa', test: w => /oa/.test(w), tip: 'oa נשמע כמו "אוֹ". ה-a שקטה.', words: [W('boat', 'סירה', '⛵'), W('coat', 'מעיל', '🧥'), W('goat', 'עז', '🐐'), W('soap', 'סבון', '🧼'), W('toast', 'טוסט', '🍞')] },
  { id: 'f-ae', ch: 'a_e', test: w => /a[^aeiou]e$/.test(w), tip: 'e בסוף מילה היא e קסומה: לא שומעים אותה, אבל בגללה ה-a נשמעת "אֵיי". plan ← plane.', words: [W('cake', 'עוגה', '🎂'), W('lake', 'אגם', '🏞️'), W('name', 'שם', '📛'), W('game', 'משחק', '🎮'), W('snake', 'נחש', '🐍'), W('skate', 'להחליק', '🛼')] },
  { id: 'f-ss', ch: 'ss', test: w => /ss$/.test(w), tip: 'בסוף מילה קצרה כותבים לרוב s כפולה.', words: [W('glass', ['כוס', 'זכוכית'], '🥛'), W('class', 'כיתה', '🏫'), W('dress', 'שמלה', '👗'), W('kiss', 'נשיקה', '😘'), W('chess', 'שחמט', '♟️'), W('mess', 'בלגן', '🌀')] },
  { id: 'f-ain', ch: 'ain', test: w => /ain/.test(w), tip: 'ain נשמע כמו "אֵין". ב-mountain כמעט לא שומעים אותו, אז זוכרים: mount + ain.', words: [W('rain', 'גשם', '🌧️'), W('train', 'רכבת', '🚆'), W('brain', 'מוח', '🧠'), W('chain', 'שרשרת', '⛓️'), W('paint', 'לצבוע', '🎨'), W('fountain', 'מזרקה', '⛲')] },
  { id: 'f-eigh', ch: 'eigh', test: w => /eigh/.test(w), tip: 'eigh נשמע כמו "אֵיי". ה-gh שקטה לגמרי, לא שומעים אותה.', words: [W('eight', 'שמונה', '8️⃣'), W('weigh', 'לשקול', '⚖️'), W('weight', 'משקל', '🏋️'), W('sleigh', 'מזחלת', '🛷'), W('eighty', 'שמונים', '💯')] },
];
const famOf = en => FAMILIES.filter(f => f.test(en.toLowerCase()));
/* ---------- parse a pasted message (WhatsApp from the teacher, or plain lines) ---------- */
const EMO_RE = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|️⃣)*/u;
function parseList(text) {
  const out = { words: [], date: '' };
  const lines = String(text || '').split(/\r?\n/);
  for (let raw of lines) {
    const numbered = /^\s*\d{1,2}\s*[.)\-]\s*/.test(raw);
    let s = raw.replace(/^\s*\d{1,2}\s*[.)\-]\s*/, '');
    const em = (s.match(EMO_RE) || [''])[0] || ((s.match(/[0-9]️⃣/) || [''])[0]);
    const en = (s.match(/[A-Za-z]+(?:[ '\-][A-Za-z]+)*/) || [''])[0].trim();
    if (!en || en.split(' ').length > 3) continue;
    const heRaw = s.replace(/[A-Za-z]+/g, ' ').replace(EMO_RE, ' ').replace(/[֑-ׇ]/g, '');
    const he = heRaw.split(/[\/,;|]|\sאו\s/).map(x => (x.match(/[א-ת]+(?:[ '"״׳\-][א-ת]+)*/) || [''])[0].trim()).filter(Boolean);
    if (!he.length && !numbered) continue;
    if (out.words.some(w => w.en.toLowerCase() === en.toLowerCase())) continue;
    out.words.push({ en, he, em });
  }
  const m = /(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/.exec(text || '');
  if (m) {
    const d = +m[1], mo = +m[2]; let y = m[3] ? +m[3] : new Date().getFullYear(); if (y < 100) y += 2000;
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) {
      let ds = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (!m[3] && dayDiff(todayStr(), ds) < -60) ds = `${y + 1}-${ds.slice(5)}`;
      out.date = ds;
    }
  }
  return out;
}
/* ---------- the English test on 23.11.2026 (My Way 2, unit 1): Magic E and long vowel sounds ----------
   The book's vocabulary pages are behind the school's login, so this list covers the two spelling topics the teacher named. */
const LIST_EXAM = {
  id: 'e-2026-11-23', t: 'מבחן 23.11', date: '2026-11-23', src: 'class', kind: 'exam', he: false,
  words: [W('cape', 'גלימה', '🦸'), W('kite', 'עפיפון', '🪁'), W('bike', 'אופניים', '🚲'), W('home', 'בית', '🏠'), W('bone', 'עצם', '🦴'), W('cube', 'קובייה', '🧊'), W('tube', 'שפופרת', '🧴'), W('five', 'חמש', '🖐️'),
    W('rain', 'גשם', '🌧️'), W('play', 'לשחק', '🎲'), W('tree', 'עץ', '🌳'), W('sea', 'ים', '🌊'), W('boat', 'סירה', '⛵'), W('snow', 'שלג', '❄️'), W('night', 'לילה', '🌙'), W('blue', 'כחול', '🔵')],
};
/* Magic E pairs: the E at the end makes the vowel say its name */
const MAGIC = [['cap', 'cape', 'כובע', 'גלימה'], ['kit', 'kite', 'ערכה', 'עפיפון'], ['hop', 'hope', 'לקפץ', 'תקווה'], ['tub', 'tube', 'אמבט', 'שפופרת'], ['plan', 'plane', 'תוכנית', 'מטוס'], ['pin', 'pine', 'סיכה', 'אורן'], ['not', 'note', 'לא', 'פתק'], ['cub', 'cube', 'גור', 'קובייה'], ['can', 'cane', 'פחית', 'מקל הליכה'], ['bit', 'bite', 'קצת', 'לנגוס'], ['rob', 'robe', 'לשדוד', 'חלוק'], ['mad', 'made', 'כועס', 'עשה']];
/* long vowel teams: the same sound, different spellings */
const VOWEL_TEAMS = [['rain', ['rane', 'rayn']], ['play', ['plai', 'plae']], ['tree', ['trea', 'trie']], ['sea', ['see', 'sie']], ['boat', ['bote', 'bowt']], ['snow', ['snoe', 'snoa']], ['night', ['nite', 'niht']], ['blue', ['bloo', 'blew']], ['train', ['trane', 'trayn']], ['green', ['grean', 'grene']], ['coat', ['cote', 'cowt']], ['light', ['lite', 'liht']]];
/* complete the sentence (like the test) */
const SENTENCES = [['I fly my ___ in the park.', 'kite'], ['The ___ is in the sky.', 'plane'], ['I ride my ___ to school.', 'bike'], ['My dog eats a ___.', 'bone'], ['I go ___ after school.', 'home'], ['We swim in the ___.', 'sea'], ['The ___ is tall and green.', 'tree'], ['I sail in a ___.', 'boat'], ['Let\'s ___ a game!', 'play'], ['The hero has a red ___.', 'cape'], ['An ice ___ is cold.', 'cube'], ['I have ___ fingers on my hand.', 'five'], ['Take an umbrella. It is ___ing.', 'rain'], ['At ___ I see the moon.', 'night'], ['The sky is ___.', 'blue'], ['In winter there is ___ on the mountain.', 'snow']];
/* the dictation on 4.11.2026 (unit 1, London). It has passed; its words stay in the general review */
const LIST_1104 = {
  id: 'c-2026-11-04', t: 'הכתבה 4.11', date: '2026-11-04', src: 'class', he: true,
  words: [W('Live', 'לחיות', '💓'), W('Palace', 'ארמון', '🏰'), W('Home', 'בית', '🏠'), W('Flag', 'דגל', '🇬🇧'), W('Tour', 'סיור', '🗺️'), W('Bus', 'אוטובוס', '🚌'), W('Clock', 'שעון', '🕰️'), W('Scone', ['לחמניית סקון', 'סקון'], '🥯'), W('Game', 'משחק', '🎲')],
};
SENTENCES.push(['The king lives in a ___.', 'palace'], ['I ride a red ___ in London.', 'bus'], ['Big Ben is a big ___.', 'clock'], ['I eat a ___ with jam.', 'scone'], ['We go on a ___ of the city.', 'tour']);
const SENT_WORDS = () => [...new Set([...LIST_EXAM.words, ...LIST_1104.words].map(x => x.en.toLowerCase()))];
