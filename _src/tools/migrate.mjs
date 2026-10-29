// One-time migration: old versioned files -> domain modules with a single definition per name.
// Single definitions are copied verbatim. Names defined more than once get the hand-written
// final version from tools/consolidated/*.js, inserted where the first definition was.
import * as acorn from 'acorn';
import fs from 'fs';
import path from 'path';
if (fs.existsSync('/home/claude/brainlab-src/src') && !process.argv.includes('--force')) { console.error('src/ exists: the migration already ran and src/ is now the source of truth.'); process.exit(1); }

const OLD = '/home/claude/brainlab/';
const OUT = '/home/claude/brainlab-src/src/';
const FILES = 'profile.js gen.js gen2.js gen3.js gen4.js lessons.js gen5.js learn10.js extra.js share.js sandbox.js update.js cloud.js ui5.js nav9.js v11.js v12.js v13.js v14.js v15.js v16.js v17.js v18.js v19.js v20.js v21.js v22.js v23.js'.split(' ');

/* ---------- where each name goes ---------- */
const M = {
  '00-core/profile.js': 'PROFILES PROF',
  '00-core/util.js': 'R ri pick shuffle mc fmt L todayStr dayDiff addDays esc strip weekKey arr',
  '00-core/constants.js': '#dir #lang TOTAL ME EC WORLDS worldOf BOSSES isBoss CATS RANKS SKINS',
  '00-core/icons.js': 'IC IC.heart IC.lock coinS',
  '00-core/sound.js': 'AC ac tone NOTES pianoNote SFX buzz',
  '10-content/lessons.js': 'LESSONS lessonFor noteLesson lessonsSection LESSONS.ostory LESSONS.onum #lessonsAssign LESSONS.reading #lessonsAssign19',
  '10-content/verbal.js': 'numCands UNIT1 unitFor numQ pickBank SEEN PEOPLE g AN OD genVerbal #an2 #od2 SC PASS RD #pass2 genReading genVerbal2 #an3 #od3 #pass3 #pass3q SYL genNonsense NS genNext FILLN genVerbal5 OSTORY genOrdStory SC2 genSC2 HOM genHom',
  '10-content/series.js': 'genSeries TROWS genTable genRing genSeries5',
  '10-content/shapes.js': 'SHAPES shapeEl cellSVG ANAME genMatrix normP keyP rotP mirP polySVG genRotation vk neg foldNet genNet genSpatial genCubes genSpatial2 SHAPEN genFigAn ANALOG_TIP genAnalog CORN dialSVG genShapeSeries genShapes',
  '10-content/math.js': 'DAYS OPS genSym genOp genCal genClock genCode FR TM MT MPOOL genMath #mt2 #mp2a #mp2b #mp2c genSprint GROC money r2 genKupa #mt3 #mp3a #mp3b #mp3c #mt4 #mp4a #mp4b MPOOL[4] genMath5 ONUM genOrdNum MT.ordnum #mp5a #mp5b #mp5c #mp5d MAGIC genMagic MT.magic #mpMagic genAcro #acro',
  '10-content/logic.js': 'LG ATTR genOrder genLogic perms genSeating genLogic5 SING NONW SY SYT BELIEF genSyll genGroups FAM genFamily',
  '10-content/registry.js': 'GEN LEVEL4',
  '20-learn/rating.js': 'rateQ',
  '20-learn/mistakes.js': 'noteMist makeTwin mistQ retryBox mnote mistId MIST_MAX trimMist',
  '20-learn/rush.js': 'minSecs logRush rushRate thinkOn NUDGE showNudge THINK_T',
  '20-learn/praise.js': 'praiseFor improveNotes impHTML',
  '20-learn/guides.js': 'SHAPE_KEYS HE_SHAPE HE_FILL HE_ATTR guideExample rowSays GSTEPS G startGuide renderGuide #shapeKeys20 pickWrong #gsteps20',
  '20-learn/road.js': 'chapRat readinessOf journey roadMini roadFull checkRoad readiness readinessCard',
  '30-state/sandbox.js': 'MAIN_KEY SBX_KEY SBX_FLAG isSbx mainPin sbxBadge sbxFresh sbxCopy enterSandbox exitSandbox askPinForSandbox tapN tapT secretTap sbxTools bindSandbox chooseSandbox openSbxTools',
  '30-state/state.js': 'KEY defState load S #sanitize sanitizeState save',
  '30-state/backup.js': 'backupName backupText doBackup restoreFrom backupSection',
  '40-game/progress.js': 'nm unlocked nextDay curWorld doneCount bossWins rankOf curStreak baseDiff qDiffFor starsOf isBday daysToBday dueMist worldDone SIMDAYS nodeKind startNode BONUS bonusToday missionToday',
  '40-game/rewards.js': 'GEAR gearOn BADGES checkBadges JOKES jokeTxt unlockJoke jokeCard',
  '40-game/diamonds.js': 'DIA diaS REWARD_IDEAS DIA_RULES giveDia awardDiamonds rewardsSection askReward diaNeed diaGoalLine diaWays openDiaSheet SONG_PRICE EX_PRICE exchangeCard',
  '40-game/missions.js': 'MIX CHAPTERS CHAPKEY CHAPNAME MODS MOD_ORDER modFor BRIEF briefFor weakest canType mkQ startMission deferred range nextOpen endChapter fmtT answer nextQ finish',
  '40-game/calm.js': 'FUN_T FUN_RAF stopFun renderOffer renderBreath renderHoops',
  '40-game/xtra.js': 'XTRA_MAX xtraToday canXtra weakChapter startXtra',
  '40-game/arcade.js': 'SP gameIntro gameOver renderSprint spLevel spNew spStart padInput spKey spOver KP KASK kpLevel kpNew receiptHTML renderKupa kpStart kpKey kpOver PN SOLF renderPiano pnBind lightKey pnPlay pnKey',
  '40-game/songs.js': 'SONGS NOTRANS SECN SOLF12 PC QUAL chordNotes midiHz playChord kbSVG songsOpenFor songsOpen chordSet twins SL stopLoop songsTile viewSongs viewSong loopStep renderSongOnly bindSongs',
  '40-game/minigames.js': 'MG_RAF stopMG renderBossGame',
  '50-family/parent.js': 'PARENT_OK viewParent bindExtra',
  '50-family/report.js': 'reportHTML viewerHTML',
  '50-family/dad.js': 'DAD_DEF DAD_HARD dadList dadNext dadHTML loveLine loveOnStreak dadMsgSection',
  '50-family/dadphone.js': 'CC_KEY ccGet CC_BUSY refreshDadReport isDadPhone PNODE dadPanel refreshDadPanel pEdit bindDadPanel',
  '50-family/checkin.js': 'MOODS MOOD_REPLY wantCheckin checkinCard setMood pickExplain explainCard parentExplainCard startDuo',
  '50-family/gender.js': 'isGirl GPH GW GRE femText femNode #femObserver',
  '50-family/profiles.js': 'switchProfile profileSection bindProfiles',
  '50-family/guest.js': 'APP_URL applyGuest guestOnboard friendCard shareFriend',
  '60-cloud/sync.js': 'CLOUD_KEY cloudCfg cloudSet cloudOn newCode cloudPath cloudPayload cloudT cloudSoon cloudPut cloudGet agoTxt FB_RULES cloudSection bindCloud findDb chooseCloudRestore normCloud _fetch23 window.fetch',
  '60-cloud/parent-channel.js': 'pPath pGet pPut P_LAST P_BUSY pullParent',
  '70-ui/shell.js': 'app timers later every clearTimers go applyTheme render nav hud elemStrip LINES modal burst toast APP_VER remoteVer doUpdate updBanner checkUpdate bindUpdate',
  '70-ui/art.js': 'elemPaths elemIcon avatarSVG bossSVG chestSVG giftSVG medal ACC ACC_SVG avatarPreview',
  '70-ui/home.js': 'nextStep todayChips heroFor viewHome morningHint',
  '70-ui/quiz.js': 'renderIntro renderQuiz floatPts TAP_LOCK TAP_KEY',
  '70-ui/result.js': 'viewResult',
  '70-ui/stats.js': 'viewMeTab PT viewMe viewTips viewStats viewDataTab viewRulesTab',
  '70-ui/arcade.js': 'viewArcade',
  '70-ui/shop.js': 'ownedSkin viewShop buySkin accSection',
  '70-ui/share.js': 'svgImg hexA rr starPath makeCard shareCard',
  '70-ui/bind.js': 'bind bindNav bindV11',
  '99-main/main.js': '#persist #visUpdate #checkUpdateLater #visCloud #pinCarry #seedRush #trimMist #rhV17 #visParent #pullLater #msInit #streakFix S.streakFix20 #tapLock',
};
/* names that are dropped: dead code or folded into a consolidated definition */
const DROP = new Set(['viewHomeOld', 'CHAPTERS[0].cats', 'MIX.boss', '#sanitize2', '#seenAssign',
  'GEN.verbal', 'GEN.logic', 'GEN.spatial', 'GEN.reading', 'GEN.analog', 'GEN.series', 'GEN.matrix', 'GEN.math',
  '_genVerbal1', '_genSpatial1', '_genMath1', '_genVerbal5', '_genLogic9', '_genVerbal19', '_lessonFor9']);
