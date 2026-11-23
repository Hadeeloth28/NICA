(() => {
'use strict';

/* ---------- basics ---------- */
const $ = (s, r = document) => r.querySelector(s);
const ar = n => Number(n).toLocaleString('ar-EG');
const KEY = 'hifz.v1';
const TOTAL = 6236;
const RECITERS = [
  ['Husary_128kbps', 'محمود خليل الحصري'],
  ['Husary_Muallim_128kbps', 'الحصري (المصحف المعلّم)'],
  ['Minshawy_Murattal_128kbps', 'محمد صديق المنشاوي'],
  ['Abdul_Basit_Murattal_192kbps', 'عبد الباسط عبد الصمد'],
  ['Alafasy_128kbps', 'مشاري العفاسي'],
];
const TABS = [['home', 'الرئيسية'], ['surahs', 'السور'], ['review', 'المراجعة'], ['quiz', 'اختبار'], ['prefs', 'الإعدادات']];

document.documentElement.lang = 'ar';
document.documentElement.dir = 'rtl';
$('#root').innerHTML = `
  <header class="top"><div class="wrap"><div class="brand">رفيق الحفظ</div><nav class="tabs" id="tabs" aria-label="أقسام التطبيق"></nav></div></header>
  <main class="wrap" id="app"><p class="muted">جارٍ تحميل نص القرآن الكريم…</p></main>
  <div id="toast" role="status"></div>`;
const app = $('#app');

/* ---------- dates ---------- */
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => iso(new Date());
const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return iso(new Date(y, m - 1, d + n)); };
const dayDiff = (a, b) => { const p = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((p(a) - p(b)) / 864e5); };

/* ---------- state ---------- */
const DEFAULTS = { segs: {}, log: {}, last: null, prefs: { size: 28, theme: 'auto', reciter: RECITERS[0][0], repeat: 3 } };
function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
  return normalize(s);
}
function normalize(s) {
  return { segs: s.segs || {}, log: s.log || {}, last: s.last || null, prefs: Object.assign({}, DEFAULTS.prefs, s.prefs || {}) };
}
let S = load();
let storageOk = true;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); storageOk = true; } catch (e) { storageOk = false; }
}
function logAct(kind, n = 1) {
  const d = today();
  const e = S.log[d] || (S.log[d] = {});
  e[kind] = (e[kind] || 0) + n;
}
function applyPrefs() {
  document.documentElement.style.setProperty('--ayah-size', S.prefs.size + 'px');
  if (S.prefs.theme === 'auto') {
    if (applyPrefs.set) { document.documentElement.removeAttribute('data-theme'); applyPrefs.set = false; }
  } else { document.documentElement.setAttribute('data-theme', S.prefs.theme); applyPrefs.set = true; }
}

/* ---------- Quran data ---------- */
let Q = null, BASM = '', SEG = {};
function buildSegments() {
  BASM = Q.verses[0];
  let off = 0;
  for (const s of Q.surahs) {
    s.off = off; s.segs = [];
    let start = 1, words = 0;
    for (let a = 1; a <= s.count; a++) {
      words += verseText(s.n, a).split(' ').length;
      const len = a - start + 1;
      if (words >= 45 || len >= 10 || a === s.count) {
        const seg = { id: `${s.n}:${start}`, s: s.n, a: start, b: a, i: s.segs.length };
        s.segs.push(seg); SEG[seg.id] = seg;
        start = a + 1; words = 0;
      }
    }
    // avoid a tiny one-ayah tail: merge it into the previous segment
    if (s.segs.length > 1) {
      const last = s.segs[s.segs.length - 1], prev = s.segs[s.segs.length - 2];
      if (last.a === last.b && prev.b - prev.a < 9 && verseText(s.n, last.a).split(' ').length < 12) {
        prev.b = last.b; delete SEG[last.id]; s.segs.pop();
      }
    }
    off += s.count;
  }
}
const surah = n => Q.surahs[n - 1];
// The stored text is Tanzil's, verbatim. The basmala that opens each surah is shown as a heading instead of inside ayah 1.
function verseText(s, a) {
  const t = Q.verses[Q.surahs[s - 1].off + a - 1];
  return (a === 1 && s !== 1 && s !== 9 && t.startsWith(BASM + ' ')) ? t.slice(BASM.length + 1) : t;
}
const hasBasmala = s => s !== 1 && s !== 9;
const segLen = g => g.b - g.a + 1;
const rangeLabel = g => g.a === g.b ? `الآية ${ar(g.a)}` : `الآيات ${ar(g.a)}–${ar(g.b)}`;

