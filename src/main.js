// Task 5: step 10 "מכונת תוכן שיווקי". The mockup opens on the step, inside the system;
// the home page is reached the way a user reaches it. The developer notes (Shift+D) are
// the only part that belongs to the mockup.
// Link params: ?view=step|home, ?screen=opening|channel|look|topics|item1|item2|item3|flyer|week|done,
// ?user=f, ?embed = phone layout.
// Week 1 is the full step (5 parts). After it, "להכין את שבוע 2" opens a short version:
// the topics, the 3 items and the week plan (2 parts).
import { html, render, useState, useEffect, useRef, Icon } from './lib.js';
import { Logo, PartnerBubble, Progress, TopBar, BottomBar, Status, PrimaryButton, Button, Toast } from './components.js';
import { STEP, ITEM_SCREENS, SCREEN_NAME, START_PLAN, NEXT_PLANS, flowOf, setWeekNo, g } from './data.js';
import { loadState, saveState, freshState } from './state.js';
import { Opening, ChannelScreen, LookScreen, TopicsScreen, ItemScreen, FlyerScreen, Done, itemState } from './step.js';
import { WeekScreen, GrowSheet, ConfirmAll, targetsOf } from './publish.js';
import { Home } from './home.js';
import { DevPanel } from './devnotes.js';
import { EMBED, IS_PHONE, readView, saveView, writeHandoff, takeHandoff, applyPhoneViewport, ViewToggle, PhonePreview } from './viewswitch.js';

const params = new URLSearchParams(location.search);
const SCREENS = ['opening', 'channel', 'look', 'topics', 'item1', 'item2', 'item3', 'flyer', 'week', 'done'];
// Older links: the screens had other names before.
const OLD = { content: 'item1', plan: 'topics', publish: 'week' };

function startRoute() {
  const view = params.get('view');
  if (view === 'home') return { view };
  const s = OLD[params.get('screen')] || params.get('screen');
  return { view: 'step', screen: SCREENS.includes(s) ? s : 'opening' };
}

const SHARK_LINE = {
  opening: 'כל מה שבנית עד עכשיו נכנס לכאן: הכאבים של הלקוחות, המסר וההצעה. מכאן זה הופך לתוכן.',
  channel: 'עדיף ערוץ אחד או שניים שמפרסמים בהם כל שבוע, מחמישה שמפרסמים בהם פעם בחודש.',
  look: 'בחרתי מראש את התבנית שנבנתה לטיפול רגשי. אפשר להחליף, וכל התוכן מתעדכן.',
  topics: 'כל נושא כאן בא מכאב שכתבת בתיק הלקוח. אם משהו לא יושב לך, "רעיון אחר".',
  item1: g('כדאי לקרוא כל פוסט פעם אחת בקול. אם זה לא נשמע כמוך, תבקש ממני לשנות.', 'כדאי לקרוא כל פוסט פעם אחת בקול. אם זה לא נשמע כמוך, תבקשי ממני לשנות.'),
  item2: 'בקרוסלה כל שקופית היא רעיון אחד. אם שדה עובר את המגבלה, אני מקצר.',
  item3: 'לא חייבים לצלם עכשיו. "אצלם אחר כך" שם תזכורת ביומן, עם התסריט.',
  flyer: 'הפלייר הזה ילך איתך לשלב 11, לפנייה החמה. אז כדאי שהוא יהיה בדיוק כמו שצריך.',
  week: 'הפוסט של ההצעה יוצא ביום חמישי בערב. זה הזמן שבו הכי הרבה אנשים פנויים לקרוא.',
  home: 'השלב הבא שלך מחכה: מכונת התוכן.',
};
const SHARK_WEEK = {
  topics: 'בחרתי לפי מה שעבד בשבוע שעבר ולפי מה ששאלו אותך. אם בא לך משהו אחר, "רעיון אחר".',
};
const SETTINGS = ['channel', 'look', 'flyer'];

