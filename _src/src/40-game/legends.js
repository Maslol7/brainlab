/* ---------- great football moments ----------
   Six famous moves. Each one: the story, a replay of what really happened, then the player tries it.
   Pitch in meters: x 0..68 across, y 0 at the goal line, growing toward the halfway line (52.5).
   Controls: tap a teammate = pass, tap the goal mouth = shoot there, tap or drag elsewhere = run there. */
const LFC_KIT = { shirt: '#D00027', shorts: '#D00027', socks: '#D00027' };
const LGM = [
  { id: 'istanbul', t: 'הנס של איסטנבול', yr: 2005, match: 'גמר ליגת האלופות · ליברפול מול מילאן', kit: LFC_KIT, kit2: { shirt: '#F4F4F4', shorts: '#F4F4F4', socks: '#F4F4F4', numCol: '#111' }, nums: { gerrard: 8, riise: 6, baros: 5 }, ab: { gerrard: ['header'] }, crowd: ['#D00027', '#F4F4F4', '#D00027', '#1B1B1F', '#C8102E'], view: [3, 47, 40], T: 10,
    story: 'במחצית מילאן מובילה 3-0. כולם חושבים שזה נגמר. דקה 54: יון ארנה ריסה מקבל את הכדור באגף שמאל, וסטיבן ג\'רארד רץ לרחבה.',
    task: 'אתה ריסה. חכה שג\'רארד ייכנס לרחבה, ואז החלק את האצבע מריסה אליו כדי להגביה. כשהכדור באוויר, החלק לפינה של השער: ג\'רארד ינגח.',
    after: 'ג\'רארד נגח לרשת. תוך 6 דקות ליברפול השוותה ל-3-3, עם שערים של שמיצר ואלונסו, וניצחה בפנדלים.',
    lesson: 'לא מוותרים, גם כשמפגרים 3-0.',
    us: [['riise', 'ריסה', 8, 22], ['gerrard', 'ג\'רארד', 36, 31, [[35, 22], [33, 11]], 6.4, .3], ['baros', 'באורש', 44, 14]],
    opp: [['press', 'מגן', 15, 15, 'press', 1.5], ['nesta', 'מגן', 39, 15, 'mark:gerrard', 3.6], ['stam', 'מגן', 42, 9, 'mark:baros', 4], ['dida', 'דידה', 34, 1, 'keeper']],
    ball: 'riise',
    rp: { T: 3.6, cap: [[0, 'ריסה מחכה לריצה של ג\'רארד'], [1.6, 'הגבהה לרחבה'], [2.6, 'נגיחה לפינה הרחוקה']],
      tr: { gerrard: [[0, 36, 30], [1.6, 34, 16], [2.5, 33, 11]], nesta: [[0, 39, 15], [2.5, 35, 12]], dida: [[0, 34, 1], [2.7, 35.5, 1]] },
      ball: [[0, 'riise'], [1.6, 'riise'], [2.5, 'gerrard'], [3.0, 30.8, -.6]], loft: [2.5] } },
  { id: 'origi', t: 'הקרן המהירה', yr: 2019, match: 'חצי גמר ליגת האלופות · ליברפול 4-0 ברצלונה', kit: LFC_KIT, kit2: { shirt: '#A50044', stripe: '#1D4FA0', shorts: '#1D4FA0', socks: '#A50044' }, nums: { trent: 66, origi: 27, vandijk: 4 }, ab: { trent: ['vision'] }, crowd: ['#D00027', '#D00027', '#F4F4F4', '#C8102E'], view: [27, 70, 30], T: 7,
    story: 'ליברפול הפסידה 3-0 במשחק הראשון, ובאנפילד כבר הובילה 3-0. דקה 79: קרן לליברפול. שחקני ברצלונה מסתובבים ומתארגנים לאט.',
    task: 'אתה טרנט אלכסנדר-ארנולד. ההגנה לא מסתכלת. החלק את האצבע לאוריגי כדי למסור מהר, ואז החלק לפינה של השער. אם תחכה, הם יתעוררו.',
    after: 'טרנט התחיל ללכת מהקרן, חזר ובעט מהר. אוריגי בעט מיד לפינה העליונה. ליברפול עלתה לגמר וזכתה בגביע.',
    lesson: 'מי ששם לב למה שאחרים מפספסים, מקדים אותם.',
    us: [['trent', 'טרנט', 67.3, .8], ['origi', 'אוריגי', 31, 7], ['vandijk', 'ואן דייק', 40, 12]],
    opp: [['b1', 'מגן', 30, 11, 'wake:origi:3.2', 6.5], ['b2', 'מגן', 37, 8, 'wake:origi:3.6', 6], ['b3', 'מגן', 44, 6, 'wake:trent:4', 6], ['ts', 'טר שטגן', 34, 1.2, 'keeper']],
    ball: 'trent',
    rp: { T: 3.4, cap: [[0, 'טרנט מתחיל ללכת מהקרן...'], [1.0, '...חוזר ומוסר מהר'], [2.3, 'אוריגי בועט מיד']],
      tr: { trent: [[0, 67.3, .8], [.6, 64, 3], [1.0, 67.3, .8]], b1: [[0, 30, 11], [3.4, 27, 15]], b2: [[0, 37, 8], [3.4, 38, 13]], b3: [[0, 44, 6], [3.4, 47, 11]] },
      ball: [[0, 'trent'], [1.2, 'trent'], [2.1, 'origi'], [2.6, 33.2, -.6]] } },
  { id: 'cruyff', t: 'התפנית של קרויף', yr: 1974, match: 'מונדיאל · הולנד מול שוודיה', kit: { shirt: '#FF7A1A', shorts: '#F4F4F4', socks: '#FF7A1A' }, kit2: { shirt: '#FFD21F', shorts: '#1D4FA0', socks: '#FFD21F', numCol: '#1D4FA0' }, nums: { cruyff: 14 }, ab: { cruyff: ['turn'] }, crowd: ['#FF7A1A', '#FFD21F', '#F4F4F4', '#1D4FA0'], tackleTip: 'אי אפשר לברוח ממנו סתם: חכה שיתקרב, ואז תפנית.', view: [4, 46, 30], T: 10, special: 'turn',
    story: 'יוהאן קרויף עומד ליד הרחבה עם הגב לשער. המגן השוודי יאן אולסון צמוד אליו ומחכה שיבעט.',
    task: 'לחץ "תפנית" כשאולסון ממש קרוב. קרויף יעשה כאילו הוא בועט, יגרור את הכדור מאחורי הרגל ויסתובב. אחר כך החזק וגרור לכיוון השער, והחלק לשער כדי לבעוט.',
    after: 'אולסון נשאר מבולבל, והתנועה קיבלה את השם "תפנית קרויף". המשחק עצמו נגמר 0-0, אבל את המהלך מלמדים עד היום.',
    lesson: 'לגרום ליריב לחשוב שתעשה דבר אחד, ואז לעשות דבר אחר.',
    us: [['cruyff', 'קרויף', 15, 19], ['rep', 'רפ', 40, 16]],
    opp: [['olsson', 'אולסון', 19, 10, 'cruyff', 7.4], ['d2', 'מגן', 34, 9, 'mark:rep', 4.5], ['hell', 'הלסטרום', 34, 1, 'keeper']],
    ball: 'cruyff',
    rp: { T: 3.2, cap: [[0, 'אולסון מתקרב'], [.9, 'כאילו בעיטה... וגרירה מאחורי הרגל'], [1.6, 'קרויף כבר בדרך']],
      tr: { cruyff: [[0, 15, 19], [.9, 15, 18], [1.3, 13, 16], [3.2, 9, 8]], olsson: [[0, 19, 10], [.9, 15.5, 16.5], [1.6, 18, 20], [3.2, 13, 13]] },
      ball: [[0, 'cruyff']] } },
  { id: 'maradona', t: 'שער המאה', yr: 1986, match: 'רבע גמר המונדיאל · ארגנטינה מול אנגליה', kit: { shirt: '#1D2F6F', shorts: '#15151A', socks: '#1D2F6F' }, kit2: { shirt: '#F4F4F4', shorts: '#1D2546', socks: '#F4F4F4' }, nums: { diego: 10 }, ab: { diego: ['dribble'] }, crowd: ['#6FB4E8', '#F4F4F4', '#F2D16B', '#D00027', '#F4F4F4'], tackleTip: 'חפש את הרווח בין המגינים, ואל תרוץ ישר אליהם.', view: [18, 60, 55], T: 15,
    story: 'דייגו מראדונה מקבל את הכדור ליד קו האמצע. בינו לבין השער: כמה שחקנים אנגלים והשוער פיטר שילטון.',
    task: 'החזק את האצבע על המגרש וגרור כדי להוביל את הכדור. אסור שמגן ייגע בך. ליד השוער: עקוף אותו והחלק לשער.',
    after: 'מראדונה רץ כ-60 מטר, עקף כמה שחקנים ואת השוער, והבקיע. בסקר של פיפ"א ב-2002 השער נבחר ל"שער המאה".',
    lesson: 'להסתכל קדימה ולמצוא את הרווח, לפני שמגיעים אליו.',
    us: [['diego', 'מראדונה', 38, 52, null, 7.6]],
    opp: [['e1', 'מגן', 33, 45, 'press:11', 5.2], ['e2', 'מגן', 46, 37, 'press:10', 5], ['e3', 'מגן', 31, 28, 'press:10', 5.4], ['e4', 'מגן', 41, 17, 'press:9', 5.6], ['shilton', 'שילטון', 34, 1, 'keeper']],
    ball: 'diego',
    rp: { T: 7.2, cap: [[0, 'מתחיל ליד קו האמצע'], [2.4, 'עוקף אחד אחרי השני'], [5.6, 'עוקף גם את השוער']],
      tr: { diego: [[0, 38, 52], [1.3, 42, 44], [2.6, 45, 34], [3.9, 42, 24], [5.0, 39, 14], [6.0, 37, 6], [6.6, 33, 3.5]], e1: [[0, 33, 45], [1.3, 39, 45], [2.6, 41, 40]], e2: [[0, 44, 38], [2.6, 42, 36], [3.9, 45, 30]], e3: [[0, 30, 28], [3.9, 39, 26], [5.0, 41, 18]], e4: [[0, 41, 18], [5.0, 37, 16], [6.0, 39, 9]], shilton: [[0, 34, 1], [6.0, 36, 4], [6.6, 36.5, 5]] },
      ball: [[0, 'diego'], [6.6, 'diego'], [7.1, 33, -.6]] } },
  { id: 'olympiacos', t: 'בעיטת הניצחון של ג\'רארד', yr: 2004, match: 'ליגת האלופות · ליברפול מול אולימפיאקוס', kit: LFC_KIT, kit2: { shirt: '#F4F4F4', stripe: '#C8102E', shorts: '#F4F4F4', socks: '#C8102E', numCol: '#111' }, nums: { gerrard: 8 }, ab: { gerrard: ['power'] }, crowd: ['#D00027', '#D00027', '#F4F4F4', '#C8102E'], view: [14, 56, 36], T: 8,
    story: 'ליברפול חייבת לנצח בהפרש של שני שערים כדי להמשיך בטורניר. 2-1, דקה 86. ניל מלור מוריד את הכדור בראש, וסטיבן ג\'רארד מגיע מבחוץ.',
    task: 'החלק לג\'רארד כדי למסור. אפשר להחליק לשער עוד לפני שהכדור מגיע: ג\'רארד יבעט מיד, בלי לעצור. קו מעוקל = בעיטה מסובבת.',
    after: 'ג\'רארד בעט מ-25 מטר לרשת. 3-1, ליברפול עלתה, ובסוף העונה זכתה בגביע באיסטנבול.',
    lesson: 'להתכונן מראש, כדי לפעול מיד כשההזדמנות מגיעה.',
    us: [['mellor', 'מלור', 31, 13], ['gerrard', 'ג\'רארד', 40, 34, [[37, 25]], 6.5, .2]],
    opp: [['o1', 'מגן', 28, 9.5, 'press', .9], ['o2', 'מגן', 35, 9.5, 'press', .8], ['o3', 'מגן', 48, 27, 'mark:gerrard', 4.6], ['nik', 'שוער', 34, 1, 'keeper']],
    ball: 'mellor',
    rp: { T: 3.1, cap: [[0, 'מלור מוריד את הכדור'], [1.6, 'ג\'רארד בועט מיד']],
      tr: { gerrard: [[0, 40, 34], [1.6, 37, 25]], o3: [[0, 48, 27], [1.8, 41, 25]], nik: [[0, 34, 1], [2.3, 35.2, 1]] },
      ball: [[0, 'mellor'], [.9, 'mellor'], [1.6, 'gerrard'], [2.4, 31.4, -.6]] } },
  { id: 'dalglish', t: 'הלוב של דלגליש', yr: 1978, match: 'גמר הגביע האירופי · ליברפול מול קלאב ברוז\'', kit: LFC_KIT, kit2: { shirt: '#1B1B1F', stripe: '#1D5BBF', shorts: '#1B1B1F', socks: '#1B1B1F' }, nums: { kenny: 7 }, crowd: ['#D00027', '#D00027', '#F4F4F4', '#1D5BBF', '#1B1B1F'], saveTip: 'השוער יצא וחסם את הבעיטה. בדיוק בשביל זה יש לוב.', view: [18, 60, 30], T: 9, special: 'chip',
    story: '0-0 בוומבלי. גרהם סונס מוסר לקני דלגליש לתוך הרחבה, והשוער בירגר ינסן יוצא אליו מהר.',
    task: 'החלק לדלגליש כדי למסור. השוער ירוץ אליו, ובעיטה רגילה תפגע בו. לחץ "לוב" והחלק לשער: הכדור יעבור מעל השוער שיצא.',
    after: 'דלגליש הרים את הכדור מעל ינסן לרשת. 1-0, וליברפול זכתה בגביע האירופי בפעם השנייה ברציפות.',
    lesson: 'בוחרים את הפתרון לפי המצב, לא תמיד את אותו פתרון.',
    us: [['souness', 'סונס', 36, 22], ['kenny', 'דלגליש', 46, 13, [[45, 9.5]], 4, .5]],
    opp: [['c1', 'מגן', 39, 16, 'press', 1.6], ['c2', 'מגן', 51, 6, 'mark:kenny', 3], ['jensen', 'ינסן', 34, 1, 'rush', 6.6]],
    ball: 'souness',
    rp: { T: 3.4, cap: [[0, 'סונס מוסר לרחבה'], [1.4, 'ינסן יוצא'], [2.3, 'לוב מעל השוער']],
      tr: { kenny: [[0, 46, 13], [1.2, 45, 9.5]], jensen: [[0, 34, 1], [1.4, 38, 3], [2.2, 41.5, 5.5]] },
      ball: [[0, 'souness'], [.4, 'souness'], [1.2, 'kenny'], [2.2, 'kenny'], [3.2, 35.5, -.6]], loft: [3.2] } },
];
/* ----- player cards: earned with coins, by winning moments, or by climbing the challenge ----- */
const LG_CARDS = [
  { id: 'me', n: () => ME.name, team: 'me', rar: 1, ab: [], how: { free: 1 }, num: 9, fact: 'השחקן שלך. בלי יכולת מיוחדת, אבל עם הרבה מוטיבציה.' },
  { id: 'rush', n: 'ראש', full: 'איאן ראש', team: 'lfc', rar: 1, ab: ['poacher'], how: { coins: 150 }, num: 9, fact: 'מלך השערים של ליברפול בכל הזמנים, עם 346 שערים.' },
  { id: 'fowler', n: 'פאולר', full: 'רובי פאולר', team: 'lfc', rar: 1, ab: ['curl'], how: { coins: 150 }, num: 9, fact: 'גדל באקדמיה של ליברפול. ב-1994 הבקיע שלושער מול ארסנל בפחות מחמש דקות.' },
  { id: 'torres', n: 'טורס', full: 'פרננדו טורס', team: 'lfc', rar: 1, ab: ['speed'], how: { coins: 150 }, num: 9, fact: 'חלוץ ספרדי מהיר במיוחד. שיחק בליברפול מ-2007 עד 2011.' },
  { id: 'firmino', n: 'פירמינו', full: 'רוברטו פירמינו', team: 'lfc', rar: 1, ab: ['vision'], how: { coins: 150 }, num: 9, fact: 'חלוץ ברזילאי שידוע במסירות בלי להסתכל.' },
  { id: 'mane', n: 'מאנה', full: 'סאדיו מאנה', team: 'lfc', rar: 2, ab: ['dribble'], how: { coins: 220 }, num: 10, fact: 'קיצוני מסנגל. יחד עם סלאח ופירמינו היה שלישיית התקפה מפורסמת.' },
  { id: 'suarez', n: 'סוארס', full: 'לואיס סוארס', team: 'lfc', rar: 2, ab: ['dribble'], how: { coins: 220 }, num: 7, fact: 'חלוץ מאורוגוואי. בעונת 2013/14 הבקיע 31 שערים בפרמייר ליג.' },
  { id: 'vandijk', n: 'ואן דייק', full: 'וירג\'יל ואן דייק', team: 'lfc', rar: 2, ab: ['header'], how: { coins: 220 }, num: 4, fact: 'בלם הולנדי, חזק מאוד בכדורי גובה.' },
  { id: 'alisson', n: 'אליסון', full: 'אליסון בקר', team: 'lfc', rar: 2, ab: ['extra'], how: { coins: 220 }, num: 1, fact: 'שוער ברזילאי. ב-2021 הבקיע בנגיחה בדקה האחרונה מול ווסט ברומיץ\'.' },
  { id: 'trent', n: 'טרנט', full: 'טרנט אלכסנדר-ארנולד', team: 'lfc', rar: 2, ab: ['vision'], how: { moment: 'origi' }, num: 66, fact: 'גדל באקדמיה של ליברפול. עשה את הקרן המהירה מול ברצלונה.' },
  { id: 'dalglish', n: 'דלגליש', full: 'קני דלגליש', team: 'lfc', rar: 2, ab: ['chip'], how: { moment: 'dalglish' }, num: 7, fact: 'הבקיע בגמר הגביע האירופי 1978, ואחר כך גם אימן את ליברפול.' },
  { id: 'gerrard', n: 'ג\'רארד', full: 'סטיבן ג\'רארד', team: 'lfc', rar: 3, ab: ['power', 'leader'], how: { moment: 'istanbul' }, num: 8, fact: 'הקפטן של ליברפול. הוביל את הקאמבק באיסטנבול 2005.' },
  { id: 'salah', n: 'סלאח', full: 'מוחמד סלאח', team: 'lfc', rar: 3, ab: ['speed', 'curl'], how: { level: 5 }, num: 11, fact: 'בעונת 2017/18 קבע שיא של 32 שערים בעונת פרמייר ליג של 38 משחקים.' },
  { id: 'zidane', n: 'זידאן', full: 'זינדין זידאן', team: 'world', rar: 2, ab: ['turn'], how: { coins: 260 }, num: 10, fact: 'הבקיע שני שערים בנגיחה בגמר מונדיאל 1998.' },
  { id: 'cruyff', n: 'קרויף', full: 'יוהאן קרויף', team: 'world', rar: 3, ab: ['turn', 'vision'], how: { moment: 'cruyff' }, num: 14, fact: 'המציא את "תפנית קרויף" ב-1974, ואחר כך היה מאמן מהפכני בברצלונה.' },
  { id: 'maradona', n: 'מראדונה', full: 'דייגו מראדונה', team: 'world', rar: 3, ab: ['dribble', 'speed'], how: { moment: 'maradona' }, num: 10, fact: 'הוביל את ארגנטינה לזכייה במונדיאל 1986.' },
  { id: 'messi', n: 'מסי', full: 'ליונל מסי', team: 'world', rar: 3, ab: ['dribble', 'curl'], how: { level: 10 }, num: 10, fact: 'זכה עם ארגנטינה במונדיאל 2022.' },
  { id: 'ronaldo', n: 'רונלדו', full: 'כריסטיאנו רונלדו', team: 'world', rar: 3, ab: ['power', 'header'], how: { coins: 450 }, num: 7, fact: 'מלך השערים בכל הזמנים של ליגת האלופות.' },
  { id: 'pele', n: 'פלה', full: 'פלה', team: 'world', rar: 3, ab: ['poacher', 'header'], how: { level: 15 }, num: 10, fact: 'השחקן היחיד שזכה בשלושה מונדיאלים: 1958, 1962 ו-1970.' },
];
const lgCard = id => LG_CARDS.find(c => c.id === id);
const lgName = c => typeof c.n === 'function' ? c.n() : c.n;
function lgA() {
  const A = S.arcade || (S.arcade = {});
  A.leg = A.leg || {}; A.cards = Array.isArray(A.cards) ? A.cards.filter(lgCard) : [];
  if (!A.cards.includes('me')) A.cards.unshift('me');
  A.squad = (Array.isArray(A.squad) ? A.squad : ['me']).filter(id => A.cards.includes(id)).slice(0, 3); if (!A.squad.length) A.squad = ['me'];
  A.chBest = A.chBest || 0; return A;
}
/* cards that are already earned (old wins, a level reached) are given quietly */
function lgGrantAll() {
  const A = lgA(), got = [];
  for (const c of LG_CARDS) if (!A.cards.includes(c.id) && ((c.how.moment && A.leg[c.how.moment]) || (c.how.level && A.chBest >= c.how.level))) { A.cards.push(c.id); got.push(c); }
  if (got.length) save(); return got;
}
let LGS = null, LG_RAF = 0, LG_TAB = 'moments';
const lgStars = id => lgA().leg[id] || 0;
const lgAbChips = ab => ab.map(a => `<span class="fc-ab" title="${FB_AB[a][1]}">${FB_AB[a][0]}</span>`).join('');
/* a small shirt drawing for a card */
const lgShirt = (c) => `<svg viewBox="0 0 60 56" class="fc-shirt" aria-hidden="true"><path d="M18 4 L8 10 L2 22 L11 27 L14 22 L14 52 L46 52 L46 22 L49 27 L58 22 L52 10 L42 4 Q30 12 18 4 Z" fill="${c.team === 'world' ? '#2B3A67' : '#D00027'}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/><text x="30" y="40" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="system-ui">${c.num}</text></svg>`;

