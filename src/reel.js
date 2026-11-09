// The reel's video, in a window of its own: upload (a real file from the computer or the
// phone, or a sample video), the processing on the server (skills pack, page 17, with the
// stop at the lead-name check), and then the editor: a player, trimming, what shows on the
// video (hook, captions, logo), the caption look, silences and noise, and the captions.
import { html, useState, useEffect, useRef, Icon, PencilCheck, cx } from './lib.js';
import { Button } from './components.js';
import { Sheet, Tag, TextSize } from './ui.js';
import { Canvas, ReelFrame, ReelCover, CAP_STYLES } from './art.js';
import { LIMITS, AD_LIB, REEL_STAGES, captionLines, spoken, fitCaps, capAt, fmtSec } from './content.js';

// Uploaded files live only in this tab (an object URL per item). After a reload the
// mockup falls back to the sample video.
const FILES = {};
export const reelFile = (id) => FILES[id] || null;
export const dropFile = (id) => {
  [id, `${id}~prev`].forEach((k) => {
    if (FILES[k]) URL.revokeObjectURL(FILES[k]);
    delete FILES[k];
  });
};
// Replacing a video keeps the one before it, so "לחזור לסרטון הקודם" can bring it back
// (and swap again). A new file only takes the item's place when the user saves.
const setFile = (id, url) => (url ? (FILES[id] = url) : delete FILES[id]);
function keepPrev(id) {
  const old = FILES[`${id}~prev`];
  if (old && old !== FILES[id]) URL.revokeObjectURL(old);
  setFile(`${id}~prev`, FILES[id]);
}
export function swapVideo(id) {
  const now = FILES[id];
  setFile(id, FILES[`${id}~prev`]);
  setFile(`${id}~prev`, now);
}
// Calls fn with the video's time on every frame while it plays (timeupdate is only 4 a second,
// too slow for captions), and loops inside the trim.
function useFrameTime(ref, playing, trim, fn) {
  useEffect(() => {
    if (!playing) return;
    let id;
    const tick = () => {
      const v = ref.current;
      if (v && trim && v.currentTime >= trim[1]) v.currentTime = trim[0];
      if (v) fn(v.currentTime);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, trim && trim[0], trim && trim[1]]);
}
// The uploaded video inside a reel frame, playing while "playing" is on, inside the trim.
export function VideoMedia({ src, playing, trim, onTime }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) {
      if (trim && (v.currentTime < trim[0] || v.currentTime >= trim[1])) v.currentTime = trim[0];
      v.play().catch(() => {});
    } else v.pause();
  }, [playing]);
  useFrameTime(ref, playing, trim, (x) => onTime && onTime(x));
  return html`<video ref=${ref} src=${src} muted loop playsinline style=${{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />`;
}
export const REEL_DEFAULT = { trim: null, hook: true, caps: true, logo: true, capStyle: 'box', capSize: 100, silence: true, noise: true, cover: 'design', coverAt: 1, edited: false };
// A video the user already edited (cuts, captions): only the name check runs, and nothing is added on top by default.
const EDITED = { hook: false, caps: false, silence: false, noise: false, edited: true };
export const COVERS = [{ id: 'design', label: 'כריכה מעוצבת' }, { id: 'frame', label: 'פריים מהסרטון' }];
export const reelOf = (st) => ({ ...REEL_DEFAULT, ...(st.reel || {}) });
const RAW = 41; // the sample video, before the silences are cut

