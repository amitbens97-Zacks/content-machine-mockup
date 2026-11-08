// Task 5: step 10 "מכונת תוכן שיווקי". The mockup opens on the step, inside the system;
// the home page is reached the way a user reaches it. The developer notes (Shift+D) are
// the only part that belongs to the mockup.
// Link params: ?view=step|home, ?screen=opening|channel|look|plan|content|flyer|publish|done,
// ?user=f, ?embed = phone layout.
import { html, render, useState, useEffect, useRef, Icon, cx } from './lib.js';
import { Logo, PartnerBubble, Progress, TopBar, BottomBar, Status, PrimaryButton, Button, Toast } from './components.js';
import { STEP, PARTS, STEP_SCREENS, PART_OF, START_PLAN, g } from './data.js';
import { loadState, saveState, freshState } from './state.js';
import { Opening, ChannelScreen, LookScreen, PlanScreen, ContentScreen, FlyerScreen, Done, itemState } from './step.js';
import { PublishScreen, GrowSheet } from './publish.js';
import { Home } from './home.js';
import { DevPanel } from './devnotes.js';
import { EMBED, IS_PHONE, readView, saveView, writeHandoff, takeHandoff, applyPhoneViewport, ViewToggle, PhonePreview } from './viewswitch.js';

const params = new URLSearchParams(location.search);
const SCREENS = ['opening', ...STEP_SCREENS, 'done'];

function startRoute() {
  const view = params.get('view');
  if (view === 'home') return { view };
  return { view: 'step', screen: SCREENS.includes(params.get('screen')) ? params.get('screen') : 'opening' };
}