/* ----- screens: moments, challenge, cards ----- */
function viewLegends() {
  const A = lgA(), tot = LGM.reduce((s, m) => s + lgStars(m.id), 0);
  const tabs = `<div class="seg lg-tabs">${[['moments', 'רגעים'], ['challenge', 'אתגר הקבוצה'], ['cards', 'האוסף']].map(([k, t]) => `<button class="${LG_TAB === k ? 'on' : ''}" data-lgtab="${k}">${t}</button>`).join('')}</div>`;
  let body = '';
  if (LG_TAB === 'moments') body = `<p class="small muted" style="margin:0">לכל רגע: הסיפור, צפייה במהלך המקורי, ואז אתה מנסה. ניצחון ברגע פותח את הכרטיס של הגיבור שלו.</p>
  <div class="lg-list">${LGM.map(m => { const hero = LG_CARDS.find(c => c.how.moment === m.id); return `<button class="lg-card" data-lg="${m.id}"><span class="lg-yr">${m.yr}</span><span class="grow"><b>${m.t}</b><small>${m.match}${hero ? ` · כרטיס: ${lgName(hero)}` : ''}</small></span><span class="lg-st">${[1, 2, 3].map(i => `<i class="${i <= lgStars(m.id) ? 'on' : ''}">★</i>`).join('')}</span></button>`; }).join('')}</div>`;
  else if (LG_TAB === 'challenge') {
    const next = LG_CARDS.filter(c => c.how.level && !A.cards.includes(c.id)).sort((a, b) => a.how.level - b.how.level)[0];
    body = `${lgSquadBar()}<div class="card stack" style="gap:8px"><div class="row"><div class="grow"><b>אתגר הקבוצה</b><div class="small muted">שלבים שהולכים ונעשים קשים: יותר מגינים, שוער חד יותר. 3 ניסיונות לכל ריצה.</div></div><div class="lg-best"><small>שיא</small><b>${A.chBest}</b></div></div>
    ${next ? `<div class="small">בשלב ${next.how.level} מחכה לך הכרטיס של <b>${next.full}</b>.</div>` : ''}<button class="btn btn-primary btn-wide" data-lgrun>להתחיל ריצה</button></div>`;
  } else body = `${lgSquadBar()}<div class="small muted">יש לך <b>${S.coins}</b> מטבעות. כל שחקן מביא יכולת משלו לאתגר הקבוצה.</div><div class="fc-grid">${LG_CARDS.map(lgCardHTML).join('')}</div>`;
  return `<div class="stack">${hud()}<div class="sec-h"><h3>רגעים גדולים בכדורגל</h3><span class="muted small">${tot} מתוך ${LGM.length * 3} ★ · ${A.cards.length} מתוך ${LG_CARDS.length} כרטיסים</span></div>${tabs}${body}<button class="btn btn-ghost btn-wide" data-go="arcade">חזרה לארקייד</button></div>`;
}
function lgSquadBar() {
  const A = lgA();
  return `<div class="lg-squad"><div class="small muted">ההרכב שלך (הראשון מתחיל עם הכדור). גע בשחקן כדי להוציא אותו.</div><div class="lg-slots">${[0, 1, 2].map(i => { const c = lgCard(A.squad[i]); return c ? `<button class="lg-slot r${c.rar}" data-lgout="${c.id}"><b>${lgName(c)}</b><small>${c.ab.map(a => FB_AB[a][0]).join(' · ') || 'בלי יכולת'}</small></button>` : `<div class="lg-slot empty">מקום פנוי</div>`; }).join('')}</div></div>`;
}
function lgCardHTML(c) {
  const A = lgA(), own = A.cards.includes(c.id), inSq = A.squad.includes(c.id);
  let act;
  if (own) act = inSq ? `<button class="btn btn-ghost fc-btn" data-lgout="${c.id}">בהרכב ✓</button>` : `<button class="btn btn-primary fc-btn" data-lgin="${c.id}">להרכב</button>`;
  else if (c.how.coins) act = `<button class="btn ${S.coins >= c.how.coins ? 'btn-boss' : 'btn-ghost'} fc-btn" data-lgbuy="${c.id}" ${S.coins >= c.how.coins ? '' : 'disabled'}>${c.how.coins} מטבעות</button>`;
  else if (c.how.moment) act = `<div class="fc-lock">ניצחון ב"${LGM.find(m => m.id === c.how.moment).t}"</div>`;
  else act = `<div class="fc-lock">להגיע לשלב ${c.how.level} באתגר</div>`;
  return `<div class="fc-card r${c.rar} ${own ? '' : 'locked'}"><div class="fc-head"><span class="fc-team">${c.team === 'lfc' ? 'ליברפול' : c.team === 'world' ? 'אגדות העולם' : 'אתה'}</span><span class="fc-rar">${['', 'רגיל', 'נדיר', 'אגדה'][c.rar]}</span></div>${lgShirt(c)}<b class="fc-name">${c.full || lgName(c)}</b><div class="fc-abs">${lgAbChips(c.ab) || '<span class="fc-ab dim">בלי יכולת</span>'}</div><p class="fc-fact">${c.fact}</p>${act}</div>`;
}
function renderLegends() {
  /* a background refresh (cloud pull, update check) must not restart a scene that is on screen */
  if (LGS && LGS.R && LGS.R.cv.isConnected) return;
  lgStop();
  if (!LGS) {
    const got = lgGrantAll(); app.innerHTML = viewLegends(); bind();
    if (got.length) toast(`קיבלת ${got.length === 1 ? 'כרטיס חדש' : got.length + ' כרטיסים חדשים'}: ${got.map(c => c.full || lgName(c)).join(', ')}`);
    const on = (sel, f) => app.querySelectorAll(sel).forEach(b => b.onclick = () => f(b));
    on('[data-lg]', b => lgOpen(b.dataset.lg));
    on('[data-lgtab]', b => { LG_TAB = b.dataset.lgtab; SFX.tap(); renderLegends(); });
    on('[data-lgrun]', () => lgChallenge());
    on('[data-lgin]', b => { const A = lgA(); if (A.squad.length >= 3) return toast('ההרכב מלא. הוצא שחקן קודם.'); A.squad.push(b.dataset.lgin); save(); SFX.tap(); renderLegends(); });
    on('[data-lgout]', b => { const A = lgA(); if (A.squad.length <= 1) return toast('צריך לפחות שחקן אחד בהרכב.'); A.squad = A.squad.filter(x => x !== b.dataset.lgout); save(); SFX.tap(); renderLegends(); });
    on('[data-lgbuy]', b => { const c = lgCard(b.dataset.lgbuy); modal(`לקנות את ${c.full}?`, `${c.how.coins} מטבעות. יכולת: ${c.ab.map(a => FB_AB[a][0] + ' (' + FB_AB[a][1] + ')').join(', ')}.`, 'לקנות', () => { if (S.coins < c.how.coins) return; S.coins -= c.how.coins; const A = lgA(); A.cards.push(c.id); if (A.squad.length < 3) A.squad.push(c.id); save(); SFX.coin(); burst(40); renderLegends(); }, 'btn-boss'); });
    return;
  }
  const m = LGS.m;
  app.innerHTML = `<div class="stack lg"><div class="qbar"><button class="icon-btn" data-lgq aria-label="חזרה">${IC.x}</button><div class="grow"><b>${m.t}</b><div class="small muted" id="lgsub">${lgSub()}</div></div><span class="lg-tm" id="lgtm"></span></div>
  <div class="lg-stage"><canvas id="lgc"></canvas><div class="lg-cap" id="lgcap"></div><div class="lg-big" id="lgbig" hidden></div><div class="lg-btns" id="lgbtns"></div><div class="lg-pane" id="lgpane"></div></div>
  <div class="small muted lg-help">החלק לשער = בעיטה (קו מעוקל = בעיטה מסובבת, מהיר = חזק) · החלק לחבר = מסירה · החזק וגרור = כדרור</div></div>`;
  app.querySelector('[data-lgq]').onclick = () => { LGS = null; renderLegends(); };
  LGS.R = fbRenderer(document.getElementById('lgc'), m); lgReset(); lgInput(); lgLoop();
  lgPane(m.ch ? 'chintro' : 'intro');
}
const lgSub = () => LGS.run ? `שלב ${LGS.run.L} · ${'♥'.repeat(LGS.run.lives)}${'♡'.repeat(Math.max(0, LGS.run.max - LGS.run.lives))}` : `${LGS.m.match}, ${LGS.m.yr}`;
function lgOpen(id) { ac(); LGS = { m: LGM.find(x => x.id === id), tries: 0 }; S.view = 'legends'; renderLegends(); }