const Toggle2 = ({ on, onClick, children }) => html`<button type="button" aria-pressed=${on} onClick=${onClick} class=${cx('inline-flex h-8 items-center gap-1.5 rounded-lg border-[1.5px] px-2.5 text-[13px] font-bold cursor-pointer', on ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-line bg-white text-muted hover:border-brand-300')}><${Icon} name=${on ? 'check' : 'plus'} size=${14} />${children}</button>`;
const Seg = ({ options, value, onChange }) => html`<span class="inline-flex flex-wrap rounded-lg bg-canvas p-0.5 ring-1 ring-line">${options.map((o) => html`<button key=${o.id} type="button" aria-pressed=${value === o.id} onClick=${() => onChange(o.id)} class=${cx('h-7 rounded-md px-2.5 text-[13px] font-bold cursor-pointer', value === o.id ? 'bg-white text-brand-600 shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink')}>${o.label}</button>`)}</span>`;
const Box = ({ title, aside, children }) => html`<section class="border-t border-line py-2.5 first:border-0 first:pt-0">
  <p class="mb-1.5 flex items-center justify-between gap-2 text-[13px] font-bold">${title}${aside}</p>${children}
</section>`;

export function ReelSheet({ item, st, setIt, tpl, p, photo, hook, script, startAt = 'pick', notify, onDelete, onClose }) {
  const [step, setStep] = useState(startAt === 'edit' && st.video === 'ready' ? 'edit' : 'pick');
  const [src, setSrc] = useState(FILES[item.id] || null);
  const [stage, setStage] = useState(0);
  const [names, setNames] = useState(st.names || null);
  const [caps, setCaps] = useState(st.caps || []);
  const [reel, setReel] = useState(reelOf(st));
  const [drag, setDrag] = useState(false);
  const [edited, setEdited] = useState(reelOf(st).edited);
  const [fresh, setFresh] = useState(false); // a new video in this window, not saved yet
  const stages = edited ? REEL_STAGES.slice(0, 3) : REEL_STAGES;
  const fileRef = useRef(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) return notify('צריך קובץ וידאו (MP4 או MOV)', 'triangle-alert');
    const url = URL.createObjectURL(f);
    setSrc(url);
    start();
  };
  const sample = () => {
    setSrc(null);
    start();
  };
  const start = () => {
    setFresh(true);
    setNames(null);
    setStage(0);
    setReel({ ...REEL_DEFAULT, ...(edited ? EDITED : {}) });
    setStep('process');
  };
  // The processing, stage by stage. At the name check it stops until the user answers.
  useEffect(() => {
    if (step !== 'process') return;
    if (stage === 2 && !names) return;
    if (stage >= stages.length) {
      setCaps(captionLines(spoken(script, names)));
      setStep('edit');
      return;
    }
    timer.current = setTimeout(() => setStage((n) => n + 1), 650);
  }, [step, stage, names]);

  const save = () => {
    const patch = { video: 'ready', caps, names, reel };
    if (fresh) {
      if (st.video === 'ready') (keepPrev(item.id), (patch.prev = { caps: st.caps, names: st.names, reel: st.reel }));
      setFile(item.id, src);
    }
    setIt(patch);
    notify(st.video === 'ready' ? 'השינויים בסרטון נשמרו' : 'הסרטון מוכן, עם כתוביות והוק', 'clapperboard');
    onClose();
  };
  const footer = step === 'edit'
    ? html`<${Button} variant="quiet" onClick=${onClose}>ביטול<//><${Button} onClick=${save}><${Icon} name="check" size=${17} />לשמור את הסרטון<//>`
    : html`<${Button} variant="quiet" onClick=${onClose}>ביטול<//><span></span>`;
  const title = step === 'pick' ? 'להעלות סרטון לרילס' : step === 'process' ? 'מעבדים את הסרטון' : 'עריכת הסרטון';
  return html`<${Sheet} xl=${step === 'edit'} wide=${step !== 'edit'} title=${title} onClose=${onClose} footer=${footer}>
    ${step === 'pick' && html`<div>
      <label
        class=${cx('flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center', drag ? 'border-brand-600 bg-brand-50' : 'border-line bg-white hover:border-brand-300')}
        onDragOver=${(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave=${() => setDrag(false)}
        onDrop=${(e) => (e.preventDefault(), setDrag(false), pickFile(e.dataTransfer.files[0]))}>
        <span class="grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-600"><${Icon} name="upload" size=${26} /></span>
        <b class="text-[17px]">לבחור סרטון מהמחשב או מהטלפון</b>
        <small class="text-[13px] text-muted">או לגרור לכאן · עד 3 דקות · אנכי (9:16) הכי טוב · MP4 או MOV</small>
        <input ref=${fileRef} type="file" accept="video/*" class="sr-only" onChange=${(e) => pickFile(e.target.files[0])} />
      </label>
      <div class="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="איזה סרטון">
        ${[[false, 'scissors', 'סרטון כמו שצולם', 'הכי פשוט. כאן מקצרים שתיקות, מנקים רעשים, ומוסיפים כתוביות, הוק ולוגו'], [true, 'clapperboard', 'סרטון שכבר ערכתי', 'עם חיתוכים או כתוביות משלך. רק בודקים שמות, ושום דבר לא נוסף עליו']].map(([v, icon, label, sub]) => html`<button key=${label} type="button" role="radio" aria-checked=${edited === v} onClick=${() => setEdited(v)} class=${cx('flex items-start gap-2.5 rounded-xl border-[1.5px] bg-white p-2.5 text-start cursor-pointer', edited === v ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
          <span class="mt-0.5 text-brand-600"><${Icon} name=${icon} size=${18} /></span>
          <span class="min-w-0"><b class="block text-[14px]">${label}</b><small class="block text-[12px] leading-snug text-muted">${sub}</small></span>
        </button>`)}
      </div>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
        <span class="flex items-center gap-1.5"><${Icon} name="shield-check" size=${15} />הסרטון נשמר רק אצלך, ולא יוצא לפני שתאשר</span>
        <button type="button" class="font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${sample}>להמשיך עם סרטון לדוגמה</button>
      </div>
    </div>`}
    ${step === 'process' && html`<div class="fb-stages rounded-xl bg-white p-3 ring-1 ring-line">
      ${stages.map((r, i) => html`<div key=${r.id} class=${cx('fb-stage', i < stage && 'is-done', i === stage && 'is-now', i > stage && 'is-next')}>
        <span class="fb-dot">${i < stage && html`<${PencilCheck} size=${16} color="#2d3e66" />`}</span>
        <span class="min-w-0"><span class="block">${r.label}</span><small class="block text-[12px] font-normal text-muted">${r.sub}</small></span>
      </div>`)}
      ${stage === 2 && !names && html`<div class="rise rounded-xl bg-warn-50 p-3 text-[14px]">
        <p class="mb-1 font-bold text-warn"><${Icon} name="user-x" size=${15} class="me-1 inline" />השם נועה מופיע בטבלת הלידים</p>
        <p class="mb-2">"${AD_LIB}" · בתוכן לא מזכירים לקוח מסוים.</p>
        <div class="flex flex-wrap gap-2"><${Button} variant="mini" onClick=${() => setNames('cut')}>לחתוך את המשפט<//><${Button} variant="quiet" onClick=${() => setNames('name')}>להשמיט רק את השם<//></div>
      </div>`}
    </div>`}
    ${step === 'edit' && html`<${ReelEdit} src=${src} caps=${caps} setCaps=${setCaps} reel=${reel} setReel=${(patch) => setReel((r) => ({ ...r, ...patch }))} names=${names} tpl=${tpl} p=${p} photo=${photo} hook=${hook} onReplace=${() => setStep('pick')} onDelete=${st.video === 'ready' && (() => (onDelete(), onClose()))} />`}
  <//>`;
}

// The editor: the player on one side, the edits on the other.
function ReelEdit({ src, caps, setCaps, reel, setReel, names, tpl, p, photo, hook, onReplace, onDelete }) {
  const video = useRef(null);
  const capsEnd = caps.length ? caps[caps.length - 1].to + 0.4 : 30;
  const [dur, setDur] = useState(src ? 0 : capsEnd);
  const trim = reel.trim || [0, dur];
  const [t, setT] = useState(trim[0]);
  const [playing, setPlaying] = useState(false);
  const [askDel, setAskDel] = useState(false);
  // The sample video: the time runs on a timer. A real video: the player's own time, every frame.
  useFrameTime(video, playing && !!src && !!dur, trim, setT);
  useEffect(() => {
    if (!playing || src) return;
    const id = setInterval(() => setT((x) => (x + 0.1 >= trim[1] ? trim[0] : x + 0.1)), 100);
    return () => clearInterval(id);
  }, [playing, src, trim[0], trim[1]]);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (playing) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [playing]);
  const seek = (x) => {
    const v = Math.max(trim[0], Math.min(trim[1], x));
    setT(v);
    if (video.current) video.current.currentTime = v;
  };
  const setTrim = (i, v) => {
    const next = [...trim];
    next[i] = v;
    if (next[1] - next[0] < 3) return;
    setReel({ trim: next });
    seek(i === 0 ? v : Math.min(t, v));
  };
  // Some files (a webm from a browser) only tell their length after a seek to the end.
  const gotDur = (d) => {
    const v = Math.min(180, d);
    setDur(v);
    setCaps(fitCaps(caps, v));
    if (!reel.trim || reel.trim[1] > v) setReel({ trim: [0, v] });
  };
  const rel = t - trim[0];
  // Captions keep their place in the video: cutting the start cuts its lines too.
  const now = capAt(caps, t);
  const cap = reel.caps ? now?.text : null;
  const shift = (d) => setCaps(caps.map((c) => ({ ...c, from: Math.max(0, +(c.from + d).toFixed(2)), to: Math.max(0.3, +(c.to + d).toFixed(2)) })));
  const media = src && html`<video ref=${video} src=${src} playsinline muted=${false} style=${{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
    onLoadedMetadata=${(e) => (Number.isFinite(e.target.duration) ? gotDur(e.target.duration) : (e.target.currentTime = 1e101))}
    onDurationChange=${(e) => { if (Number.isFinite(e.target.duration) && !dur) { gotDur(e.target.duration); e.target.currentTime = 0; } }}
    onTimeUpdate=${(e) => { if (!dur || playing) return; setT(Math.min(e.target.currentTime, trim[1])); }} />`;
  const pct = (x) => `${(x / (dur || 1)) * 100}%`;
  const range = 'fb-trim pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent';
  return html`<div class="grid items-start gap-5 md:grid-cols-[230px_1fr]">
    <div class="mx-auto w-full max-w-[230px]">
      <button type="button" class="block w-full cursor-pointer" onClick=${() => setPlaying((x) => !x)} aria-label=${playing ? 'עצירה' : 'ניגון'}>
        <${Canvas} w=${1080} h=${1920} round=${14}><${ReelFrame} t=${tpl} p=${p} hook=${reel.hook ? hook : null} caption=${cap} photo=${photo} playing=${playing} media=${media} capStyle=${reel.capStyle} capSize=${reel.capSize} brand=${reel.logo} /><//>
      </button>
      <div class="mt-2 flex items-center gap-2">
        <button type="button" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white cursor-pointer" onClick=${() => setPlaying((x) => !x)} aria-label=${playing ? 'עצירה' : 'ניגון'}><${Icon} name=${playing ? 'pause' : 'play'} size=${16} /></button>
        <input type="range" dir="ltr" min=${trim[0]} max=${trim[1]} step="0.1" value=${t} onInput=${(e) => seek(+e.target.value)} class="fb-range fb-range-ltr min-w-0 flex-1" style=${{ '--p': `${((t - trim[0]) / (trim[1] - trim[0] || 1)) * 100}%` }} aria-label="מיקום בסרטון" />
        <span class="shrink-0 text-[12px] tabular-nums text-muted" dir="ltr">${fmtSec(rel)} / ${fmtSec(trim[1] - trim[0])}</span>
      </div>
      ${askDel
        ? html`<p class="rise mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg bg-error-50 px-2 py-1.5 text-center text-[13px]"><b class="text-error">למחוק את הסרטון?</b><button type="button" class="font-bold text-error underline underline-offset-2 cursor-pointer" onClick=${onDelete}>כן, למחוק</button><button type="button" class="font-bold text-muted underline underline-offset-2 cursor-pointer" onClick=${() => setAskDel(false)}>לא</button></p>`
        : html`<p class="mt-1 text-center text-[12px] text-muted">${src ? 'הסרטון שהעלית' : 'סרטון לדוגמה'} · <button type="button" class="font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${onReplace}>להחליף</button>${onDelete && html` · <button type="button" class="font-bold text-error underline underline-offset-2 cursor-pointer" onClick=${() => setAskDel(true)}>למחוק</button>`}</p>`}
    </div>
    <div class="min-w-0">
      <${Box} title="חיתוך" aside=${html`<span class="text-[12px] font-normal text-muted" dir="rtl">מ-${fmtSec(trim[0])} עד ${fmtSec(trim[1])} · ${Math.round(trim[1] - trim[0])} שניות</span>`}>
        <div class="relative h-12 overflow-hidden rounded-lg bg-ink/80" dir="ltr">
          ${Array.from({ length: 12 }, (_, i) => html`<span key=${i} class="absolute top-0 h-full border-l border-white/10" style=${{ left: `${(i / 12) * 100}%`, width: `${100 / 12}%`, background: src ? `hsl(225 18% ${22 + (i % 3) * 5}%)` : `url(${photo}) center/cover`, opacity: src ? 1 : 0.55 }}></span>`)}
          <span class="absolute inset-y-0 left-0 bg-black/60" style=${{ width: pct(trim[0]) }}></span>
          <span class="absolute inset-y-0 right-0 bg-black/60" style=${{ width: `calc(100% - ${pct(trim[1])})` }}></span>
          <span class="absolute inset-y-0 rounded-md border-[3px] border-[#ffd23f]" style=${{ left: pct(trim[0]), width: `calc(${pct(trim[1])} - ${pct(trim[0])})` }}></span>
          <span class="absolute inset-y-0 w-0.5 bg-white" style=${{ left: pct(t) }}></span>
          <input type="range" min="0" max=${dur || 1} step="0.1" value=${trim[0]} onInput=${(e) => setTrim(0, +e.target.value)} class=${range} aria-label="תחילת הסרטון" />
          <input type="range" min="0" max=${dur || 1} step="0.1" value=${trim[1]} onInput=${(e) => setTrim(1, +e.target.value)} class=${range} aria-label="סוף הסרטון" />
        </div>
        <p class="mt-1 text-[12px] text-muted">גוררים את הקצוות הצהובים. ${src ? '' : `המקור ${fmtSec(RAW)}, אחרי קיצור השתיקות ${fmtSec(capsEnd)}.`}</p>
      <//>
      <${Box} title="מה מופיע על הסרטון">
        <div class="flex flex-wrap items-center gap-1.5">
          <${Toggle2} on=${reel.hook} onClick=${() => setReel({ hook: !reel.hook })}>הוק למעלה<//>
          <${Toggle2} on=${reel.caps} onClick=${() => setReel({ caps: !reel.caps })}>כתוביות<//>
          <${Toggle2} on=${reel.logo} onClick=${() => setReel({ logo: !reel.logo })}>לוגו ושם<//>
          ${reel.caps && html`<span class="ms-1 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">כתוביות:<${Seg} options=${CAP_STYLES} value=${reel.capStyle} onChange=${(v) => setReel({ capStyle: v })} /><${TextSize} label="גודל הכתוביות" value=${reel.capSize} onChange=${(v) => setReel({ capSize: v })} /></span>`}
        </div>
      <//>
      <${Box} title="הכריכה" aside=${html`<span class="text-[12px] font-normal text-muted">בפרופיל ובלשונית הרילס</span>`}>
        <div class="flex items-start gap-3">
          <span class="block w-[72px] shrink-0">
            <${Canvas} w=${1080} h=${1920} round=${6}>${reel.cover === 'design'
              ? html`<${ReelCover} t=${tpl} p=${p} photo=${photo} hook=${hook} />`
              : html`<${ReelFrame} t=${tpl} p=${p} hook=${reel.hook ? hook : null} photo=${photo} playing brand=${reel.logo} />`}<//>
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <${Seg} options=${COVERS} value=${reel.cover} onChange=${(v) => setReel({ cover: v })} />
              ${reel.cover === 'frame' && html`<button type="button" class="text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => setReel({ coverAt: rel })}>הפריים הנוכחי (${fmtSec(rel)})</button>`}
            </div>
            <p class="mt-1 text-[12px] leading-snug text-muted">${reel.cover === 'design'
              ? 'התמונה שלך וההוק, בתבנית. הכריכה לא חייבת להיות מתוך הסרטון.'
              : `פריים מ-${fmtSec(reel.coverAt)}. עוצרים את הסרטון איפה שרוצים, ולוחצים "הפריים הנוכחי".`}</p>
          </div>
        </div>
      <//>
      <${Box} title="ניקוי הסאונד">
        <div class="flex flex-wrap gap-1.5">
          <${Toggle2} on=${reel.silence} onClick=${() => setReel({ silence: !reel.silence })}>קיצור שתיקות (6 נמצאו)<//>
          <${Toggle2} on=${reel.noise} onClick=${() => setReel({ noise: !reel.noise })}>ניקוי רעשי רקע<//>
        </div>
      <//>
      <${Box} title="הכתוביות" aside=${html`<span class="flex items-center gap-1.5">${names && html`<${Tag}>${names === 'cut' ? 'משפט אחד נחתך' : 'השם הושמט'}<//>`}${src && html`<span class="flex items-center gap-1 text-[12px] font-normal text-muted">סנכרון<button type="button" class="h-6 rounded-md bg-canvas px-1.5 font-bold text-ink ring-1 ring-line cursor-pointer" onClick=${() => shift(-0.2)}>מוקדם יותר</button><button type="button" class="h-6 rounded-md bg-canvas px-1.5 font-bold text-ink ring-1 ring-line cursor-pointer" onClick=${() => shift(0.2)}>מאוחר יותר</button></span>`}</span>`}>
        ${src && html`<p class="mb-1 text-[12px] leading-snug text-muted">כל שורה עולה כשאומרים אותה. בדמו אין תמלול, אז השורות לפי התסריט ופרושות על אורך הסרטון. מקדימות או מאחרות? "סנכרון".</p>`}
        <ul class="thin-scroll max-h-[150px] overflow-y-auto rounded-xl bg-white ring-1 ring-line">
          ${caps.map((c) => html`<li key=${c.id} class=${cx('flex items-center gap-2 border-b border-line px-2 py-0.5 last:border-0', now && now.id === c.id && 'bg-brand-50', (c.to < trim[0] || c.from > trim[1]) && 'opacity-45')}>
            <button type="button" aria-label="לקפוץ לשורה" class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-brand-600 hover:bg-brand-100 cursor-pointer" onClick=${() => seek(c.from + 0.01)}><${Icon} name="play" size=${13} /></button>
            <span class="w-[36px] shrink-0 text-[12px] tabular-nums text-muted" dir="ltr">${fmtSec(c.from)}.${Math.floor((c.from % 1) * 10)}</span>
            <input class="h-8 min-w-0 flex-1 rounded-lg border border-transparent px-1.5 text-[15px] hover:border-line focus:border-brand-600 focus:outline-none" value=${c.text} onInput=${(e) => setCaps(caps.map((x) => (x.id === c.id ? { ...x, text: e.target.value } : x)))} aria-label="שורת כתובית" />
            <span class=${cx('text-[12px] font-bold tabular-nums', c.text.length > LIMITS.capChars ? 'text-error' : 'text-muted')}>${c.text.length}/${LIMITS.capChars}</span>
          </li>`)}
        </ul>
      <//>
    </div>
  </div>`;
}
