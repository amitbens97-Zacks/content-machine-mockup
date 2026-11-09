// Step 10, "מכונת תוכן שיווקי" (chapter 4): opening, channels, the look, the writing
// (3 topics, then a screen per item), the flyer, and the finish. The week plan
// (days, times, scheduling) is in publish.js. Nothing the user already answered in an
// earlier step is asked again: it is filled in and marked with the step it came from.
// From the second week on, the step is only the topics, the items and the week plan.
import { html, useState, useEffect, useRef, Icon, PencilCheck, PencilLine, cx, confetti, money } from './lib.js';
import { Button, Note, StepHeading, SharkAvatar, SubStep } from './components.js';
import { Chips, inputCls, Tag } from './ui.js';
import { USER, BRAND, META, PAGE_LINK, PLATFORMS, STYLES, TEMPLATES, RECOMMENDED_TEMPLATE, TYPES, FORMATS, TOPICS, TOPIC_CHOICES, TOPIC_WHY, LAST_WEEK_STATS, OFFER, PARTS, PART_HINT, MAX_WEEKS, partLabel, partNo, weekDays, weekRange, MESSAGE_LINES, BIOS, WORDS, DESIGN, g } from './data.js';
import { Canvas, Slide, SLIDE_LOOK, SLIDE_ALIGN, ReelFrame, ReelCover, Flyer, PostImage, POST_LAYOUTS, POST_LOOK, LAYOUTS, FLYER_FONTS, FLYER_BG, FLYER_SIZES, FLYER_POS, FLYER_LOOK, palette } from './art.js';
import { words, LIMITS, topicOf, checkText, postVersions, postQuote, CHANGES, changeOptions, carouselSlides, slideFields, reelScript, fmtSec } from './content.js';
import { MetaSheet } from './publish.js';
import { ReelSheet, reelOf, reelFile, VideoMedia } from './reel.js';