/* ----- the challenge ladder: built from the squad ----- */
const LG_KITS = [{ shirt: '#1D4FA0', shorts: '#F4F4F4', socks: '#1D4FA0' }, { shirt: '#1B1B1F', shorts: '#1B1B1F', socks: '#F2C230' }, { shirt: '#F4F4F4', shorts: '#1B1B1F', socks: '#F4F4F4', numCol: '#111' }, { shirt: '#2E7D32', stripe: '#F4F4F4', shorts: '#F4F4F4', socks: '#2E7D32' }, { shirt: '#6A1B9A', shorts: '#6A1B9A', socks: '#F4F4F4' }];
function lgLevel(L) {
  const A = lgA(), sq = A.squad.map(lgCard), r = (a, b) => a + Math.random() * (b - a);
  const spots = [[r(28, 40), r(30, 35)], [r(12, 20), r(20, 26)], [r(48, 56), r(18, 24)]];
  const us = sq.map((c, i) => [c.id, lgName(c), spots[i][0], spots[i][1], null, 6.6]);
  const nd = Math.min(6, 1 + Math.floor((L + 1) / 2)), opp = [], sp = Math.min(6.2, 4 + L * .14);
  for (let i = 0; i < nd; i++) {
    const role = i === 0 ? `press:${Math.min(14, 7 + L * .5)}` : i % 3 === 1 && us[1] ? `mark:${us[1][0]}` : i % 3 === 2 && us[2] ? `mark:${us[2][0]}` : 'block';
    opp.push([`d${i}`, 'מגן', r(20, 48), r(8, 24 - i), role, sp - (role === 'block' ? 1 : 0)]);
  }
  opp.push(['gk', 'שוער', 34, 1, 'keeper', Math.min(5, 3.7 + L * .07)]);
  const ab = {}; sq.forEach(c => ab[c.id] = c.ab);
  return { id: 'ch', ch: true, ai: true, t: 'אתגר הקבוצה', match: '', T: 14, kit: LFC_KIT, kit2: LG_KITS[(L - 1) % LG_KITS.length], nums: Object.fromEntries(sq.map(c => [c.id, c.num])), ab, us, opp, ball: sq[0].id, gkReact: Math.max(-.08, .08 - L * .012), gkDive: Math.min(4.3, 3 + L * .1), crowd: ['#D00027', '#F4F4F4', '#D00027', '#1B1B1F'] };
}
function lgChallenge() {
  ac(); const A = lgA(), max = 3 + (A.squad.some(id => lgCard(id).ab.includes('extra')) ? 1 : 0);
  LGS = { m: lgLevel(1), run: { L: 1, lives: max, max, coins: 0 }, tries: 0 }; S.view = 'legends'; renderLegends();
}

