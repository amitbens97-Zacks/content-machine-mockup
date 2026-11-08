// The home page, only what this task changes on it: the next-step card, and a card with
// the week's content and how each item did after it went out.
import { html, Icon } from './lib.js';
import { Button } from './components.js';
import { USER, STEP, g } from './data.js';
import { topicOf } from './content.js';
import { fmtOf, dayOf } from './step.js';
import { statusTag } from './publish.js';

export function Home({ state, go, onGrow }) {
  const cfg = state.cfg;
  const started = Object.keys(cfg.sched).length > 0;
  return html`<div class="mx-auto max-w-[1040px] px-4 py-5 md:px-8 md:py-7">
    <h1 class="fb-h1 mb-1 text-[28px] md:text-[36px]">בוקר טוב, ${USER.firstName}</h1>
    <p class="mb-5 text-[16px]">${USER.business} · ${cfg.done ? 'שבוע התוכן בלוח' : 'השבוע עוד אין תוכן בלוח'}</p>
    <section class="fb-panel mb-5 flex flex-wrap items-center gap-4 !p-4 md:!p-5">
      <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name=${cfg.done ? 'users' : STEP.icon} size=${24} /></span>
      <span class="min-w-0 flex-1">
        <small class="fb-eyebrow block">הצעד הבא · פרק ${STEP.chapterNo}, ${STEP.chapter}</small>
        <b class="block font-display text-[20px]">${cfg.done ? 'שלב 11: פנייה חמה' : `שלב ${STEP.n}: ${STEP.name}`}</b>
      </span>
      <${Button} class="!h-11 !text-[16px]" onClick=${() => go({ view: 'step', screen: cfg.done ? 'done' : 'opening' })}>${cfg.done ? 'לסיכום שלב 10' : 'להתחיל'}<${Icon} name="arrow-left" size=${18} /><//>
    </section>
    <div class="grid items-start gap-5 md:grid-cols-[1.4fr_0.6fr]">
      <section class="fb-panel !p-0 overflow-hidden">
        <div class="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
          <h2 class="fb-h3">התוכן של השבוע</h2>
          ${started && html`<button type="button" class="text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => go({ view: 'step', screen: 'publish' })}>ללוח</button>`}
        </div>
        ${started
          ? html`<ul>${cfg.plan.map((i) => html`<li key=${i.id} class="flex items-center gap-3 border-t border-line px-4 py-2.5">
              <span class="text-brand-600"><${Icon} name=${fmtOf(i.format).icon} size=${18} /></span>
              <span class="min-w-0 flex-1"><b class="block truncate text-[15px]">${topicOf(i).title}</b><small class="block text-[13px] text-muted">${dayOf(i.day).label} ${i.time} · ${fmtOf(i.format).label}</small></span>
              ${statusTag(cfg, i)}
            </li>`)}</ul>
            <p class="border-t border-line px-4 py-2.5 text-[13px] text-muted">אחרי שפריט יוצא, כאן יופיע כמה ראו, הגיבו ושמרו, וכמה לידים הגיעו ממנו.</p>`
          : html`<p class="px-4 pb-4 text-[15px] text-muted">${g('כשתסיים', 'כשתסיימי')} את שלב 10, הפוסטים של השבוע יופיעו כאן, עם המצב של כל אחד.</p>`}
      </section>
      <section class="fb-panel !p-4">
        <h2 class="fb-h3 mb-1">Grow</h2>
        <p class="mb-2 text-[14px]">${state.flags.growSub ? 'צמיחת קהל באינסטגרם, כלולה במנוי שלך.' : 'צמיחת קהל באינסטגרם, תוספת למנוי.'}</p>
        <${Button} variant="text" class="!h-auto !p-0" onClick=${onGrow}>${state.flags.growSub ? 'להפעיל' : 'לפרטים'}<//>
      </section>
    </div>
  </div>`;
}