/* ---------- progress + scheduling ---------- */
const isDue = id => S.segs[id] && S.segs[id].due <= today();
const dueIds = () => Object.keys(S.segs).filter(id => SEG[id] && isDue(id)).sort((x, y) => S.segs[x].due < S.segs[y].due ? -1 : S.segs[x].due > S.segs[y].due ? 1 : 0);
const memAyat = () => Object.keys(S.segs).reduce((n, id) => n + (SEG[id] ? segLen(SEG[id]) : 0), 0);
function surahProgress(s) {
  let n = 0;
  for (const g of s.segs) if (S.segs[g.id]) n += segLen(g);
  return n / s.count;
}
function streak() {
  let d = today(), n = 0;
  if (!S.log[d]) d = addDays(d, -1);
  while (S.log[d]) { n++; d = addDays(d, -1); }
  return n;
}
function nextInterval(st, g) {
  const base = st.int || 0, ease = st.ease || 2.3;
  if (g === 0) return 1;
  if (g === 1) return Math.max(1, Math.round(base * 1.2));
  if (g === 2) return base < 1 ? 1 : base < 3 ? 3 : Math.round(base * ease);
  return base < 1 ? 3 : Math.max(base + 2, Math.round(base * ease * 1.3));
}
function grade(id, g) {
  const st = S.segs[id];
  st.int = nextInterval(st, g);
  st.ease = Math.min(3, Math.max(1.3, (st.ease || 2.3) + [-0.2, -0.15, 0, 0.1][g]));
  st.reps = (st.reps || 0) + 1;
  if (g === 0) st.lapses = (st.lapses || 0) + 1;
  st.due = addDays(today(), st.int);
  logAct('rev');
  save();
}
function memorize(id, dueIn = 1) {
  if (!S.segs[id]) { S.segs[id] = { int: 0, ease: 2.3, reps: 0, due: addDays(today(), dueIn), since: today() }; logAct('new'); }
}
const intervalLabel = n => n === 1 ? 'غدًا' : n === 2 ? 'بعد يومين' : n < 11 ? `بعد ${ar(n)} أيام` : n < 60 ? `بعد ${ar(n)} يومًا` : `بعد ${ar(Math.round(n / 30))} أشهر`;
function nextNew() {
  const start = S.last ? S.last : 1;
  for (let k = 0; k < 114; k++) {
    const s = surah(((start - 1 + k) % 114) + 1);
    const g = s.segs.find(x => !S.segs[x.id]);
    if (g) return g;
  }
  return null;
}

/* ---------- audio ---------- */
const player = { el: null, q: [], i: 0, rep: 0, on: false };
function stopAudio() {
  player.on = false;
  if (player.el) { player.el.pause(); }
  document.querySelectorAll('.ayah.playing').forEach(e => e.classList.remove('playing'));
  const b = $('[data-act="play"]'); if (b) b.textContent = 'استمع';
}
function playSeg(g) {
  if (player.on) { stopAudio(); return; }
  if (!player.el) {
    player.el = new Audio();
    player.el.addEventListener('ended', () => {
      if (!player.on) return;
      player.rep++;
      if (player.rep >= S.prefs.repeat) { player.rep = 0; player.i++; }
      playStep();
    });
    player.el.addEventListener('error', () => {
      if (!player.on) return;
      stopAudio(); toast('تعذّر تشغيل التلاوة. تحقّق من اتصالك بالإنترنت.');
    });
  }
  player.q = []; for (let a = g.a; a <= g.b; a++) player.q.push([g.s, a]);
  player.i = 0; player.rep = 0; player.on = true;
  const b = $('[data-act="play"]'); if (b) b.textContent = 'أوقف التلاوة';
  playStep();
}
function playStep() {
  if (player.i >= player.q.length) { stopAudio(); return; }
  const [s, a] = player.q[player.i];
  document.querySelectorAll('.ayah.playing').forEach(e => e.classList.remove('playing'));
  const el = $(`.ayah[data-a="${a}"]`); if (el) el.classList.add('playing');
  player.el.src = `https://everyayah.com/data/${S.prefs.reciter}/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`;
  const p = player.el.play();
  if (p && p.catch) p.catch(() => { if (player.on) { stopAudio(); toast('تعذّر تشغيل التلاوة. تحقّق من اتصالك بالإنترنت.'); } });
}