/* ----- the play loop ----- */
function lgReset() { lgStop(); LGS.W = fbWorld(LGS.m); LGS.trail = []; LGS.slow = null; const b = document.getElementById('lgbig'); if (b) b.hidden = true; lgCap(''); lgButtons(); lgLoop(); }
function lgStop() { cancelAnimationFrame(LG_RAF); LG_RAF = 0; }
function lgLoop() {
  lgStop(); let last = performance.now(), first = true;
  const f = now => {
    if (!LGS || S.view !== 'legends' || !LGS.R || !LGS.R.cv.isConnected) return lgStop();
    const dt = Math.min(.04, (now - last) / 1000); last = now; const W = LGS.W, R = LGS.R;
    if (LGS.slow) { lgSlowFrame(dt); }
    else {
      if (W.mode === 'replay') lgReplayStep(dt);
      else if (W.mode !== 'idle') fbStep(W, dt); else W.t += dt;
      lgEvents();
      fbFollow(R, W, dt, first); first = false; fbDraw(R, W); lgTrail();
      const tm = document.getElementById('lgtm'); if (tm) tm.textContent = W.mode === 'play' ? Math.max(0, Math.ceil(W.T - W.t)) : '';
    }
    LG_RAF = requestAnimationFrame(f);
  };
  LG_RAF = requestAnimationFrame(f);
}
function lgCap(t, ms) { const c = document.getElementById('lgcap'); if (!c) return; c.textContent = t; clearTimeout(LGS.capT); if (ms) LGS.capT = setTimeout(() => { if (c.textContent === t) c.textContent = ''; }, ms); }
function lgButtons() {
  const el = document.getElementById('lgbtns'), W = LGS && LGS.W; if (!el || !W) return;
  const turn = W.ps.some(p => p.team === 'us' && fbHas(p, 'turn')), chip = LGS.m.special === 'chip';
  el.innerHTML = W.mode !== 'play' ? '' : (turn ? '<button class="lg-act" id="lgturn">תפנית</button>' : '') + (chip ? `<button class="lg-act ${W.chip ? 'on' : ''}" id="lgchip">לוב</button>` : '');
  const t = document.getElementById('lgturn'), c = document.getElementById('lgchip');
  if (t) t.onclick = () => fbTurn(LGS.W);
  if (c) c.onclick = () => { LGS.W.chip = !LGS.W.chip; c.classList.toggle('on', LGS.W.chip); SFX.tap(); };
}
/* sounds, captions and the end of a try come from the world's events */
function lgEvents() {
  const W = LGS.W;
  while (W.ev.length) {
    const [type, d] = W.ev.shift();
    if (type === 'kick') { d === 'pass' ? SFX.tap() : SFX.hit(); }
    else if (type === 'toast') lgCap(d, 1800);
    else if (type === 'turn') { SFX.combo(); lgCap(`תפנית! ${d} בכיוון הלא נכון`, 1500); }
    else if (type === 'save') SFX.hit();
    else if (type === 'post') SFX.hit();
    else if (type === 'goal') lgGoal();
    else if (type === 'fail') { SFX.no(); lgButtons(); setTimeout(() => { if (LGS && LGS.W === W) lgPane('fail', d); }, 1100); }
  }
}
function lgRoar() {
  const a = ac(); if (!a || !S.sound) return;
  try { const n = a.sampleRate * 2.2, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.min(1, i / 4000) * Math.pow(1 - i / n, 1.4);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .6; g.gain.value = .32; s.connect(f); f.connect(g); g.connect(a.destination); s.start(); } catch (e) { }
}
function lgGoal() {
  const W = LGS.W; SFX.win(); lgRoar(); burst(90); lgButtons();
  const big = document.getElementById('lgbig'); if (big) { big.textContent = 'גוֹל!'; big.hidden = false; big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); }
  /* the slow-motion replay of the last seconds */
  const fr = W.rec.slice(-130).filter((_, i) => i % 1 === 0);
  setTimeout(() => { if (!LGS || LGS.W !== W) return; if (big) big.hidden = true; LGS.slow = { fr, i: 0, acc: 0 }; lgCap('הילוך חוזר', 0); }, 1500);
}
function lgSlowFrame(dt) {
  const s = LGS.slow, W = LGS.W; s.acc += dt * 60 * .4;
  while (s.acc >= 1 && s.i < s.fr.length - 1) { s.i++; s.acc -= 1; }
  W.t += dt; fbReplayFrame(LGS.R, W, s.fr[s.i]);
  if (s.i >= s.fr.length - 1) { LGS.slow = null; lgCap(''); W.mode = 'done'; lgWin(); }
}
function lgWin() {
  const m = LGS.m, A = lgA();
  if (LGS.run) {
    const r = LGS.run, coins = 4 + r.L; r.coins += coins; S.coins += coins; S.xp += coins; if (r.L > A.chBest) A.chBest = r.L;
    const got = lgGrantAll(); save(); return lgPane('chwin', { coins, got });
  }
  const st = LGS.tries <= 1 ? 3 : LGS.tries <= 3 ? 2 : 1, prev = A.leg[m.id] || 0;
  let coins = 0; if (st > prev) { coins = (prev ? 0 : 10) + (st - prev) * 5; A.leg[m.id] = st; S.coins += coins; S.xp += coins; }
  const got = lgGrantAll(); save(); lgPane('win', { st, coins, got });
}