const SHARK_LINE = {
  opening: 'כל מה שבנית עד עכשיו נכנס לכאן: הכאבים של הלקוחות, המסר וההצעה. מכאן זה הופך לתוכן.',
  channel: 'עדיף ערוץ אחד או שניים שמפרסמים בהם כל שבוע, מחמישה שמפרסמים בהם פעם בחודש.',
  look: 'בחרתי מראש את התבנית שנבנתה לטיפול רגשי. אפשר להחליף, וכל התוכן מתעדכן.',
  plan: g('כל נושא כאן בא מכאב שכתבת בתיק הלקוח. אם משהו לא יושב לך, "רעיון אחר".', 'כל נושא כאן בא מכאב שכתבת בתיק הלקוח. אם משהו לא יושב לך, "רעיון אחר".'),
  content: g('כדאי לקרוא כל פוסט פעם אחת בקול. אם זה לא נשמע כמוך, תבקש ממני לשנות.', 'כדאי לקרוא כל פוסט פעם אחת בקול. אם זה לא נשמע כמוך, תבקשי ממני לשנות.'),
  flyer: 'הפלייר הזה ילך איתך לשלב 11, לפנייה החמה. אז כדאי שהוא יהיה בדיוק כמו שצריך.',
  publish: 'הפוסט של ההצעה יוצא ביום חמישי בערב. זה הזמן שבו הכי הרבה אנשים פנויים לקרוא.',
  home: 'השלב הבא שלך מחכה: מכונת התוכן.',
};

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
  const timers = useRef({});
  const phoneLayout = EMBED || window.innerWidth < 768;

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
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
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

  const jump = (id) => {
    setDev(false);
    if (id === 'home') go({ view: 'home' });
    else {
      if (STEP_SCREENS.includes(id)) setMaxPart((m) => Math.max(m, PART_OF[id]));
      go({ view: 'step', screen: id });
    }
  };
  const reset = () => {
    setState(freshState());
    setDev(false);
    setMaxPart(0);
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
            class=${cx('inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[14px] font-bold cursor-pointer', id === 'home' ? 'bg-brand-100 text-brand-600' : locked ? 'text-faint' : 'text-muted hover:bg-brand-50 hover:text-brand-600')}
            onClick=${() => (id === 'home' ? null : notify(locked ? '"לידים" נפתח בשלב 14. עד אז הלידים בכרטיס בדף הבית' : id === 'calendar' && Object.keys(state.cfg.sched).length ? 'הפריטים של השבוע מחכים ביומן' : 'במוק-אפ הפריט הזה לא פעיל', 'info'))}
          ><${Icon} name=${locked ? 'lock' : icon} size=${17} />${label}</button>`;
        })}
      </nav>
      <span class="ms-auto"></span>
      <button type="button" class="rounded-lg p-2 text-muted hover:bg-brand-50 cursor-pointer" aria-label="התראות" onClick=${() => notify('אין התראות חדשות', 'bell')}><${Icon} name="bell" size=${20} /></button>
      ${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} class="max-md:hidden" />`}
      ${devBtn}
    </header>`;
    return shell(html`${appBar}<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto"><${Home} state=${state} go=${go} onGrow=${() => setGrow(true)} /><${PartnerBubble} message=${state.cfg.done ? 'שבוע התוכן בלוח. השלב הבא: פנייה חמה, עם הפלייר שיצרת.' : SHARK_LINE.home} unread=${unread} onRead=${() => setUnread(false)} /></main>`);
  }

  // ---------- step 10 ----------
  const { cfg, flags } = state;
  const screen = route.screen;
  const part = screen in PART_OF ? PART_OF[screen] : -1;
  const idx = STEP_SCREENS.indexOf(screen);
  const toScreen = (s) => {
    setSave(null);
    setRoute({ view: 'step', screen: s });
    if (s in PART_OF && PART_OF[s] > maxPart) setMaxPart(PART_OF[s]);
  };
  const allApproved = cfg.plan.every((i) => itemState(cfg, i).approved);
  const allInCal = cfg.plan.every((i) => ['scheduled', 'manual', 'posted'].includes(cfg.sched[i.id]?.status));
  const failed = cfg.plan.some((i) => cfg.sched[i.id]?.status === 'failed');
  const reason =
    screen === 'channel' && !cfg.channels.length ? 'צריך לבחור לפחות ערוץ אחד'
    : screen === 'channel' && (cfg.channels.includes('ig') || cfg.channels.includes('fb')) && !cfg.connect ? 'צריך לבחור: לחבר, או לפרסם בעצמך'
    : screen === 'content' && !cfg.generated ? 'כריש המילים עוד כותב'
    : screen === 'content' && !allApproved ? 'צריך לאשר את שלושת הפריטים'
    : screen === 'flyer' && !cfg.flyer.saved ? 'צריך לשמור את הפלייר'
    : screen === 'publish' && failed ? 'פריט אחד לא תוזמן. לפתוח אותו ולנסות שוב'
    : screen === 'publish' && !allInCal ? 'כל פריט צריך להיות בלוח: מתוזמן, או עם תזכורת'
    : null;
  const next = screen === 'opening' ? STEP_SCREENS[0] : STEP_SCREENS[idx + 1] || 'done';
  const props = { cfg, setCfg, flags, notify, phoneLayout };
  const body = {
    opening: html`<${Opening} ...${props} />`,
    channel: html`<${ChannelScreen} ...${props} />`,
    look: html`<${LookScreen} ...${props} />`,
    plan: html`<${PlanScreen} ...${props} />`,
    content: html`<${ContentScreen} ...${props} />`,
    flyer: html`<${FlyerScreen} ...${props} />`,
    publish: html`<${PublishScreen} ...${props} />`,
    done: html`<${Done} ...${props} onGrow=${() => setGrow(true)} />`,
  }[screen];
  const firstOfPart = (i) => STEP_SCREENS.find((s) => PART_OF[s] === i);
  const top = html`<${TopBar}
    step=${STEP}
    progress=${screen === 'opening' ? null : html`<${Progress} parts=${PARTS} current=${part} maxReached=${Math.max(maxPart, part)} done=${screen === 'done'} onJump=${(i) => toScreen(firstOfPart(i))} />`}
    tools=${html`${screen !== 'done' && html`<button type="button" class="fb-home cursor-pointer whitespace-nowrap max-md:hidden" onClick=${() => (notify('דילגת על השלב. הוא נשאר פתוח במפה, ואפשר לחזור בדיוק לכאן', 'skip-forward'), go({ view: 'home' }))}><${Icon} name="skip-forward" size=${16} />דילוג על השלב</button>`}${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} class="max-md:hidden" />`}${devBtn}`}
    onHome=${() => go({ view: 'home' })}
  />`;
  const bottom = screen === 'done'
    ? html`<${BottomBar}
        extra=${html`<${Button} variant="text" onClick=${() => toScreen('publish')}><${Icon} name="calendar-days" size=${16} />ללוח של השבוע<//>`}
        primary=${html`<${PrimaryButton} label="לשלב הבא" onClick=${() => (notify('השלב הבא נפתח במפה: שלב 11, פנייה חמה', 'arrow-left'), go({ view: 'home' }))} />`}
      />`
    : html`<${BottomBar}
        back=${screen !== 'opening' && html`<${Button} variant="secondary" onClick=${() => toScreen(idx === 0 ? 'opening' : STEP_SCREENS[idx - 1])}>חזרה<//>`}
        status=${html`<${Status} reason=${reason} save=${save} />`}
        primary=${html`<${PrimaryButton}
          label=${screen === 'opening' ? 'מתחילים' : screen === 'publish' ? 'סיום השלב' : 'המשך'}
          check=${screen === 'publish'}
          disabled=${!!reason}
          onClick=${() => {
            if (screen === 'publish') setCfg({ done: true });
            toScreen(next);
          }}
        />`}
      />`;
  return shell(html`${top}
    <main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
      ${body}
      ${SHARK_LINE[screen] && html`<${PartnerBubble} message=${SHARK_LINE[screen]} unread=${unread} onRead=${() => setUnread(false)} />`}
    </main>
    ${bottom}`);
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
