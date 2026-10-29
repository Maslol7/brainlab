function viewArcade() {
  const dm = dueMist().length, tm = S.mist.length;
  return `<div class="stack">${hud()}
  <div class="sec-h"><h3>ארקייד</h3><span class="muted small">משחקים שמאמנים את המוח</span></div>
  <div class="tiles">${songsTile()}
    <button class="tile" style="--tc:${EC.water}" data-go="sprint"><span class="ti">${IC.calc}</span><h4>ספרינט חשבון</h4><p>60 שניות של תרגילים בראש</p><span class="best">שיא: ${S.arcade.sprint}</span></button>
    <button class="tile" style="--tc:#A98BFF" data-go="piano"><span class="ti">${IC.keys}</span><h4>זיכרון פסנתר</h4><p>שמע, זכור, נגן בחזרה</p><span class="best">שיא: ${S.arcade.piano}</span></button>
    <button class="tile wide" style="--tc:${EC.fire}" data-go="kupa"><span class="ti">${IC.cart}</span><div class="grow"><h4>קופה ראשית</h4><p>משמרת של 90 שניות. סכומים, עודף והנחות, מהר ובלי מחשבון.</p></div><span class="best">שיא: ${S.arcade.kupa}</span></button>
    <button class="tile wide" style="--tc:var(--gold)" data-act="review" ${tm ? '' : 'disabled'}><span class="ti">${IC.book}</span><div class="grow"><h4>מחברת הטעויות</h4><p>${tm ? `${tm} שאלות במחברת${dm ? `. <b style="color:var(--gold)">${dm} מחכות לחזרה היום</b>` : ''}` : 'ריקה כרגע. כל טעות נכנסת לכאן וחוזרת עד שתשלוט בה.'}</p></div></button>
    <div class="tile wide" style="--tc:#A98BFF;flex-wrap:wrap"><span class="ti">${IC.clock}</span><div class="grow"><h4>סימולציית מבחן</h4><p>6 פרקים כמו במבחן האמיתי, שעון נפרד לכל פרק, בלי משוב עד הסוף.</p></div><div class="row" style="width:100%;gap:8px"><button class="btn btn-ghost" data-sim="half" style="flex:1;min-height:44px;font-size:.95rem">חצי · 36 דק׳</button><button class="btn btn-boss" data-sim="full" style="flex:1;min-height:44px;font-size:.95rem">מלאה · 72 דק׳</button></div></div>
  </div>
</div>`;
}
