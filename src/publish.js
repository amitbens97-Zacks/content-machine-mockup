// The last part of step 10: the week plan, item by item, a preview per platform, and publishing.
// Instagram has no scheduling of its own, so FlowBiz keeps the queue and publishes at
// the time; Facebook gets the time with the post (Pages only). Nothing goes out without
// an explicit "לתזמן" from the user. Facebook groups and LinkedIn are copy-and-remind.
// Also here: the Meta connection sheet (part 1) and the follower-growth sheet (the finish).
import { html, useState, Icon, cx, money } from './lib.js';
import { Button, StepHeading, SharkAvatar } from './components.js';
import { Sheet, Field, inputCls, Tag } from './ui.js';
import { USER, META, BRAND, postLink, partLabel, partNo, weekDays, g } from './data.js';
import { Canvas, Slide, ReelFrame, PostImage } from './art.js';
import { topicOf, postQuote, reelCaption, carouselCaption } from './content.js';
import { tplOf, palOf, photoOf, itemState, postImg, carouselArt, captionOf, fmtOf, typeOf, dayOf } from './step.js';

// ---------- the Meta connection ----------
export function MetaSheet({ flags, onClose, onDone }) {
  const [step, setStep] = useState('ask');
  const [fixed, setFixed] = useState(false);
  const personal = flags.personalIg && !fixed;
  const perms = [
    ['send', 'לפרסם ולתזמן פוסטים בעמוד העסקי בפייסבוק'],
    ['instagram', 'לפרסם בחשבון המקצועי באינסטגרם'],
    ['bar-chart-3', 'לראות תגובות ונתונים על הפוסטים שפורסמו מכאן'],
  ];
  return html`<${Sheet} title="חיבור לאינסטגרם ולפייסבוק" onClose=${onClose}
    footer=${step === 'ask'
      ? html`<${Button} variant="quiet" onClick=${onClose}>ביטול<//><${Button} onClick=${() => setStep('pick')}>להמשיך ל-Meta<//>`
      : html`<${Button} variant="quiet" onClick=${() => setStep('ask')}>חזרה<//><${Button} disabled=${personal} onClick=${onDone}>לחבר<//>`}>
    ${step === 'ask'
      ? html`<p class="mb-3 text-[15px]">נפתח חלון של Meta. ${g('מתחברים', 'מתחברות')} שם, ו-FlowBiz מקבלת רק את ההרשאות האלה:</p>
          <ul class="mb-3 flex flex-col gap-2">${perms.map(([i, t]) => html`<li class="flex items-center gap-2.5 rounded-xl bg-white p-2.5 text-[15px] ring-1 ring-line"><${Icon} name=${i} size=${18} class="text-brand-600" />${t}</li>`)}</ul>
          <p class="flex items-start gap-2 text-[13px] text-muted"><${Icon} name="lock" size=${15} class="mt-0.5 shrink-0" />את הסיסמה לפייסבוק מקלידים רק אצל Meta. FlowBiz לא רואה אותה ולא שומרת אותה, ואפשר לבטל את ההרשאה בכל רגע.</p>`
      : html`<p class="mb-1 text-[14px] font-bold">העמוד בפייסבוק</p>
          ${flags.noPage
            ? html`<p class="mb-3 rounded-xl bg-warn-50 p-3 text-[14px] text-warn">אין לך עמוד עסקי בפייסבוק. Meta מאפשרת לפרסם ממערכת חיצונית רק לעמוד, לא לפרופיל אישי. אפשר לפתוח עמוד בחינם, או להמשיך רק עם אינסטגרם ולקבל את הפוסטים לפייסבוק להעתקה.</p>`
            : html`<label class="mb-3 flex items-center gap-2.5 rounded-xl border-[1.5px] border-brand-600 bg-brand-50 p-2.5 text-[15px]"><input type="radio" checked class="h-4 w-4 accent-brand-600" /><${Icon} name="facebook" size=${18} class="text-brand-600" /><b>${META.fb.page}</b><span class="text-[13px] text-muted">${META.fb.likes} עוקבים</span></label>`}
          <p class="mb-1 text-[14px] font-bold">החשבון באינסטגרם</p>
          ${personal
            ? html`<div class="rounded-xl bg-warn-50 p-3 text-[14px] text-warn">
                <p class="mb-2"><b dir="ltr">@${META.ig.handle}</b> הוא חשבון אישי. כדי לפרסם ישירות צריך חשבון מקצועי. המעבר בחינם ולוקח דקה: באפליקציה, הגדרות ← סוג חשבון וכלים ← מעבר לחשבון מקצועי.</p>
                <${Button} variant="mini" onClick=${() => setFixed(true)}>${g('עברתי, לבדוק שוב', 'עברתי, לבדוק שוב')}<//>
              </div>`
            : html`<label class="flex items-center gap-2.5 rounded-xl border-[1.5px] border-brand-600 bg-brand-50 p-2.5 text-[15px]"><input type="radio" checked class="h-4 w-4 accent-brand-600" /><${Icon} name="instagram" size=${18} class="text-brand-600" /><b dir="ltr">@${META.ig.handle}</b><${Tag} tone="live">${META.ig.kind}<//></label>`}`}
  <//>`;
}

