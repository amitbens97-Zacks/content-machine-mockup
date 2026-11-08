// Step 10, "מכונת תוכן שיווקי" (chapter 4): opening, the channel, the look, the week's
// plan, the content (post, carousel, reel), the flyer, and the finish. Publishing is in
// publish.js. Nothing the user already answered in an earlier step is asked again: it is
// filled in and marked with the step it came from.
import { html, useState, useEffect, useRef, Icon, PencilCheck, PencilLine, cx, confetti, money } from './lib.js';
import { Button, Note, StepHeading, SharkAvatar, SubStep } from './components.js';
import { Chips, Field, inputCls, Tag } from './ui.js';
import { USER, BRAND, META, PAGE_LINK, PLATFORMS, STYLES, TEMPLATES, RECOMMENDED_TEMPLATE, WEEK, TYPES, FORMATS, TOPICS, TOPIC_CHOICES, OFFER, PARTS, partLabel, MESSAGE_LINES, BIOS, WORDS, DESIGN, g } from './data.js';
import { Canvas, Slide, ReelFrame, Flyer, LAYOUTS, palette } from './art.js';
import { words, LIMITS, topicOf, checkText, postVersions, postQuote, CHANGES, applyChange, carouselSlides, slideFields, reelScript, TRANSCRIPT, captionLines, REEL_STAGES, fmtSec } from './content.js';
import { MetaSheet } from './publish.js';

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

