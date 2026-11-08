// The reel's video, in a window of its own: upload (a real file from the computer or the
// phone, or a sample video), the processing on the server (skills pack, page 17, with the
// stop at the lead-name check), and then the editor: a player, trimming, what shows on the
// video (hook, captions, logo), the caption look, silences and noise, and the captions.
import { html, useState, useEffect, useRef, Icon, PencilCheck, cx } from './lib.js';
import { Button } from './components.js';
import { Sheet, Tag } from './ui.js';
import { Canvas, ReelFrame, CAP_STYLES } from './art.js';
import { LIMITS, TRANSCRIPT, REEL_STAGES, captionLines, fmtSec } from './content.js';

// Uploaded files live only in this tab (an object URL per item). After a reload the
// mockup falls back to the sample video.
const FILES = {};
export const reelFile = (id) => FILES[id] || null;
// The uploaded video inside a reel frame, playing while "playing" is on.
export function VideoMedia({ src, playing }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);
  return html`<video ref=${ref} src=${src} muted loop playsinline style=${{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />`;
}
export const REEL_DEFAULT = { trim: null, hook: true, caps: true, logo: true, capStyle: 'box', silence: true, noise: true };
export const reelOf = (st) => ({ ...REEL_DEFAULT, ...(st.reel || {}) });
const RAW = 41; // the sample video, before the silences are cut

const Toggle2 = ({ on, onClick, children }) => html`<button type="button" aria-pressed=${on} onClick=${onClick} class=${cx('inline-flex h-8 items-center gap-1.5 rounded-lg border-[1.5px] px-2.5 text-[13px] font-bold cursor-pointer', on ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-line bg-white text-muted hover:border-brand-300')}><${Icon} name=${on ? 'check' : 'plus'} size=${14} />${children}</button>`;
const Seg = ({ options, value, onChange }) => html`<span class="inline-flex flex-wrap rounded-lg bg-canvas p-0.5 ring-1 ring-line">${options.map((o) => html`<button key=${o.id} type="button" aria-pressed=${value === o.id} onClick=${() => onChange(o.id)} class=${cx('h-7 rounded-md px-2.5 text-[13px] font-bold cursor-pointer', value === o.id ? 'bg-white text-brand-600 shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink')}>${o.label}</button>`)}</span>`;
const Box = ({ title, aside, children }) => html`<section class="border-t border-line py-2.5 first:border-0 first:pt-0">
  <p class="mb-1.5 flex items-center justify-between gap-2 text-[13px] font-bold">${title}${aside}</p>${children}
</section>`;