// ---------- where each item goes ----------
export function targetsOf(cfg, flags) {
  const t = [];
  if (cfg.channels.includes('ig')) t.push({ id: 'ig', label: 'אינסטגרם', icon: 'instagram', direct: cfg.connect === 'meta' && !flags.personalIg });
  if (cfg.channels.includes('fb')) t.push({ id: 'fb', label: 'עמוד בפייסבוק', icon: 'facebook', direct: cfg.connect === 'meta' && !flags.noPage });
  if (cfg.channels.includes('fb') && cfg.fbGroups) t.push({ id: 'groups', label: 'קבוצות בפייסבוק', icon: 'users', direct: false });
  if (cfg.channels.includes('li')) t.push({ id: 'li', label: 'לינקדאין', icon: 'linkedin', direct: false });
  return t;
}
// An item is ready to go out when it is approved, and a reel also needs its video.
export const needsVideo = (cfg, item) => item.format === 'reel' && itemState(cfg, item).video !== 'ready';

const STATUS = {
  scheduled: (i) => html`<${Tag} tone="live"><${Icon} name="clock" size=${12} />מתוזמן · ${dayOf(i.day).label} ${i.time}<//>`,
  manual: () => html`<${Tag} tone="draft"><${Icon} name="bell" size=${12} />תזכורת ביומן<//>`,
  posted: () => html`<${Tag} tone="live"><${Icon} name="check" size=${12} />פורסם<//>`,
  failed: () => html`<${Tag} tone="fix"><${Icon} name="triangle-alert" size=${12} />התזמון נכשל<//>`,
};
export const statusTag = (cfg, i) => (cfg.sched[i.id] ? STATUS[cfg.sched[i.id].status](i) : html`<${Tag}>עוד לא בלוח<//>`);

// What the post looks like on the platform.
function PlatformPreview({ cfg, flags, item, target }) {
  const t = topicOf(item);
  const tpl = tplOf(cfg);
  const p = palOf(cfg, flags);
  const st = itemState(cfg, item);
  const caption = item.format === 'post' ? captionOf(cfg, item) : item.format === 'carousel' ? carouselCaption(t) : reelCaption(t);
  const art = item.format === 'reel'
    ? html`<${Canvas} w=${1080} h=${1920} round=${0}><${ReelFrame} t=${tpl} p=${p} hook=${st.hook === 'none' ? null : t.hooks[st.hook]} caption=${st.caps?.[0]?.text} photo=${photoOf(cfg, flags) || USER.photo} /><//>`
    : item.format === 'post'
      ? html`<${Canvas} round=${0}><${PostImage} t=${tpl} p=${p} photo=${photoOf(cfg, flags) || USER.photo} ...${postImg(st, t)} noLogo=${flags.noLogo} /><//>`
      : html`<${Canvas} round=${0}><${Slide} s=${st.slides[0]} ...${carouselArt(st, cfg, flags)} total=${st.slides.length} noLogo=${flags.noLogo} /><//>`;
  const name = target === 'ig' ? META.ig.handle : META.fb.page;
  return html`<div class="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl bg-white ring-1 ring-line">
    <div class="flex items-center gap-2 px-3 py-2">
      <img src=${BRAND.logo} alt="" class="h-7 w-7 rounded-full ring-1 ring-line" />
      <b class="min-w-0 truncate text-[13px]" dir=${target === 'ig' ? 'ltr' : 'rtl'}>${name}</b>
      <span class="ms-auto text-muted"><${Icon} name="ellipsis" size=${16} /></span>
    </div>
    ${target !== 'ig' && html`<p class="line-clamp-3 whitespace-pre-line px-3 pb-2 text-[13px] leading-snug">${caption}</p>`}
    ${art}
    ${item.format === 'carousel' && html`<div class="flex justify-center gap-1 py-1.5">${st.slides.map((_, i) => html`<i class=${cx('h-1.5 w-1.5 rounded-full', i ? 'bg-line' : 'bg-brand-600')}></i>`)}</div>`}
    ${target === 'ig' && html`<p class="line-clamp-3 whitespace-pre-line px-3 py-2 text-[13px] leading-snug"><b dir="ltr">${META.ig.handle}</b> ${caption}</p>`}
  </div>`;
}

