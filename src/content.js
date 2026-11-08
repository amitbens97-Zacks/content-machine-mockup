// The content engine of the step, as the skills pack defines it (pages 12-13, 17, 19-20):
// the shapes of a post, a carousel and a reel, the word limits, and the checks that run
// on every text before the user sees it. In production the model writes the words; the
// shapes, the limits and the checks are code, the same as here.
import { TOPICS, USER, g, postLink } from './data.js';

export const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;

// Word limits per field (skills pack, "מגבלות מילים"). Enforced in code: a text over
// the limit goes back to the model to shorten, up to twice, and only then to the user.
export const LIMITS = {
  coverTitle: 12, coverSub: 14, coverOpener: 6, coverSwipe: 6,
  slideTitle: 9, slideBody: 40, slideOpener: 3,
  sumTitle: 6, sumPoint: 9,
  ctaTitle: 10, ctaSave: 11,
  quote: 26,
  hookWords: 8, hookChars: 40,
  capWords: 3, capChars: 15,
};

export const topicOf = (item) => TOPICS[item.topic];

// ---------- the checks on every text ----------
// Names: against the leads table, so a real client's name never reaches a post.
// The geresh is normalized first (ג'ני, ג׳ני and ג`ני are the same name).
const LEAD_NAMES = ['נועה', 'יעל', 'אורן', 'שירה', 'רונית', 'גיא', 'ג׳ני'];
const norm = (s) => (s || '').replace(/['`’״]/g, '׳');
const BANNED = ['מגוון', 'ייחודי', 'מקיף', 'משמעותי', 'חדשני'];
export function checkText(s) {
  const t = norm(s);
  const out = [];
  const names = LEAD_NAMES.filter((n) => new RegExp(`(^|[\\s,.!?:"(])[ובכלמשה]?${n}($|[\\s,.!?:")])`).test(t));
  if (names.length) out.push({ id: 'name', names, text: `${names.length > 1 ? 'השמות' : 'השם'} ${names.join(', ')} ${names.length > 1 ? 'מופיעים' : 'מופיע'} בטבלת הלידים. בתוכן לא כותבים על לקוח מסוים, גם לא בשם אחר.` });
  const bad = BANNED.filter((w) => t.includes(w));
  if (bad.length) out.push({ id: 'word', text: `"${bad[0]}" לא נכנס לתוכן. כדאי מילה מוחשית יותר.` });
  if (/[—–]/.test(t)) out.push({ id: 'dash', text: 'בלי קו מפריד ארוך. עדיף נקודה או פסיק.' });
  if (/\d+%|מובטח|רק היום|נשארו \d/.test(t)) out.push({ id: 'claim', text: 'תוצאה, מספר או דחיפות שלא מופיעים בפרופיל לא נכנסים לתוכן.' });
  return out;
}

// ---------- post: 3 versions with different hooks (long / medium / short) ----------
export function postVersions(t, item) {
  if (t.type === 'offer') {
    const body = (hook) => [hook, t.sub, '', ...t.points.map((p) => `✓ ${p}`), '', t.who, t.forWho, '', `${t.cta}: ${postLink(item.id)}`].join('\n');
    return [
      { id: 'long', label: 'ארוכה', hook: t.hooks[0], text: body(t.hooks[0]), diff: 'פותחת בתוצאה, עם כל מה שכלול בתהליך' },
      { id: 'medium', label: 'בינונית', hook: t.hooks[1], text: [t.hooks[1], t.sub, '', ...t.points.slice(0, 3).map((p) => `✓ ${p}`), '', t.forWho, `${t.cta}: ${postLink(item.id)}`].join('\n'), diff: 'פותחת בשאלה לקהל, שלוש נקודות במקום ארבע' },
      { id: 'short', label: 'קצרה', hook: t.hooks[2], text: [t.hooks[2], t.sub, '', `${t.cta}: ${postLink(item.id)}`].join('\n'), diff: 'פותחת במה שזה, ומשאירה את הפרטים לדף' },
    ];
  }
  return [
    { id: 'long', label: 'ארוכה', hook: t.hooks[0], text: [t.hooks[0], '', `${t.insight} ${t.reason}`, '', t.example, '', t.question].join('\n'), diff: 'פותחת בשאלה, ויש בה דוגמה מהיומיום' },
    { id: 'medium', label: 'בינונית', hook: t.hooks[1], text: [t.hooks[1], '', `${t.insight} ${t.reason}`, '', t.question].join('\n'), diff: 'פותחת בהבטחה להסבר, בלי הדוגמה' },
    { id: 'short', label: 'קצרה', hook: t.hooks[2], text: [t.hooks[2], '', t.insight, '', t.question].join('\n'), diff: 'פותחת בפנייה ישירה, משפט אחד ושאלה' },
  ];
}
// The image of a post: one quote, up to 26 words.
export const postQuote = (t) => (t.type === 'offer' ? t.hooks[0] : t.insight);

// Changes the user can ask for. Each one shows "before → after" and waits for "כן".
export const CHANGES = [
  { id: 'shorter', label: 'קצר יותר' },
  { id: 'hook', label: 'פתיח אחר' },
  { id: 'personal', label: 'יותר אישי' },
];
export function applyChange(kind, text, t) {
  const lines = text.split('\n');
  if (kind === 'shorter') return lines.filter((l, i) => i === 0 || (l.trim() && !l.startsWith('למשל'))).slice(0, 4).join('\n\n');
  if (kind === 'hook') {
    const i = t.hooks.indexOf(lines[0]);
    lines[0] = t.hooks[(i + 1) % t.hooks.length];
    return lines.join('\n');
  }
  if (kind === 'personal') {
    const add = 'אני רואה את זה כמעט כל שבוע בקליניקה.';
    if (text.includes(add)) return text;
    return [lines[0], '', add, ...lines.slice(1)].join('\n');
  }
  return text;
}

// ---------- carousel: 5 to 7 slides, 1080x1350 ----------
// cover (the pain), one idea per slide, a summary of 2-4 points, CTA with a save line.
export function carouselSlides(t) {
  const opener = { value: 'טיפ לשבוע', story: 'מהקליניקה', offer: USER.business }[t.type];
  const slides = [{ kind: 'cover', title: t.hooks[0], sub: t.type === 'offer' ? t.sub : `${t.pain}?`, opener, swipe: 'החליקו לצד' }];
  if (t.type === 'offer') {
    t.points.forEach((p, i) => slides.push({ kind: 'content', n: i + 1, title: p, body: '' }));
    slides.push({ kind: 'summary', title: 'למי זה מתאים', points: [t.forWho.replace(/\.$/, '')] });
  } else {
    slides.push({ kind: 'content', n: 1, title: 'מה קורה כאן', body: t.insight });
    slides.push({ kind: 'content', n: 2, title: 'למה זה חשוב', body: t.reason });
    slides.push({ kind: 'content', n: 3, title: 'איך זה נראה', body: t.example.replace(/^למשל: /, '') });
    slides.push({ kind: 'summary', title: 'בקצרה', points: t.points });
  }
  slides.push({ kind: 'cta', title: t.type === 'offer' ? t.cta : t.question, save: t.type === 'offer' ? `הקישור בביו · ${USER.business}` : t.cta });
  return slides;
}
// The fields of a slide, each with its limit, for the counters and the check.
export function slideFields(s) {
  if (s.kind === 'cover') return [['title', 'כותרת', LIMITS.coverTitle], ['sub', 'כותרת משנה', LIMITS.coverSub], ['opener', 'שורת פתיחה', LIMITS.coverOpener]];
  if (s.kind === 'content') return [['title', 'כותרת', LIMITS.slideTitle], ['body', 'גוף', LIMITS.slideBody]];
  if (s.kind === 'summary') return [['title', 'כותרת', LIMITS.sumTitle]];
  return [['title', 'כותרת', LIMITS.ctaTitle], ['save', 'שורת שמירה', LIMITS.ctaSave]];
}
export const carouselCaption = (t) => [t.hooks[0], '', t.insight, '', t.question].join('\n');

// ---------- reel: 3 hooks and a 30-45 second script ----------
export function reelScript(t) {
  const pts = t.points.slice(0, 3);
  return [
    { at: '0-3', say: t.hooks[0], screen: t.hooks[0] },
    { at: '3-10', say: `${t.pain}? זה מוכר להרבה אנשים.`, screen: `${t.pain}?` },
    ...pts.map((p, i) => ({ at: `${10 + i * 7}-${17 + i * 7}`, say: p, screen: p.split(' ').slice(0, 4).join(' ') })),
    { at: `${10 + pts.length * 7}-${16 + pts.length * 7}`, say: t.type === 'offer' ? `${t.who} ${t.cta}, בקישור בביו.` : `${t.question} ${t.cta}.`, screen: t.type === 'offer' ? t.cta : t.cta },
  ];
}
export const reelCaption = (t) => (t.type === 'offer' ? [t.hooks[0], t.sub, '', `${t.cta}: הקישור בביו`].join('\n') : [t.hooks[0], '', t.insight, '', t.question].join('\n'));

// The video the demo user uploads, as the transcription returns it. One sentence mentions
// a lead by name, so the name check stops it.
export const TRANSCRIPT = [
  'רוצים להפסיק לתכנן את היום סביב החרדה?',
  g(`אני ${USER.firstName}, עובד סוציאלי קליני, ואני עובד עם חרדה כבר שמונה שנים.`, `אני ${USER.firstName}, עובדת סוציאלית קלינית, ואני עובדת עם חרדה כבר שמונה שנים.`),
  'כמו שאמרתי לנועה בשבוע שעבר, הבנה לבד לא מספיקה.',
  'בתהליך של שתים עשרה פגישות לומדים מה מפעיל את החרדה, ומקבלים כלים להתקף.',
  'וכל שבוע עושים צעד אחד קטן.',
  'לשיחת היכרות בלי עלות, הקישור בביו.',
];
// Captions: up to 3 words and 15 characters a line; a line ends at the end of a sentence
// or after a pause of 0.45s; it leaves the screen 0.4s after its last word.
export function captionLines(sentences) {
  const out = [];
  sentences.forEach((s, si) => {
    let cur = [];
    s.split(/\s+/).filter(Boolean).forEach((w) => {
      const next = [...cur, w].join(' ');
      if (cur.length && (cur.length >= LIMITS.capWords || next.length > LIMITS.capChars)) {
        out.push({ s: si, text: cur.join(' ') });
        cur = [w];
      } else cur.push(w);
    });
    if (cur.length) out.push({ s: si, text: cur.join(' ') });
  });
  let t = 0;
  return out.map((l, i) => {
    const d = 0.35 * words(l.text) + 0.4;
    const r = { id: `c${i}`, ...l, from: t, to: t + d };
    t += d + 0.1;
    return r;
  });
}
export const fmtSec = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// The processing of a reel (skills pack, page 17). Runs on a server; the user waits on this list.
export const REEL_STAGES = [
  { id: 'up', label: 'העלאת הסרטון', sub: 'עד 3 דקות' },
  { id: 'tr', label: 'תמלול בעברית', sub: 'ivrit-ai turbo' },
  { id: 'names', label: 'בדיקת שמות', sub: 'מול טבלת הלידים' },
  { id: 'cut', label: 'קיצור שתיקות', sub: 'שתיקה מעל 0.7 שניות מתקצרת ל-0.3' },
  { id: 'clean', label: 'ניקוי רעשים', sub: 'רק כשרעש הרקע מעל 50- dB' },
  { id: 'caps', label: 'כתוביות והוק', sub: 'עד 3 מילים בשורה, ההוק למעלה כל הסרטון' },
];