/* ---------- rendering helpers ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}
// keep = how many leading words stay visible; the rest are masked until the ayah is tapped
function ayahHTML(s, a, keep) {
  const w = verseText(s, a).split(' ');
  const k = Math.min(keep, w.length);
  const shown = w.slice(0, k).join(' '), rest = w.slice(k).join(' ');
  return `<span class="ayah${rest ? '' : ' open'}" data-act="peek" data-a="${a}" role="button" tabindex="0">${shown}${shown && rest ? ' ' : ''}${rest ? `<span class="m">${rest}</span>` : ''}<span class="num"> ﴿${ar(a)}﴾</span></span> `;
}
function segHTML(g, mode) {
  let h = '';
  for (let a = g.a; a <= g.b; a++) h += ayahHTML(g.s, a, mode === 'full' ? 1e9 : mode === 'first' ? 1 : mode === 'prompt' ? (a === g.a ? 2 : 0) : 0);
  return h;
}
function segStatus(g) {
  const st = S.segs[g.id];
  if (!st) return '<span class="pill">جديد</span>';
  if (st.due <= today()) return '<span class="pill due">مراجعة اليوم</span>';
  return `<span class="pill done">محفوظ · ${intervalLabel(dayDiff(st.due, today()))}</span>`;
}
function renderTabs() {
  const due = Q ? dueIds().length : 0;
  const cur = { surah: 'surahs', seg: 'surahs' }[view.name] || view.name;
  $('#tabs').innerHTML = TABS.map(([k, t]) =>
    `<button class="tab" data-act="tab" data-to="${k}"${cur === k ? ' aria-current="page"' : ''}>${t}${k === 'review' && due ? `<span class="dot">${ar(due)}</span>` : ''}</button>`).join('');
}

/* ---------- views ---------- */
let view = { name: 'home' };
let session = null, quiz = null, quizScope = 'mine', surahFilter = '', confirmReset = false;

function go(name, params = {}, keepScroll = false) {
  stopAudio();
  view = Object.assign({ name }, params);
  const top = TABS.some(t => t[0] === name);
  if (top && location.hash !== '#' + name) { try { history.replaceState(null, '', '#' + name); } catch (e) { /* hash is a convenience only */ } }
  render();
  if (!keepScroll) window.scrollTo(0, 0);
}
function render() {
  renderTabs();
  app.innerHTML = ({ home: vHome, surahs: vSurahs, surah: vSurah, seg: vSeg, review: vReview, quiz: vQuiz, prefs: vPrefs }[view.name] || vHome)();
}

function vHome() {
  const mem = memAyat(), due = dueIds().length, pct = mem / TOTAL * 100, nn = nextNew();
  const t = today();
  let days = '';
  for (let k = 13; k >= 0; k--) {
    const e = S.log[addDays(t, -k)]; const n = e ? (e.rev || 0) + (e.new || 0) + (e.quiz || 0) : 0;
    days += `<i class="${n === 0 ? '' : n < 4 ? 'l1' : n < 10 ? 'l2' : 'l3'}" title="${ar(n)}"></i>`;
  }
  const todayCard = due
    ? `<section class="card today stack"><h2>وِرد المراجعة اليوم</h2><p class="muted">${due === 1 ? 'مقطع واحد ينتظر' : due === 2 ? 'مقطعان ينتظران' : `${ar(due)} ${due < 11 ? 'مقاطع' : 'مقطعًا'} تنتظر`} المراجعة.</p><div class="row"><button class="btn big" data-act="tab" data-to="review">ابدأ المراجعة</button></div></section>`
    : mem
      ? `<section class="card stack"><h2>أتممتَ مراجعة اليوم</h2><p class="muted">لا مقاطع مستحقة الآن. يمكنك حفظ مقطع جديد أو اختبار نفسك.</p></section>`
      : `<section class="card stack"><h2>ابدأ رحلة الحفظ</h2><p class="muted">اختر سورة، واحفظ مقطعًا قصيرًا منها، ثم يذكّرك التطبيق بمراجعته في الوقت المناسب قبل أن تنساه.</p>
          <div class="row">${[1, 114, 113, 112, 78].map(n => `<button class="btn" data-act="open-surah" data-s="${n}">سورة ${surah(n).name}</button>`).join('')}</div></section>`;
  const nextCard = nn ? `<section class="card stack"><h2>الحفظ الجديد</h2>
      <div class="row"><div class="grow"><b>سورة ${surah(nn.s).name}</b><div class="muted small">${rangeLabel(nn)}</div></div>
      <button class="btn primary" data-act="open-seg" data-id="${nn.id}">${mem ? 'تابع الحفظ' : 'ابدأ الحفظ'}</button></div></section>` : '';
  return `
    <h1>السلام عليكم</h1>
    <div class="stats">
      <div class="stat"><b>${ar(mem)}</b><span>آية محفوظة</span></div>
      <div class="stat"><b>${pct.toLocaleString('ar-EG', { maximumFractionDigits: 1 })}٪</b><span>من القرآن الكريم</span></div>
      <div class="stat"><b>${ar(due)}</b><span>مقاطع للمراجعة اليوم</span></div>
      <div class="stat"><b>${ar(streak())}</b><span>أيام متتالية</span></div>
    </div>
    ${todayCard}${nextCard}
    <section class="card stack"><div class="row"><h2 class="grow">التقدّم في الختمة</h2><span class="muted small">${ar(mem)} من ${ar(TOTAL)} آية</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="row"><span class="muted small grow">نشاطك في آخر ١٤ يومًا</span></div><div class="days">${days}</div></section>
    ${storageOk ? '' : '<p class="muted small">تعذّر حفظ تقدّمك في هذا المتصفح. استعمل النسخة الاحتياطية من الإعدادات.</p>'}`;
}