export function ReelSheet({ item, st, setIt, tpl, p, photo, hook, startAt = 'pick', notify, onClose }) {
  const [step, setStep] = useState(startAt === 'edit' && st.video === 'ready' ? 'edit' : 'pick');
  const [src, setSrc] = useState(FILES[item.id] || null);
  const [stage, setStage] = useState(0);
  const [names, setNames] = useState(st.names || null);
  const [caps, setCaps] = useState(st.caps || []);
  const [reel, setReel] = useState(reelOf(st));
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) return notify('צריך קובץ וידאו (MP4 או MOV)', 'triangle-alert');
    const url = URL.createObjectURL(f);
    FILES[item.id] = url;
    setSrc(url);
    start();
  };
  const sample = () => {
    delete FILES[item.id];
    setSrc(null);
    start();
  };
  const start = () => {
    setNames(null);
    setStage(0);
    setReel({ ...REEL_DEFAULT });
    setStep('process');
  };
  // The processing, stage by stage. At the name check it stops until the user answers.
  useEffect(() => {
    if (step !== 'process') return;
    if (stage === 2 && !names) return;
    if (stage >= REEL_STAGES.length) {
      setCaps(captionLines(TRANSCRIPT.filter((x, i) => !(names === 'cut' && i === 2)).map((x) => (names === 'name' ? x.replace('לנועה ', '') : x))));
      setStep('edit');
      return;
    }
    timer.current = setTimeout(() => setStage((n) => n + 1), 650);
  }, [step, stage, names]);

  const save = () => {
    setIt({ video: 'ready', caps, names, reel });
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
      <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
        <span class="flex items-center gap-1.5"><${Icon} name="shield-check" size=${15} />הסרטון נשמר רק אצלך, ולא יוצא לפני שתאשר</span>
        <button type="button" class="font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${sample}>להמשיך עם סרטון לדוגמה</button>
      </div>
    </div>`}
    ${step === 'process' && html`<div class="fb-stages rounded-xl bg-white p-3 ring-1 ring-line">
      ${REEL_STAGES.map((r, i) => html`<div key=${r.id} class=${cx('fb-stage', i < stage && 'is-done', i === stage && 'is-now', i > stage && 'is-next')}>
        <span class="fb-dot">${i < stage && html`<${PencilCheck} size=${16} color="#2d3e66" />`}</span>
        <span class="min-w-0"><span class="block">${r.label}</span><small class="block text-[12px] font-normal text-muted">${r.sub}</small></span>
      </div>`)}
      ${stage === 2 && !names && html`<div class="rise rounded-xl bg-warn-50 p-3 text-[14px]">
        <p class="mb-1 font-bold text-warn"><${Icon} name="user-x" size=${15} class="me-1 inline" />השם נועה מופיע בטבלת הלידים</p>
        <p class="mb-2">"${TRANSCRIPT[2]}" · בתוכן לא מזכירים לקוח מסוים.</p>
        <div class="flex flex-wrap gap-2"><${Button} variant="mini" onClick=${() => setNames('cut')}>לחתוך את המשפט<//><${Button} variant="quiet" onClick=${() => setNames('name')}>להשמיט רק את השם<//></div>
      </div>`}
    </div>`}
    ${step === 'edit' && html`<${ReelEdit} src=${src} caps=${caps} setCaps=${setCaps} reel=${reel} setReel=${(patch) => setReel((r) => ({ ...r, ...patch }))} names=${names} tpl=${tpl} p=${p} photo=${photo} hook=${hook} onReplace=${() => setStep('pick')} />`}
  <//>`;
}