/* anonymous load-time statements, keyed by file + index among that file's anonymous statements */
const ANON = {
  'gen2.js': ['#an2', '#od2', '#pass2', '#mt2', '#mp2a', '#mp2b', '#mp2c'],
  'gen3.js': ['#an3', '#od3', '#pass3', '#pass3q', '#mt3', '#mp3a', '#mp3b', '#mp3c'],
  'gen4.js': ['#mt4', '#mp4a', '#mp4b'],
  'gen5.js': ['#mp5a', '#mp5b', '#mp5c', '#mp5d'],
  'learn10.js': ['#lessonsAssign', '#mpMagic'],
  'update.js': ['#persist', '#visUpdate', '#checkUpdateLater'],
  'cloud.js': ['#visCloud'],
  'ui5.js': ['#dir', '#lang', '#sanitize'],
  'v13.js': ['#femObserver', '#acro', '#pinCarry'],
  'v15.js': ['#seedRush', '#trimMist'],
  'v17.js': ['#rhV17'],
  'v18.js': ['#visParent', '#pullLater'],
  'v19.js': ['#lessonsAssign19'],
  'v20.js': ['#shapeKeys20', '#gsteps20', '#msInit', '#streakFix'],
  'v23.js': ['#tapLock', '#sanitize2'],
};
/* references to removed aliases inside copied code */
const RENAME = { _genVerbal1: 'genVerbal', _genSpatial1: 'genSpatial', _genMath1: 'genMath', _fetch23: 'fetchRaw', _nextQ16: 'nextQ' };