function surahCards() {
  const f = surahFilter.trim();
  const list = Q.surahs.filter(s => !f || s.name.includes(f) || String(s.n) === f || ar(s.n) === f);
  if (!list.length) return '<p class="muted">لا توجد سورة بهذا الاسم.</p>';
  return list.map(s => `<button class="surah" data-act="open-surah" data-s="${s.n}">
      <span class="no"><span>${ar(s.n)}</span></span>
      <span><span class="nm">${s.name}</span><br><span class="muted small">${s.type === 'meccan' ? 'مكية' : 'مدنية'} · ${ar(s.count)} ${s.count < 11 ? 'آيات' : 'آية'}</span></span>
      <span class="muted small">${Math.round(surahProgress(s) * 100) ? ar(Math.round(surahProgress(s) * 100)) + '٪' : ''}</span>
      <span class="bar"><i style="width:${surahProgress(s) * 100}%"></i></span></button>`).join('');
}
function vSurahs() {
  return `<h1>سور القرآن الكريم</h1>
    <div class="field"><label for="surah-search">ابحث باسم السورة أو رقمها</label><input type="search" id="surah-search" value="${surahFilter.replace(/"/g, '&quot;')}" autocomplete="off"></div>
    <div class="surahs" id="surah-list">${surahCards()}</div>`;
}

function vSurah() {
  const s = surah(view.s);
  const done = s.segs.filter(g => S.segs[g.id]).length;
  return `<button class="btn quiet back" data-act="tab" data-to="surahs">→ كل السور</button>
    <div class="row"><div class="grow"><h1>سورة ${s.name}</h1><p class="muted">${s.type === 'meccan' ? 'مكية' : 'مدنية'} · ${ar(s.count)} ${s.count < 11 ? 'آيات' : 'آية'} · حفظت ${ar(done)} من ${ar(s.segs.length)} ${s.segs.length < 11 ? 'مقاطع' : 'مقطعًا'}</p></div>
      ${done < s.segs.length ? `<button class="btn" data-act="mark-surah" data-s="${s.n}">أحفظها من قبل</button>` : ''}</div>
    <div class="bar"><i style="width:${surahProgress(s) * 100}%"></i></div>
    <div class="stack">${s.segs.map(g => `<button class="seg" data-act="open-seg" data-id="${g.id}">
        <span class="grow"><span class="muted small">${rangeLabel(g)}</span><span class="pre" style="display:block">${verseText(g.s, g.a)}</span></span>${segStatus(g)}</button>`).join('')}</div>`;
}