export function Toggle({ on, onChange, label }) {
  return html`<button
    type="button"
    role="switch"
    aria-checked=${on}
    aria-label=${label}
    onClick=${() => onChange(!on)}
    class=${cx('relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer', on ? 'bg-brand-600' : 'bg-[#cfd5e0]')}
  ><span class=${cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'start-[22px]' : 'start-0.5')}></span></button>`;
}
const From = ({ children }) => html`<span class="fb-filled-by"><${Icon} name="pencil" size=${14} />${children}</span>`;
// A small on/off chip, for "what shows on the flyer".
const OnChip = ({ on, onClick, children }) => html`<button type="button" aria-pressed=${on} onClick=${onClick}
  class=${cx('inline-flex h-8 items-center gap-1 rounded-lg border-[1.5px] px-2.5 text-[13px] font-bold cursor-pointer', on ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white text-muted hover:border-brand-300')}
><${Icon} name=${on ? 'check' : 'plus'} size=${13} />${children}</button>`;
// Small option chips, one row.
const Mini = ({ options, value, onChange }) => html`<div class="flex flex-wrap gap-1.5" role="radiogroup">${options.map((o) => html`<button key=${o.id} type="button" role="radio" aria-checked=${value === o.id} onClick=${() => onChange(o.id)}
  class=${cx('h-8 rounded-lg border-[1.5px] px-2.5 text-[13px] font-bold cursor-pointer', value === o.id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')}>${o.label}</button>`)}</div>`;

export const tplOf = (cfg) => TEMPLATES.find((t) => t.id === cfg.template) || TEMPLATES[0];
export const palOf = (cfg, flags, swatch) => palette(tplOf(cfg), cfg.colors, flags.noLogo, swatch);
export const photoOf = (cfg, flags) => (flags.noPhoto && cfg.photo !== 'upload' ? null : USER.photo);
export const fmtOf = (id) => FORMATS.find((f) => f.id === id);
export const typeOf = (id) => TYPES.find((t) => t.id === id);
export const dayOf = (id) => weekDays().find((d) => d.id === id);
// The state of one item of the week, with its defaults.
// The post image of an item: its look, the quote and the signature (both edited on the image).
export const postImg = (st, tp) => ({ look: { ...POST_LOOK, ...(st.img?.look || {}), show: { ...POST_LOOK.show, ...(st.img?.look?.show || {}) } }, quote: st.img?.quote || postQuote(tp), sign: st.img?.sign || '' });
// The carousel's own design: its template (the week's by default), accent, background,
// text size, font, alignment and what shows. The same for all its slides.
export const slideLook = (st) => ({ ...SLIDE_LOOK, ...(st.look || {}), show: { ...SLIDE_LOOK.show, ...(st.look?.show || {}) } });
export function carouselArt(st, cfg, flags) {
  const look = slideLook(st);
  const t = TEMPLATES.find((x) => x.id === look.tpl) || tplOf(cfg);
  return { t, p: palette(t, cfg.colors, flags.noLogo, look.swatch), look };
}
export function itemState(cfg, item) {
  const t = topicOf(item);
  const s = cfg.items[item.id] || {};
  return {
    version: s.version || 'long',
    texts: s.texts || {},
    slides: s.slides || carouselSlides(t),
    hook: s.hook ?? 0,
    video: s.video || null,
    caps: s.caps || null,
    approved: !!s.approved,
    names: s.names || null,
    img: s.img || null,
    reel: s.reel || null,
    look: s.look || null,
  };
}
// The text that goes out with an item.
export function captionOf(cfg, item) {
  const t = topicOf(item);
  const s = itemState(cfg, item);
  const v = postVersions(t, item).find((x) => x.id === s.version);
  return s.texts[s.version] ?? v.text;
}

// ---------- opening (first entry only) ----------

export function Opening({ cfg, flags }) {
  const t = tplOf(cfg);
  const p = palOf(cfg, flags);
  const photo = photoOf(cfg, flags) || USER.photo;
  return html`<div class="mx-auto grid max-w-[1120px] items-center gap-6 px-4 py-4 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:px-8 md:py-5">
    <div>
      <${StepHeading} n="10" eyebrow="שלב 10 · מביאים לקוחות" title=${['שבוע של תוכן, ופלייר אחד, ', 'מוכנים לפרסום', '']} />
      <p class="-mt-1 mb-3 max-w-[46ch] text-[17px] text-ink">הכרישים כותבים ומעצבים לך שבוע של תוכן, מתוך מה שכבר בנית. ${g('אתה מאשר', 'את מאשרת')}, והתוכן יוצא בזמן שקבעת.</p>
      <ol class="fb-panel mb-3 flex flex-col !p-1.5">
        ${PARTS.map((name, i) => html`<li key=${name} class=${cx('flex items-center gap-3 rounded-lg px-3 py-1.5', i % 2 === 0 && 'bg-canvas/60')}>
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-[14px] font-bold text-brand-600">${i + 1}</span>
          <b class="w-[118px] shrink-0 text-[15px]">${name}</b>
          <span class="min-w-0 text-[14px] text-muted">${PART_HINT[i]}</span>
        </li>`)}
      </ol>
      <p class="flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px]">
        <span class="flex items-center gap-1.5"><${Icon} name="clock" size=${17} class="text-brand-600" />כ-15 דקות</span>
        <span class="flex items-center gap-1.5"><${Icon} name="file-check-2" size=${17} class="text-brand-600" />3 פריטים ביומן, ופלייר לשלב 11</span>
      </p>
    </div>
    <div class="relative mx-auto h-[360px] w-full max-w-[400px] max-md:hidden" aria-hidden="true">
      <div class="absolute start-2 top-0 w-[136px] rotate-[-4deg]"><${Canvas} w=${1080} h=${1920}><${ReelFrame} t=${t} p=${p} hook=${TOPICS.o1.hooks[0]} caption="צעד אחד" photo=${photo} /><//></div>
      <div class="absolute end-0 top-4 w-[190px] rotate-[3deg]"><${Canvas}><${Slide} s=${{ kind: 'cover', opener: 'טיפ לשבוע', title: TOPICS.v1.hooks[1], sub: '', swipe: 'החליקו לצד' }} t=${t} p=${p} total=${6} noLogo=${flags.noLogo} /><//></div>
      <div class="absolute bottom-5 start-14 w-[180px] rotate-[-1deg]"><${Canvas}><${Flyer} t=${t} p=${p} layout="circle" photo=${photo} noLogo=${flags.noLogo} /><//></div>
      <span class="hand absolute -bottom-2 end-4 rotate-[-4deg] whitespace-nowrap text-[26px]">בעיצוב שלך, בקול שלך</span>
    </div>
  </div>`;
}

// ---------- part 1: channels ----------

export function ChannelScreen({ cfg, setCfg, flags, notify }) {
  const [meta, setMeta] = useState(false);
  const on = cfg.channels;
  const flip = (id) => setCfg({ channels: on.includes(id) ? on.filter((x) => x !== id) : [...on, id] });
  const rec = flags.b2b ? ['li', 'fb'] : ['ig', 'fb'];
  const sub = {
    ig: 'פוסט, קרוסלה ורילס. מתזמנים ומפרסמים מכאן',
    fb: 'לעמוד העסקי. לקבוצות: טקסט להעתקה',
    li: 'טקסט להעתקה וקבצים. אין פרסום ישיר',
  };
  const anyMeta = on.includes('ig') || on.includes('fb');
  return html`<div class="mx-auto max-w-[1120px] px-4 py-4 md:px-8 md:py-5">
    <${StepHeading} n=${partNo('channel')} eyebrow=${partLabel('channel')} title=${['איפה ', 'מפרסמים', '']} sub=${`בוחרים ערוצים, ואז איך הפריטים יוצאים: לבד בזמן שנקבע, או ש${g('אתה מפרסם', 'את מפרסמת')} בעצמך.`} />
    <div class="flex flex-col gap-3">
      <section class="fb-panel !p-4">
        <${SubStep} n="1" class="!mb-2" aside=${html`<p class="flex items-center gap-2 rounded-xl bg-brand-50 px-2.5 py-1 text-[14px]"><${SharkAvatar} size=${24} /><span class="min-w-0">לפי <b>צייד הלקוחות</b> (שלב 4): ${flags.b2b ? 'הקהל שלך הוא עסקים.' : `הקהל שלך ב${USER.where}.`} ההמלצה: <b>${rec.map((id) => PLATFORMS.find((x) => x.id === id).label).join(' ו')}</b>.</span></p>`}>איפה הקהל שלך<//>
        <ul class="grid gap-2 sm:grid-cols-3">
          ${PLATFORMS.map((pl) => {
            const checked = on.includes(pl.id);
            return html`<li key=${pl.id}>
              <label class=${cx('flex h-full cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-3 py-2', checked ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
                <input type="checkbox" class="h-5 w-5 shrink-0 accent-brand-600" checked=${checked} onChange=${() => flip(pl.id)} />
                <span class="text-brand-600"><${Icon} name=${pl.icon} size=${19} /></span>
                <span class="min-w-0"><b class="flex flex-wrap items-center gap-1.5 text-[15px]">${pl.label}${rec.includes(pl.id) && html`<${Tag} tone="blue">מומלץ<//>`}</b><small class="block text-[13px] leading-snug text-muted">${sub[pl.id]}</small></span>
              </label>
            </li>`;
          })}
        </ul>
      </section>
      <section class=${cx('fb-panel !p-4', !anyMeta && 'opacity-60')}>
        <${SubStep} n="2" class="!mb-2">איך מפרסמים<//>
        ${!anyMeta
          ? html`<p class="text-[14px] text-muted">לינקדאין בלבד: כל פריט מגיע עם טקסט להעתקה, קבצים ותזכורת ביומן.</p>`
          : cfg.connect === 'meta'
            ? html`<div class="rise">
                <ul class="mb-2 flex flex-col gap-2">
                  ${on.includes('ig') && html`<li class="flex flex-wrap items-center gap-2 text-[15px]"><${Icon} name="instagram" size=${18} class="text-brand-600" /><b dir="ltr">@${META.ig.handle}</b><span class="text-muted">· ${META.ig.kind}</span><${Tag} tone="live">מחובר<//></li>`}
                  ${on.includes('fb') && !flags.noPage && html`<li class="flex flex-wrap items-center gap-2 text-[15px]"><${Icon} name="facebook" size=${18} class="text-brand-600" /><b>${META.fb.page}</b><${Tag} tone="live">מחובר<//></li>`}
                  ${on.includes('fb') && flags.noPage && html`<li class="flex flex-wrap items-center gap-2 text-[15px]"><${Icon} name="facebook" size=${18} class="text-muted" /><b>פייסבוק</b><${Tag} tone="draft">בלי עמוד עסקי: להעתקה<//></li>`}
                </ul>
                <button type="button" class="text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => (setCfg({ connect: null, sched: Object.fromEntries(Object.entries(cfg.sched).filter(([, v]) => v?.status !== 'scheduled')) }), notify('החיבור נותק. הפוסטים שתוזמנו בוטלו', 'unplug'))}>ניתוק</button>
              </div>`
            : html`<div class="grid gap-2 sm:grid-cols-2">
                <button type="button" class=${cx('lp-option !items-start', cfg.connect === 'meta' && '!border-brand-600 !bg-brand-50')} onClick=${() => setMeta(true)}>
                  <span class="mt-0.5 text-brand-600"><${Icon} name="plug-zap" size=${19} /></span>
                  <span class="min-w-0"><b class="flex flex-wrap items-center gap-1.5 text-[15px]">לחבר את אינסטגרם ופייסבוק<${Tag} tone="blue">מומלץ<//></b><small class="block text-[13px] leading-snug text-muted">פעם אחת דרך Meta, וכל פריט שמאשרים יוצא לבד בזמן שנקבע</small></span>
                </button>
                <button type="button" class=${cx('lp-option !items-start', cfg.connect === 'manual' && '!border-brand-600 !bg-brand-50')} onClick=${() => setCfg({ connect: 'manual' })}>
                  <span class="mt-0.5 text-brand-600"><${Icon} name="hand" size=${19} /></span>
                  <span class="min-w-0"><b class="block text-[15px]">אפרסם בעצמי</b><small class="block text-[13px] leading-snug text-muted">טקסט להעתקה, קבצים ותזכורת ביומן. אפשר לחבר בכל רגע</small></span>
                </button>
              </div>`}
        ${on.includes('fb') &&
        html`<label class="mt-3 flex cursor-pointer items-start gap-2.5 border-t border-line pt-3 text-[15px]">
          <input type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" checked=${cfg.fbGroups} onChange=${(e) => setCfg({ fbGroups: e.target.checked })} />
          <span><b>גם לקבוצות בפייסבוק</b><small class="block text-[13px] leading-snug text-muted">פייסבוק לא מאפשר לפרסם בקבוצות ממערכת חיצונית, אז ${g('תקבל', 'תקבלי')} טקסט להעתקה ותזכורת.</small></span>
        </label>`}
      </section>
    </div>
    ${meta && html`<${MetaSheet} flags=${flags} onClose=${() => setMeta(false)} onDone=${() => (setMeta(false), setCfg({ connect: 'meta' }), notify('אינסטגרם ופייסבוק מחוברים', 'plug-zap'))} />`}
  </div>`;
}

// ---------- part 2: the look ----------

// The chosen template, big enough to judge: the same look in the post image, a carousel slide and a reel.
function TemplatePreview({ t, p, photo, flags }) {
  const fig = (w, label, art) => html`<figure class=${cx('m-0 shrink-0', w)}>${art}<figcaption class="mt-0.5 text-center text-[12px] text-muted">${label}</figcaption></figure>`;
  return html`<div class="flex flex-wrap items-end gap-3 rounded-2xl border-[1.5px] border-brand-600 bg-white p-2.5 sm:flex-nowrap">
    ${fig('w-[calc(38%-8px)] sm:w-[146px]', 'פוסט', html`<${Canvas} round=${8}><${PostImage} t=${t} p=${p} photo=${photo} quote=${postQuote(TOPICS.v1)} noLogo=${flags.noLogo} /><//>`)}
    ${fig('w-[calc(38%-8px)] sm:w-[146px]', 'קרוסלה', html`<${Canvas} round=${8}><${Slide} s=${{ kind: 'cover', opener: USER.business, title: TOPICS.v1.hooks[1], sub: '', swipe: 'החליקו לצד' }} t=${t} p=${p} total=${6} noLogo=${flags.noLogo} /><//>`)}
    ${fig('w-[calc(24%-8px)] sm:w-[103px]', 'רילס', html`<${Canvas} w=${1080} h=${1920} round=${8}><${ReelFrame} t=${t} p=${p} hook=${TOPICS.v1.hooks[0]} caption="צעד אחד" photo=${photo} /><//>`)}
    <div class="min-w-0 flex-1 self-center sm:ps-2">
      <b class="flex flex-wrap items-center gap-1.5 font-display text-[22px] leading-tight">${t.name}${t.id === RECOMMENDED_TEMPLATE && html`<${Tag} tone="blue">מומלץ<//>`}</b>
      <p class="mt-1 text-[14px]">${t.mood}</p>
      <p class="text-[13px] text-muted">נבנתה ל${t.forWho}</p>
      <p class="mt-2 text-[13px] text-muted">גופן ${t.font}</p>
    </div>
  </div>`;
}

export function LookScreen({ cfg, setCfg, flags, notify }) {
  const p = palOf(cfg, flags);
  const list = TEMPLATES.filter((x) => x.style === cfg.style);
  const photo = photoOf(cfg, flags);
  const samples = cfg.voice.split(/\n\s*\n/).filter((x) => x.trim()).length;
  return html`<div class="mx-auto max-w-[1120px] px-4 py-4 md:px-8 md:py-3">
    <${StepHeading} n=${partNo('look')} eyebrow=${partLabel('look')} title=${['איך התוכן ', 'ייראה', '']} sub="כבר בחרנו תבנית שמתאימה לעסק. אם היא נראית לך, פשוט ממשיכים." />
    <div class="grid items-start gap-4 md:grid-cols-[1fr_300px]">
      <section class="fb-panel !p-4">
        <${SubStep} n="1" aside=${html`<small class="text-[12px] text-muted">8 סגנונות, 10 תבניות</small>`}>סגנון<//>
        <div class="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="radiogroup">
          ${STYLES.map((st) => {
            const ts = TEMPLATES.filter((x) => x.style === st.id);
            const on = cfg.style === st.id;
            return html`<button key=${st.id} type="button" role="radio" aria-checked=${on} onClick=${() => setCfg({ style: st.id, template: ts[0].id })} class=${cx('flex items-center justify-between gap-2 rounded-xl border-[1.5px] bg-white px-2.5 py-1.5 text-start cursor-pointer', on ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
              <span class="min-w-0"><b class="block truncate text-[14px] leading-tight">${st.label}</b><small class="text-[12px] text-muted">${ts.length === 1 ? 'תבנית אחת' : `${ts.length} תבניות`}</small></span>
              <span class="flex shrink-0 -space-x-1.5 space-x-reverse" aria-hidden="true">${[ts[0].own.bg, ts[0].own.a, ts[0].own.b].map((c) => html`<i class="h-4 w-4 rounded-full ring-2 ring-white" style=${{ background: c }}></i>`)}</span>
            </button>`;
          })}
        </div>
        <${SubStep} n="2" aside=${list.length > 1 && html`<${Mini} options=${list.map((x) => ({ id: x.id, label: x.name }))} value=${cfg.template} onChange=${(v) => setCfg({ template: v })} />`}>תבנית<//>
        <${TemplatePreview} t=${tplOf(cfg)} p=${p} photo=${photo || USER.photo} flags=${flags} />
      </section>
      <div class="flex flex-col gap-4">
        <section class="fb-panel !p-4">
          <${SubStep} n="3">מה כבר יש לנו ממך<//>
          ${flags.noLogo
            ? html`<p class="mb-3 rounded-lg bg-warn-50 p-2 text-[13px] text-warn">עוד אין לוגו, אז התוכן יוצא עם שם העסק ובצבעי התבנית. אחרי שלב 6 הלוגו ייכנס לבד.</p>`
            : html`<div class="mb-2 flex items-center gap-2.5">
                <img src=${BRAND.logo} alt="הלוגו של העסק" class="h-10 w-10 rounded-full bg-white ring-1 ring-line" />
                <span class="flex gap-1">${BRAND.swatches.slice(0, 4).map((c) => html`<i class="h-5 w-5 rounded-full ring-1 ring-line" style=${{ background: c }}></i>`)}</span>
              </div>
              <${Mini} options=${[{ id: 'brand', label: 'צבעי הלוגו' }, { id: 'own', label: 'צבעי התבנית' }]} value=${cfg.colors} onChange=${(v) => setCfg({ colors: v })} />`}
          <div class="mt-3 flex items-center gap-3 border-t border-line pt-3">
            ${photo
              ? html`<img src=${photo} alt="התמונה שלך" class="h-14 w-12 rounded-lg object-cover ring-1 ring-line" />`
              : html`<span class="grid h-14 w-12 place-items-center rounded-lg border-2 border-dashed border-line text-faint"><${Icon} name="image-plus" size=${20} /></span>`}
            <span class="min-w-0 flex-1 text-[13px] text-muted">${photo ? 'התמונה שלך, לפלייר ולשקופיות' : 'עוד אין תמונה'}</span>
            <${Button} variant="quiet" class="!h-8 !px-2 !text-[13px]" onClick=${() => (setCfg({ photo: 'upload' }), notify(photo ? 'במוקאפ: כאן נפתחת בחירת תמונה מהמחשב או מהטלפון' : 'התמונה עלתה', 'image'))}>${photo ? 'להחליף' : 'להעלות'}<//>
          </div>
          <p class="mt-2"><${From}>מ"שם ולוגו" ומ"דף נחיתה"<//></p>
          <p class="mt-1 flex items-center gap-1.5 text-[12px] text-muted"><${Icon} name="contrast" size=${14} />ניגודיות ${p.ratio.toFixed(1)}:1, הטקסט קריא</p>
        </section>
        <details class="fb-panel group !p-4" open=${!!cfg.voice}>
          <summary class="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span class="flex items-center gap-2 text-[15px] font-bold"><${Icon} name="pen-line" size=${17} class="text-brand-600" />שיישמע עוד יותר כמוך<span class="text-[13px] font-normal text-muted">(לא חובה)</span></span>
            <${Icon} name="chevron-down" size=${18} class="text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p class="mb-2 mt-2 text-[13px] text-muted">עד 5 פוסטים או הודעות שכתבת. ${WORDS} לומד מהם את הסגנון שלך. שורה ריקה בין טקסט לטקסט.</p>
          <textarea rows="3" class=${cx(inputCls, '!h-auto py-2 leading-relaxed')} placeholder="להדביק כאן" value=${cfg.voice} onInput=${(e) => setCfg({ voice: e.target.value })}></textarea>
          ${samples > 0 && html`<p class="mt-1 text-[13px] text-muted">${samples > 5 ? 'נלקחים 5 הראשונים' : samples === 1 ? 'טקסט אחד' : `${samples} טקסטים`}</p>`}
        </details>
      </div>
    </div>
  </div>`;
}

// ---------- part 3a: what to write this week (the 3 topics) ----------

export function TopicsScreen({ cfg, setCfg, flags, onSettings }) {
  const plan = cfg.plan;
  const week = cfg.week || 1;
  const offers = plan.filter((i) => topicOf(i).type === 'offer').length;
  const history = cfg.history || [];
  const used = new Set(history.flatMap((w) => w.plan.map((i) => i.topic)).filter((x) => x !== 'o1'));
  const last = history[history.length - 1];
  const setItem = (id, p) => setCfg({ plan: plan.map((i) => (i.id === id ? { ...i, ...p } : i)), generated: false, items: { ...cfg.items, [id]: undefined } });
  return html`<div class="mx-auto max-w-[1120px] px-4 py-4 md:px-8 md:py-5">
    <${StepHeading} n=${partNo('topics')} eyebrow=${partLabel('topics')} title=${['מה כותבים ', week > 1 ? `בשבוע ${week}` : 'השבוע', '']}
      sub=${week > 1 ? `שלושה נושאים חדשים לשבוע ${weekRange()}, לפי מה שעבד ומה ששאלו אותך. אפשר להחליף, או פשוט להמשיך.` : 'שלושה נושאים מתוך הכאבים שבתיק הלקוח: שניים נותנים ערך, ואחד מציע. אפשר להחליף, או פשוט להמשיך.'} />
    ${last && html`<section class="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl bg-white/90 px-3 py-2 text-[13px] ring-1 ring-line">
      <b class="flex items-center gap-1.5 text-[14px]"><${Icon} name="bar-chart-3" size=${16} class="text-brand-600" />מה עבד בשבוע ${week - 1}</b>
      ${last.plan.map((i) => {
        const s = LAST_WEEK_STATS[i.id];
        return html`<span key=${i.id} class="flex min-w-0 items-center gap-1.5"><${Icon} name=${fmtOf(i.format).icon} size=${14} class="shrink-0 text-brand-600" /><span class="max-w-[170px] truncate">${TOPICS[i.topic].title}</span><span class="shrink-0 text-muted">${s.saves} שמירות · ${s.leads === 1 ? 'ליד 1' : `${s.leads} לידים`}</span></span>`;
      })}
    </section>`}
    <div class="grid gap-3 md:grid-cols-3">
      ${plan.map((item, idx) => {
        const t = topicOf(item);
        const choices = TOPIC_CHOICES[t.type];
        const why = week > 1 && TOPIC_WHY[item.topic];
        return html`<section key=${item.id} class="fb-panel flex flex-col gap-2.5 !p-3.5">
          <div class="flex items-center gap-2">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 font-display text-[15px] font-bold text-brand-600">${idx + 1}</span>
            <div class="flex flex-wrap gap-1" role="radiogroup" aria-label="סוג">
              ${TYPES.map((ty) => {
                const off = ty.id === 'offer' && t.type !== 'offer' && (flags.noOffer || offers >= 1);
                const on = t.type === ty.id;
                return html`<button key=${ty.id} type="button" role="radio" aria-checked=${on} disabled=${off}
                  title=${off ? (flags.noOffer ? 'אין עדיין הצעה. היא נבנית בשלב 8' : 'בשבוע של 3 פריטים יש הצעה אחת לכל היותר') : ty.sub}
                  onClick=${() => { if (on) return; const nt = TOPIC_CHOICES[ty.id].find((x) => !used.has(x)) || TOPIC_CHOICES[ty.id][0]; setItem(item.id, { topic: nt, seen: [nt], ...(ty.id === 'offer' ? { time: '19:30' } : {}) }); }}
                  class=${cx('inline-flex h-7 items-center gap-1 rounded-lg border-[1.5px] px-1.5 text-[12px] font-bold', on ? 'border-brand-600 bg-brand-100 text-brand-600' : off ? 'border-line bg-canvas text-faint cursor-not-allowed' : 'border-line bg-white hover:border-brand-300 cursor-pointer')}
                ><${Icon} name=${ty.icon} size=${13} />${ty.label}</button>`;
              })}
            </div>
          </div>
          <div class="min-h-[78px] rounded-xl bg-canvas p-2.5">
            <b class="block font-display text-[17px] leading-snug">${t.title}</b>
            ${why
              ? html`<small class="mt-1 flex items-start gap-1 text-[12px] font-bold text-brand-600"><${Icon} name=${why.icon} size=${13} class="mt-0.5 shrink-0" />${why.text}</small>`
              : html`<small class="mt-1 block text-[12px] text-muted">מהכאב: "${t.pain}"</small>`}
          </div>
          ${(() => {
            // Every idea shown stays in a row: "רעיון אחר" moves forward (a new idea at the
            // end), the arrow goes back to the ideas before.
            const seen = item.seen?.includes(item.topic) ? item.seen : [item.topic];
            const at = seen.indexOf(item.topic);
            const rest = choices.filter((x) => !seen.includes(x) && !plan.some((i) => i.topic === x));
            const fresh = rest.filter((x) => !used.has(x))[0] || rest[0];
            const canNext = at < seen.length - 1 || !!fresh;
            const go = (topic, list = seen) => setItem(item.id, { topic, seen: list });
            const arrow = 'grid h-7 w-7 place-items-center rounded-lg border-[1.5px] border-line bg-white text-brand-600 hover:border-brand-300 cursor-pointer disabled:cursor-not-allowed disabled:text-faint disabled:hover:border-line';
            return html`<div class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-1.5">
                ${seen.length > 1 && html`<button type="button" class=${arrow} disabled=${at === 0} onClick=${() => go(seen[at - 1])} aria-label="לרעיון הקודם" title="לרעיון הקודם"><${Icon} name="chevron-right" size=${16} /></button>
                  <span class="text-[12px] font-bold tabular-nums text-muted">${at + 1}/${seen.length}</span>`}
                ${choices.length > 1 && html`<button type="button" disabled=${!canNext} class="text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:text-faint" onClick=${() => (at < seen.length - 1 ? go(seen[at + 1]) : go(fresh, [...seen, fresh]))}><${Icon} name="refresh-cw" size=${12} class="me-1 inline" />${at < seen.length - 1 ? 'לרעיון הבא' : 'רעיון אחר'}</button>`}
              </span>
              ${used.has(item.topic) && html`<${Tag} tone="draft">כבר פורסם<//>`}
            </div>`;
          })()}
          <div class="flex gap-1.5">
            ${FORMATS.map((f) => html`<button key=${f.id} type="button" aria-pressed=${item.format === f.id} onClick=${() => setItem(item.id, { format: f.id })} class=${cx('inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border-[1.5px] text-[13px] font-bold cursor-pointer', item.format === f.id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')}><${Icon} name=${f.icon} size=${14} />${f.label}</button>`)}
          </div>
        </section>`;
      })}
    </div>
    <div class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p class="flex min-w-0 items-start gap-2 text-[13px] text-muted"><${Icon} name="info" size=${15} class="mt-0.5 shrink-0" />
        ${flags.noOffer ? 'עוד אין הצעה (שלב 8), אז השבוע כולו ערך.' : 'בשבוע של 3 פריטים יש הצעה אחת לכל היותר. מתי כל פריט יוצא קובעים בסוף, בתוכנית לשבוע.'}</p>
      ${week > 1 && html`<button type="button" class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border-[1.5px] border-brand-300 bg-white px-3.5 text-[16px] font-bold text-brand-600 hover:border-brand-600 hover:bg-brand-50 cursor-pointer" onClick=${onSettings}><${Icon} name="settings-2" size=${18} />לשנות ערוצים, עיצוב או פלייר</button>`}
    </div>
  </div>`;
}

// ---------- part 3b: the content, a screen per item ----------

const GEN_STAGES = (t) => [
  'קורא את תיק הלקוח ואת דף המסרים',
  'כותב 3 גרסאות לכל פוסט',
  'בונה את הקרוסלה, בתוך מגבלות המילים',
  'כותב תסריט לרילס, עם 3 הוקים',
  `מעצב בתבנית "${t.name}"`,
  'בודק שמות, מילים ומספרים',
];

function Checks({ text }) {
  const list = checkText(text);
  if (!list.length) return null;
  return html`<ul class="mt-2 flex flex-col gap-1">${list.map((c) => html`<li key=${c.id} class="flex items-start gap-1.5 rounded-lg bg-warn-50 px-2 py-1 text-[13px] text-warn"><${Icon} name="triangle-alert" size=${14} class="mt-0.5 shrink-0" />${c.text}</li>`)}</ul>`;
}

const Counter = ({ text, limit, unit = 'מילים', n }) => {
  const c = n ?? words(text);
  return html`<span class=${cx('text-[12px] font-bold tabular-nums', c > limit ? 'text-error' : 'text-muted')}>${c}/${limit} ${unit}</span>`;
};

const NL = String.fromCharCode(10);
// Only the lines that change, when the rest of the text stays the same.
function changedPart(before, after) {
  const a = before.split(NL);
  const b = after.split(NL);
  if (a.length === b.length) return b.filter((l, i) => l !== a[i]).join(NL);
  const added = b.filter((l) => l.trim() && !a.includes(l));
  if (added.length && b.length > a.length) return added.join(NL);
  return after;
}
// A request to the shark: several suggestions side by side, the user picks one (or none).
// "עוד הצעות" brings the next set.
function Suggestions({ req, text, tp, onPick, onClose }) {
  const [round, setRound] = useState(0);
  const { list, more } = changeOptions(req.id, text, tp, round);
  const whole = req.id === 'shorter';
  const ref = useRef(null);
  useEffect(() => ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), []);
  return html`<div ref=${ref} class="rise scroll-mb-4 rounded-xl border-[1.5px] border-brand-300 bg-brand-50 p-3">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <p class="flex items-center gap-2 text-[14px] font-bold"><${SharkAvatar} size=${26} />${req.label}: ${list.length} הצעות. ${g('בחר', 'בחרי')} אחת</p>
      <span class="flex gap-1">
        ${more && html`<${Button} variant="quiet" class="!h-8 !px-2 !text-[13px]" onClick=${() => setRound((r) => r + 1)}><${Icon} name="refresh-cw" size=${14} />עוד הצעות<//>`}
        <${Button} variant="quiet" class="!h-8 !px-2 !text-[13px]" onClick=${onClose}>להשאיר כמו שהיה<//>
      </span>
    </div>
    ${list.length
      ? html`<div class="grid gap-2 md:grid-cols-3">
          ${list.map((opt, i) => html`<button key=${round + '-' + i} type="button" onClick=${() => onPick(opt)} class="group flex flex-col gap-1.5 rounded-lg bg-white p-2.5 text-start ring-1 ring-line hover:ring-2 hover:ring-brand-600 cursor-pointer">
            <small class="text-[12px] font-bold text-muted">הצעה ${round * 3 + i + 1}${whole || req.id === 'longer' ? ` · ${words(opt)} מילים (עכשיו ${words(text)})` : ''}</small>
            <span class=${cx('whitespace-pre-line text-[14px] leading-snug', whole && 'line-clamp-5')}>${whole ? opt : changedPart(text, opt)}</span>
            <span class="mt-auto inline-flex items-center gap-1 text-[13px] font-bold text-brand-600 opacity-70 group-hover:opacity-100"><${Icon} name="check" size=${14} />לבחור בזו</span>
          </button>`)}
        </div>`
      : html`<p class="text-[14px] text-muted">אין עוד הצעות מהסוג הזה לטקסט הנוכחי.</p>`}
  </div>`;
}

const Tabs = ({ value, onChange, items, class: cls = 'mb-2' }) => html`<div class=${cx(cls, 'inline-flex rounded-xl bg-canvas p-0.5 ring-1 ring-line')} role="tablist">
  ${items.map(([id, label, icon]) => html`<button key=${id} type="button" role="tab" aria-selected=${value === id} onClick=${() => onChange(id)} class=${cx('inline-flex h-8 items-center gap-1.5 rounded-lg px-4 text-[14px] font-bold cursor-pointer', value === id ? 'bg-white text-brand-600 shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink')}><${Icon} name=${icon} size=${15} />${label}</button>`)}
</div>`;

function PostEditor({ item, st, setIt, p, tpl, flags, cfg }) {
  const tp = topicOf(item);
  const versions = postVersions(tp, item);
  const [req, setReq] = useState(null);
  const [tab, setTab] = useState('text');
  const text = st.texts[st.version] ?? versions.find((v) => v.id === st.version).text;
  const setText = (v) => setIt({ texts: { ...st.texts, [st.version]: v } });
  const photo = photoOf(cfg, flags) || USER.photo;
  const img = postImg(st, tp);
  const setImg = (patch) => setIt({ img: { ...img, ...patch } });
  const tabs = html`<${Tabs} value=${tab} onChange=${setTab} items=${[['text', 'הטקסט', 'align-right'], ['image', 'התמונה', 'image']]} />`;
  if (tab === 'image') return html`${tabs}<${PostImageEditor} img=${img} setImg=${setImg} tp=${tp} p=${p} tpl=${tpl} photo=${photo} flags=${flags} />`;
  const onImage = () => setTab('image');
  return html`${tabs}<div class="grid items-start gap-5 md:grid-cols-[1fr_250px]">
    <div class="min-w-0">
      <${SubStep} n="1">בוחרים פתיח<//>
      <div class="mb-3 grid gap-2 sm:grid-cols-3" role="radiogroup">
        ${versions.map((v) => html`<button key=${v.id} type="button" role="radio" aria-checked=${st.version === v.id} title=${`מה שונה כאן: ${v.diff}`} onClick=${() => (setIt({ version: v.id }), setReq(null))} class=${cx('rounded-xl border-[1.5px] bg-white px-2.5 py-2 text-start cursor-pointer', st.version === v.id ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
          <b class="block text-[13px] text-muted">${v.label}</b>
          <span class="line-clamp-2 block text-[14px] font-bold leading-snug">${v.hook}</span>
        </button>`)}
      </div>
      <${SubStep} n="2">קוראים, ומתקנים אם צריך<//>
      <div class="mb-2 flex flex-wrap items-center gap-1.5">
        <span class="text-[13px] font-bold">לבקש מ${WORDS}:</span>
        ${CHANGES.map((c) => html`<button key=${c.id} type="button" aria-pressed=${req?.id === c.id} class=${cx('h-8 rounded-lg border-[1.5px] px-2 text-[13px] font-bold cursor-pointer', req?.id === c.id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')} onClick=${() => setReq(req?.id === c.id ? null : c)}>${c.label}</button>`)}
      </div>
      ${req
        ? html`<${Suggestions} key=${req.id + st.version} req=${req} text=${text} tp=${tp} onPick=${(v) => (setText(v), setReq(null))} onClose=${() => setReq(null)} />`
        : html`<textarea rows="5" class=${cx(inputCls, '!h-auto py-2 leading-relaxed')} value=${text} onInput=${(e) => setText(e.target.value)} aria-label="הטקסט של הפוסט"></textarea>
          <${Checks} text=${text} />`}
    </div>
    <div>
      <p class="mb-2 flex items-center justify-between text-[14px] font-bold">התמונה של הפוסט<button type="button" class="text-[13px] text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${onImage}>לערוך</button></p>
      <button type="button" class="block w-full cursor-pointer" onClick=${onImage} aria-label="לערוך את התמונה"><${Canvas}><${PostImage} t=${tpl} p=${p} photo=${photo} quote=${img.quote} sign=${img.sign} look=${img.look} noLogo=${flags.noLogo} /><//></button>
      <p class="mt-1 flex items-center justify-between text-[12px] text-muted"><span>ציטוט מהפוסט, עם התמונה שלך</span><${Counter} text=${img.quote} limit=${LIMITS.quote} /></p>
    </div>
  </div>`;
}

// What the user can ask כריש העיצוב for, in free text. In the product the text goes to the
// model with the current design, and it returns changes to the same settings the panel has
// (layout, background, text size, photo zoom and position, what shows, the quote). It never
// returns a new picture, and the user's photo is never generated. In the mockup, words are matched.
const IMG_EXAMPLES = ['רקע כהה', 'תמונה גדולה יותר', 'ציטוט קצר יותר', 'בועת דיבור', 'בלי לוגו'];
function imageRequest(text, img, tp) {
  const s = text.replace(/[.,!?]/g, ' ');
  const has = (...w) => w.some((x) => s.includes(x));
  const look = { ...img.look, show: { ...img.look.show } };
  let quote = img.quote;
  const done = [];
  const layout = has('קשת') ? 'arch' : has('בועה', 'בועת', 'דיבור') ? 'bubble' : has('על התמונה', 'תמונה מלאה', 'כרטיס', 'רקע תמונה') ? 'card' : null;
  if (layout && layout !== look.layout) (look.layout = layout), done.push(`פריסה: ${POST_LAYOUTS.find((x) => x.id === layout).label}`);
  const bg = has('כהה', 'שחור', 'לילה') ? 'dark' : has('צבעוני', 'צבע חזק', 'בולט') ? 'color' : has('בהיר', 'לבן') ? 'light' : null;
  if (bg && bg !== look.bg) (look.bg = bg), done.push(`רקע ${FLYER_BG.find((x) => x.id === bg).label}`);
  const photoWord = has('תמונה', 'פנים', 'זום', 'קרוב');
  if (photoWord && has('גדול', 'להגדיל', 'קרוב', 'זום')) (look.zoom = Math.min(160, look.zoom + 20)), done.push('התמונה קרובה יותר');
  else if (photoWord && has('קטן', 'להקטין', 'רחוק')) (look.zoom = 100), done.push('התמונה רחוקה יותר');
  if (has('למעלה') && photoWord) (look.pos = 'top'), done.push('מיקום התמונה: למעלה');
  if (has('למטה') && photoWord) (look.pos = 'bottom'), done.push('מיקום התמונה: למטה');
  const textWord = has('טקסט', 'ציטוט', 'כותרת', 'אותיות', 'פונט', 'גופן');
  if (textWord && has('גדול', 'להגדיל', 'בולט')) (look.size = 'l'), done.push('טקסט גדול');
  else if (textWord && has('קטן', 'להקטין')) (look.size = 's'), done.push('טקסט קטן');
  if (has('קצר', 'לקצר', 'פחות מילים')) {
    const w = quote.split(/\s+/);
    const short = (tp.hooks[2] && words(tp.hooks[2]) < w.length ? tp.hooks[2] : w.slice(0, Math.max(5, Math.ceil(w.length * 0.6))).join(' ').replace(/[,،]$/, ''));
    if (short !== quote) (quote = short), done.push('ציטוט קצר יותר');
  }
  if (has('בלי לוגו', 'להוריד את הלוגו')) (look.show.logo = false), done.push('בלי לוגו');
  if (has('עם לוגו', 'להחזיר את הלוגו')) (look.show.logo = true), done.push('עם לוגו');
  if (has('בלי שם', 'בלי חתימה')) (look.show.sign = false), done.push('בלי שם ותפקיד');
  return { img: { ...img, look, quote }, done };
}

// The image tab of the post: the options next to the image, the texts edited on the image
// itself, and a free-text request to כריש העיצוב.
function PostImageEditor({ img, setImg, tp, p, tpl, photo, flags }) {
  const look = img.look;
  const setLook = (patch) => setImg({ look: { ...look, ...patch } });
  const show = (k) => setLook({ show: { ...look.show, [k]: !look.show[k] } });
  const [ask, setAsk] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const send = (text) => {
    if (!text.trim()) return;
    setBusy(true);
    setRes(null);
    setTimeout(() => {
      const before = img;
      const r = imageRequest(text, img, tp);
      setBusy(false);
      if (r.done.length) setImg(r.img);
      setRes({ text, done: r.done, before });
      setAsk('');
    }, 900);
  };
  const edit = (key, v) => setImg({ [key]: v });
  return html`<div class="grid items-start gap-5 md:grid-cols-[1fr_270px]">
    <div class="min-w-0">
      <${Row} label="פריסה">
        <div class="flex flex-wrap gap-2" role="radiogroup">
          ${POST_LAYOUTS.map((l) => html`<button key=${l.id} type="button" role="radio" aria-checked=${look.layout === l.id} onClick=${() => setLook({ layout: l.id })} class=${cx('flex flex-col items-center gap-1 rounded-lg bg-white p-1 cursor-pointer sm:flex-row sm:gap-2 sm:pe-2.5', look.layout === l.id ? 'ring-[2.5px] ring-brand-600' : 'ring-1 ring-line hover:ring-brand-300')}>
            <span class="block w-[44px]"><${Canvas} round=${3}><${PostImage} t=${tpl} p=${p} photo=${photo} quote=${img.quote} sign=${img.sign} look=${{ ...look, layout: l.id }} noLogo=${flags.noLogo} /><//></span>
            <span class="text-[13px] font-bold">${l.label}</span>
          </button>`)}
        </div>
      <//>
      <${Row} label="רקע וטקסט">
        <div class="flex flex-wrap items-center gap-2">
          <${Mini} options=${FLYER_BG} value=${look.bg} onChange=${(v) => setLook({ bg: v })} />
          <span class="h-5 w-px bg-line" aria-hidden="true"></span>
          <${Mini} options=${FLYER_SIZES} value=${look.size} onChange=${(v) => setLook({ size: v })} />
        </div>
      <//>
      <${Row} label="התמונה">
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 text-[13px]"><${Icon} name="zoom-in" size=${15} class="text-muted" /><input type="range" min="100" max="160" step="5" value=${look.zoom} onInput=${(e) => setLook({ zoom: +e.target.value })} class="fb-range w-[120px]" style=${{ '--p': `${((look.zoom - 100) / 60) * 100}%` }} aria-label="זום" /></label>
          <${Mini} options=${FLYER_POS} value=${look.pos} onChange=${(v) => setLook({ pos: v })} />
        </div>
      <//>
      <${Row} label="מה מופיע">
        <div class="flex flex-wrap gap-1.5">
          <${OnChip} on=${look.show.sign} onClick=${() => show('sign')}>שם ותפקיד<//>
          ${!flags.noLogo && html`<${OnChip} on=${look.show.logo} onClick=${() => show('logo')}>לוגו<//>`}
        </div>
      <//>
      <div class="mt-1 rounded-xl border-[1.5px] border-brand-300 bg-brand-50 p-3">
        <p class="mb-1.5 flex items-center gap-2 text-[14px] font-bold"><${SharkAvatar} size=${24} />לבקש מ${DESIGN}, במילים שלך</p>
        <div class="flex gap-2">
          <input class=${cx(inputCls, '!h-10 min-w-0 flex-1 !text-[15px]')} placeholder="למשל: רקע כהה, והתמונה קרובה יותר" value=${ask} disabled=${busy} onInput=${(e) => setAsk(e.target.value)} onKeyDown=${(e) => e.key === 'Enter' && send(ask)} aria-label="מה לשנות בתמונה" />
          <${Button} class="!h-10 shrink-0" disabled=${busy || !ask.trim()} onClick=${() => send(ask)}>${busy ? 'עובד...' : 'לשנות'}<//>
        </div>
        ${!res && !busy && html`<div class="mt-2 flex flex-wrap gap-1">${IMG_EXAMPLES.map((x) => html`<button key=${x} type="button" class="h-7 rounded-lg bg-white px-2 text-[12px] font-bold text-muted ring-1 ring-line hover:text-brand-600 cursor-pointer" onClick=${() => send(x)}>${x}</button>`)}</div>`}
        ${busy && html`<p class="mt-2 flex items-center gap-2 text-[13px] text-muted"><${Icon} name="loader" size=${14} class="animate-spin" />${DESIGN} מעצב לפי הבקשה</p>`}
        ${res && html`<div class="rise mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[13px] ring-1 ring-line">
          ${res.done.length
            ? html`<span class="flex items-center gap-1.5"><${Icon} name="check" size=${14} class="text-money" /><b>שיניתי:</b> ${res.done.join(' · ')}</span>
              <button type="button" class="font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => (setImg(res.before), setRes(null))}>לבטל</button>`
            : html`<span class="text-muted">לא הבנתי מה לשנות ב"${res.text}". אפשר לכתוב על הרקע, הגודל, התמונה, הפריסה או הציטוט.</span>`}
        </div>`}
      </div>
    </div>
    <aside class="max-md:order-first max-md:mx-auto max-md:w-full max-md:max-w-[280px] md:sticky md:top-4">
      <${Canvas} round=${12}><${PostImage} t=${tpl} p=${p} photo=${photo} quote=${img.quote} sign=${img.sign} look=${look} noLogo=${flags.noLogo} edit=${edit} /><//>
      <p class="mt-1.5 flex items-center justify-between gap-2 text-[12px] text-muted"><span class="flex items-center gap-1"><${Icon} name="mouse-pointer-click" size=${14} />לחיצה על טקסט בתמונה: עריכה במקום</span><${Counter} text=${img.quote} limit=${LIMITS.quote} /></p>
      <${Checks} text=${img.quote} />
    </aside>
  </div>`;
}

function CarouselEditor({ item, st, setIt, flags, cfg }) {
  const [sel, setSel] = useState(0);
  const [tab, setTab] = useState('text');
  const slides = st.slides;
  const s = slides[sel];
  const { t: tpl, p, look } = carouselArt(st, cfg, flags);
  const setLook = (patch) => setIt({ look: { ...look, ...patch } });
  const show = (k) => setLook({ show: { ...look.show, [k]: !look.show[k] } });
  const setField = (k, v) => setIt({ slides: slides.map((x, i) => (i === sel ? { ...x, [k]: v } : x)) });
  // A text edited on the slide itself; "points.1" is the second point of the summary.
  const edit = (k, v) => (k.startsWith('points.')
    ? setIt({ slides: slides.map((x, i) => (i === sel ? { ...x, points: x.points.map((pt, n) => (n === +k.split('.')[1] ? v : pt)) } : x)) })
    : setField(k, v));
  const shorten = (k, limit) => setField(k, s[k].split(/\s+/).slice(0, limit).join(' ').replace(/[,،]$/, ''));
  const over = slides.some((x) => slideFields(x).some(([k, , lim]) => words(x[k]) > lim) || (x.points || []).some((pt) => words(pt) > LIMITS.sumPoint));
  const changed = !!st.look;
  const swatches = [0, ...BRAND.swatches.map((_, i) => i).slice(1)];
  const art = (x, i, e) => html`<${Slide} s=${x} t=${tpl} p=${p} i=${i} total=${slides.length} noLogo=${flags.noLogo} look=${look} edit=${e} />`;
  const tabs = html`<${Tabs} class="" value=${tab} onChange=${setTab} items=${[['text', 'הטקסט', 'align-right'], ['design', 'העיצוב', 'palette']]} />`;
  return html`<div class="grid items-start gap-5 md:grid-cols-[1fr_224px]">
    <div class="min-w-0">
      <${SubStep} n="1" class="!mb-1.5" aside=${tabs}>${tab === 'text' ? 'בוחרים שקופית' : html`השקופיות <small class="text-[12px] font-normal text-muted">· העיצוב חל על כולן</small>`}<//>
      <div class="thin-scroll -mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-2">
        ${slides.map((x, i) => html`<button key=${i} type="button" onClick=${() => setSel(i)} aria-pressed=${sel === i} class=${cx('w-[62px] shrink-0 rounded-lg p-0.5 cursor-pointer', sel === i ? 'ring-[3px] ring-brand-600' : 'ring-1 ring-line hover:ring-brand-300')}>
          <${Canvas} round=${5}>${art(x, i)}<//>
        </button>`)}
      </div>
      ${tab === 'text'
        ? html`<${SubStep} n="2" class="!mb-1.5" aside=${over ? html`<${Tag} tone="fix">יש שדה מעל המגבלה<//>` : html`<${Tag} tone="live">כל השדות בתוך המגבלה<//>`}>שקופית ${sel + 1}: ${{ cover: 'שער', content: 'רעיון אחד', summary: 'סיכום', cta: 'הנעה לפעולה' }[s.kind]}<//>
          <div class="grid gap-x-3 sm:grid-cols-2">
            ${slideFields(s).map(([k, label, lim]) => {
              const n = words(s[k]);
              return html`<div key=${k} class=${cx('mb-2', k === 'body' && 'sm:col-span-2')}>
                <div class="mb-1 flex items-center justify-between"><span class="text-[13px] font-bold">${label}</span><${Counter} text=${s[k]} limit=${lim} /></div>
                <textarea rows=${k === 'body' ? 3 : 2} class=${cx(inputCls, '!h-auto py-1.5 leading-snug', n > lim && '!border-error')} value=${s[k]} onInput=${(e) => setField(k, e.target.value)}></textarea>
                ${n > lim && html`<p class="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-error">מעל ${lim} מילים.<button type="button" class="font-bold underline underline-offset-2 cursor-pointer" onClick=${() => shorten(k, lim)}>${WORDS} יקצר</button></p>`}
                <${Checks} text=${s[k]} />
              </div>`;
            })}
          </div>
          ${s.kind === 'summary' && html`<ul class="flex flex-col gap-1 text-[14px]">${s.points.map((pt) => html`<li class="flex items-center justify-between gap-2 rounded-lg bg-canvas px-2 py-1"><span>${pt}</span><${Counter} text=${pt} limit=${LIMITS.sumPoint} /></li>`)}</ul>`}`
        : html`<div>
          <${Row} label="תבנית">
            <div class="flex flex-wrap items-center gap-2">
              <select class=${cx(inputCls, '!h-9 !w-auto min-w-[190px] !py-0 !text-[14px]')} value=${tpl.id} onChange=${(e) => setLook({ tpl: e.target.value === tplOf(cfg).id ? '' : e.target.value })} aria-label="תבנית לקרוסלה">
                ${STYLES.map((g2) => html`<optgroup key=${g2.id} label=${g2.label}>${TEMPLATES.filter((x) => x.style === g2.id).map((x) => html`<option key=${x.id} value=${x.id}>${x.name} · ${x.mood}${x.id === tplOf(cfg).id ? ' (של השבוע)' : ''}</option>`)}</optgroup>`)}
              </select>
            </div>
          <//>
          <${Row} label="צבעים">
            <div class="flex flex-wrap items-center gap-2">
              <${Mini} options=${FLYER_BG} value=${look.bg} onChange=${(v) => setLook({ bg: v })} />
              <span class="h-5 w-px bg-line" aria-hidden="true"></span>
              <span class="flex items-center gap-1.5" role="radiogroup" aria-label="צבע הדגשה">
                ${swatches.map((i) => {
                  const c = palette(tpl, cfg.colors, flags.noLogo, i).a;
                  return html`<button key=${i} type="button" role="radio" aria-checked=${look.swatch === i} title=${i === 0 ? 'הצבע של התבנית' : 'צבע מהלוגו'} onClick=${() => setLook({ swatch: i })} class=${cx('h-7 w-7 rounded-full cursor-pointer ring-offset-2', look.swatch === i ? 'ring-[2.5px] ring-brand-600' : 'ring-1 ring-line hover:ring-brand-300')} style=${{ background: c }}></button>`;
                })}
              </span>
            </div>
          <//>
          <${Row} label="טקסט">
            <div class="flex flex-wrap items-center gap-2">
              <${Mini} options=${FLYER_SIZES} value=${look.size} onChange=${(v) => setLook({ size: v })} />
              <span class="h-5 w-px bg-line" aria-hidden="true"></span>
              <${Mini} options=${SLIDE_ALIGN} value=${look.align} onChange=${(v) => setLook({ align: v })} />
              <span class="h-5 w-px bg-line" aria-hidden="true"></span>
              <select class=${cx(inputCls, '!h-8 !w-auto !py-0 !text-[13px] font-bold')} value=${look.font} onChange=${(e) => setLook({ font: e.target.value })} aria-label="גופן">
                ${FLYER_FONTS.map((f) => html`<option key=${f.id} value=${f.id}>גופן: ${f.label}</option>`)}
              </select>
            </div>
          <//>
          <${Row} label="מה מופיע">
            <div class="flex flex-wrap gap-1.5">
              <${OnChip} on=${look.show.logo} onClick=${() => show('logo')}>לוגו ושם<//>
              <${OnChip} on=${look.show.num} onClick=${() => show('num')}>מספרים<//>
              <${OnChip} on=${look.show.swipe} onClick=${() => show('swipe')}>"החליקו לצד"<//>
            </div>
          <//>
          ${changed && html`<button type="button" class="mt-1 text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => setIt({ look: null })}>לחזור לעיצוב של השבוע</button>`}
        </div>`}
    </div>
    <div class="max-md:order-first max-md:mx-auto max-md:w-full max-md:max-w-[280px]">
      <p class="mb-1.5 flex items-center justify-between text-[14px] font-bold">שקופית ${sel + 1} מתוך ${slides.length}
        <span class="flex gap-1">
          <button type="button" class="grid h-7 w-7 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-line disabled:text-faint cursor-pointer" disabled=${sel === 0} onClick=${() => setSel(sel - 1)} aria-label="השקופית הקודמת"><${Icon} name="chevron-right" size=${16} /></button>
          <button type="button" class="grid h-7 w-7 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-line disabled:text-faint cursor-pointer" disabled=${sel === slides.length - 1} onClick=${() => setSel(sel + 1)} aria-label="השקופית הבאה"><${Icon} name="chevron-left" size=${16} /></button>
        </span>
      </p>
      <${Canvas}>${art(s, sel, edit)}<//>
      <p class="mt-1.5 flex items-center gap-1 text-[12px] text-muted"><${Icon} name="mouse-pointer-click" size=${14} />לחיצה על טקסט בשקופית: עריכה במקום</p>
    </div>
  </div>`;
}

// The reel: 3 hooks, the script, and the video. Uploading opens a window of its own
// (reel.js): the file, the processing, and then a player with the editing.
function ReelEditor({ item, st, setIt, p, tpl, flags, notify, cfg }) {
  const tp = topicOf(item);
  const script = reelScript(tp);
  const photo = photoOf(cfg, flags) || USER.photo;
  const [sheet, setSheet] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [cap, setCap] = useState(0);
  const hook = st.hook === 'none' ? null : tp.hooks[st.hook];
  const ready = st.video === 'ready';
  const caps = st.caps || [];
  const reel = reelOf(st);
  useEffect(() => {
    if (!playing || !caps.length) return;
    const id = setInterval(() => setCap((c) => (c + 1) % caps.length), 650);
    return () => clearInterval(id);
  }, [playing, caps.length]);
  const len = reel.trim ? reel.trim[1] - reel.trim[0] : caps.length ? caps[caps.length - 1].to + 0.4 : 0;
  return html`<div class="grid items-start gap-5 md:grid-cols-[1fr_190px]">
    <div class="min-w-0">
      <${SubStep} n="1" aside=${html`<small class="text-[12px] text-muted">למעלה לאורך כל הרילס</small>`}>בוחרים הוק<//>
      <div class="mb-2 grid gap-1.5 sm:grid-cols-2" role="radiogroup">
        ${tp.hooks.map((h, i) => html`<button key=${i} type="button" role="radio" aria-checked=${st.hook === i} onClick=${() => setIt({ hook: i })} class=${cx('flex items-center justify-between gap-2 rounded-xl border-[1.5px] bg-white px-2.5 py-1.5 text-start cursor-pointer', st.hook === i ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
          <span class="text-[14px] font-bold leading-snug">${h}</span>
          <${Counter} n=${h.length} limit=${LIMITS.hookChars} unit="" />
        </button>`)}
        <button type="button" role="radio" aria-checked=${st.hook === 'none'} onClick=${() => setIt({ hook: 'none' })} class=${cx('rounded-xl border-[1.5px] bg-white px-2.5 py-1.5 text-start text-[14px] font-bold cursor-pointer', st.hook === 'none' ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>בלי הוק</button>
      </div>
      ${!ready &&
      html`<${SubStep} n="2" class="!mb-1.5" aside=${html`<small class="text-[12px] text-muted">כ-${script.length > 5 ? 45 : 35} שניות</small>`}>התסריט<//>
        <div class="mb-2 overflow-hidden rounded-xl bg-white text-[13px] ring-1 ring-line">
          <div class="grid grid-cols-[52px_1fr] bg-canvas text-[12px] font-bold text-muted sm:grid-cols-[52px_1.4fr_0.6fr]">
            <span class="px-2 py-0.5">שניות</span>
            <span class="flex items-center gap-1 px-2 py-0.5"><${Icon} name="mic" size=${13} />מה ${g('אתה אומר', 'את אומרת')} למצלמה</span>
            <span class="flex items-center gap-1 px-2 py-0.5 max-sm:hidden"><${Icon} name="type" size=${13} />כתוב על המסך (נכנס לבד)</span>
          </div>
          ${script.map((r) => html`<div class="grid grid-cols-[52px_1fr] items-center border-t border-line sm:grid-cols-[52px_1.4fr_0.6fr]">
            <span class="whitespace-nowrap px-2 py-0.5 tabular-nums text-muted" dir="ltr">${r.at.replace('-', '–')}</span>
            <span class="px-2 py-0.5 leading-snug">${r.say}</span>
            <span class="px-2 pb-1 max-sm:col-start-2 sm:py-0.5"><span class="inline-block rounded-md bg-ink px-1.5 py-px text-[12px] font-bold leading-snug text-white"><span class="sm:hidden">על המסך: </span>${r.screen}</span></span>
          </div>`)}
        </div>
        <${SubStep} n="3" class="!mb-1" aside=${st.video !== 'later' && html`<span class="flex flex-wrap gap-2">
            <${Button} variant="secondary" class="!h-9" onClick=${() => setSheet('pick')}><${Icon} name="upload" size=${16} />להעלות סרטון<//>
            <${Button} variant="quiet" class="!h-9" onClick=${() => (setIt({ video: 'later' }), notify('התסריט נשמר. ביומן תהיה תזכורת לצלם', 'calendar-plus'))}>אצלם אחר כך<//>
          </span>`}>מצלמים ומעלים<//>
        <p class="flex items-start gap-1.5 text-[13px] text-muted"><${Icon} name="smartphone" size=${14} class="mt-0.5 shrink-0 text-brand-600" />בטלפון, לאורך, ובמילים שלך (לא צריך לשנן). מעלים את הסרטון כמו שצולם: החיתוך, הכתוביות, ההוק והכריכה נעשים כאן.</p>
        ${st.video === 'later' && html`<p class="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-warn-50 p-2.5 text-[14px] text-warn"><${Icon} name="video-off" size=${16} />הרילס ייכנס ליומן כתזכורת לצלם, ויתוזמן אחרי ההעלאה.<button type="button" class="font-bold underline underline-offset-2 cursor-pointer" onClick=${() => setSheet('pick')}>להעלות עכשיו</button></p>`}`}
      ${ready &&
      html`<div class="rise">
        <${SubStep} n="2">הסרטון<//>
        <div class="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-line">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-money-50 text-money"><${Icon} name="clapperboard" size=${22} /></span>
          <span class="min-w-0 flex-1">
            <b class="block text-[15px]">הסרטון מוכן · ${fmtSec(len)}</b>
            <small class="block text-[13px] text-muted">${[reel.cover === 'frame' ? 'כריכה מהסרטון' : 'כריכה מעוצבת', reel.silence && '6 שתיקות קוצרו', reel.caps ? `${caps.length} שורות כתוביות` : 'בלי כתוביות', st.names === 'cut' ? 'משפט עם שם נחתך' : st.names === 'name' ? 'שם הושמט' : ''].filter(Boolean).join(' · ')}</small>
          </span>
          <${Button} onClick=${() => setSheet('edit')}><${Icon} name="scissors" size=${16} />לערוך את הסרטון<//>
          <button type="button" class="text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => setSheet('pick')}>להחליף</button>
        </div>
      </div>`}
    </div>
    <div class="mx-auto w-full max-w-[190px]">
      <button type="button" class="block w-full cursor-pointer" onClick=${() => (ready ? setPlaying((x) => !x) : setSheet('pick'))} aria-label=${ready ? (playing ? 'עצירה' : 'ניגון') : 'להעלות סרטון'}>
        <${Canvas} w=${1080} h=${1920} round=${14}><${ReelFrame} t=${tpl} p=${p} hook=${reel.hook ? hook : null} caption=${ready ? (reel.caps ? caps[cap]?.text : null) : script[1].screen.split(' ').slice(0, 3).join(' ')} photo=${photo} playing=${playing || !ready} capStyle=${reel.capStyle} brand=${reel.logo} media=${ready && reelFile(item.id) && html`<${VideoMedia} src=${reelFile(item.id)} playing=${playing} />`} /><//>
      </button>
      <p class="mt-1 text-center text-[12px] text-muted">${ready ? (playing ? 'לעצירה, לחיצה על הסרטון' : 'לניגון, לחיצה על הסרטון') : 'ככה ייראה הרילס'}</p>
    </div>
    ${sheet && html`<${ReelSheet} item=${item} st=${st} setIt=${setIt} tpl=${tpl} p=${p} photo=${photo} hook=${hook} startAt=${sheet} notify=${notify} onClose=${() => setSheet(null)} />`}
  </div>`;
}

const ITEM_HOW = {
  post: 'בוחרים פתיח, קוראים, ומאשרים בכפתור למטה.',
  carousel: 'עוברים על השקופיות, מתקנים אם צריך, ומאשרים בכפתור למטה.',
  reel: 'בוחרים הוק, מצלמים לפי התסריט ומעלים, עכשיו או אחר כך.',
};

// One item of the week per screen: "פריט 2 מתוך 3". The main button approves it and moves on.
export function ItemScreen({ cfg, setCfg, flags, notify, n }) {
  const tpl = tplOf(cfg);
  const p = palOf(cfg, flags);
  const [stage, setStage] = useState(cfg.generated ? 99 : 0);
  const stages = GEN_STAGES(tpl);
  useEffect(() => {
    if (cfg.generated) return;
    if (stage >= stages.length) {
      setCfg({ generated: true });
      return;
    }
    const id = setTimeout(() => setStage((x) => x + 1), 520);
    return () => clearTimeout(id);
  }, [stage, cfg.generated]);
  if (!cfg.generated)
    return html`<div class="mx-auto max-w-[620px] px-4 py-4 md:px-8 md:py-5">
      <${StepHeading} n=${partNo('item1')} eyebrow=${partLabel('item1')} title=${['כותבים את ', 'התוכן של השבוע', '']} sub=${`${WORDS} כותב בקול שלך, ו${DESIGN} מעצב. כמה שניות, ואז עוברים על הפריטים אחד אחד.`} />
      <section class="fb-panel !p-5">
        <p class="mb-4 flex items-center gap-2 font-display text-[18px] font-bold"><${SharkAvatar} size=${34} mood="thinking" />${WORDS} עובד על זה</p>
        <div class="fb-stages">
          ${stages.map((label, i) => html`<div key=${i} class=${cx('fb-stage', i < stage && 'is-done', i === stage && 'is-now', i > stage && 'is-next')}><span class="fb-dot">${i < stage && html`<${PencilCheck} size=${16} color="#2d3e66" />`}</span>${label}</div>`)}
        </div>
      </section>
    </div>`;
  const item = cfg.plan[n];
  const st = itemState(cfg, item);
  const fmt = fmtOf(item.format);
  const setIt = (patch) => setCfg({ items: { ...cfg.items, [item.id]: { ...st, ...(cfg.items[item.id] || {}), ...patch } } });
  const props = { item, st, setIt, p, tpl, flags, notify, cfg };
  return html`<div class="mx-auto max-w-[1120px] px-4 py-3 md:px-8 md:py-3">
    <${StepHeading} n=${partNo('item1')} eyebrow=${partLabel('item1')} title=${[`פריט ${n + 1} מתוך ${cfg.plan.length}: `, fmt.label, '']} sub=${ITEM_HOW[item.format]} />
    <section key=${item.id} class="fb-panel !p-4">
      <div class="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line pb-2">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name=${fmt.icon} size=${19} /></span>
        <b class="min-w-0 flex-1 font-display text-[18px] leading-snug">${topicOf(item).title}</b>
        <${Tag}>${typeOf(topicOf(item).type).label}<//>
        ${st.approved && html`<${Tag} tone="live"><${Icon} name="check" size=${12} />אושר<//>`}
      </div>
      ${item.format === 'post' && html`<${PostEditor} ...${props} />`}
      ${item.format === 'carousel' && html`<${CarouselEditor} ...${props} />`}
      ${item.format === 'reel' && html`<${ReelEditor} ...${props} />`}
    </section>
  </div>`;
}

// ---------- part 4: the flyer ----------

export function flyerOffer(cfg, flags) {
  const e = cfg.flyer.edits || {};
  const base = flags.noOffer ? { ...OFFER, title: MESSAGE_LINES[0].text, sub: 'טיפול CBT לחרדה, למבוגרים ולנוער', price: '' } : OFFER;
  return { ...base, ...e, points: base.points.map((x, i) => e.points?.[i] ?? x) };
}

// One row of the flyer panel: a label, then its controls.
const Row = ({ label, children }) => html`<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line py-1.5"><span class="w-full shrink-0 text-[13px] font-bold sm:w-[78px]">${label}</span><div class="min-w-0 flex-1">${children}</div></div>`;
// The flyer is edited on the flyer itself: click a text, type, click away. The panel next
// to it holds the look: layout, colors, background, font, text size, the photo, and what shows.
export function FlyerScreen({ cfg, setCfg, flags }) {
  const tpl = tplOf(cfg);
  const f = cfg.flyer;
  const look = { ...FLYER_LOOK, ...(f.look || {}), show: { ...FLYER_LOOK.show, ...(f.look?.show || {}) } };
  const p = palOf(cfg, flags, f.swatch);
  const photo = photoOf(cfg, flags) || USER.photo;
  const offer = flyerOffer(cfg, flags);
  const setF = (patch) => setCfg({ flyer: { ...f, ...patch, saved: false } });
  const setLook = (patch) => setF({ look: { ...look, ...patch } });
  const show = (k) => setLook({ show: { ...look.show, [k]: !look.show[k] } });
  const edit = (key, v) => {
    const e = { ...(f.edits || {}) };
    if (key.startsWith('points.')) {
      const pts = [...(e.points || [])];
      pts[+key.split('.')[1]] = v;
      e.points = pts;
    } else e[key] = v;
    setF({ edits: e });
  };
  const flyer = (layout, editable) => html`<${Flyer} t=${tpl} p=${p} layout=${layout} photo=${photo} noLogo=${flags.noLogo} offer=${offer} price=${f.price && !!offer.price} qr=${f.qr} look=${look} edit=${editable ? edit : null} />`;
  return html`<div class="mx-auto max-w-[1120px] px-4 py-3 md:px-8 md:py-3">
    <${StepHeading} n=${partNo('flyer')} eyebrow=${partLabel('flyer')} title=${['פלייר אחד, עם ', 'התמונה שלך', '']} sub="לוחצים על כל טקסט בפלייר כדי לערוך אותו. הפלייר מחכה לך בשלב 11." />
    <div class="grid items-start gap-5 md:grid-cols-[1fr_310px]">
      <section class="fb-panel !p-4">
        <${SubStep} n="1">העיצוב<//>
        <${Row} label="פריסה">
          <div class="flex flex-wrap gap-2" role="radiogroup">
            ${LAYOUTS.map((l) => html`<button key=${l.id} type="button" role="radio" aria-checked=${f.layout === l.id} onClick=${() => setF({ layout: l.id })} class=${cx('flex flex-col items-center gap-1 rounded-lg bg-white p-1 cursor-pointer sm:flex-row sm:gap-2 sm:pe-2.5', f.layout === l.id ? 'ring-[2.5px] ring-brand-600' : 'ring-1 ring-line hover:ring-brand-300')}>
              <span class="block w-[44px]"><${Canvas} round=${3}>${flyer(l.id, false)}<//></span>
              <span class="text-[13px] font-bold">${l.label}</span>
            </button>`)}
          </div>
        <//>
        <${Row} label="צבע הדגשה"><div class="flex gap-1.5">${BRAND.swatches.map((c, i) => html`<button key=${c} type="button" aria-label=${`צבע ${i + 1}`} aria-pressed=${(f.swatch || 0) === i} onClick=${() => setF({ swatch: i })} class=${cx('h-7 w-7 rounded-full cursor-pointer', (f.swatch || 0) === i ? 'ring-[3px] ring-brand-600 ring-offset-2' : 'ring-1 ring-line')} style=${{ background: c }}></button>`)}</div><//>
        <${Row} label="רקע"><${Mini} options=${FLYER_BG} value=${look.bg} onChange=${(v) => setLook({ bg: v })} /><//>
        <${Row} label="גופן כותרת"><${Mini} options=${FLYER_FONTS} value=${look.font} onChange=${(v) => setLook({ font: v })} /><//>
        <${Row} label="גודל טקסט"><${Mini} options=${FLYER_SIZES} value=${look.size} onChange=${(v) => setLook({ size: v })} /><//>
        <${Row} label="התמונה">
          <div class="flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-2 text-[13px]"><${Icon} name="zoom-in" size=${15} class="text-muted" /><input type="range" min="100" max="160" step="5" value=${look.zoom} onInput=${(e) => setLook({ zoom: +e.target.value })} class="fb-range w-[120px]" style=${{ '--p': `${((look.zoom - 100) / 60) * 100}%` }} aria-label="זום" /></label>
            <${Mini} options=${FLYER_POS} value=${look.pos} onChange=${(v) => setLook({ pos: v })} />
          </div>
        <//>
        <${Row} label="מה מופיע">
          <div class="flex flex-wrap gap-1.5">
            ${offer.price && html`<${OnChip} on=${f.price} onClick=${() => setF({ price: !f.price })}>מחיר<//>`}
            <${OnChip} on=${f.qr} onClick=${() => setF({ qr: !f.qr })}>QR לדף<//>
            <${OnChip} on=${look.show.points} onClick=${() => show('points')}>נקודות<//>
            <${OnChip} on=${look.show.phone} onClick=${() => show('phone')}>טלפון<//>
            ${!flags.noLogo && html`<${OnChip} on=${look.show.logo} onClick=${() => show('logo')}>לוגו<//>`}
          </div>
        <//>
        <div class="mt-2 border-t border-line pt-2">
          <p class="mb-1 flex flex-wrap items-center justify-between gap-2"><span class="text-[13px] font-bold">בדיקת הטקסט</span><${From}>${flags.noOffer ? 'מ"דף המסרים"' : 'מ"בניית הצעה מנצחת"'}<//></p>
          ${checkText(`${offer.title} ${offer.sub} ${offer.cta} ${offer.points.join(' ')}`).length
            ? html`<${Checks} text=${`${offer.title} ${offer.sub} ${offer.cta} ${offer.points.join(' ')}`} />`
            : html`<p class="flex items-center gap-1.5 text-[13px] text-muted"><${Icon} name="check" size=${14} class="text-money" />בלי שמות, מילים אסורות או הבטחות</p>`}
        </div>
      </section>
      <aside class="max-md:order-first max-md:mx-auto max-md:w-full max-md:max-w-[280px] md:sticky md:top-4">
        <${Canvas} round=${12}>${flyer(f.layout, true)}<//>
        <p class="mt-2 flex items-center gap-1.5 text-[13px] text-muted"><${Icon} name="mouse-pointer-click" size=${15} />לחיצה על טקסט בפלייר: עריכה במקום</p>
        ${f.saved && html`<p class="rise mt-2 flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-[14px] font-bold text-brand-600"><${PencilCheck} size=${18} color="#0038b8" />נשמר בקבצים. מחכה לך בשלב 11</p>`}
      </aside>
    </div>
  </div>`;
}

// ---------- the finish ----------

// The next week, right from the finish: the shark already picked 3 topics.
// After week 4 the streak is done: no week 5, and the auto-prepare stops.
export function StreakEnd({ cfg }) {
  const weeks = [...(cfg.history || []), { week: cfg.week || 1, plan: cfg.plan }];
  const items = weeks.reduce((n, h) => n + h.plan.length, 0);
  const leads = (cfg.history || []).reduce((n, h) => n + h.plan.reduce((m, i) => m + (LAST_WEEK_STATS[i.id]?.leads || 0), 0), 0);
  return html`<section class="fb-panel mb-4 border-[1.5px] border-brand-300 !p-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name="flag" size=${22} /></span>
      <span class="min-w-0 flex-1"><b class="block text-[17px]">${MAX_WEEKS} שבועות של תוכן, הרצף הושלם</b><small class="block text-[13px] text-muted">${items} פריטים ב-${MAX_WEEKS} שבועות${leads ? `, ${leads} לידים מהתוכן` : ''}. כאן הרצף נגמר, ואין שבוע ${MAX_WEEKS + 1}. כל מה שפורסם נשאר בלוח ובטבלת הלידים.</small></span>
    </div>
  </section>`;
}

function NextWeek({ cfg, setCfg, onNextWeek }) {
  const next = (cfg.week || 1) + 1;
  if (next > MAX_WEEKS) return html`<${StreakEnd} cfg=${cfg} />`;
  return html`<section class="fb-panel mb-4 border-[1.5px] border-brand-300 !p-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name="calendar-plus" size=${22} /></span>
      <span class="min-w-0 flex-1"><b class="block text-[17px]">השבוע הבא, ${weekRange(next)} <span class="text-[14px] font-normal text-muted">· שבוע ${next} מתוך ${MAX_WEEKS}</span></b><small class="block text-[13px] text-muted">3 נושאים כבר מחכים: מה שעבד, מה שלידים שאלו, וכאבים שעוד לא כתבת עליהם. כ-5 דקות.</small></span>
      <${Button} onClick=${onNextWeek}>להכין את שבוע ${next}<${Icon} name="arrow-left" size=${17} /><//>
    </div>
    <label class="mt-3 flex cursor-pointer items-center justify-between gap-3 border-t border-line pt-3 text-[14px]">
      <span><b>להכין לבד כל מוצאי שבת</b><small class="block text-[13px] text-muted">טיוטה של השבוע הבא מחכה ביום ראשון בבוקר, עם התראה, עד שבוע ${MAX_WEEKS}. שום דבר לא יוצא בלי האישור שלך.</small></span>
      <${Toggle} on=${!!cfg.autoWeek} onChange=${(v) => setCfg({ autoWeek: v })} label="הכנה אוטומטית של השבוע הבא" />
    </label>
  </section>`;
}

export function Done({ cfg, setCfg, flags, notify, onGrow, onNextWeek }) {
  const week = cfg.week || 1;
  const growing = cfg.growth === 'active';
  useEffect(() => {
    const t = setTimeout(() => confetti('step'), 200);
    // Right after the confetti: the offer to grow the followers, once a week, until bought.
    const o = !growing && cfg.growthAsked !== week ? setTimeout(() => (setCfg({ growthAsked: week }), onGrow()), 1600) : null;
    return () => (clearTimeout(t), clearTimeout(o));
  }, []);
  const [tab, setTab] = useState('line');
  const [ver, setVer] = useState(0);
  const scheduled = cfg.plan.filter((i) => cfg.sched[i.id]?.status === 'scheduled').length;
  const manual = cfg.plan.filter((i) => ['manual', 'posted'].includes(cfg.sched[i.id]?.status)).length;
  const rows = [
    ['calendar-check', 'ביומן', `${cfg.plan.length} פריטים${scheduled ? ` · ${scheduled} מתוזמנים` : ''}${manual ? ` · ${manual} לפרסום ידני` : ''}`],
    ...(week === 1 ? [['image', 'הפלייר', 'בקבצים, מחכה לשלב 11'], ['palette', 'המראה', `תבנית ${tplOf(cfg).n}: ${tplOf(cfg).name}`]] : []),
    ['link', 'הקישור', 'כל פוסט מסומן במקור שלו בטבלת הלידים'],
  ];
  const texts = tab === 'line' ? MESSAGE_LINES.map((m) => m.text) : BIOS.map((b) => b.join(NL));
  return html`<div class="mx-auto grid max-w-[1080px] items-start gap-6 px-4 py-5 md:grid-cols-[1.3fr_0.7fr] md:px-8 md:py-7">
    <div class="min-w-0">
      <p class="fb-eyebrow mb-1">${week === 1 ? 'סיימת את שלב 10 · מביאים לקוחות' : `שבוע ${week} · ${weekRange()}`}</p>
      <h1 class="fb-h1 mb-3 text-[28px] md:text-[34px]">${week === 1 ? `שבוע התוכן של ${USER.business} ` : `שבוע ${week} `}<span class="marker">${week === 1 ? 'מוכן' : 'בלוח'}</span></h1>
      <section class="fb-panel mb-4 !p-4">
        <ul class="flex flex-col divide-y divide-line">
          ${rows.map(([icon, k, v]) => html`<li key=${k} class="flex items-center gap-3 py-1.5"><span class="text-brand-600"><${Icon} name=${icon} size=${18} /></span><span class="w-[64px] shrink-0 text-[14px] font-bold">${k}</span><span class="min-w-0 text-[15px]">${v}</span></li>`)}
        </ul>
      </section>
      <${NextWeek} cfg=${cfg} setCfg=${setCfg} onNextWeek=${onNextWeek} />
      <section class=${cx('fb-panel flex flex-wrap items-center gap-3 !p-3', !growing && 'border-[1.5px] border-money/40')}>
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-money-50 text-money"><${Icon} name="trending-up" size=${20} /></span>
        <span class="min-w-0 flex-1"><b class="block text-[15px]">${growing ? 'צמיחת העוקבים פעילה' : 'עוקבים חדשים, בלי מאמץ'}</b><small class="block text-[13px] text-muted">${growing ? 'עוקבים חדשים מהקהל שבחרת, כל יום. המספרים בדף הבית.' : cfg.growth === 'paid' ? 'התשלום עבר. חסרים העמודים הדומים והחשבון באינסטגרם.' : 'עוקבים אוטומטית אחרי הקהל שלך, כדי שיגיעו לתוכן. 350 ₪ + מע"מ לחודש, בלי התחייבות.'}</small></span>
        ${!growing && html`<${Button} variant="secondary" onClick=${onGrow}>${cfg.growth === 'paid' ? 'להשלים' : 'איך זה עובד'}<//>`}
      </section>
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex justify-center pt-2">
        ${week === 1
          ? html`<${Note} tone="gold" tilt=${-2} class="fb-badge-note !pt-10">
              <span class="fb-note-kicker">תג חדש</span>
              <b class="font-display text-[26px]">המכפיל</b>
              <span class="text-[14px]">חסכת בשלב הזה</span>
              <span class="relative font-display text-[36px] font-black text-money">${money(1200)}<${PencilLine} color="#12805c" class="absolute inset-x-0 -bottom-1 h-2 w-full" /></span>
            <//>`
          : html`<${Note} tone="gold" tilt=${-2} class="fb-badge-note !pt-10">
              <span class="fb-note-kicker">${week >= MAX_WEEKS ? 'הרצף הושלם' : 'רצף'}</span>
              <b class="font-display text-[40px] leading-none">${week}<span class="text-[22px]"> / ${MAX_WEEKS}</span></b>
              <span class="text-[15px] font-bold">שבועות של תוכן ברצף</span>
            <//>`}
      </div>
      ${week === 1 && html`<section class="fb-panel !p-4">
        <div class="mb-2 flex items-center justify-between gap-2"><h2 class="fb-h3">להעתקה</h2><${Mini} options=${[{ id: 'line', label: 'משפט מסר' }, { id: 'bio', label: 'ביו לאינסטגרם' }]} value=${tab} onChange=${(v) => (setTab(v), setVer(0))} /></div>
        <div class="flex items-start justify-between gap-2 rounded-xl bg-canvas p-3 text-[15px] font-bold leading-relaxed"><span class="whitespace-pre-line">${texts[ver]}</span><${Button} variant="quiet" class="!h-8 shrink-0" onClick=${() => notify('הועתק', 'copy')}><${Icon} name="copy" size=${15} /><//></div>
        <div class="mt-2 flex items-center justify-between text-[13px] text-muted"><span>גרסה ${ver + 1} מתוך 3</span><button type="button" class="font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => setVer((v) => (v + 1) % 3)}>גרסה אחרת</button></div>
      </section>`}
    </div>
  </div>`;
}