/* ----- the panel over the pitch ----- */
function lgPane(kind, d) {
  const p = document.getElementById('lgpane'); if (!p || !LGS) return; const m = LGS.m;
  p.hidden = false; const cardLine = got => got && got.length ? `<div class="lg-newcard">כרטיס חדש: <b>${got.map(c => c.full || lgName(c)).join(', ')}</b></div>` : '';
  if (kind === 'intro') p.innerHTML = `<div class="eyebrow">הסיפור</div><p>${m.story}</p><div class="row"><button class="btn btn-ghost" data-lgb="rp">לצפות במהלך</button><button class="btn btn-primary" data-lgb="task">לנסות בעצמי</button></div>`;
  else if (kind === 'task') p.innerHTML = `<div class="eyebrow">המשימה</div><p>${m.task}</p><button class="btn btn-primary btn-wide" data-lgb="play">יאללה</button>`;
  else if (kind === 'rpend') p.innerHTML = `<div class="eyebrow">ככה זה קרה</div><p>${m.after}</p><button class="btn btn-primary btn-wide" data-lgb="task">עכשיו תורי</button>`;
  else if (kind === 'chintro') p.innerHTML = `<div class="eyebrow">שלב ${LGS.run.L}</div><p>הבקע לפני שהזמן נגמר. ${LGS.run.L === 1 ? 'החלק לחבר כדי למסור, החלק לשער כדי לבעוט, והחזק וגרור כדי לכדרר.' : `${m.opp.length - 1} מגינים ושוער.`}</p><button class="btn btn-primary btn-wide" data-lgb="play">יאללה</button>`;
  else if (kind === 'win') p.innerHTML = `<div class="lg-st big">${[1, 2, 3].map(i => `<i class="${i <= d.st ? 'on' : ''}">★</i>`).join('')}</div>${d.coins ? `<div class="small" style="text-align:center">+${d.coins} מטבעות</div>` : ''}${cardLine(d.got)}<p class="small">${m.after}</p><p><b>השיעור:</b> ${m.lesson}</p><div class="row"><button class="btn btn-ghost" data-lgb="task">שוב</button><button class="btn btn-primary" data-lgb="list">לרגע הבא</button></div>`;
  else if (kind === 'chwin') p.innerHTML = `<div class="eyebrow" style="color:var(--gold)">שלב ${LGS.run.L} עבר!</div><p>+${d.coins} מטבעות. ${LGS.run.L >= lgA().chBest ? 'שיא חדש!' : ''}</p>${cardLine(d.got)}<button class="btn btn-primary btn-wide" data-lgb="next">לשלב ${LGS.run.L + 1}</button>`;
  else if (kind === 'fail' && LGS.run) {
    const r = LGS.run; r.lives--; const sub = document.getElementById('lgsub'); if (sub) sub.textContent = lgSub();
    p.innerHTML = r.lives > 0 ? `<div class="eyebrow" style="color:var(--bad)">לא הפעם</div><p>${d}</p><p class="small muted">נשארו ${r.lives} ניסיונות.</p><button class="btn btn-primary btn-wide" data-lgb="play">לנסות שוב</button>`
      : `<div class="eyebrow" style="color:var(--bad)">הריצה נגמרה</div><p>${d}</p><p>הגעת לשלב <b>${r.L}</b> והרווחת <b>${r.coins}</b> מטבעות. השיא שלך: ${lgA().chBest}.</p><div class="row"><button class="btn btn-ghost" data-lgb="list">לאוסף</button><button class="btn btn-primary" data-lgb="run">ריצה חדשה</button></div>`;
  }
  else if (kind === 'fail') p.innerHTML = `<div class="eyebrow" style="color:var(--bad)">לא הפעם</div><p>${d}</p><div class="row"><button class="btn btn-ghost" data-lgb="rp">לצפות שוב במקור</button><button class="btn btn-primary" data-lgb="play">לנסות שוב</button></div>`;
  p.querySelectorAll('[data-lgb]').forEach(b => b.onclick = () => {
    const a = b.dataset.lgb; SFX.tap();
    if (a === 'rp') lgReplay(); else if (a === 'task') { lgReset(); lgPane('task'); } else if (a === 'play') lgPlay();
    else if (a === 'list') { if (LGS.run) LG_TAB = 'cards'; LGS = null; renderLegends(); }
    else if (a === 'run') { LGS = null; lgChallenge(); }
    else if (a === 'next') { LGS.run.L++; LGS.m = lgLevel(LGS.run.L); LGS.tries = 0; const sub = document.getElementById('lgsub'); if (sub) sub.textContent = lgSub(); LGS.R.m = LGS.m; lgReset(); lgPane('chintro'); }
  });
}
function lgPlay() {
  lgReset(); LGS.tries++; LGS.W.mode = 'play'; document.getElementById('lgpane').hidden = true; lgButtons();
  if (LGS.run && LGS.tries > 1) { LGS.m = lgLevel(LGS.run.L); LGS.W = fbWorld(LGS.m); LGS.W.mode = 'play'; lgButtons(); }
}