export const tplOf = (cfg) => TEMPLATES.find((t) => t.id === cfg.template) || TEMPLATES[0];
export const palOf = (cfg, flags, swatch) => palette(tplOf(cfg), cfg.colors, flags.noLogo, swatch);
export const photoOf = (cfg, flags) => (flags.noPhoto && cfg.photo !== 'upload' ? null : USER.photo);
export const fmtOf = (id) => FORMATS.find((f) => f.id === id);
export const typeOf = (id) => TYPES.find((t) => t.id === id);
export const dayOf = (id) => WEEK.find((d) => d.id === id);
// The state of one item of the week, with its defaults.
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
  return html`<div class="mx-auto grid max-w-[1120px] items-center gap-8 px-4 py-6 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:px-8 md:py-8">
    <div>
      <${StepHeading} n="10" eyebrow="שלב 10 · מביאים לקוחות" title=${['שבוע של תוכן, ופלייר אחד, ', 'מוכנים לפרסום', '']} />
      <p class="mb-6 max-w-[50ch] text-[18px] text-ink">${WORDS} כותב בקול שלך מתוך מה שכבר בנית: תיק הלקוח, דף המסרים וההצעה. ${DESIGN} מעצב בתבנית שבחרת, עם הלוגו והתמונה שלך. ${g('אתה מאשר', 'את מאשרת')} כל פריט, והוא יוצא לאינסטגרם ולפייסבוק בזמן שקבעת.</p>
      <div class="flex flex-col gap-2 border-t border-line pt-4 text-[15px]">
        <div><p class="mb-1.5 flex items-center gap-2"><${Icon} name="list" size=${17} class="text-brand-600" /><b>${PARTS.length} חלקים, אחד אחרי השני:</b></p>
          <ol class="grid grid-cols-2 gap-x-4 gap-y-1.5 ps-6 sm:grid-cols-3">${PARTS.map((p, i) => html`<li key=${p} class="flex items-center gap-1.5"><span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-[12px] font-bold text-brand-600">${i + 1}</span>${p}</li>`)}</ol></div>
        <p class="flex items-center gap-2"><${Icon} name="clock" size=${17} class="text-brand-600" /><b>זמן:</b> כ-15 דקות</p>
        <p class="flex items-center gap-2"><${Icon} name="file-check-2" size=${17} class="text-brand-600" /><b>התוצר:</b> 3 פריטים ביומן, ופלייר לשלב 11</p>
      </div>
    </div>
    <div class="relative mx-auto h-[400px] w-full max-w-[420px]" aria-hidden="true">
      <div class="absolute start-2 top-0 w-[150px] rotate-[-4deg]"><${Canvas} w=${1080} h=${1920}><${ReelFrame} t=${t} p=${p} hook=${TOPICS.o1.hooks[0]} caption="צעד אחד" photo=${photo} /><//></div>
      <div class="absolute end-0 top-6 w-[210px] rotate-[3deg]"><${Canvas}><${Slide} s=${{ kind: 'cover', opener: 'טיפ לשבוע', title: TOPICS.v1.hooks[1], sub: '', swipe: 'החליקו לצד' }} t=${t} p=${p} total=${6} noLogo=${flags.noLogo} /><//></div>
      <div class="absolute bottom-6 start-16 w-[200px] rotate-[-1deg]"><${Canvas}><${Flyer} t=${t} p=${p} layout="circle" photo=${photo} noLogo=${flags.noLogo} /><//></div>
      <span class="hand absolute -bottom-2 end-4 rotate-[-4deg] whitespace-nowrap text-[26px]">בעיצוב שלך, בקול שלך</span>
    </div>
  </div>`;
}

// ---------- part 1a: the channel ----------

export function ChannelScreen({ cfg, setCfg, flags, notify }) {
  const [meta, setMeta] = useState(false);
  const on = cfg.channels;
  const flip = (id) => setCfg({ channels: on.includes(id) ? on.filter((x) => x !== id) : [...on, id] });
  const rec = flags.b2b ? ['li', 'fb'] : ['ig', 'fb'];
  const sub = {
    ig: 'פוסט, קרוסלה ורילס. מתזמנים ומפרסמים מכאן',
    fb: 'פרסום ותזמון לעמוד העסקי. לקבוצות: טקסט להעתקה',
    li: 'טקסט להעתקה וקבצים להורדה. אין פרסום ישיר',
  };
  const anyMeta = on.includes('ig') || on.includes('fb');
  return html`<div class="mx-auto max-w-[1000px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="1" eyebrow=${partLabel(0)} title=${['איפה ', 'מפרסמים', '']} sub=${`בוחרים ערוץ אחד או יותר, ואז איך הפריטים יוצאים: לבד בזמן שנקבע, או ש${g('אתה מפרסם', 'את מפרסמת')} בעצמך.`} />
    <section class="fb-panel mb-4 !p-4 md:!p-5">
    <${SubStep} n="1">איפה הקהל שלך<//>
    <div class="mb-3 flex items-start gap-3 rounded-xl bg-brand-50 p-3 text-[15px]">
      <${SharkAvatar} size=${34} />
      <p class="min-w-0">לפי <b>צייד הלקוחות</b> (שלב 4): ${flags.b2b ? 'הקהל שלך הוא עסקים, ובעיקר בלינקדאין ובפייסבוק.' : `הקהל שלך נמצא ב${USER.where}.`} אז ההמלצה: <b>${rec.map((id) => PLATFORMS.find((x) => x.id === id).label).join(' ו')}</b>.</p>
    </div>
    <ul class="grid gap-2 sm:grid-cols-3">
      ${PLATFORMS.map((pl) => {
        const checked = on.includes(pl.id);
        return html`<li key=${pl.id}>
          <label class=${cx('flex h-full cursor-pointer items-start gap-2.5 rounded-xl border-[1.5px] bg-white p-3', checked ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
            <input type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" checked=${checked} onChange=${() => flip(pl.id)} />
            <span class="mt-0.5 text-brand-600"><${Icon} name=${pl.icon} size=${19} /></span>
            <span class="min-w-0"><b class="flex flex-wrap items-center gap-1.5 text-[15px]">${pl.label}${rec.includes(pl.id) && html`<${Tag} tone="blue">מומלץ<//>`}</b><small class="block text-[13px] leading-snug text-muted">${sub[pl.id]}</small></span>
          </label>
        </li>`;
      })}
    </ul>
    </section>
    ${anyMeta &&
    html`<section class="fb-panel !p-4 md:!p-5">
      <${SubStep} n="2">איך מפרסמים<//>
      ${cfg.connect === 'meta'
        ? html`<div class="rise">
            <ul class="my-3 flex flex-col gap-2">
              ${on.includes('ig') && html`<li class="flex flex-wrap items-center gap-2 text-[15px]"><${Icon} name="instagram" size=${18} class="text-brand-600" /><b dir="ltr">@${META.ig.handle}</b><span class="text-muted">· ${META.ig.kind}</span><${Tag} tone="live">מחובר<//></li>`}
              ${on.includes('fb') && !flags.noPage && html`<li class="flex flex-wrap items-center gap-2 text-[15px]"><${Icon} name="facebook" size=${18} class="text-brand-600" /><b>${META.fb.page}</b><span class="text-muted">· עמוד עסקי</span><${Tag} tone="live">מחובר<//></li>`}
              ${on.includes('fb') && flags.noPage && html`<li class="flex flex-wrap items-center gap-2 text-[15px]"><${Icon} name="facebook" size=${18} class="text-muted" /><b>פייסבוק</b><${Tag} tone="draft">בלי עמוד עסקי: להעתקה<//></li>`}
            </ul>
            <button type="button" class="text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => (setCfg({ connect: null, sched: Object.fromEntries(Object.entries(cfg.sched).filter(([, v]) => v?.status !== 'scheduled')) }), notify('החיבור נותק. הפוסטים שתוזמנו בוטלו', 'unplug'))}>ניתוק</button>
          </div>`
        : html`<p class="mb-3 text-[14px] text-muted">מחברים פעם אחת דרך Meta, וכל פריט שמאשרים יוצא לבד בזמן שנקבע. בלי חיבור, כל פריט מגיע עם טקסט להעתקה, קבצים להורדה ותזכורת ביומן.</p>
          <div class="grid gap-2 sm:grid-cols-2">
            <button type="button" class=${cx('lp-option !items-start', cfg.connect === 'meta' && '!border-brand-600 !bg-brand-50')} onClick=${() => setMeta(true)}>
              <span class="mt-0.5 text-brand-600"><${Icon} name="plug-zap" size=${19} /></span>
              <span class="min-w-0"><b class="block text-[15px]">לחבר את אינסטגרם ופייסבוק</b><small class="block text-[13px] leading-snug text-muted">תזמון ופרסום במקביל, בלחיצה</small></span>
            </button>
            <button type="button" class=${cx('lp-option !items-start', cfg.connect === 'manual' && '!border-brand-600 !bg-brand-50')} onClick=${() => setCfg({ connect: 'manual' })}>
              <span class="mt-0.5 text-brand-600"><${Icon} name="hand" size=${19} /></span>
              <span class="min-w-0"><b class="block text-[15px]">${g('אפרסם בעצמי', 'אפרסם בעצמי')}</b><small class="block text-[13px] leading-snug text-muted">טקסט להעתקה, קבצים ותזכורת. אפשר לחבר בכל רגע</small></span>
            </button>
          </div>`}
      ${on.includes('fb') &&
      html`<label class="mt-4 flex cursor-pointer items-start gap-2.5 border-t border-line pt-3 text-[15px]">
        <input type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" checked=${cfg.fbGroups} onChange=${(e) => setCfg({ fbGroups: e.target.checked })} />
        <span><b>גם לקבוצות בפייסבוק</b><small class="block text-[13px] leading-snug text-muted">פייסבוק לא מאפשר לפרסם בקבוצות ממערכת חיצונית. לכל פריט לקבוצות ${g('תקבל', 'תקבלי')} טקסט להעתקה ותזכורת בשעה הטובה.</small></span>
      </label>`}
    </section>`}
    ${meta && html`<${MetaSheet} flags=${flags} onClose=${() => setMeta(false)} onDone=${() => (setMeta(false), setCfg({ connect: 'meta' }), notify('אינסטגרם ופייסבוק מחוברים', 'plug-zap'))} />`}
  </div>`;
}

// ---------- part 1b: the look ----------

function TemplateCard({ t, cfg, flags, on, onPick }) {
  const p = palette(t, cfg.colors, flags.noLogo);
  return html`<button type="button" onClick=${onPick} aria-pressed=${on} class=${cx('group flex flex-col gap-2 rounded-2xl border-[1.5px] bg-white p-2 text-start cursor-pointer', on ? 'border-brand-600 ring-4 ring-brand-100' : 'border-line hover:border-brand-300')}>
    <${Canvas} round=${8}><${Slide} s=${{ kind: 'cover', opener: USER.business, title: TOPICS.v1.hooks[1], sub: '' }} t=${t} p=${p} noLogo=${flags.noLogo} /><//>
    <span class="px-1 pb-1">
      <b class="flex items-center gap-1.5 text-[14px]">${t.name}${t.id === RECOMMENDED_TEMPLATE && html`<${Tag} tone="blue">מומלץ<//>`}</b>
      <small class="text-[12px] text-muted">נבנתה ל${t.forWho}</small>
    </span>
  </button>`;
}

export function LookScreen({ cfg, setCfg, flags, notify }) {
  const t = tplOf(cfg);
  const p = palOf(cfg, flags);
  const list = TEMPLATES.filter((x) => x.style === cfg.style);
  const photo = photoOf(cfg, flags);
  const samples = cfg.voice.split(/\n\s*\n/).filter((x) => x.trim()).length;
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="2" eyebrow=${partLabel(1)} title=${['איך התוכן ', 'ייראה', '']} sub="כבר בחרנו תבנית שמתאימה לעסק. אם היא נראית לך, פשוט ממשיכים. כל פוסט, קרוסלה, רילס ופלייר ייראו ככה." />
    <div class="grid items-start gap-6 md:grid-cols-[1.3fr_0.7fr]">
      <div class="flex min-w-0 flex-col gap-4">
        <section class="fb-panel !p-4 md:!p-5">
          <${SubStep} n="1">סגנון<//>
          <${Chips} options=${STYLES} value=${cfg.style} onChange=${(v) => setCfg({ style: v, template: TEMPLATES.find((x) => x.style === v).id })} />
          <${SubStep} n="2" class="mt-5">תבנית<//>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            ${list.map((x) => html`<${TemplateCard} key=${x.id} t=${x} cfg=${cfg} flags=${flags} on=${x.id === cfg.template} onPick=${() => setCfg({ template: x.id })} />`)}
          </div>
        </section>
        <section class="fb-panel !p-4 md:!p-5">
          <${SubStep} n="3">מה כבר יש לנו ממך<//>
          <p class="mb-3 text-[14px] text-muted">הלוגו, הצבעים והתמונה מהשלבים הקודמים. אין מה לעשות כאן, אלא אם רוצים להחליף.</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="min-w-0 rounded-xl bg-canvas p-3">
              <p class="mb-2 text-[14px] font-bold">לוגו וצבעים</p>
              ${flags.noLogo
                ? html`<p class="rounded-lg bg-warn-50 p-2 text-[13px] text-warn">עוד אין לוגו, אז התוכן יוצא עם שם העסק ובצבעי התבנית. ${g('כשתסיים', 'כשתסיימי')} את שלב 6, הלוגו והצבעים ייכנסו לבד.</p>`
                : html`<div class="mb-2 flex items-center gap-2.5">
                    <img src=${BRAND.logo} alt="הלוגו של העסק" class="h-11 w-11 rounded-full bg-white ring-1 ring-line" />
                    <span class="flex gap-1">${BRAND.swatches.slice(0, 4).map((c) => html`<i class="h-6 w-6 rounded-full ring-1 ring-line" style=${{ background: c }}></i>`)}</span>
                  </div>
                  <${Chips} small options=${[{ id: 'brand', label: 'צבעי הלוגו' }, { id: 'own', label: 'צבעי התבנית' }]} value=${cfg.colors} onChange=${(v) => setCfg({ colors: v })} />
                  <p class="mt-2"><${From}>מילאנו לפי "שם ולוגו"<//></p>`}
            </div>
            <div class="min-w-0 rounded-xl bg-canvas p-3">
              <p class="mb-2 text-[14px] font-bold">התמונה שלך</p>
              <div class="flex items-center gap-3">
                ${photo
                  ? html`<img src=${photo} alt="התמונה שלך" class="h-20 w-16 rounded-lg object-cover ring-1 ring-line" />`
                  : html`<span class="grid h-20 w-16 place-items-center rounded-lg border-2 border-dashed border-line text-faint"><${Icon} name="image-plus" size=${22} /></span>`}
                <div class="min-w-0">
                  <p class="mb-2 text-[13px] text-muted">לפלייר ולחלק מהשקופיות.</p>
                  <${Button} variant="quiet" onClick=${() => (setCfg({ photo: 'upload' }), notify(photo ? 'במוקאפ: כאן נפתחת בחירת תמונה מהמחשב או מהטלפון' : 'התמונה עלתה', 'image'))}><${Icon} name="upload" size=${15} />${photo ? 'להחליף' : 'להעלות תמונה'}<//>
                </div>
              </div>
              ${photo && cfg.photo === 'landing' && html`<p class="mt-2"><${From}>מילאנו לפי "דף נחיתה"<//></p>`}
            </div>
          </div>
          <p class="mt-2 flex items-center gap-1.5 text-[13px] text-muted"><${Icon} name="contrast" size=${15} />ניגודיות הטקסט: ${p.ratio.toFixed(1)}:1. המינימום הוא 4.5:1, אז הטקסט קריא.</p>
        </section>
        <details class="fb-panel group !p-4 md:!p-5" open=${!!cfg.voice}>
          <summary class="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span class="flex items-center gap-2 text-[16px] font-bold"><${Icon} name="pen-line" size=${18} class="text-brand-600" />שהתוכן יישמע עוד יותר כמוך <span class="text-[14px] font-normal text-muted">(לא חובה)</span></span>
            <${Icon} name="chevron-down" size=${18} class="text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p class="mb-2 mt-3 text-[14px] text-muted">עד 5 פוסטים או הודעות שכתבת. ${WORDS} לומד מהם איך ${g('אתה כותב', 'את כותבת')}: אורך המשפטים, המילים, ההומור. שורה ריקה בין טקסט לטקסט.</p>
          <textarea rows="4" class=${cx(inputCls, '!h-auto py-2 leading-relaxed')} placeholder="להדביק כאן" value=${cfg.voice} onInput=${(e) => setCfg({ voice: e.target.value })}></textarea>
          ${samples > 0 && html`<p class="mt-1 text-[13px] text-muted">${samples > 5 ? 'נלקחים 5 הראשונים' : samples === 1 ? 'טקסט אחד' : `${samples} טקסטים`}</p>`}
        </details>
      </div>
      <aside class="sticky top-4 hidden md:block">
        <p class="mb-2 text-[14px] font-bold">ככה זה ייראה</p>
        <${Canvas}><${Slide} s=${{ kind: 'cover', opener: 'טיפ לשבוע', title: TOPICS.v1.hooks[1], sub: 'שלושה דברים שאפשר לעשות כבר הערב' }} t=${t} p=${p} total=${6} noLogo=${flags.noLogo} /><//>
        <p class="mt-2 text-[13px] text-muted">תבנית ${t.n}: ${t.name}. השם, הלוגו והצבעים שלך.</p>
      </aside>
    </div>
  </div>`;
}

// ---------- part 2: the week ----------

export function PlanScreen({ cfg, setCfg, flags, notify }) {
  const plan = cfg.plan;
  const offers = plan.filter((i) => topicOf(i).type === 'offer').length;
  const setItem = (id, p) => setCfg({ plan: plan.map((i) => (i.id === id ? { ...i, ...p } : i)), generated: false, items: { ...cfg.items, [id]: undefined } });
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="3" eyebrow=${partLabel(2)} title=${['3 פריטים ', 'לשבוע הזה', '']} sub="שלושה נושאים מוכנים, מתוך הכאבים שבתיק הלקוח. אפשר להחליף נושא, יום או צורה, או פשוט להמשיך." />
    <div class="grid gap-4 md:grid-cols-3">
      ${plan.map((item, idx) => {
        const t = topicOf(item);
        const choices = TOPIC_CHOICES[t.type];
        return html`<section key=${item.id} class="fb-panel flex flex-col gap-3 !p-4">
          <div class="flex items-center gap-2">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 font-display text-[15px] font-bold text-brand-600">${idx + 1}</span>
            <select class=${cx(inputCls, '!h-9 !w-auto flex-1 !px-2 !text-[15px]')} value=${item.day} onChange=${(e) => setItem(item.id, { day: e.target.value })} aria-label="יום">
              ${WEEK.map((d) => html`<option value=${d.id}>${d.label} ${d.date}</option>`)}
            </select>
            <input type="time" class=${cx(inputCls, '!h-9 !w-[96px] !px-2 !text-[15px]')} value=${item.time} onChange=${(e) => setItem(item.id, { time: e.target.value })} aria-label="שעה" />
          </div>
          <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="סוג">
            ${TYPES.map((ty) => {
              const off = ty.id === 'offer' && t.type !== 'offer' && (flags.noOffer || offers >= 1);
              const on = t.type === ty.id;
              return html`<button key=${ty.id} type="button" role="radio" aria-checked=${on} disabled=${off}
                title=${off ? (flags.noOffer ? 'אין עדיין הצעה. היא נבנית בשלב 8' : 'בשבוע של 3 פריטים יש הצעה אחת לכל היותר') : ty.sub}
                onClick=${() => !on && setItem(item.id, { topic: TOPIC_CHOICES[ty.id][0], ...(ty.id === 'offer' ? { time: '19:30' } : {}) })}
                class=${cx('inline-flex h-8 items-center gap-1 rounded-lg border-[1.5px] px-2 text-[13px] font-bold', on ? 'border-brand-600 bg-brand-100 text-brand-600' : off ? 'border-line bg-canvas text-faint cursor-not-allowed' : 'border-line bg-white hover:border-brand-300 cursor-pointer')}
              ><${Icon} name=${ty.icon} size=${14} />${ty.label}</button>`;
            })}
          </div>
          <div class="min-h-[86px] rounded-xl bg-canvas p-3">
            <b class="block font-display text-[17px] leading-snug">${t.title}</b>
            <small class="mt-1 block text-[13px] text-muted">מהכאב: "${t.pain}"</small>
          </div>
          ${choices.length > 1 && html`<button type="button" class="-mt-1 self-start text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => setItem(item.id, { topic: choices[(choices.indexOf(item.topic) + 1) % choices.length] })}><${Icon} name="refresh-cw" size=${13} class="me-1 inline" />רעיון אחר</button>`}
          <div>
            <p class="mb-1 text-[13px] font-bold">איך זה ייראה</p>
            <div class="flex gap-1.5">
              ${FORMATS.map((f) => html`<button key=${f.id} type="button" aria-pressed=${item.format === f.id} onClick=${() => setItem(item.id, { format: f.id })} class=${cx('inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border-[1.5px] text-[13px] font-bold cursor-pointer', item.format === f.id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')}><${Icon} name=${f.icon} size=${14} />${f.label}</button>`)}
            </div>
          </div>
          ${t.type === 'offer' && html`<p class="text-[13px] text-muted"><${Icon} name="clock" size=${13} class="me-1 inline" />הצעה יוצאת בין 19:00 ל-20:00, כשרוב הקהל פנוי.</p>`}
        </section>`;
      })}
    </div>
    <p class="mt-4 flex items-start gap-2 text-[14px] text-muted"><${Icon} name="info" size=${16} class="mt-0.5 shrink-0" />${flags.noOffer ? 'עוד אין הצעה (שלב 8), אז השבוע כולו ערך. ההצעה תיכנס לתוכנית אחרי שתיבנה.' : 'קהל שמקבל ממך ערך מגיב יותר כשמגיעה הצעה. לכן בשבוע של 3 פריטים יש הצעה אחת לכל היותר.'}</p>
  </div>`;
}

// ---------- part 3: the content ----------

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
// "before → after": every change the shark suggests waits for a "כן".
function BeforeAfter({ pending, onYes, onNo }) {
  // Only the lines that change, when the rest stays the same.
  const a = pending.before.split(NL);
  const b = pending.after.split(NL);
  if (a.length === b.length) pending = { ...pending, before: a.filter((l, i) => l !== b[i]).join(NL), after: b.filter((l, i) => l !== a[i]).join(NL) };
  return html`<div class="rise mt-3 rounded-xl border-[1.5px] border-brand-300 bg-brand-50 p-3">
    <p class="mb-2 flex items-center gap-2 text-[14px] font-bold"><${SharkAvatar} size=${26} />${pending.label}: ככה זה ייראה</p>
    <div class="grid gap-2 md:grid-cols-2">
      <div class="rounded-lg bg-white p-2 text-[14px] leading-relaxed text-muted"><small class="mb-1 block font-bold">לפני</small><span class="whitespace-pre-line">${pending.before}</span></div>
      <div class="rounded-lg bg-white p-2 text-[14px] leading-relaxed ring-2 ring-brand-300"><small class="mb-1 block font-bold text-brand-600">אחרי</small><span class="whitespace-pre-line">${pending.after}</span></div>
    </div>
    <div class="mt-2 flex gap-2"><${Button} variant="mini" onClick=${onYes}>כן, להחליף<//><${Button} variant="quiet" onClick=${onNo}>לא, להשאיר<//></div>
  </div>`;
}

function PostEditor({ item, st, setIt, t, p, tpl, flags }) {
  const tp = topicOf(item);
  const versions = postVersions(tp, item);
  const [pending, setPending] = useState(null);
  const text = st.texts[st.version] ?? versions.find((v) => v.id === st.version).text;
  const setText = (v) => setIt({ texts: { ...st.texts, [st.version]: v } });
  return html`<div class="grid items-start gap-5 md:grid-cols-[1.2fr_0.8fr]">
    <div class="min-w-0">
      <${SubStep} n="1">בוחרים פתיח<//>
      <div class="mb-3 grid gap-2 sm:grid-cols-3" role="radiogroup">
        ${versions.map((v) => html`<button key=${v.id} type="button" role="radio" aria-checked=${st.version === v.id} onClick=${() => (setIt({ version: v.id }), setPending(null))} class=${cx('rounded-xl border-[1.5px] bg-white p-2.5 text-start cursor-pointer', st.version === v.id ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
          <b class="block text-[14px]">${v.label}</b>
          <span class="block text-[13px] leading-snug">"${v.hook}"</span>
          <small class="mt-1 block text-[12px] leading-snug text-muted">מה שונה כאן: ${v.diff}</small>
        </button>`)}
      </div>
      <${SubStep} n="2" class="mt-5">קוראים, ומתקנים אם צריך<//>
      <textarea rows="9" class=${cx(inputCls, '!h-auto py-2 leading-relaxed')} value=${text} onInput=${(e) => setText(e.target.value)} aria-label="הטקסט של הפוסט"></textarea>
      <${Checks} text=${text} />
      <div class="mt-2 flex flex-wrap items-center gap-1.5">
        <span class="text-[13px] font-bold">לבקש מ${WORDS}:</span>
        ${CHANGES.map((c) => html`<button key=${c.id} type="button" class="h-8 rounded-lg border-[1.5px] border-line bg-white px-2 text-[13px] font-bold hover:border-brand-300 cursor-pointer" onClick=${() => setPending({ ...c, before: text, after: applyChange(c.id, text, tp) })}>${c.label}</button>`)}
      </div>
      ${pending && html`<${BeforeAfter} pending=${pending} onYes=${() => (setText(pending.after), setPending(null))} onNo=${() => setPending(null)} />`}
    </div>
    <div>
      <p class="mb-2 text-[14px] font-bold">התמונה של הפוסט</p>
      <${Canvas}><${Slide} s=${{ kind: 'quote', title: postQuote(tp) }} t=${tpl} p=${p} noLogo=${flags.noLogo} /><//>
      <p class="mt-1 flex items-center justify-between text-[13px] text-muted"><span>ציטוט אחד מהפוסט</span><${Counter} text=${postQuote(tp)} limit=${LIMITS.quote} /></p>
    </div>
  </div>`;
}

function CarouselEditor({ item, st, setIt, p, tpl, flags }) {
  const [sel, setSel] = useState(0);
  const slides = st.slides;
  const s = slides[sel];
  const setField = (k, v) => setIt({ slides: slides.map((x, i) => (i === sel ? { ...x, [k]: v } : x)) });
  const shorten = (k, limit) => setField(k, s[k].split(/\s+/).slice(0, limit).join(' ').replace(/[,،]$/, ''));
  const over = slides.some((x) => slideFields(x).some(([k, , lim]) => words(x[k]) > lim) || (x.points || []).some((pt) => words(pt) > LIMITS.sumPoint));
  return html`<div>
    <${SubStep} n="1" aside=${over ? html`<${Tag} tone="fix">יש שדה מעל המגבלה<//>` : html`<${Tag} tone="live">כל השדות בתוך המגבלה<//>`}>עוברים על ${slides.length} השקופיות<//>
    <div class="thin-scroll -mx-1 mb-3 flex gap-3 overflow-x-auto px-1 pb-2">
      ${slides.map((x, i) => html`<button key=${i} type="button" onClick=${() => setSel(i)} aria-pressed=${sel === i} class=${cx('w-[150px] shrink-0 rounded-xl p-1 cursor-pointer md:w-[170px]', sel === i ? 'ring-[3px] ring-brand-600' : 'ring-1 ring-line hover:ring-brand-300')}>
        <${Canvas} round=${7}><${Slide} s=${x} t=${tpl} p=${p} i=${i} total=${slides.length} noLogo=${flags.noLogo} /><//>
      </button>`)}
    </div>
    <${SubStep} n="2" class="mt-2">מתקנים את השקופית שנבחרה, אם צריך<//>
    <section class="rounded-xl bg-canvas p-3">
      <p class="mb-2 text-[14px] font-bold">שקופית ${sel + 1}: ${{ cover: 'שער', content: 'רעיון אחד', summary: 'סיכום', cta: 'הנעה לפעולה' }[s.kind]}</p>
      ${slideFields(s).map(([k, label, lim]) => {
        const n = words(s[k]);
        return html`<div key=${k} class="mb-2">
          <div class="mb-1 flex items-center justify-between"><span class="text-[13px] font-bold">${label}</span><${Counter} text=${s[k]} limit=${lim} /></div>
          <textarea rows=${k === 'body' ? 3 : 2} class=${cx(inputCls, '!h-auto py-1.5 leading-snug', n > lim && '!border-error')} value=${s[k]} onInput=${(e) => setField(k, e.target.value)}></textarea>
          ${n > lim && html`<p class="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-error">מעל ${lim} מילים, הטקסט לא ייכנס יפה לשקופית.<button type="button" class="font-bold underline underline-offset-2 cursor-pointer" onClick=${() => shorten(k, lim)}>${WORDS} יקצר</button></p>`}
          <${Checks} text=${s[k]} />
        </div>`;
      })}
      ${s.kind === 'summary' && html`<ul class="flex flex-col gap-1 text-[14px]">${s.points.map((pt) => html`<li class="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1"><span>${pt}</span><${Counter} text=${pt} limit=${LIMITS.sumPoint} /></li>`)}</ul>`}
    </section>
  </div>`;
}

// The reel: 3 hooks, the script, and, if the user has a video, the processing.
function ReelEditor({ item, st, setIt, p, tpl, flags, notify, cfg }) {
  const tp = topicOf(item);
  const script = reelScript(tp);
  const photo = photoOf(cfg, flags) || USER.photo;
  const [stage, setStage] = useState(st.video === 'processing' ? 0 : -1);
  const [playing, setPlaying] = useState(false);
  const [cap, setCap] = useState(0);
  const timer = useRef();
  const hook = st.hook === 'none' ? null : tp.hooks[st.hook];
  const caps = st.caps || [];
  useEffect(() => () => clearTimeout(timer.current), []);
  // The processing runs stage by stage. At the name check it stops and asks.
  useEffect(() => {
    if (st.video !== 'processing' || stage < 0) return;
    if (stage === 2 && !st.names) return; // waits for the user's answer
    if (stage >= REEL_STAGES.length) {
      const lines = captionLines(TRANSCRIPT.filter((x, i) => !(st.names === 'cut' && i === 2)).map((x) => (st.names === 'name' ? x.replace('לנועה ', '') : x)));
      setIt({ video: 'ready', caps: lines });
      return;
    }
    timer.current = setTimeout(() => setStage((n) => n + 1), 700);
  }, [stage, st.video, st.names]);
  useEffect(() => {
    if (!playing || !caps.length) return;
    const id = setInterval(() => setCap((c) => (c + 1) % caps.length), 650);
    return () => clearInterval(id);
  }, [playing, caps.length]);
  const total = caps.length ? caps[caps.length - 1].to : 0;
  return html`<div class="grid items-start gap-5 md:grid-cols-[1.3fr_0.7fr]">
    <div class="min-w-0">
      <${SubStep} n="1" aside=${html`<small class="text-[13px] text-muted">מופיע למעלה לאורך כל הרילס</small>`}>בוחרים הוק<//>
      <div class="mb-4 grid gap-2 sm:grid-cols-2" role="radiogroup">
        ${tp.hooks.map((h, i) => html`<button key=${i} type="button" role="radio" aria-checked=${st.hook === i} onClick=${() => setIt({ hook: i })} class=${cx('flex flex-col gap-1 rounded-xl border-[1.5px] bg-white p-2.5 text-start cursor-pointer', st.hook === i ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
          <span class="text-[14px] font-bold leading-snug">${h}</span>
          <span class="flex gap-2"><${Counter} text=${h} limit=${LIMITS.hookWords} /><${Counter} n=${h.length} limit=${LIMITS.hookChars} unit="תווים" /></span>
        </button>`)}
        <button type="button" role="radio" aria-checked=${st.hook === 'none'} onClick=${() => setIt({ hook: 'none' })} class=${cx('rounded-xl border-[1.5px] bg-white p-2.5 text-start text-[14px] font-bold cursor-pointer', st.hook === 'none' ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>בלי הוק</button>
      </div>
      ${st.video !== 'ready' &&
      html`<${SubStep} n="2" aside=${html`<small class="text-[13px] text-muted">30 עד 45 שניות</small>`}>מצלמים לפי התסריט, עכשיו או אחר כך<//>
        <div class="mb-4 overflow-hidden rounded-xl ring-1 ring-line">
          <table class="w-full text-[14px]">
            <thead class="bg-canvas text-[12px] text-muted"><tr><th class="w-[58px] px-2 py-1.5 text-start">שניות</th><th class="px-2 py-1.5 text-start">מה אומרים</th><th class="px-2 py-1.5 text-start max-sm:hidden">על המסך</th></tr></thead>
            <tbody>${script.map((r) => html`<tr class="border-t border-line bg-white align-top"><td class="px-2 py-1.5 tabular-nums text-muted">${r.at}</td><td class="px-2 py-1.5">${r.say}</td><td class="px-2 py-1.5 font-bold max-sm:hidden">${r.screen}</td></tr>`)}</tbody>
          </table>
        </div>`}
      ${!st.video &&
      html`<div class="flex flex-wrap gap-2">
        <${Button} variant="secondary" onClick=${() => (setIt({ video: 'processing', names: null }), setStage(0))}><${Icon} name="upload" size=${16} />יש לי סרטון<//>
        <${Button} variant="quiet" onClick=${() => (setIt({ video: 'later' }), notify('התסריט נשמר. ביומן תהיה תזכורת לצלם', 'calendar-plus'))}>${g('אצלם אחר כך', 'אצלם אחר כך')}<//>
      </div>`}
      ${st.video === 'later' && html`<p class="flex flex-wrap items-center gap-2 rounded-xl bg-warn-50 p-3 text-[14px] text-warn"><${Icon} name="video-off" size=${16} />עוד אין סרטון. הרילס ייכנס ליומן כתזכורת לצלם, ויתוזמן אחרי ההעלאה.<button type="button" class="font-bold underline underline-offset-2 cursor-pointer" onClick=${() => (setIt({ video: 'processing', names: null }), setStage(0))}>להעלות עכשיו</button></p>`}
      ${st.video === 'processing' &&
      html`<div class="fb-stages rounded-xl bg-white p-4 ring-1 ring-line">
        ${REEL_STAGES.map((r, i) => html`<div key=${r.id} class=${cx('fb-stage', i < stage && 'is-done', i === stage && 'is-now', i > stage && 'is-next')}>
          <span class="fb-dot">${i < stage && html`<${PencilCheck} size=${16} color="#2d3e66" />`}</span>
          <span class="min-w-0"><span class="block">${r.label}</span><small class="block text-[12px] font-normal text-muted">${r.sub}</small></span>
        </div>`)}
        ${stage === 2 && !st.names && html`<div class="rise rounded-xl bg-warn-50 p-3 text-[14px]">
          <p class="mb-1 font-bold text-warn"><${Icon} name="user-x" size=${15} class="me-1 inline" />השם נועה מופיע בטבלת הלידים</p>
          <p class="mb-2">"${TRANSCRIPT[2]}" · בתוכן לא מזכירים לקוח מסוים.</p>
          <div class="flex flex-wrap gap-2"><${Button} variant="mini" onClick=${() => setIt({ names: 'cut' })}>לחתוך את המשפט<//><${Button} variant="quiet" onClick=${() => setIt({ names: 'name' })}>להשמיט רק את השם<//></div>
        </div>`}
      </div>`}
      ${st.video === 'ready' &&
      html`<div class="rise">
        <p class="mb-2 flex flex-wrap items-center justify-between gap-2 text-[14px] font-bold"><span>הכתוביות · ${caps.length} שורות</span><span class="text-[13px] font-normal text-muted">0:41 ← ${fmtSec(total)} · ${st.names === 'cut' ? 'משפט אחד נחתך, ' : ''}6 שתיקות קוצרו</span></p>
        <ul class="thin-scroll max-h-[260px] overflow-y-auto rounded-xl bg-white ring-1 ring-line">
          ${caps.map((c, i) => html`<li key=${c.id} class=${cx('flex items-center gap-2 border-b border-line px-2 py-1 last:border-0', playing && cap === i && 'bg-brand-50')}>
            <button type="button" aria-label="להשמיע את השורה" class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-brand-600 hover:bg-brand-100 cursor-pointer" onClick=${() => (setCap(i), setPlaying(false))}><${Icon} name="play" size=${14} /></button>
            <span class="w-[38px] shrink-0 text-[12px] tabular-nums text-muted">${fmtSec(c.from)}</span>
            <input class="h-8 min-w-0 flex-1 rounded-lg border border-transparent px-1.5 text-[15px] hover:border-line focus:border-brand-600 focus:outline-none" value=${c.text} onInput=${(e) => setIt({ caps: caps.map((x) => (x.id === c.id ? { ...x, text: e.target.value } : x)) })} />
            <${Counter} n=${c.text.length} limit=${LIMITS.capChars} unit="" />
          </li>`)}
        </ul>
        <button type="button" class="mt-2 text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => (setIt({ video: null, caps: null, names: null }), setPlaying(false))}>להחליף סרטון</button>
      </div>`}
    </div>
    <div class="mx-auto w-full max-w-[260px]">
      <p class="mb-2 text-[14px] font-bold">${st.video === 'ready' ? 'הרילס, 1080×1920' : 'ככה ייראה הרילס'}</p>
      <button type="button" class="block w-full cursor-pointer" onClick=${() => st.video === 'ready' && setPlaying((x) => !x)} aria-label=${playing ? 'עצירה' : 'ניגון'}>
        <${Canvas} w=${1080} h=${1920} round=${14}><${ReelFrame} t=${tpl} p=${p} hook=${hook} caption=${st.video === 'ready' ? caps[cap]?.text : script[1].screen.split(' ').slice(0, 3).join(' ')} photo=${photo} playing=${playing || st.video !== 'ready'} /><//>
      </button>
      ${st.video === 'ready' && html`<p class="mt-1 text-center text-[13px] text-muted">${playing ? 'לעצירה, לחיצה על הסרטון' : 'לניגון, לחיצה על הסרטון'}</p>`}
    </div>
  </div>`;
}

const ITEM_HOW = {
  post: 'בוחרים פתיח, קוראים, ומאשרים בכפתור למטה.',
  carousel: 'עוברים על השקופיות, מתקנים אם צריך, ומאשרים בכפתור למטה.',
  reel: 'בוחרים הוק, מצלמים לפי התסריט (עכשיו או אחר כך), ומאשרים בכפתור למטה.',
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
    return html`<div class="mx-auto max-w-[620px] px-4 py-5 md:px-8 md:py-6">
      <${StepHeading} n="4" eyebrow=${partLabel(3)} title=${['כותבים את ', 'התוכן של השבוע', '']} sub=${`${WORDS} כותב את שלושת הפריטים בקול שלך, ו${DESIGN} מעצב. כמה שניות, ואז עוברים עליהם אחד אחד.`} />
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
  const d = dayOf(item.day);
  const setIt = (patch) => setCfg({ items: { ...cfg.items, [item.id]: { ...st, ...(cfg.items[item.id] || {}), ...patch } } });
  const props = { item, st, setIt, p, tpl, flags, notify, cfg };
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="4" eyebrow=${partLabel(3)} title=${[`פריט ${n + 1} מתוך ${cfg.plan.length}: `, fmt.label, '']} sub=${ITEM_HOW[item.format]} />
    <section key=${item.id} class="fb-panel !p-4 md:!p-5">
      <div class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line pb-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name=${fmt.icon} size=${20} /></span>
        <span class="min-w-0 flex-1">
          <b class="block font-display text-[19px] leading-snug">${topicOf(item).title}</b>
          <small class="block text-[13px] text-muted">${d.label} ${d.date} בשעה ${item.time} · ${typeOf(topicOf(item).type).label}</small>
        </span>
        ${st.approved && html`<${Tag} tone="live"><${Icon} name="check" size=${12} />אושר<//>`}
      </div>
      ${item.format === 'post' && html`<${PostEditor} ...${props} />`}
      ${item.format === 'carousel' && html`<${CarouselEditor} ...${props} />`}
      ${item.format === 'reel' && html`<${ReelEditor} ...${props} />`}
      <p class="mt-5 flex items-start gap-1.5 border-t border-line pt-3 text-[13px] text-muted"><${Icon} name="shield-check" size=${15} class="mt-0.5 shrink-0" />האישור הוא על התוכן בלבד. שום דבר לא יוצא לפני חלק 6, תזמון.</p>
    </section>
  </div>`;
}

// ---------- part 4: the flyer ----------

export function flyerOffer(cfg, flags) {
  const e = cfg.flyer.edits || {};
  const base = flags.noOffer ? { ...OFFER, title: MESSAGE_LINES[0].text, sub: 'טיפול CBT לחרדה, למבוגרים ולנוער', price: '' } : OFFER;
  return { ...base, ...e };
}

export function FlyerScreen({ cfg, setCfg, flags, notify }) {
  const tpl = tplOf(cfg);
  const f = cfg.flyer;
  const p = palOf(cfg, flags, f.swatch);
  const photo = photoOf(cfg, flags) || USER.photo;
  const offer = flyerOffer(cfg, flags);
  const setF = (patch) => setCfg({ flyer: { ...f, ...patch, saved: patch.saved ?? false } });
  const edit = (k, v) => setF({ edits: { ...f.edits, [k]: v } });
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="5" eyebrow=${partLabel(4)} title=${['פלייר אחד, עם ', 'התמונה שלך', '']} sub="בוחרים עיצוב, בודקים מה כתוב, ושומרים בכפתור למטה. הפלייר מחכה לך בשלב 11, פנייה חמה." />
    <div class="grid items-start gap-6 md:grid-cols-[1fr_380px]">
      <div class="flex min-w-0 flex-col gap-4">
        <section class="fb-panel !p-4 md:!p-5">
          <${SubStep} n="1" aside=${html`<small class="text-[13px] text-muted">אותה תמונה, 3 עיצובים</small>`}>בוחרים עיצוב<//>
          <div class="grid grid-cols-3 gap-3" role="radiogroup">
            ${LAYOUTS.map((l) => html`<button key=${l.id} type="button" role="radio" aria-checked=${f.layout === l.id} onClick=${() => setF({ layout: l.id })} class=${cx('flex flex-col gap-1.5 rounded-xl p-1.5 text-center cursor-pointer', f.layout === l.id ? 'ring-[3px] ring-brand-600' : 'ring-1 ring-line hover:ring-brand-300')}>
              <${Canvas} round=${6}><${Flyer} t=${tpl} p=${p} layout=${l.id} photo=${photo} noLogo=${flags.noLogo} offer=${offer} price=${f.price && !!offer.price} qr=${f.qr} /><//>
              <span class="text-[13px] font-bold">${l.label}</span>
            </button>`)}
          </div>
          <p class="mb-1 mt-4 text-[14px] font-bold">צבע ההדגשה</p>
          <div class="flex gap-2">${BRAND.swatches.map((c, i) => html`<button key=${c} type="button" aria-label=${`צבע ${i + 1}`} aria-pressed=${(f.swatch || 0) === i} onClick=${() => setF({ swatch: i })} class=${cx('h-9 w-9 rounded-full cursor-pointer', (f.swatch || 0) === i ? 'ring-[3px] ring-brand-600 ring-offset-2' : 'ring-1 ring-line')} style=${{ background: c }}></button>`)}</div>
        </section>
        <section class="fb-panel !p-4 md:!p-5">
          <${SubStep} n="2" aside=${html`<${From}>${flags.noOffer ? 'מילאנו לפי "דף המסרים"' : 'מילאנו לפי "בניית הצעה מנצחת"'}<//>`}>בודקים מה כתוב<//>
          <${Field} label="כותרת"><input class=${inputCls} value=${offer.title} onInput=${(e) => edit('title', e.target.value)} /><//>
          <${Field} label="שורה מתחת"><input class=${inputCls} value=${offer.sub} onInput=${(e) => edit('sub', e.target.value)} /><//>
          <${Field} label="הכפתור"><input class=${inputCls} value=${offer.cta} onInput=${(e) => edit('cta', e.target.value)} /><//>
          <${Checks} text=${`${offer.title} ${offer.sub} ${offer.cta}`} />
          ${offer.price && html`<label class="mt-1 flex cursor-pointer items-center justify-between gap-3 border-t border-line py-2.5 text-[15px]"><span><b>להציג מחיר</b><small class="block text-[13px] text-muted">${offer.price}, ${offer.terms}. מההצעה, בלי שינוי</small></span><${Toggle} on=${f.price} onChange=${(v) => setF({ price: v })} label="להציג מחיר" /></label>`}
          <label class="flex cursor-pointer items-center justify-between gap-3 border-t border-line py-2.5 text-[15px]"><span><b>קוד QR לדף</b><small class="block text-[13px] text-muted">סורקים ומגיעים לדף שלך, <span dir="ltr">${PAGE_LINK}</span></small></span><${Toggle} on=${f.qr} onChange=${(v) => setF({ qr: v })} label="קוד QR" /></label>
        </section>
      </div>
      <aside class="md:sticky md:top-4">
        <${Canvas} round=${12}><${Flyer} t=${tpl} p=${p} layout=${f.layout} photo=${photo} noLogo=${flags.noLogo} offer=${offer} price=${f.price && !!offer.price} qr=${f.qr} /><//>
        <div class="mt-3 flex flex-wrap gap-2">
          <${Button} variant="mini" onClick=${() => notify('הורד: flyer-merchav-shaket.png, 1080×1350', 'download')}><${Icon} name="image-down" size=${15} />תמונה<//>
          <${Button} variant="mini" onClick=${() => notify('הורד: flyer-merchav-shaket.pdf, A4 להדפסה', 'download')}><${Icon} name="printer" size=${15} />PDF להדפסה<//>
        </div>
        ${f.saved
          ? html`<p class="rise mt-3 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-[14px] font-bold text-brand-600"><${PencilCheck} size=${20} color="#0038b8" />נשמר בקבצים. מחכה לך בשלב 11</p>`
          : html`<p class="mt-3 flex items-center gap-2 text-[13px] text-muted"><${Icon} name="save" size=${15} />נשמר בקבצים כש${g('תמשיך', 'תמשיכי')} לתזמון</p>`}
      </aside>
    </div>
  </div>`;
}

// ---------- the finish ----------

export function Done({ cfg, flags, notify, onGrow }) {
  useEffect(() => {
    const t = setTimeout(() => confetti('step'), 200);
    return () => clearTimeout(t);
  }, []);
  const [line, setLine] = useState(0);
  const [bio, setBio] = useState(0);
  const scheduled = cfg.plan.filter((i) => cfg.sched[i.id]?.status === 'scheduled').length;
  const manual = cfg.plan.filter((i) => ['manual', 'posted'].includes(cfg.sched[i.id]?.status)).length;
  const rows = [
    ['calendar-check', 'ביומן', `${cfg.plan.length} פריטים${scheduled ? ` · ${scheduled} מתוזמנים` : ''}${manual ? ` · ${manual} לפרסום ידני` : ''}`],
    ['image', 'הפלייר', 'בקבצים, מחכה לשלב 11'],
    ['palette', 'המראה', `תבנית ${tplOf(cfg).n}: ${tplOf(cfg).name}`],
    ['link', 'הקישור', 'כל פוסט מסומן במקור שלו בטבלת הלידים'],
  ];
  return html`<div class="mx-auto grid max-w-[1040px] items-start gap-8 px-4 py-6 md:grid-cols-[1.25fr_0.75fr] md:px-8 md:py-10">
    <div class="min-w-0">
      <p class="fb-eyebrow mb-1">סיימת את שלב 10 · מביאים לקוחות</p>
      <h1 class="fb-h1 mb-4 text-[28px] md:text-[36px]">שבוע התוכן של ${USER.business} <span class="marker">מוכן</span></h1>
      <section class="fb-panel mb-4 !p-4 md:!p-5">
        <ul class="flex flex-col divide-y divide-line">
          ${rows.map(([icon, k, v]) => html`<li key=${k} class="flex items-center gap-3 py-2"><span class="text-brand-600"><${Icon} name=${icon} size=${18} /></span><span class="w-[70px] shrink-0 text-[14px] font-bold">${k}</span><span class="min-w-0 text-[15px]">${v}</span></li>`)}
        </ul>
        <${Button} variant="mini" class="mt-2" onClick=${() => notify('הורד: שבוע-התוכן-מרחב-שקט.pdf', 'download')}><${Icon} name="file-down" size=${15} />שבוע התוכן שלך, PDF<//>
      </section>
      <section class="fb-panel mb-4 !p-4 md:!p-5">
        <h2 class="fb-h3 mb-1">משפט המסר שלך</h2>
        <p class="mb-2 text-[14px] text-muted">לראש העמוד, לחתימה ולפתיח של כל שיחה. 3 גרסאות:</p>
        <${Chips} small options=${MESSAGE_LINES.map((m, i) => ({ id: i, label: m.label }))} value=${line} onChange=${setLine} />
        <p class="mt-2 flex items-start justify-between gap-2 rounded-xl bg-canvas p-3 text-[16px] font-bold"><span>${MESSAGE_LINES[line].text}</span><${Button} variant="quiet" class="!h-8 shrink-0" onClick=${() => notify('הועתק', 'copy')}><${Icon} name="copy" size=${15} /><//></p>
        <h2 class="fb-h3 mb-1 mt-4">ביו לאינסטגרם, 3 שורות</h2>
        <p class="mb-2 text-[14px] text-muted">אינסטגרם לא מאפשר לשנות ביו ממערכת חיצונית, אז מעתיקים ומדביקים.</p>
        <${Chips} small options=${BIOS.map((b, i) => ({ id: i, label: `גרסה ${i + 1}` }))} value=${bio} onChange=${setBio} />
        <div class="mt-2 flex items-start justify-between gap-2 rounded-xl bg-canvas p-3 text-[15px] leading-relaxed"><span>${BIOS[bio].map((l) => html`<span class="block">${l}</span>`)}</span><${Button} variant="quiet" class="!h-8 shrink-0" onClick=${() => notify('הביו הועתק', 'copy')}><${Icon} name="copy" size=${15} /><//></div>
      </section>
      <section class="fb-panel flex flex-wrap items-center gap-3 !p-4">
        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name="trending-up" size=${22} /></span>
        <span class="min-w-0 flex-1"><b class="block text-[16px]">יותר עוקבים שמתאימים לך, עם Grow</b><small class="block text-[13px] text-muted">${flags.growSub ? 'כלול במנוי שלך. פעם אחת מגדירים, ו-Grow עובד ברקע' : 'תוספת למנוי: צמיחת קהל באינסטגרם'}</small></span>
        <${Button} variant="secondary" onClick=${onGrow}>${flags.growSub ? 'להפעיל' : 'לפרטים'}<//>
      </section>
    </div>
    <div class="flex justify-center pt-8">
      <${Note} tone="gold" tilt=${-2} class="fb-badge-note !pt-10">
        <span class="fb-note-kicker">תג חדש</span>
        <b class="font-display text-[26px]">המכפיל</b>
        <span class="text-[14px]">חסכת בשלב הזה</span>
        <span class="relative font-display text-[36px] font-black text-money">${money(1200)}<${PencilLine} color="#12805c" class="absolute inset-x-0 -bottom-1 h-2 w-full" /></span>
      <//>
    </div>
  </div>`;
}