function ItemSheet({ cfg, setCfg, flags, item, notify, onClose }) {
  const targets = targetsOf(cfg, flags);
  const [view, setView] = useState(targets[0]?.id || 'ig');
  const [to, setTo] = useState(targets.filter((x) => x.direct).map((x) => x.id));
  const s = cfg.sched[item.id];
  const st = itemState(cfg, item);
  const direct = targets.filter((x) => x.direct);
  const noVideo = needsVideo(cfg, item);
  const setPlan = (p) => setCfg({ plan: cfg.plan.map((i) => (i.id === item.id ? { ...i, ...p } : i)) });
  const setS = (v) => setCfg({ sched: { ...cfg.sched, [item.id]: v } });
  const schedule = () => {
    if (flags.failPublish && !s?.retried) {
      setS({ status: 'failed', to, retried: false });
      notify('אינסטגרם לא קיבל את הפריט. ננסה שוב בעוד 5 דקות', 'triangle-alert');
      return onClose();
    }
    setS({ status: 'scheduled', to });
    notify(`מתוזמן ל${dayOf(item.day).label} ב-${item.time}. נכנס גם ליומן`, 'calendar-check');
    onClose();
  };
  const remind = () => {
    setS({ status: 'manual', to: [] });
    notify(`תזכורת ביומן: ${dayOf(item.day).label} ב-${item.time}`, 'bell');
    onClose();
  };
  const footer = s?.status === 'scheduled'
    ? html`<${Button} variant="quiet" onClick=${() => (setS(undefined), notify('התזמון בוטל', 'x'), onClose())}>לבטל תזמון<//><${Button} onClick=${onClose}>סגירה<//>`
    : html`<${Button} variant="quiet" onClick=${remind}><${Icon} name="bell" size=${15} />${direct.length ? 'אפרסם בעצמי' : 'תזכורת ביומן'}<//>
      ${direct.length ? html`<${Button} disabled=${!to.length || noVideo || !st.approved} onClick=${schedule}><${Icon} name="calendar-check" size=${17} />לתזמן<//>` : html`<${Button} onClick=${() => (setS({ status: 'posted', to: [] }), notify('סומן כפורסם', 'check'), onClose())}>פרסמתי<//>`}`;
  return html`<${Sheet} wide title=${`${dayOf(item.day).label} · ${fmtOf(item.format).label}: ${topicOf(item).title}`} onClose=${onClose} footer=${footer}>
    <div class="grid gap-5 md:grid-cols-[300px_1fr]">
      <div>
        ${targets.length > 1 && html`<div class="mb-2 flex flex-wrap gap-1.5">${targets.filter((x) => x.id === 'ig' || x.id === 'fb').map((x) => html`<button key=${x.id} type="button" aria-pressed=${view === x.id} onClick=${() => setView(x.id)} class=${cx('inline-flex h-8 items-center gap-1 rounded-lg border-[1.5px] px-2 text-[13px] font-bold cursor-pointer', view === x.id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white')}><${Icon} name=${x.icon} size=${14} />${x.label}</button>`)}</div>`}
        <${PlatformPreview} cfg=${cfg} flags=${flags} item=${item} target=${view === 'fb' ? 'fb' : 'ig'} />
      </div>
      <div class="min-w-0">
        <div class="mb-3 grid grid-cols-2 gap-2">
          <${Field} label="יום" class="!mb-0"><select class=${inputCls} value=${item.day} onChange=${(e) => setPlan({ day: e.target.value })}>${weekDays().map((d) => html`<option value=${d.id}>${d.label} ${d.date}</option>`)}</select><//>
          <${Field} label="שעה" class="!mb-0"><input type="time" class=${inputCls} value=${item.time} onChange=${(e) => setPlan({ time: e.target.value })} /><//>
        </div>
        <p class="mb-1 text-[14px] font-bold">לאן</p>
        <ul class="mb-3 flex flex-col gap-1.5">
          ${targets.map((x) => html`<li key=${x.id}>
            ${x.direct
              ? html`<label class="flex cursor-pointer items-center gap-2 rounded-xl bg-white p-2 text-[14px] ring-1 ring-line"><input type="checkbox" class="h-4 w-4 accent-brand-600" checked=${to.includes(x.id)} onChange=${() => setTo(to.includes(x.id) ? to.filter((y) => y !== x.id) : [...to, x.id])} /><${Icon} name=${x.icon} size=${16} class="text-brand-600" /><b>${x.label}</b><span class="ms-auto text-[12px] text-muted">יוצא לבד</span></label>`
              : html`<div class="flex items-center gap-2 rounded-xl bg-canvas p-2 text-[14px]"><${Icon} name=${x.icon} size=${16} class="text-muted" /><b>${x.label}</b><button type="button" class="ms-auto inline-flex items-center gap-1 text-[13px] font-bold text-brand-600 cursor-pointer" onClick=${() => notify('הטקסט הועתק. הקבצים ירדו לתיקיית ההורדות', 'copy')}><${Icon} name="copy" size=${13} />העתקה והורדה</button></div>`}
          </li>`)}
        </ul>
        ${noVideo && html`<p class="mb-2 rounded-xl bg-warn-50 p-2.5 text-[14px] text-warn">לרילס עוד אין סרטון. אפשר להעלות בפריט עצמו, בכתיבת התוכן, או לשים תזכורת לצלם ולפרסם.</p>`}
        ${!st.approved && !noVideo && html`<p class="mb-2 rounded-xl bg-warn-50 p-2.5 text-[14px] text-warn">הפריט עוד לא אושר בחלק "כתיבת התוכן".</p>`}
        ${s?.status === 'failed' && html`<div class="mb-2 rounded-xl bg-error-50 p-2.5 text-[14px] text-error"><b class="block">התזמון הקודם נכשל</b>אינסטגרם לא קיבל את הפריט (חיבור שפג, או מגבלת הפרסום היומית). ננסה שוב לבד, ואם לא, ${g('תקבל', 'תקבלי')} התראה.<button type="button" class="ms-1 font-bold underline underline-offset-2 cursor-pointer" onClick=${() => (setS({ status: 'scheduled', to: s.to, retried: true }), notify('מתוזמן', 'calendar-check'), onClose())}>לנסות עכשיו</button></div>`}
        ${topicOf(item).type === 'offer' && html`<p class="flex items-start gap-1.5 text-[13px] text-muted"><${Icon} name="link" size=${14} class="mt-0.5 shrink-0" /><span>הקישור בפוסט מסומן במקור שלו: <b dir="ltr">${postLink(item.id)}</b>. ליד שמגיע ממנו מופיע בטבלה כ"פוסט".</span></p>`}
      </div>
    </div>
  <//>`;
}