function vSeg() {
  const g = SEG[view.id], s = surah(g.s), mode = view.mode || 'full', st = S.segs[g.id];
  const prev = s.segs[g.i - 1], next = s.segs[g.i + 1];
  return `<button class="btn quiet back" data-act="open-surah" data-s="${s.n}">→ سورة ${s.name}</button>
    <div class="row"><div class="grow"><h1>سورة ${s.name}</h1><p class="muted">${rangeLabel(g)}</p></div>${segStatus(g)}</div>
    <div class="modes" role="group" aria-label="طريقة العرض">
      ${[['full', 'النص كاملًا'], ['first', 'أول كلمة فقط'], ['hidden', 'إخفاء الكل']].map(([k, t]) => `<button data-act="mode" data-mode="${k}" aria-pressed="${mode === k}">${t}</button>`).join('')}</div>
    ${g.a === 1 && hasBasmala(g.s) ? `<div class="basmala">${BASM}</div>` : ''}
    <div class="mushaf">${segHTML(g, mode)}</div>
    <p class="muted small">${mode === 'full' ? 'اقرأ المقطع وكرّره مع التلاوة، ثم أخفِ النص واتلُه من حفظك.' : 'اتلُ من حفظك، واضغط على أي آية لكشفها والتحقق منها.'}</p>
    <div class="row">
      <button class="btn" data-act="play">استمع</button>
      <span class="muted small grow">كل آية تُكرَّر ${S.prefs.repeat === 1 ? 'مرة واحدة' : S.prefs.repeat === 2 ? 'مرتين' : ar(S.prefs.repeat) + ' مرات'}</span>
      ${st ? `<button class="btn danger" data-act="forget" data-id="${g.id}">أزِله من محفوظاتي</button>` : `<button class="btn primary" data-act="memorize" data-id="${g.id}">حفظتُ هذا المقطع</button>`}
    </div>
    <div class="row">
      ${prev ? `<button class="btn quiet" data-act="open-seg" data-id="${prev.id}">→ المقطع السابق</button>` : ''}
      <span class="grow"></span>
      ${next ? `<button class="btn quiet" data-act="open-seg" data-id="${next.id}">المقطع التالي ←</button>` : ''}
    </div>`;
}

function vReview() {
  if (!session) {
    const due = dueIds();
    const upcoming = Object.keys(S.segs).filter(id => SEG[id] && !isDue(id)).sort((a, b) => S.segs[a].due < S.segs[b].due ? -1 : 1).slice(0, 6);
    if (!Object.keys(S.segs).length) return `<h1>المراجعة</h1><section class="card stack"><h2>لا محفوظات بعد</h2><p class="muted">عندما تحفظ مقطعًا يظهر هنا في موعد مراجعته: بعد يوم، ثم ثلاثة أيام، ثم تتباعد المواعيد كلما ثبت الحفظ.</p><div class="row"><button class="btn primary" data-act="tab" data-to="surahs">اختر سورة للحفظ</button></div></section>`;
    return `<h1>المراجعة</h1>
      <section class="card stack ${due.length ? 'today' : ''}"><h2>${due.length ? `${ar(due.length)} ${due.length < 3 ? (due.length === 1 ? 'مقطع مستحق' : 'مقطعان مستحقان') : due.length < 11 ? 'مقاطع مستحقة' : 'مقطعًا مستحقًا'} اليوم` : 'لا مراجعة مستحقة اليوم'}</h2>
        <p class="muted">${due.length ? 'اتلُ كل مقطع من حفظك، ثم اكشفه وقيّم تلاوتك بصدق.' : 'أحسنت. عُد غدًا، أو راجع مقطعًا قبل موعده من القائمة.'}</p>
        ${due.length ? '<div class="row"><button class="btn big" data-act="start-review">ابدأ المراجعة</button></div>' : ''}</section>
      ${upcoming.length ? `<h2>المراجعات القادمة</h2><div class="stack">${upcoming.map(id => { const g = SEG[id]; return `<button class="seg" data-act="review-one" data-id="${id}"><span class="grow"><b>سورة ${surah(g.s).name}</b><span class="muted small" style="display:block">${rangeLabel(g)}</span></span>${segStatus(g)}</button>`; }).join('')}</div>` : ''}`;
  }
  if (session.i >= session.q.length) {
    const n = session.q.length, good = session.good;
    return `<section class="card stack center"><h1>تمّت المراجعة</h1><p>راجعت ${ar(n)} ${n === 1 ? 'مقطعًا واحدًا' : n === 2 ? 'مقطعين' : n < 11 ? 'مقاطع' : 'مقطعًا'}، منها ${ar(good)} بإتقان.</p>
      <p class="muted">ما تعثّرت فيه سيعود إليك غدًا.</p><div class="row"><button class="btn primary" data-act="end-review">العودة إلى الرئيسية</button></div></section>`;
  }
  const id = session.q[session.i], g = SEG[id], st = S.segs[id];
  const labels = ['نسيت', 'بصعوبة', 'جيد', 'متقن'];
  return `<div class="row"><span class="muted grow">${ar(session.i + 1)} من ${ar(session.q.length)}</span><button class="btn quiet" data-act="end-review">إنهاء</button></div>
    <div class="bar"><i style="width:${session.i / session.q.length * 100}%"></i></div>
    <div><h1>سورة ${surah(g.s).name}</h1><p class="muted">${rangeLabel(g)}</p></div>
    <div class="mushaf">${segHTML(g, session.open ? 'full' : 'prompt')}</div>
    ${session.open
      ? `<p class="muted small">كيف كانت تلاوتك من الحفظ؟</p><div class="grades">${labels.map((t, k) => `<button class="btn g${k}" data-act="grade" data-g="${k}">${t}<small>${intervalLabel(nextInterval(st, k))}</small></button>`).join('')}</div>`
      : `<p class="muted small">اتلُ المقطع كاملًا من حفظك. اضغط على آية لكشفها وحدها.</p><div class="row"><button class="btn primary big grow" data-act="reveal">اكشف المقطع</button></div>`}`;
}