// The editor: the player on one side, the edits on the other.
function ReelEdit({ src, caps, setCaps, reel, setReel, names, tpl, p, photo, hook, onReplace }) {
  const video = useRef(null);
  const capsEnd = caps.length ? caps[caps.length - 1].to + 0.4 : 30;
  const [dur, setDur] = useState(src ? 0 : capsEnd);
  const trim = reel.trim || [0, dur];
  const [t, setT] = useState(trim[0]);
  const [playing, setPlaying] = useState(false);
  // The sample video: the time runs on a timer. A real video: the player's own time.
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
    if (!reel.trim || reel.trim[1] > v) setReel({ trim: [0, v] });
  };
  const rel = t - trim[0];
  const cap = reel.caps ? caps.find((c) => rel >= c.from && rel < c.to + 0.1)?.text : null;
  const media = src && html`<video ref=${video} src=${src} playsinline muted=${false} style=${{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
    onLoadedMetadata=${(e) => (Number.isFinite(e.target.duration) ? gotDur(e.target.duration) : (e.target.currentTime = 1e101))}
    onDurationChange=${(e) => { if (Number.isFinite(e.target.duration) && !dur) { gotDur(e.target.duration); e.target.currentTime = 0; } }}
    onTimeUpdate=${(e) => { if (!dur) return; const x = e.target.currentTime; if (x >= trim[1]) e.target.currentTime = trim[0]; setT(Math.min(x, trim[1])); }} />`;
  const pct = (x) => `${(x / (dur || 1)) * 100}%`;
  const range = 'fb-trim pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent';
  return html`<div class="grid items-start gap-5 md:grid-cols-[230px_1fr]">
    <div class="mx-auto w-full max-w-[230px]">
      <button type="button" class="block w-full cursor-pointer" onClick=${() => setPlaying((x) => !x)} aria-label=${playing ? 'עצירה' : 'ניגון'}>
        <${Canvas} w=${1080} h=${1920} round=${14}><${ReelFrame} t=${tpl} p=${p} hook=${reel.hook ? hook : null} caption=${cap} photo=${photo} playing=${playing} media=${media} capStyle=${reel.capStyle} brand=${reel.logo} /><//>
      </button>
      <div class="mt-2 flex items-center gap-2">
        <button type="button" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white cursor-pointer" onClick=${() => setPlaying((x) => !x)} aria-label=${playing ? 'עצירה' : 'ניגון'}><${Icon} name=${playing ? 'pause' : 'play'} size=${16} /></button>
        <input type="range" dir="ltr" min=${trim[0]} max=${trim[1]} step="0.1" value=${t} onInput=${(e) => seek(+e.target.value)} class="fb-range fb-range-ltr min-w-0 flex-1" style=${{ '--p': `${((t - trim[0]) / (trim[1] - trim[0] || 1)) * 100}%` }} aria-label="מיקום בסרטון" />
        <span class="shrink-0 text-[12px] tabular-nums text-muted" dir="ltr">${fmtSec(rel)} / ${fmtSec(trim[1] - trim[0])}</span>
      </div>
      <p class="mt-1 text-center text-[12px] text-muted">${src ? 'הסרטון שהעלית' : 'סרטון לדוגמה'} · <button type="button" class="font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${onReplace}>להחליף</button></p>
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
          ${reel.caps && html`<span class="ms-1 flex items-center gap-1.5 text-[13px] text-muted">כתוביות:<${Seg} options=${CAP_STYLES} value=${reel.capStyle} onChange=${(v) => setReel({ capStyle: v })} /></span>`}
        </div>
      <//>
      <${Box} title="ניקוי הסאונד">
        <div class="flex flex-wrap gap-1.5">
          <${Toggle2} on=${reel.silence} onClick=${() => setReel({ silence: !reel.silence })}>קיצור שתיקות (6 נמצאו)<//>
          <${Toggle2} on=${reel.noise} onClick=${() => setReel({ noise: !reel.noise })}>ניקוי רעשי רקע<//>
        </div>
      <//>
      <${Box} title="הכתוביות" aside=${names && html`<${Tag}>${names === 'cut' ? 'משפט אחד נחתך' : 'השם הושמט'}<//>`}>
        <ul class="thin-scroll max-h-[170px] overflow-y-auto rounded-xl bg-white ring-1 ring-line">
          ${caps.map((c) => html`<li key=${c.id} class=${cx('flex items-center gap-2 border-b border-line px-2 py-0.5 last:border-0', cap === c.text && 'bg-brand-50')}>
            <button type="button" aria-label="לקפוץ לשורה" class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-brand-600 hover:bg-brand-100 cursor-pointer" onClick=${() => seek(trim[0] + c.from)}><${Icon} name="play" size=${13} /></button>
            <span class="w-[36px] shrink-0 text-[12px] tabular-nums text-muted">${fmtSec(c.from)}</span>
            <input class="h-8 min-w-0 flex-1 rounded-lg border border-transparent px-1.5 text-[15px] hover:border-line focus:border-brand-600 focus:outline-none" value=${c.text} onInput=${(e) => setCaps(caps.map((x) => (x.id === c.id ? { ...x, text: e.target.value } : x)))} aria-label="שורת כתובית" />
            <span class=${cx('text-[12px] font-bold tabular-nums', c.text.length > LIMITS.capChars ? 'text-error' : 'text-muted')}>${c.text.length}/${LIMITS.capChars}</span>
          </li>`)}
        </ul>
      <//>
    </div>
  </div>`;
}