export function ConfirmAll({ cfg, setCfg, flags, notify, onClose }) {
  const targets = targetsOf(cfg, flags).filter((x) => x.direct);
  const list = cfg.plan.filter((i) => cfg.sched[i.id]?.status !== 'scheduled');
  const ready = list.filter((i) => !needsVideo(cfg, i) && itemState(cfg, i).approved);
  const later = list.filter((i) => !ready.includes(i));
  const go = () => {
    const sched = { ...cfg.sched };
    ready.forEach((i) => (sched[i.id] = flags.failPublish && i === ready[0] ? { status: 'failed', to: targets.map((x) => x.id) } : { status: 'scheduled', to: targets.map((x) => x.id) }));
    later.forEach((i) => (sched[i.id] = { status: 'manual', to: [] }));
    setCfg({ sched });
    notify(flags.failPublish ? 'פריט אחד לא התקבל באינסטגרם. ננסה שוב בעוד 5 דקות' : `${ready.length === 1 ? 'פריט אחד מתוזמן' : `${ready.length} פריטים מתוזמנים`}. נכנסו גם ליומן`, flags.failPublish ? 'triangle-alert' : 'calendar-check');
    onClose();
  };
  return html`<${Sheet} title="לתזמן את השבוע?" onClose=${onClose} footer=${html`<${Button} variant="quiet" onClick=${onClose}>לא עכשיו<//><${Button} disabled=${!list.length} onClick=${go}>כן, לתזמן<//>`}>
    <p class="mb-3 text-[15px]">זה מה שיוצא, לאן ומתי:</p>
    <ul class="mb-3 flex flex-col gap-2">
      ${ready.map((i) => html`<li key=${i.id} class="rounded-xl bg-white p-2.5 ring-1 ring-line"><b class="block text-[15px]">${dayOf(i.day).label} ${i.time} · ${fmtOf(i.format).label}</b><small class="text-[13px] text-muted">${topicOf(i).title} · ${targets.map((x) => x.label).join(' ו')}</small></li>`)}
    </ul>
    ${cfg.fbGroups && cfg.channels.includes('fb') && html`<p class="mb-2 flex items-start gap-2 text-[14px] text-muted"><${Icon} name="users" size=${15} class="mt-0.5 shrink-0" />לקבוצות בפייסבוק: תזכורת ביומן בכל אחד מהזמנים, עם הטקסט מוכן להעתקה.</p>`}
    ${later.length > 0 && html`<p class="rounded-xl bg-warn-50 p-2.5 text-[14px] text-warn">${later.map((i) => `${dayOf(i.day).label} (${fmtOf(i.format).label})`).join(', ')}: ${later.some((i) => needsVideo(cfg, i)) ? 'עוד אין סרטון' : 'עוד לא אושר'}, אז ${later.length > 1 ? 'הם נכנסים' : 'הוא נכנס'} ליומן כתזכורת.</p>`}
  <//>`;
}