/* quiz */
function quizPool() {
  const pool = [];
  if (quizScope === 'mine') { for (const id of Object.keys(S.segs)) { const g = SEG[id]; if (g) for (let a = g.a; a <= g.b; a++) pool.push([g.s, a]); } }
  else { const s = surah(+quizScope); for (let a = 1; a <= s.count; a++) pool.push([s.n, a]); }
  return pool;
}
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clip = (t, n = 14) => { const w = t.split(' '); return w.length > n ? w.slice(0, n).join(' ') + ' …' : t; };
function makeQuiz() {
  const pool = quizPool();
  const key = ([s, a]) => s + ':' + a;
  const inPool = new Set(pool.map(key));
  const qs = [];
  for (const [s, a] of shuffle(pool.slice())) {
    if (qs.length >= 10) break;
    const text = verseText(s, a), w = text.split(' ');
    const canNext = a < surah(s).count && inPool.has(key([s, a + 1]));
    const canFill = w.length >= 6;
    if (!canNext && !canFill) continue;
    const type = canNext && canFill ? (Math.random() < .6 ? 'next' : 'fill') : canNext ? 'next' : 'fill';
    const half = Math.ceil(w.length / 2);
    const answer = type === 'next' ? clip(verseText(s, a + 1)) : clip(w.slice(half).join(' '));
    const opts = new Set([answer]);
    // distractors: nearby ayat first (harder), then anything in the pool
    const near = shuffle(pool.filter(p => p[0] === s && Math.abs(p[1] - a) <= 12 && p[1] !== a));
    const far = shuffle(pool.filter(p => !(p[0] === s && Math.abs(p[1] - a) <= 12)));
    for (const [ps, pa] of near.concat(far)) {
      if (opts.size >= 4) break;
      const pw = verseText(ps, pa).split(' ');
      if (type === 'fill' && pw.length < 4) continue;
      opts.add(type === 'next' ? clip(pw.join(' ')) : clip(pw.slice(Math.ceil(pw.length / 2)).join(' ')));
    }
    if (opts.size < 4) continue;
    qs.push({ s, a, type, prompt: type === 'next' ? clip(text, 22) : w.slice(0, half).join(' ') + ' …', answer, opts: shuffle([...opts]) });
  }
  return qs;
}
function vQuiz() {
  if (!quiz) {
    const mine = memAyat();
    return `<h1>اختبر حفظك</h1>
      <section class="card stack">
        <div class="field"><label for="quiz-scope">نطاق الأسئلة</label><select id="quiz-scope">
          <option value="mine"${quizScope === 'mine' ? ' selected' : ''}>محفوظاتي (${ar(mine)} آية)</option>
          ${Q.surahs.map(s => `<option value="${s.n}"${quizScope === String(s.n) ? ' selected' : ''}>${ar(s.n)}. سورة ${s.name}</option>`).join('')}</select></div>
        <p class="muted small">عشرة أسئلة: ما الآية التالية؟ وأكمل الآية.</p>
        <div class="row"><button class="btn primary big" data-act="start-quiz">ابدأ الاختبار</button></div>
      </section>`;
  }
  if (quiz.i >= quiz.qs.length) {
    const n = quiz.qs.length;
    return `<section class="card stack center"><h1>${ar(quiz.score)} من ${ar(n)}</h1>
      <p class="muted">${quiz.score === n ? 'ما شاء الله، إجابات كلها صحيحة.' : quiz.score >= n * .7 ? 'حفظ جيد. راجع ما أخطأت فيه.' : 'هذه الآيات تحتاج إلى مراجعة أكثر.'}</p>
      <div class="row"><button class="btn primary" data-act="start-quiz">اختبار جديد</button><button class="btn" data-act="quit-quiz">تغيير النطاق</button></div></section>`;
  }
  const q = quiz.qs[quiz.i];
  return `<div class="row"><span class="muted grow">السؤال ${ar(quiz.i + 1)} من ${ar(quiz.qs.length)}</span><button class="btn quiet" data-act="quit-quiz">إنهاء</button></div>
    <div class="bar"><i style="width:${quiz.i / quiz.qs.length * 100}%"></i></div>
    <section class="card stack"><p class="muted small">${q.type === 'next' ? 'ما الآية التي تلي قوله تعالى' : 'أكمل قوله تعالى'} · سورة ${surah(q.s).name}</p><p class="quote">${q.prompt}</p></section>
    <div class="opts">${q.opts.map((o, k) => `<button class="opt${quiz.picked == null ? '' : o === q.answer ? ' right' : k === quiz.picked ? ' wrong' : ''}" data-act="answer" data-k="${k}"${quiz.picked == null ? '' : ' disabled'}>${o}</button>`).join('')}</div>
    ${quiz.picked == null ? '' : `<div class="row"><span class="grow ${q.opts[quiz.picked] === q.answer ? '' : 'muted'}">${q.opts[quiz.picked] === q.answer ? 'إجابة صحيحة' : 'الإجابة الصحيحة مظلّلة بالأخضر'}</span><button class="btn primary" data-act="next-q">${quiz.i + 1 < quiz.qs.length ? 'السؤال التالي' : 'النتيجة'}</button></div>`}`;
}