/* ----- the real move, replayed from its tracks ----- */
function lgAt(tr, t) {
  let i = 0; while (i < tr.length - 1 && tr[i + 1][0] <= t) i++;
  const a = tr[i], b = tr[Math.min(i + 1, tr.length - 1)]; if (a === b || t <= a[0]) return [a[1], a[2]];
  const k = Math.min(1, (t - a[0]) / (b[0] - a[0])); return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}
function lgReplay() { lgReset(); document.getElementById('lgpane').hidden = true; LGS.W.mode = 'replay'; LGS.W.rt = 0; }
function lgReplayStep(dt) {
  const W = LGS.W, rp = LGS.m.rp; W.rt += dt; W.t += dt; const t = W.rt;
  for (const id in rp.tr) { const p = fbP(W, id); if (!p) continue; const [x, y] = lgAt(rp.tr[id], t); p.vx = (x - p.x) / Math.max(dt, 1e-3); p.vy = (y - p.y) / Math.max(dt, 1e-3); p.ph += Math.hypot(p.vx, p.vy) * dt * 2.3; p.x = x; p.y = y; }
  const pos = e => typeof e[1] === 'string' ? (p => [p.x, p.y - .6])(fbP(W, e[1])) : [e[1], e[2]];
  const bt = rp.ball; let i = 0; while (i < bt.length - 1 && bt[i + 1][0] <= t) i++;
  const a = bt[i], b = bt[Math.min(i + 1, bt.length - 1)], pa = pos(a), B = W.b;
  if (a === b || t <= a[0]) { B.x = pa[0]; B.y = pa[1]; B.z = FB.BR; }
  else { const pb = pos(b), k = Math.min(1, (t - a[0]) / (b[0] - a[0])), mv = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]); B.x = pa[0] + (pb[0] - pa[0]) * k; B.y = pa[1] + (pb[1] - pa[1]) * k; B.z = FB.BR + ((rp.loft || []).includes(b[0]) ? Math.sin(k * Math.PI) * 3 : b.length === 3 && typeof b[1] !== 'string' ? k * .8 : 0); B.rot += mv * dt * 2; if (k > .02 && k < .2 && typeof a[1] === 'string') { const kp = fbP(W, a[1]); if (kp) { kp.st = 'kick'; kp.stT = .25; } } }
  for (const p of W.ps) if (p.stT) { p.stT -= dt; if (p.stT <= 0) { p.stT = 0; p.st = ''; } }
  if (B.y < 0 && !W.netHit) { W.netHit = 1; W.goalAt = { x: B.x, z: B.z }; lgRoar(); }
  const c = rp.cap.filter(x => x[0] <= t).pop(); lgCap(c ? c[1] : '');
  if (t >= rp.T) { W.mode = 'idle'; lgCap(''); lgPane('rpend'); }
}