function App({ view: shellView, onViewChange }) {
  const handoff = useRef(takeHandoff()).current;
  const [route, setRoute] = useState(handoff?.route || startRoute());
  const [state, setState] = useState(handoff?.state || loadState());
  const [toast, setToast] = useState(null);
  const [dev, setDev] = useState(false);
  const [grow, setGrow] = useState(false);
  const [save, setSave] = useState(null);
  const [unread, setUnread] = useState(true);
  const [maxPart, setMaxPart] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const timers = useRef({});
  const phoneLayout = EMBED || window.innerWidth < 768;
  setWeekNo(state.cfg.week);

  useEffect(() => {
    saveState(state);
    window.__flowbizSnapshot = () => ({ route, state });
  });
  useEffect(() => {
    const q = new URLSearchParams();
    q.set('view', route.view);
    if (route.view === 'step') q.set('screen', route.screen);
    if (EMBED) q.set('embed', '1');
    if (params.get('user')) q.set('user', params.get('user'));
    history.replaceState(null, '', `${location.pathname}?${q}`);
    setUnread(true);
    document.querySelector('main')?.scrollTo(0, 0);
  }, [route.view, route.screen]);
  useEffect(() => {
    const k = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (e.key === 'D' && e.shiftKey && !typing) setDev((d) => !d);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const notify = (text, icon = 'info') => {
    setToast({ id: Date.now(), text, icon });
    clearTimeout(timers.current.toast);
    timers.current.toast = setTimeout(() => setToast(null), 2800);
  };
  const go = (r) => setRoute(r);
  const setCfg = (p) => {
    setState((s) => ({ ...s, cfg: { ...s.cfg, ...p } }));
    setSave('saving');
    clearTimeout(timers.current.save);
    timers.current.save = setTimeout(() => setSave('saved'), 450);
  };
  // Developer switches. "No offer" also takes the offer out of the week, the way the
  // plan would be built for a user who has not finished step 8.
  const setFlag = (k, v) =>
    setState((s) => {
      const flags = { ...s.flags, [k]: v };
      let cfg = s.cfg;
      if (k === 'noOffer') {
        const plan = v
          ? cfg.plan.map((i) => (i.topic === 'o1' ? { ...i, topic: 'v2', time: '20:30' } : i))
          : START_PLAN.map((i) => ({ ...i }));
        cfg = { ...cfg, plan, generated: false, items: {} };
      }
      if (k === 'noLogo' && v) cfg = { ...cfg, colors: 'own' };
      if (k === 'noLogo' && !v) cfg = { ...cfg, colors: 'brand' };
      return { cfg, flags };
    });
  // The next week: last week goes to the history, and the shark's plan for the new week
  // comes in. The channels, the look and the flyer stay as they are.
  const startNextWeek = () => {
    const week = (state.cfg.week || 1) + 1;
    setState((s) => {
      const c = s.cfg;
      const plan = NEXT_PLANS[(week - 2) % NEXT_PLANS.length].map((i) => ({ ...i }));
      return { ...s, cfg: { ...c, week, history: [...(c.history || []), { week: c.week || 1, plan: c.plan, sched: c.sched }], plan: s.flags.noOffer ? plan.map((i) => (i.topic === 'o1' ? { ...i, topic: 'v2' } : i)) : plan, generated: false, items: {}, sched: {}, done: false } };
    });
    setMaxPart(0);
    setDev(false);
    go({ view: 'step', screen: 'topics' });
    notify(`שבוע ${week}: 3 נושאים חדשים מחכים`, 'calendar-plus');
  };

  const flow = flowOf(state.cfg.week);
  const jump = (id) => {
    setDev(false);
    if (id === 'home') go({ view: 'home' });
    else if (id === 'nextweek') startNextWeek();
    else {
      if (id in flow.partOf) setMaxPart((m) => Math.max(m, flow.partOf[id]));
      go({ view: 'step', screen: id });
    }
  };
  const reset = () => {
    setState(freshState());
    setDev(false);
    setMaxPart(0);
    go({ view: 'step', screen: 'opening' });
    notify('הנתונים אופסו', 'rotate-ccw');
  };

  const shell = (inner) => html`<div class="fb-notebook flex h-dvh flex-col text-ink" dir="rtl">
    ${inner}
    <${Toast} toast=${toast} />
    ${grow && html`<${GrowSheet} flags=${state.flags} notify=${notify} onClose=${() => setGrow(false)} />`}
    <${DevPanel} open=${dev} onClose=${() => setDev(false)} onJump=${jump} onReset=${reset} flags=${state.flags} setFlag=${setFlag} />
  </div>`;

  const devBtn = html`<button type="button" onClick=${() => setDev((d) => !d)} title="הערות למפתחים (Shift+D)" aria-label="הערות למפתחים" class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-brand-50 hover:text-brand-600 cursor-pointer max-md:hidden"><${Icon} name="code-xml" size=${18} /></button>`;

  // ---------- the home page ----------
  if (route.view === 'home') {
    const nav = [
      ['home', 'בית', 'house'],
      ['calendar', 'יומן', 'calendar-days'],
      ['tasks', 'משימות', 'list-checks'],
      ['finance', 'כספים', 'wallet'],
      ['files', 'קבצים', 'folder-open'],
      ['leads', 'לידים', 'users'],
      ['pages', 'הדפים שלי', 'layout-template'],
    ];
    const appBar = html`<header class="no-print z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 md:px-6">
      <button type="button" aria-label="דף הבית" class="cursor-pointer" onClick=${() => go({ view: 'home' })}><${Logo} size="sm" /></button>
      <nav class="ms-4 hidden items-center gap-1 lg:flex">
        ${nav.map(([id, label, icon]) => {
          const locked = id === 'leads';
          return html`<button key=${id} type="button"
            class=${'inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[14px] font-bold cursor-pointer ' + (id === 'home' ? 'bg-brand-100 text-brand-600' : locked ? 'text-faint' : 'text-muted hover:bg-brand-50 hover:text-brand-600')}
            onClick=${() => (id === 'home' ? null : notify(locked ? '"לידים" נפתח בשלב 14. עד אז הלידים בכרטיס בדף הבית' : id === 'calendar' && Object.keys(state.cfg.sched).length ? 'הפריטים של השבוע מחכים ביומן' : 'במוק-אפ הפריט הזה לא פעיל', 'info'))}
          ><${Icon} name=${locked ? 'lock' : icon} size=${17} />${label}</button>`;
        })}
      </nav>
      <span class="ms-auto"></span>
      <button type="button" class="rounded-lg p-2 text-muted hover:bg-brand-50 cursor-pointer" aria-label="התראות" onClick=${() => notify('אין התראות חדשות', 'bell')}><${Icon} name="bell" size=${20} /></button>
      ${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} class="max-md:hidden" />`}
      ${devBtn}
    </header>`;
    return shell(html`${appBar}<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto"><${Home} state=${state} setCfg=${setCfg} go=${go} onGrow=${() => setGrow(true)} onNextWeek=${startNextWeek} /><${PartnerBubble} message=${state.cfg.done ? 'שבוע התוכן בלוח. השלב הבא: פנייה חמה, עם הפלייר שיצרת.' : SHARK_LINE.home} unread=${unread} onRead=${() => setUnread(false)} /></main>`);
  }

  // ---------- step 10 ----------
  const { cfg, flags } = state;
  const weekMode = (cfg.week || 1) > 1;
  // "הגדרות": channels, look and flyer, opened from the topics of a later week.
  const settings = !!route.settings;
  // In the weeks after the first, the first-pass screens open only through "הגדרות".
  const screen = weekMode && !settings && ['opening', ...SETTINGS].includes(route.screen) ? 'topics' : route.screen;
  const steps = settings ? SETTINGS : flow.screens;
  const part = screen in flow.partOf ? flow.partOf[screen] : -1;
  const idx = steps.indexOf(screen);
  const toScreen = (s) => {
    setSave(null);
    setRoute({ view: 'step', screen: s, settings: settings && SETTINGS.includes(s) });
    if (s in flow.partOf && flow.partOf[s] > maxPart) setMaxPart(flow.partOf[s]);
  };
  const itemN = ITEM_SCREENS.indexOf(screen);
  const allInCal = cfg.plan.every((i) => ['scheduled', 'manual', 'posted'].includes(cfg.sched[i.id]?.status));
  const failed = cfg.plan.some((i) => cfg.sched[i.id]?.status === 'failed');
  const reason =
    screen === 'channel' && !cfg.channels.length ? 'צריך לבחור לפחות ערוץ אחד'
    : screen === 'channel' && (cfg.channels.includes('ig') || cfg.channels.includes('fb')) && !cfg.connect ? 'צריך לבחור: לחבר, או לפרסם בעצמך'
    : itemN >= 0 && !cfg.generated ? 'כריש המילים עוד כותב'
    : screen === 'week' && failed ? 'פריט אחד לא תוזמן. לפתוח אותו ולנסות שוב'
    : null;
  const hint = itemN >= 0 ? 'שום דבר לא יוצא לפני התוכנית לשבוע' : null;
  const next = screen === 'opening' ? steps[0] : steps[idx + 1] || (settings ? 'topics' : 'done');
  const props = { cfg, setCfg, flags, notify, phoneLayout };
  const body = {
    opening: html`<${Opening} ...${props} />`,
    channel: html`<${ChannelScreen} ...${props} />`,
    look: html`<${LookScreen} ...${props} />`,
    topics: html`<${TopicsScreen} ...${props} onSettings=${() => setRoute({ view: 'step', screen: 'channel', settings: true })} />`,
    item1: html`<${ItemScreen} ...${props} n=${0} />`,
    item2: html`<${ItemScreen} ...${props} n=${1} />`,
    item3: html`<${ItemScreen} ...${props} n=${2} />`,
    flyer: html`<${FlyerScreen} ...${props} />`,
    week: html`<${WeekScreen} ...${props} />`,
    done: html`<${Done} ...${props} onGrow=${() => setGrow(true)} onNextWeek=${startNextWeek} />`,
  }[screen];
  const firstOfPart = (i) => steps.find((s) => flow.partOf[s] === i);
  // The main button says where it leads. On an item it also approves the item; on the
  // flyer it saves; on the week plan it schedules the week, then finishes the step.
  const direct = targetsOf(cfg, flags).some((x) => x.direct);
  const approve = (item) => setCfg({ items: { ...cfg.items, [item.id]: { ...itemState(cfg, item), ...(cfg.items[item.id] || {}), approved: true } } });
  const saveFlyer = () => cfg.flyer.saved || (setCfg({ flyer: { ...cfg.flyer, saved: true } }), notify('הפלייר נשמר בקבצים', 'folder-check'));
  const backToWeek = () => setRoute({ view: 'step', screen: 'topics' });
  const main =
    screen === 'opening' ? { label: 'מתחילים', go: () => toScreen(next) }
    : settings ? { label: next === 'topics' ? `חזרה לשבוע ${cfg.week}` : `המשך ל${SCREEN_NAME[next]}`, go: () => (screen === 'flyer' && saveFlyer(), next === 'topics' ? backToWeek() : toScreen(next)) }
    : screen === 'topics' ? { label: 'לכתוב את 3 הפריטים', go: () => toScreen(next) }
    : itemN >= 0 ? { label: `לאשר ולעבור ל${SCREEN_NAME[next]}`, go: () => (approve(cfg.plan[itemN]), toScreen(next)) }
    : screen === 'flyer' ? { label: 'לשמור ולעבור לתוכנית לשבוע', go: () => (saveFlyer(), toScreen(next)) }
    : screen === 'week' && !allInCal && direct ? { label: 'לתזמן את השבוע', go: () => setConfirm(true) }
    : screen === 'week' && !allInCal ? { label: 'להכניס את השבוע ליומן', go: () => {
        const sched = { ...cfg.sched };
        cfg.plan.forEach((i) => sched[i.id] || (sched[i.id] = { status: 'manual', to: [] }));
        setCfg({ sched });
        notify('3 תזכורות ביומן, עם הטקסט והקבצים', 'bell');
      } }
    : screen === 'week' ? { label: weekMode ? `לסיים את שבוע ${cfg.week}` : 'סיום השלב', check: true, go: () => (setCfg({ done: true }), toScreen('done')) }
    : { label: `המשך ל${SCREEN_NAME[next]}`, go: () => toScreen(next) };
  const top = html`<${TopBar}
    step=${weekMode ? { ...STEP, name: `${STEP.name} · שבוע ${cfg.week}` } : STEP}
    progress=${screen === 'opening' || settings ? null : html`<${Progress} parts=${flow.parts} current=${part} maxReached=${Math.max(maxPart, part)} done=${screen === 'done'} onJump=${(i) => toScreen(firstOfPart(i))} fill=${itemN >= 0 && cfg.generated ? Math.round(((itemN + 1) / 4) * 100) : 55} />`}
    tools=${html`${screen !== 'done' && !weekMode && html`<button type="button" class="fb-home cursor-pointer whitespace-nowrap max-md:hidden" onClick=${() => (notify('דילגת על השלב. הוא נשאר פתוח במפה, ואפשר לחזור בדיוק לכאן', 'skip-forward'), go({ view: 'home' }))}><${Icon} name="skip-forward" size=${16} />דילוג על השלב</button>`}${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} class="max-md:hidden" />`}${devBtn}`}
    onHome=${() => go({ view: 'home' })}
  />`;
  const bottom = screen === 'done'
    ? html`<${BottomBar}
        extra=${html`<${Button} variant="text" onClick=${() => toScreen('week')}><${Icon} name="calendar-days" size=${16} />לתוכנית של השבוע<//>`}
        primary=${weekMode
          ? html`<${PrimaryButton} label="לדף הבית" onClick=${() => go({ view: 'home' })} />`
          : html`<${PrimaryButton} label="לשלב הבא" onClick=${() => (notify('השלב הבא נפתח במפה: שלב 11, פנייה חמה', 'arrow-left'), go({ view: 'home' }))} />`}
      />`
    : html`<${BottomBar}
        back=${screen !== 'opening' && !(weekMode && screen === 'topics') && html`<${Button} variant="secondary" onClick=${() => (settings && idx === 0 ? backToWeek() : toScreen(idx <= 0 ? 'opening' : steps[idx - 1]))}>חזרה<//>`}
        status=${html`<${Status} reason=${reason} save=${save} hint=${hint} />`}
        primary=${html`<${PrimaryButton} label=${main.label} check=${main.check} disabled=${!!reason} onClick=${main.go} />`}
      />`;
  const line = (weekMode && SHARK_WEEK[screen]) || SHARK_LINE[screen];
  return shell(html`${top}
    ${settings && html`<div class="no-print flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-line bg-brand-50 px-4 py-2 text-center text-[14px] font-bold text-brand-600">
      <span>הגדרות התוכן: ערוצים, עיצוב ופלייר. השינויים נכנסים לשבוע ${cfg.week} ולשבועות הבאים</span>
      <button type="button" class="inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer" onClick=${backToWeek}><${Icon} name="arrow-right" size=${15} />חזרה לשבוע ${cfg.week}</button>
    </div>`}
    <main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
      ${body}
      ${line && html`<${PartnerBubble} message=${line} unread=${unread} onRead=${() => setUnread(false)} />`}
    </main>
    ${bottom}
    ${confirm && html`<${ConfirmAll} cfg=${cfg} setCfg=${setCfg} flags=${flags} notify=${notify} onClose=${() => setConfirm(false)} />`}`);
}

function Root() {
  const [view, setView] = useState(readView);
  useEffect(() => applyPhoneViewport(view), [view]);
  const change = (v) => {
    if (v === 'mobile') {
      try {
        writeHandoff(window.__flowbizSnapshot?.());
      } catch {}
    }
    saveView(v);
    setView(v);
  };
  if (!EMBED && !IS_PHONE && view === 'mobile') return html`<${PhonePreview} onSwitch=${change} title="מכונת תוכן שיווקי" />`;
  return html`<${App} view=${view} onViewChange=${change} />`;
}

applyPhoneViewport(readView());
render(html`<${Root} />`, document.getElementById('app'));