// The last part: when each item goes out. Day and time are set right in the list, a
// strip on top shows the week at a glance, and each row opens the preview. The main
// button at the bottom schedules the whole week.
export function WeekScreen({ cfg, setCfg, flags, notify }) {
  const [open, setOpen] = useState(null);
  const targets = targetsOf(cfg, flags);
  const direct = targets.filter((x) => x.direct);
  const copy = targets.filter((x) => !x.direct);
  const item = cfg.plan.find((i) => i.id === open);
  const days = weekDays();
  const order = days.map((d) => d.id);
  const rows = [...cfg.plan].sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day) || a.time.localeCompare(b.time));
  const setPlan = (id, p) => setCfg({ plan: cfg.plan.map((i) => (i.id === id ? { ...i, ...p } : i)) });
  const chip = (x, on) => html`<span key=${x.id} class=${cx('inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[13px] font-bold', on ? 'bg-money-50 text-money' : 'bg-canvas text-muted ring-1 ring-line')}><${Icon} name=${x.icon} size=${14} />${x.label}</span>`;
  return html`<div class="mx-auto max-w-[1000px] px-4 py-4 md:px-8 md:py-5">
    <${StepHeading} n=${partNo('week')} eyebrow=${partLabel('week')} title=${['מתי כל פריט ', 'יוצא', '']} sub=${direct.length ? 'הכריש הציע ימים ושעות שבהם הקהל שלך פעיל. אפשר לשנות כאן, ובסוף "לתזמן את השבוע" בכפתור למטה.' : 'הכריש הציע ימים ושעות. כל פריט נכנס ליומן עם תזכורת, טקסט להעתקה וקבצים להורדה.'} />
    <div class="mb-3 grid grid-cols-7 overflow-hidden rounded-xl bg-white ring-1 ring-line" aria-hidden="true">
      ${days.map((d, i) => {
        const its = cfg.plan.filter((x) => x.day === d.id);
        return html`<div key=${d.id} class=${cx('flex min-h-[58px] flex-col items-center gap-1 py-1.5', i && 'border-s border-line', its.length && 'bg-brand-50')}>
          <span class=${cx('text-[12px] font-bold', its.length ? 'text-brand-600' : 'text-muted')}>${d.short} <span class="font-normal">${d.date}</span></span>
          <span class="flex gap-1">${its.map((x) => html`<span key=${x.id} class="grid h-6 w-6 place-items-center rounded-md bg-brand-600 text-white"><${Icon} name=${fmtOf(x.format).icon} size=${13} /></span>`)}</span>
        </div>`;
      })}
    </div>
    <ol class="flex flex-col gap-2">
      ${rows.map((i) => {
        const t = topicOf(i);
        const f = fmtOf(i.format);
        return html`<li key=${i.id} class="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 rounded-2xl bg-white p-3 ring-1 ring-line md:flex md:gap-x-4">
          <div class="flex shrink-0 gap-1.5">
            <select class=${cx(inputCls, '!h-9 !w-auto !px-2 !text-[14px]')} value=${i.day} onChange=${(e) => setPlan(i.id, { day: e.target.value })} aria-label="יום">${days.map((d) => html`<option value=${d.id}>${d.label} ${d.date}</option>`)}</select>
            <input type="time" class=${cx(inputCls, '!h-9 !w-[92px] !px-2 !text-[14px]')} value=${i.time} onChange=${(e) => setPlan(i.id, { time: e.target.value })} aria-label="שעה" />
          </div>
          <span class="min-w-0 flex-1 max-md:col-span-2">
            <span class="flex items-center gap-1.5 text-[12px] font-bold text-muted"><${Icon} name=${f.icon} size=${13} class="text-brand-600" />${f.label} · ${typeOf(t.type).label}${t.type === 'offer' && html`<span class="font-normal"> · הכי טוב בין 19:00 ל-20:00</span>`}</span>
            <b class="block truncate text-[15px] leading-snug">${t.title}</b>
          </span>
          <span class="flex items-center justify-between gap-3 max-md:col-span-2 md:contents">
            <span class="shrink-0">${statusTag(cfg, i)}</span>
            <button type="button" onClick=${() => setOpen(i.id)} class="inline-flex shrink-0 items-center gap-1 text-[14px] font-bold text-brand-600 cursor-pointer hover:underline"><${Icon} name="eye" size=${15} />תצוגה מקדימה</button>
          </span>
        </li>`;
      })}
    </ol>
    <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
      ${direct.length > 0 && html`<span class="flex flex-wrap items-center gap-1.5"><b>יוצא לבד:</b>${direct.map((x) => chip(x, true))}</span>`}
      ${copy.length > 0 && html`<span class="flex flex-wrap items-center gap-1.5"><b>להעתקה ותזכורת:</b>${copy.map((x) => chip(x, false))}</span>`}
    </div>
    ${item && html`<${ItemSheet} cfg=${cfg} setCfg=${setCfg} flags=${flags} item=${item} notify=${notify} onClose=${() => setOpen(null)} />`}
  </div>`;
}

