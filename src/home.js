// The home page, only what this task changes on it: the next-step card, the content of
// the week with each item's state, and, once a week is done, the next week, ready to make.
import { html, Icon, cx } from './lib.js';
import { Button } from './components.js';
import { USER, STEP, LAST_WEEK_STATS, MAX_WEEKS, weekRange, g } from './data.js';
import { topicOf } from './content.js';
import { fmtOf, dayOf, Toggle, StreakEnd } from './step.js';
import { statusTag } from './publish.js';

export function Home({ state, setCfg, go, onGrow, onNextWeek }) {
  const cfg = state.cfg;
  const week = cfg.week || 1;
  const started = Object.keys(cfg.sched).length > 0;
  const history = cfg.history || [];
  const firstDone = cfg.done || week > 1;
  return html`<div class="mx-auto max-w-[1040px] px-4 py-5 md:px-8 md:py-7">
    <h1 class="fb-h1 mb-1 text-[28px] md:text-[36px]">בוקר טוב, ${USER.firstName}</h1>
    <p class="mb-5 text-[16px]">${USER.business} · ${cfg.done ? `שבוע ${week} של התוכן בלוח` : week > 1 ? `שבוע ${week} בהכנה` : 'השבוע עוד אין תוכן בלוח'}</p>
    <section class="fb-panel mb-4 flex flex-wrap items-center gap-4 !p-4 md:!p-5">
      <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name=${firstDone ? 'users' : STEP.icon} size=${24} /></span>
      <span class="min-w-0 flex-1">
        <small class="fb-eyebrow block">הצעד הבא · פרק ${STEP.chapterNo}, ${STEP.chapter}</small>
        <b class="block font-display text-[20px]">${firstDone ? 'שלב 11: פנייה חמה' : `שלב ${STEP.n}: ${STEP.name}`}</b>
      </span>
      <${Button} class="!h-11 !text-[16px]" onClick=${() => (firstDone ? null : go({ view: 'step', screen: 'opening' }))}>${firstDone ? 'לשלב 11' : 'להתחיל'}<${Icon} name="arrow-left" size=${18} /><//>
    </section>
    ${firstDone && cfg.done && week >= MAX_WEEKS && html`<${StreakEnd} cfg=${cfg} />`}
    ${firstDone && !(cfg.done && week >= MAX_WEEKS) && html`<section class="fb-panel mb-4 border-[1.5px] border-brand-300 !p-4">
      <div class="flex flex-wrap items-center gap-3">
        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name="calendar-plus" size=${22} /></span>
        <span class="min-w-0 flex-1">
          <small class="fb-eyebrow block">מכונת התוכן · ${MAX_WEEKS} שבועות ברצף</small>
          <b class="block text-[17px]">${cfg.done ? `שבוע ${week + 1} מתוך ${MAX_WEEKS}, ${weekRange(week + 1)}: 3 נושאים מחכים` : `שבוע ${week} מתוך ${MAX_WEEKS} מחכה לך`}</b>
          <small class="block text-[13px] text-muted">${cfg.done ? 'לפי מה שעבד, מה שלידים שאלו, וכאבים שעוד לא כתבת עליהם. כ-5 דקות.' : 'הנושאים כבר בחורים. נשאר לעבור על הפריטים ולתזמן.'}</small>
        </span>
        <${Button} onClick=${() => (cfg.done ? onNextWeek() : go({ view: 'step', screen: 'topics' }))}>${cfg.done ? `להכין את שבוע ${week + 1}` : 'להמשיך'}<${Icon} name="arrow-left" size=${17} /><//>
      </div>
      <label class="mt-3 flex cursor-pointer items-center justify-between gap-3 border-t border-line pt-3 text-[14px]">
        <span><b>להכין לבד כל מוצאי שבת</b><small class="block text-[13px] text-muted">טיוטה מחכה ביום ראשון בבוקר, עם התראה, עד שבוע ${MAX_WEEKS}. שום דבר לא יוצא בלי האישור שלך.</small></span>
        <${Toggle} on=${!!cfg.autoWeek} onChange=${(v) => setCfg({ autoWeek: v })} label="הכנה אוטומטית של השבוע הבא" />
      </label>
    </section>`}
    <div class="grid items-start gap-5 md:grid-cols-[1.4fr_0.6fr]">
      <section class="fb-panel !p-0 overflow-hidden">
        <div class="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
          <h2 class="fb-h3">התוכן של שבוע ${week}</h2>
          ${started && html`<button type="button" class="text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => go({ view: 'step', screen: 'week' })}>לתוכנית</button>`}
        </div>
        ${started
          ? html`<ul>${cfg.plan.map((i) => html`<li key=${i.id} class="flex items-center gap-3 border-t border-line px-4 py-2.5">
              <span class="text-brand-600"><${Icon} name=${fmtOf(i.format).icon} size=${18} /></span>
              <span class="min-w-0 flex-1"><b class="block truncate text-[15px]">${topicOf(i).title}</b><small class="block text-[13px] text-muted">${dayOf(i.day).label} ${dayOf(i.day).date} ${i.time} · ${fmtOf(i.format).label}</small></span>
              ${statusTag(cfg, i)}
            </li>`)}</ul>`
          : html`<p class="px-4 pb-4 text-[15px] text-muted">${week > 1 ? 'הפריטים של השבוע ייכנסו לכאן אחרי התזמון.' : `${g('כשתסיים', 'כשתסיימי')} את שלב 10, הפוסטים של השבוע יופיעו כאן, עם המצב של כל אחד.`}</p>`}
        ${history.length > 0 && html`<div class="border-t border-line px-4 py-3">
          <p class="mb-1.5 text-[13px] font-bold text-muted">שבועות קודמים</p>
          <ul class="flex flex-col gap-1">
            ${[...history].reverse().map((h) => {
              const leads = h.plan.reduce((n, i) => n + (LAST_WEEK_STATS[i.id]?.leads || 0), 0);
              const saves = h.plan.reduce((n, i) => n + (LAST_WEEK_STATS[i.id]?.saves || 0), 0);
              return html`<li key=${h.week} class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-canvas px-2.5 py-1.5 text-[14px]"><b>שבוע ${h.week} · ${weekRange(h.week)}</b><span class="text-[13px] text-muted">3 פריטים · ${saves} שמירות · ${leads === 1 ? 'ליד 1' : `${leads} לידים`}</span></li>`;
            })}
          </ul>
        </div>`}
      </section>
      <section class=${cx('fb-panel !p-4', cfg.growth !== 'active' && 'border-[1.5px] border-money/40')}>
        <h2 class="fb-h3 mb-1 flex items-center gap-2"><${Icon} name="trending-up" size=${19} class="text-money" />${cfg.growth === 'active' ? 'צמיחת העוקבים' : 'עוקבים חדשים, בלי מאמץ'}</h2>
        <p class="mb-2 text-[14px]">${cfg.growth === 'active' ? 'פעילה. כל יום עוקבים אחרי אנשים מהקהל שבחרת, ואחרי 10 ימים מורידים מעקב.' : cfg.growth === 'paid' ? 'התשלום עבר. חסרים העמודים הדומים והחשבון באינסטגרם.' : 'עוקבים אוטומטית אחרי הקהל שלך, כדי שיגיעו לתוכן. 350 ₪ + מע"מ לחודש, בלי התחייבות.'}</p>
        ${cfg.growth !== 'active' && html`<${Button} variant="text" class="!h-auto !p-0" onClick=${onGrow}>${cfg.growth === 'paid' ? 'להשלים' : 'איך זה עובד'}<//>`}
      </section>
    </div>
  </div>`;
}