/* ----- touch: swipe to pass or shoot, hold and drag to dribble, tap to run ----- */
function lgInput() {
  const R = LGS.R, cv = R.cv; let g = null;
  const pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * R.W / r.width, y: (e.clientY - r.top) * R.H / r.height, t: performance.now() }; };
  cv.onpointerdown = e => { if (!LGS.W || LGS.W.mode !== 'play') return; g = { pts: [pt(e)], mode: '' }; cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = e => {
    if (!g) return; const q = pt(e); g.pts.push(q); const p0 = g.pts[0], d = Math.hypot(q.x - p0.x, q.y - p0.y);
    if (!g.mode && d > 16) g.mode = q.t - p0.t < 260 ? 'swipe' : 'drag';
    if (g.mode === 'swipe') LGS.trail.push(q);
    if (g.mode === 'drag' || (!g.mode && q.t - p0.t > 260)) { g.mode = 'drag'; const w = fbUnproject(R, q.x, q.y, 'ground'); if (w && LGS.W.carrier) LGS.W.runTo = { x: w.x, y: Math.max(.5, w.y) }; }
  };
  cv.onpointerup = e => { if (!g) return; const G = g; g = null; G.pts.push(pt(e)); if (LGS.W.mode !== 'play') return; if (G.mode === 'swipe') lgSwipe(G.pts); else if (!G.mode) lgTapAt(G.pts[0]); };
}
function lgTrail() {
  const ctx = LGS.R.ctx, now = performance.now(); LGS.trail = LGS.trail.filter(q => now - q.t < 380); const T = LGS.trail; if (T.length < 2) return;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 1; i < T.length; i++) { const a = 1 - (now - T[i].t) / 380; ctx.strokeStyle = `rgba(255,236,150,${a * .85})`; ctx.lineWidth = 3 + a * 7; ctx.beginPath(); ctx.moveTo(T[i - 1].x, T[i - 1].y); ctx.lineTo(T[i].x, T[i].y); ctx.stroke(); }
}
function lgTapAt(q) {
  const W = LGS.W, R = LGS.R, w = fbUnproject(R, q.x, q.y, 'ground'); if (!w) return;
  const c = W.carrier, mate = c && W.ps.filter(p => p.team === 'us' && p !== c).sort((a, b) => Math.hypot(a.x - w.x, a.y - w.y) - Math.hypot(b.x - w.x, b.y - w.y))[0];
  if (mate && Math.hypot(mate.x - w.x, mate.y - w.y) < 3.5 && !W.fly) return fbPassTo(W, mate, {});
  if (c) W.runTo = { x: w.x, y: Math.max(.5, w.y) };
}
/* read a swipe: where it ends picks shot or pass; its bend is the curl; its speed is the power */
function lgSwipe(pts) {
  const W = LGS.W, R = LGS.R, a = pts[0], z = pts[pts.length - 1], L = Math.hypot(z.x - a.x, z.y - a.y); if (L < 20) return;
  const dur = Math.max(30, z.t - a.t), speed = L / dur, power = Math.max(0, Math.min(1, (speed - .45) / 1.6));
  let bend = 0; for (const q of pts) { const s = ((z.x - a.x) * (q.y - a.y) - (z.y - a.y) * (q.x - a.x)) / L; if (Math.abs(s) > Math.abs(bend)) bend = s; }
  const curve = Math.max(-1, Math.min(1, -bend / L * 3.2));
  const gp = fbUnproject(R, z.x, z.y, 'goal'), shot = gp && gp.x > 25 && gp.x < 43 && gp.z > -.8 && gp.z < 4.5;
  const aim = shot && { x: Math.max(FB.GX0 - 1.2, Math.min(FB.GX1 + 1.2, gp.x)), z: Math.max(.15, Math.min(3.2, gp.z)), power, curve };
  if (W.fly && W.fly.kind === 'pass') { if (aim) { W.queue = aim; lgCap('בעיטה ראשונה!', 900); } return; }
  const c = W.carrier; if (!c || c.team !== 'us') return;
  if (aim) return fbShootAt(W, aim.x, aim.z, aim);
  const w = fbUnproject(R, z.x, z.y, 'ground'); if (!w) return;
  const mate = W.ps.filter(p => p.team === 'us' && p !== c).sort((p1, p2) => Math.hypot(p1.x - w.x, p1.y - w.y) - Math.hypot(p2.x - w.x, p2.y - w.y))[0];
  if (mate && Math.hypot(mate.x - w.x, mate.y - w.y) < 6) return fbPassTo(W, mate, { curve: curve * .6, loft: power > .8 });
  W.runTo = { x: w.x, y: Math.max(.5, w.y) };
}