// ---------- follower growth on Instagram ----------
// Sold here, right after the finish: the account follows people from the audience the user
// picked, and unfollows after 10 days, so the followers go up and the following stays low.
// The word "Grow" never shows to the user. Only after the payment does it ask for the pages
// and the Instagram login, which go straight to the provider's API: never stored by
// FlowBiz, never logged.
export const GROWTH_PRICE = 350;
const VAT = 0.18;
const HOW = [
  ['target', 'בוחרים את הקהל', '3 עד 5 עמודים באינסטגרם שהקהל שלך כבר עוקב אחריהם. לא מתחרים, תחום קרוב.'],
  ['user-plus', 'עוקבים בשבילך, כל יום', 'החשבון שלך עוקב אוטומטית אחרי אנשים מהקהל הזה. הם מקבלים התראה, נכנסים לפרופיל ורואים את התוכן.'],
  ['user-minus', 'אחרי 10 ימים, מורידים מעקב', 'מי שעקב בחזרה נשאר. את המעקב מורידים, כך שהעוקבים שלך עולים ומספר הנעקבים נשאר נמוך.'],
];
export function GrowthSheet({ cfg, setCfg, notify, onClose }) {
  const [step, setStep] = useState(cfg.growth === 'paid' ? 'setup' : cfg.growth === 'active' ? 'done' : 'offer');
  const [pages, setPages] = useState(['', '', '']);
  const [pass, setPass] = useState('');
  const filled = pages.filter((x) => x.trim()).length;
  const vat = Math.round(GROWTH_PRICE * VAT);
  const title = { offer: 'עוקבים חדשים, בלי מאמץ', pay: 'אישור התשלום', setup: 'עוד 2 דברים, ומתחילים', done: 'צמיחת העוקבים פעילה' }[step];
  const footer = {
    offer: html`<${Button} variant="quiet" onClick=${onClose}>לא עכשיו<//><${Button} class="!h-11 !text-[16px]" onClick=${() => setStep('pay')}><${Icon} name="trending-up" size=${18} />להתחיל לצמוח<//>`,
    pay: html`<${Button} variant="quiet" onClick=${() => setStep('offer')}>חזרה<//><${Button} class="!h-11 !text-[16px]" onClick=${() => (setCfg({ growth: 'paid' }), setStep('setup'), notify('התשלום עבר', 'check'))}><${Icon} name="lock" size=${17} />לאשר ולשלם ${money(GROWTH_PRICE + vat)}<//>`,
    setup: html`<${Button} variant="quiet" onClick=${onClose}>אמלא אחר כך<//><${Button} disabled=${filled < 3 || !pass} onClick=${() => (setCfg({ growth: 'active' }), setPass(''), setStep('done'))}>להפעיל<//>`,
    done: html`<span></span><${Button} onClick=${onClose}>סגירה<//>`,
  }[step];
  return html`<${Sheet} wide title=${title} onClose=${onClose} footer=${footer}>
    ${step === 'offer' && html`<div>
      <div class="mb-4 flex items-center gap-3 rounded-2xl bg-brand-600 p-4 text-white">
        <${SharkAvatar} size=${52} mood="happy" />
        <div class="min-w-0">
          <b class="block font-display text-[21px] leading-tight">התוכן מוכן. עכשיו צריך שיראו אותו</b>
          <p class="mt-1 text-[14px] text-white/85">אנשים מהקהל שלך מגיעים לפרופיל כל יום, ו${g('אתה לא עושה', 'את לא עושה')} כלום.</p>
        </div>
      </div>
      <p class="mb-2 text-[15px] font-bold">איך זה עובד</p>
      <ol class="mb-3 grid gap-2 sm:grid-cols-3">
        ${HOW.map(([icon, head, text], i) => html`<li key=${head} class="relative rounded-xl bg-white p-3 ring-1 ring-line">
          <span class="mb-1.5 flex items-center gap-2"><span class="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-600"><${Icon} name=${icon} size=${17} /></span><span class="font-display text-[14px] font-bold text-muted">${i + 1}</span></span>
          <b class="block text-[15px] leading-snug">${head}</b>
          <small class="mt-0.5 block text-[13px] leading-snug text-muted">${text}</small>
        </li>`)}
      </ol>
      <div class="mb-3 rounded-xl bg-white px-3 pb-2.5 pt-3 ring-1 ring-line" aria-label="מה קורה עם כל אחד">
        <div class="relative mx-2 mb-1 h-2 rounded-full bg-gradient-to-l from-brand-300 via-brand-600 to-money"></div>
        <div class="grid grid-cols-3 text-[12px] leading-snug">
          <span><b class="block text-[13px]">יום 1</b>עוקבים אחריו</span>
          <span class="text-center"><b class="block text-[13px]">ימים 2-9</b>נכנס לפרופיל, עוקב בחזרה</span>
          <span class="text-end"><b class="block text-[13px]">יום 10</b>מורידים מעקב. הוא נשאר עוקב שלך</span>
        </div>
      </div>
      <ul class="mb-3 grid gap-1.5 text-[14px] sm:grid-cols-3">
        ${[['clock', '0 דקות ממך ביום'], ['users', 'אנשים מהקהל שלך, לא בוטים'], ['sparkles', 'התוכן שיצרת כאן גורם להם להישאר']].map(([icon, text]) => html`<li key=${text} class="flex items-center gap-1.5"><${Icon} name=${icon} size=${15} class="shrink-0 text-money" />${text}</li>`)}
      </ul>
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border-[1.5px] border-money/40 bg-money-50 p-3">
        <span><b class="font-display text-[26px] leading-none">${money(GROWTH_PRICE)}</b> <span class="text-[14px] font-bold">+ מע"מ לחודש</span></span>
        <span class="flex items-center gap-1.5 text-[14px] font-bold text-money"><${Icon} name="shield-check" size=${16} />בלי התחייבות. מבטלים בכל שלב</span>
      </div>
    </div>`}
    ${step === 'pay' && html`<div>
      <ul class="mb-3 overflow-hidden rounded-xl bg-white text-[15px] ring-1 ring-line">
        <li class="flex justify-between border-b border-line px-3 py-2"><span>צמיחת עוקבים אוטומטית · חודשי</span><b>${money(GROWTH_PRICE)}</b></li>
        <li class="flex justify-between border-b border-line px-3 py-2 text-muted"><span>מע"מ 18%</span><span>${money(vat)}</span></li>
        <li class="flex justify-between px-3 py-2"><b>לתשלום בכל חודש</b><b>${money(GROWTH_PRICE + vat)}</b></li>
      </ul>
      <p class="mb-1 flex items-start gap-2 text-[14px]"><${Icon} name="credit-card" size=${17} class="mt-0.5 shrink-0 text-brand-600" />החיוב בכרטיס של המנוי שלך ב-FlowBiz, כל חודש באותו תאריך.</p>
      <p class="flex items-start gap-2 text-[14px]"><${Icon} name="shield-check" size=${17} class="mt-0.5 shrink-0 text-money" />בלי התחייבות. ביטול בכל שלב מההגדרות, והחודש ששולם ממשיך לעבוד עד סופו.</p>
    </div>`}
    ${step === 'setup' && html`<div>
      <p class="mb-3 flex items-center gap-2 rounded-xl bg-money-50 p-2.5 text-[14px] font-bold text-money"><${Icon} name="check" size=${16} />התשלום עבר. עכשיו מה שצריך כדי להתחיל:</p>
      <p class="mb-1 text-[14px] font-bold">1. 3 עד 5 עמודים דומים באינסטגרם</p>
      <p class="mb-2 text-[13px] text-muted">עמודים שהקהל שלך כבר עוקב אחריהם. לא מתחרים ישירים, אלא תחום קרוב. למשל: עמוד על הורות, על מיינדפולנס, על בריאות נפשית.</p>
      <div class="mb-3 flex flex-col gap-1.5">
        ${pages.map((v, i) => html`<input key=${i} dir="ltr" class=${inputCls} placeholder="@page_name" value=${v} onInput=${(e) => { const v = e.target.value; setPages((ps) => ps.map((x, j) => (j === i ? v : x))); }} aria-label=${`עמוד ${i + 1}`} />`)}
        ${pages.length < 5 && html`<button type="button" class="self-start text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => setPages([...pages, ''])}>עוד עמוד</button>`}
      </div>
      <p class="mb-1 text-[14px] font-bold">2. החשבון שלך באינסטגרם</p>
      <${Field} label="שם המשתמש"><input dir="ltr" class=${inputCls} value=${`@${META.ig.handle}`} readonly /><//>
      <${Field} label="הסיסמה" hint="עוברת ישר לשירות שמפעיל את המעקב. לא נשמרת ב-FlowBiz ולא נרשמת בשום לוג."><input type="password" dir="ltr" autocomplete="off" class=${inputCls} value=${pass} onInput=${(e) => setPass(e.target.value)} /><//>
    </div>`}
    ${step === 'done' && html`<div>
      <p class="mb-2 flex items-center gap-2 text-[17px] font-bold"><${SharkAvatar} size=${36} mood="happy" />מתחילים תוך 24 שעות</p>
      <p class="text-[15px]">מהיום החשבון שלך עוקב כל יום אחרי אנשים מהקהל שבחרת, ומוריד מעקב אחרי 10 ימים. את העוקבים החדשים של כל שבוע רואים בדף הבית. הסיסמה עברה ישר לשירות, ולא נשמרה אצלנו.</p>
    </div>`}
  <//>`;
}