/* ---------- consolidated definitions ---------- */
const CONS = {};
for (const f of fs.readdirSync('/home/claude/brainlab-src/tools/consolidated')) {
  const src = fs.readFileSync('/home/claude/brainlab-src/tools/consolidated/' + f, 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script', onComment: [] });
  let prevEnd = 0;
  for (const n of ast.body) {
    let nm = n.type === 'FunctionDeclaration' ? n.id.name : n.type === 'VariableDeclaration' ? n.declarations[0].id.name : null;
    if (!nm) { if (!/@module/.test(src.slice(prevEnd, n.start))) throw new Error('consolidated: unnamed statement in ' + f); nm = '#cons' + Object.keys(CONS).length; }
    const lead = src.slice(prevEnd, n.start).replace(/^\s*\n/, '').trimEnd();
    CONS[nm] = (lead ? lead.trimStart() + '\n' : '') + src.slice(n.start, n.end);
    prevEnd = n.end;
  }
}

/* ---------- read and route ---------- */
const where = {}; for (const [mod, s] of Object.entries(M)) for (const n of s.split(/\s+/).filter(Boolean)) { if (where[n]) throw new Error('mapped twice: ' + n); where[n] = mod; }
const items = [], defCount = {};
for (const f of FILES) {
  const src = fs.readFileSync(OLD + f, 'utf8');
  const comments = [];
  const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script', onComment: comments });
  let anonI = 0, prevEnd = 0;
  for (const n of ast.body) {
    let names;
    if (n.type === 'FunctionDeclaration') names = [n.id.name];
    else if (n.type === 'VariableDeclaration') names = n.declarations.map(d => d.id.name);
    else if (n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression') names = [src.slice(n.expression.left.start, n.expression.left.end)];
    else { const k = (ANON[f] || [])[anonI++]; if (!k) throw new Error(`unmapped anonymous statement ${f}: ${src.slice(n.start, n.start + 60)}`); names = [k]; }
    // keep explanatory comments that sit right above the statement, drop version banners
    const between = comments.filter(c => c.start >= prevEnd && c.end <= n.start).map(c => src.slice(c.start, c.end)).filter(t => !/={3,}/.test(t) && !/V\d\d?\b/.test(t));
    prevEnd = n.end;
    names.forEach(nm => defCount[nm] = (defCount[nm] || 0) + 1);
    items.push({ f, names, code: src.slice(n.start, n.end), lead: between.join('\n') });
  }
}
const isAlias = it => /^const _\w+ = [\w.]+;$/.test(it.code.trim()) && it.names.every(n => n.startsWith('_'));
const out = {}, placed = new Set(), missing = new Set();
for (const it of items) {
  if (isAlias(it)) continue;
  if (it.names.some(n => DROP.has(n))) { if (!it.names.every(n => DROP.has(n))) throw new Error('partial drop ' + it.names); continue; }
  const nm = it.names[0], mod = where[nm];
  if (!mod) throw new Error(`no module for ${it.f}: ${it.names.join(',')}`);
  if (it.names.some(n => where[n] !== mod)) throw new Error('split declaration ' + it.names);
  let code;
  if (CONS[nm] || defCount[nm] > 1) {
    if (placed.has(nm)) continue;
    if (!CONS[nm]) { missing.add(nm); continue; }
    placed.add(nm); code = CONS[nm];
  } else {
    code = it.code; for (const [a, b] of Object.entries(RENAME)) code = code.replace(new RegExp('\\b' + a + '\\b', 'g'), b);
    if (it.lead) code = it.lead + '\n' + code;
  }
  (out[mod] = out[mod] || []).push(code);
}
/* consolidated names that never had a source slot (new helpers) go to the module named in their leading tag */
for (const [nm, code] of Object.entries(CONS)) {
  if (placed.has(nm)) continue;
  const m = /^\/\/ @module (\S+)/.exec(code); if (!m) { console.error('consolidated but unused: ' + nm); process.exitCode = 1; continue; }
  (out[m[1]] = out[m[1]] || []).push(code.replace(/^\/\/ @module \S+\n/, ''));
}
if (missing.size) { console.error('needs consolidation: ' + [...missing].join(' ')); process.exitCode = 1; }
fs.rmSync(OUT, { recursive: true, force: true });
for (const [mod, parts] of Object.entries(out)) {
  fs.mkdirSync(path.dirname(OUT + mod), { recursive: true });
  fs.writeFileSync(OUT + mod, parts.join('\n') + '\n');
}
fs.writeFileSync('/home/claude/brainlab-src/tools/order.json', JSON.stringify(Object.keys(M).filter(m => out[m]), null, 1));
console.log('modules', Object.keys(out).length, 'consolidated', placed.size);