function vPrefs() {
  const p = S.prefs;
  return `<h1>الإعدادات</h1>
    <section class="card stack"><h2>العرض</h2>
      <div class="field"><label for="pref-size">حجم خط الآيات</label><input type="range" id="pref-size" min="20" max="44" step="2" value="${p.size}"></div>
      <div class="mushaf" id="size-sample">${ayahHTML(1, 2, 1e9)}</div>
      <div class="field"><label for="pref-theme">المظهر</label><select id="pref-theme">
        ${[['auto', 'حسب الجهاز'], ['light', 'فاتح'], ['dark', 'داكن']].map(([k, t]) => `<option value="${k}"${p.theme === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div></section>
    <section class="card stack"><h2>التلاوة</h2>
      <div class="field"><label for="pref-reciter">القارئ</label><select id="pref-reciter">${RECITERS.map(([k, t]) => `<option value="${k}"${p.reciter === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label for="pref-repeat">عدد مرات تكرار كل آية</label><select id="pref-repeat">${[1, 2, 3, 5, 7, 10].map(n => `<option value="${n}"${p.repeat === n ? ' selected' : ''}>${ar(n)}</option>`).join('')}</select></div>
      <p class="muted small">التلاوات من موقع everyayah.com وتحتاج إلى اتصال بالإنترنت.</p></section>
    <section class="card stack"><h2>النسخة الاحتياطية</h2>
      <p class="muted small">تقدّمك محفوظ في هذا المتصفح فقط. انسخ النص التالي واحتفظ به، والصقه هنا على جهاز آخر لاستعادة محفوظاتك.</p>
      <div class="field"><label for="backup-box">بيانات التقدّم</label><textarea id="backup-box" spellcheck="false">${JSON.stringify({ segs: S.segs, log: S.log, last: S.last, prefs: S.prefs })}</textarea></div>
      <div class="row"><button class="btn" data-act="copy-backup">انسخ</button><button class="btn" data-act="restore">استعد من النص</button><span class="grow"></span>
        <button class="btn danger" data-act="reset">${confirmReset ? 'اضغط مرة أخرى لتأكيد المسح' : 'امسح كل التقدّم'}</button></div></section>
    <p class="muted small">نص القرآن الكريم من مشروع تنزيل (Tanzil.net)، الإصدار المبسّط ١٫٠٫٢، منقول كما هو دون تغيير. <a href="http://tanzil.net" target="_blank" rel="noopener">tanzil.net</a></p>`;
}

/* ---------- events ---------- */
const acts = {
  tab: d => { if (d.to !== 'review') session = null; if (d.to !== 'quiz') quiz = null; go(d.to); },
  'open-surah': d => { S.last = +d.s; save(); go('surah', { s: +d.s }); },
  'open-seg': d => { S.last = SEG[d.id].s; save(); go('seg', { id: d.id, mode: 'full' }); },
  mode: d => { go('seg', { id: view.id, mode: d.mode }, true); },
  peek: (d, el) => { if (el.querySelector('.m')) el.classList.toggle('open'); },
  play: () => playSeg(SEG[view.id]),
  memorize: d => { memorize(d.id); save(); toast('أُضيف إلى محفوظاتك. موعد المراجعة الأولى غدًا.'); go('seg', { id: d.id, mode: view.mode }, true); },
  forget: d => { delete S.segs[d.id]; save(); toast('أُزيل المقطع من محفوظاتك.'); go('seg', { id: d.id, mode: view.mode }, true); },
  'mark-surah': d => {
    // spread first reviews over the coming week so they don't all land on one day
    surah(+d.s).segs.forEach((g, k) => memorize(g.id, 1 + (k % 7)));
    save(); toast('أُضيفت السورة إلى محفوظاتك.'); go('surah', { s: +d.s }, true);
  },
  'start-review': () => { session = { q: dueIds(), i: 0, good: 0, open: false }; go('review'); },
  'review-one': d => { session = { q: [d.id], i: 0, good: 0, open: false }; go('review'); },
  reveal: () => { session.open = true; go('review', {}, true); },
  grade: d => { const g = +d.g; grade(session.q[session.i], g); if (g >= 2) session.good++; session.i++; session.open = false; go('review'); },
  'end-review': () => { session = null; go('home'); },
  'start-quiz': () => {
    const qs = makeQuiz();
    if (qs.length < 3) { toast(quizScope === 'mine' ? 'محفوظاتك قليلة لتكوين اختبار. احفظ مقاطع أكثر أو اختر سورة.' : 'هذه السورة قصيرة لتكوين اختبار. اختر سورة أطول.'); return; }
    quiz = { qs, i: 0, score: 0, picked: null }; go('quiz');
  },
  answer: d => { if (quiz.picked != null) return; quiz.picked = +d.k; const q = quiz.qs[quiz.i]; if (q.opts[quiz.picked] === q.answer) quiz.score++; go('quiz', {}, true); },
  'next-q': () => { quiz.i++; quiz.picked = null; if (quiz.i >= quiz.qs.length) { logAct('quiz', quiz.qs.length); save(); } go('quiz'); },
  'quit-quiz': () => { quiz = null; go('quiz'); },
  'copy-backup': () => {
    const box = $('#backup-box');
    const fallback = () => { box.focus(); box.select(); toast('حُدِّد النص. انسخه يدويًا.'); };
    try { navigator.clipboard.writeText(box.value).then(() => toast('نُسخت بيانات التقدّم.'), fallback); } catch (e) { fallback(); }
  },
  restore: () => {
    try {
      const o = JSON.parse($('#backup-box').value);
      if (!o || typeof o.segs !== 'object') throw 0;
      S = normalize(o); save(); applyPrefs(); toast('استُعيدت محفوظاتك.'); go('prefs', {}, true);
    } catch (e) { toast('النص غير صالح. الصق النسخة الاحتياطية كاملة كما نسختها.'); }
  },
  reset: () => {
    if (!confirmReset) { confirmReset = true; go('prefs', {}, true); return; }
    confirmReset = false; S = normalize({ prefs: S.prefs }); save(); toast('مُسح كل التقدّم.'); go('prefs', {}, true);
  },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || !Q) return;
  if (el.dataset.act !== 'reset') confirmReset = false;
  acts[el.dataset.act](el.dataset, el);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.ayah')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'surah-search') { surahFilter = t.value; $('#surah-list').innerHTML = surahCards(); }
  else if (t.id === 'pref-size') { S.prefs.size = +t.value; applyPrefs(); save(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'quiz-scope') quizScope = t.value;
  else if (t.id === 'pref-theme') { S.prefs.theme = t.value; applyPrefs(); save(); }
  else if (t.id === 'pref-reciter') { S.prefs.reciter = t.value; save(); }
  else if (t.id === 'pref-repeat') { S.prefs.repeat = +t.value; save(); }
});
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (Q && TABS.some(t => t[0] === h) && h !== view.name) acts.tab({ to: h });
});

/* ---------- boot ---------- */
applyPrefs();
renderTabs();
fetch('data/quran.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => {
  Q = d; buildSegments();
  const h = location.hash.slice(1);
  go(TABS.some(t => t[0] === h) ? h : 'home');
}).catch(() => {
  app.innerHTML = '<section class="card stack"><h2>تعذّر تحميل نص القرآن الكريم</h2><p class="muted">تأكّد أن ملف data/quran.json موجود بجوار الصفحة وأن التطبيق يعمل عبر خادم ويب، ثم أعد تحميل الصفحة.</p></section>';
});
})();
