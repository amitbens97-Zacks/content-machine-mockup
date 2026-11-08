// Mock data for task 5, step 10 "מכונת תוכן שיווקי". In production every line here
// comes from a step the user already finished, and nothing is asked twice:
//   business name, logo, brand colors        -> "שם ולוגו" (6)
//   field, audience, B2B or B2C, advantage   -> "אני והעסק" (2)
//   pains, trigger, where the audience is    -> "צייד הלקוחות", the client file (4)
//   tone, story, authority                   -> "דף המסרים" (7)
//   the offer, what is included, terms       -> "בניית הצעה מנצחת" (8) and the basket (3)
//   the link to the page                     -> "דף נחיתה" (9)
//   the user's photo                         -> uploaded in "דף נחיתה" (9), or here
// The mockup's "today" is fixed: Sunday 8.11.2026, 10:12.

export const PARTNER = { name: 'הכריש', role: 'השותף העסקי' };
// The shark by area (journey doc, chapter 4 ד): writing and design in this step.
export const WORDS = 'כריש המילים';
export const DESIGN = 'כריש העיצוב';

export const STEP = { n: 10, name: 'מכונת תוכן שיווקי', chapterNo: 4, chapter: 'מביאים לקוחות', icon: 'megaphone' };
// Six parts, one job each. "כתיבת התוכן" has a screen per item of the week.
export const PARTS = ['ערוצים', 'עיצוב', 'תוכנית לשבוע', 'כתיבת התוכן', 'פלייר', 'תזמון'];
// Screens of the step and the part each one belongs to.
export const STEP_SCREENS = ['channel', 'look', 'plan', 'item1', 'item2', 'item3', 'flyer', 'publish'];
export const PART_OF = { channel: 0, look: 1, plan: 2, item1: 3, item2: 3, item3: 3, flyer: 4, publish: 5 };
export const ITEM_SCREENS = ['item1', 'item2', 'item3'];
// What the main button leads to, in words.
export const SCREEN_NAME = { channel: 'ערוצים', look: 'עיצוב', plan: 'תוכנית לשבוע', item1: 'פריט 1', item2: 'פריט 2', item3: 'פריט 3', flyer: 'פלייר', publish: 'תזמון', done: 'סיום' };
export const partLabel = (i) => `חלק ${i + 1} מתוך ${PARTS.length} · ${PARTS[i]}`;

// The demo user: a therapist with a small private clinic, the same business as in task 4.
// FlowBiz knows how each user asked to be addressed (זכר / נקבה): ?user=f|m or Shift+D.
const PHOTO = (id) => `https://images.unsplash.com/${id}?w=900&h=1100&fit=crop&crop=faces&q=80`;
const PROFILES = {
  m: { gender: 'm', firstName: 'דניאל', fullName: 'דניאל כהן', slug: 'danielcohen', photo: PHOTO('photo-1705645930353-0e335311ef20') },
  f: { gender: 'f', firstName: 'דניאלה', fullName: 'דניאלה כהן', slug: 'danielacohen', photo: PHOTO('photo-1792488954237-3fad5b5a8a4e') },
};
const GENDER_KEY = 'flowbiz-cm-gender';
function pickGender() {
  try {
    const q = new URLSearchParams(location.search).get('user');
    if (q === 'f' || q === 'm') {
      localStorage.setItem(GENDER_KEY, q);
      return q;
    }
    return localStorage.getItem(GENDER_KEY) === 'f' ? 'f' : 'm';
  } catch {
    return 'm';
  }
}
export const GENDER = pickGender();
export const g = (m, f) => (GENDER === 'f' ? f : m);
export function setDemoGender(v) {
  try {
    localStorage.setItem(GENDER_KEY, v);
  } catch {}
  const u = new URL(location.href);
  u.searchParams.set('user', v);
  location.href = u.toString();
}

export const USER = {
  ...PROFILES[GENDER],
  business: 'מרחב שקט',
  kind: g('מטפל רגשי', 'מטפלת רגשית'),
  role: g('עובד סוציאלי קליני', 'עובדת סוציאלית קלינית'),
  advantage: g('עובד סוציאלי קליני, 8 שנים בטיפול CBT בחרדה', 'עובדת סוציאלית קלינית, 8 שנים בטיפול CBT בחרדה'),
  audience: 'מבוגרים ונוער מגיל 16 שמתמודדים עם חרדה',
  where: 'אינסטגרם, ופייסבוק בקבוצות של הורים ושל בריאות נפשית',
  phone: '052-4567890',
  place: 'קליניקה ברמת גן, או בזום',
  b2b: false,
};

export const ROOT_DOMAIN = 'flowbiz.co.il';
export const PAGE_LINK = `${USER.slug}.${ROOT_DOMAIN}/cbt`;
// The link carries the source, so a lead that came from a post shows "פוסט" in the leads table.
export const postLink = (itemId) => `${PAGE_LINK}?src=post-${itemId}`;

// From "שם ולוגו" (6): the logo and the colors taken from it.
export const BRAND = {
  logo: 'assets/brand/logo.svg',
  primary: '#2f6f6a',
  accent: '#e3a868',
  dark: '#1f3b3a',
  light: '#eef4f1',
  swatches: ['#2f6f6a', '#e3a868', '#1f3b3a', '#9cc3b5', '#c97b5a'],
};

// The Meta accounts the demo user has (shown after "חיבור").
export const META = {
  ig: { handle: 'merchav.shaket', kind: 'חשבון מקצועי', followers: 412 },
  fb: { page: 'מרחב שקט · טיפול בחרדה', likes: 236 },
};

// The platforms of the step. Instagram and Facebook connect (schedule and publish);
// LinkedIn is offered to B2B businesses, with copy and download only.
export const PLATFORMS = [
  { id: 'ig', label: 'אינסטגרם', icon: 'instagram', connect: true },
  { id: 'fb', label: 'פייסבוק', icon: 'facebook', connect: true },
  { id: 'li', label: 'לינקדאין', icon: 'linkedin', connect: false },
];

// ---------- The 10 branding templates (skills pack, page 18) ----------
// Every template: its own layout, type and marks. The colors come from the user's
// logo (contrast checked at 4.5:1); "צבעי התבנית" shows the template's own palette.
// Choosing is two steps: first a style, then a template, previewed with the user's name.
export const STYLES = [
  { id: 'soft', label: 'רך וחם' },
  { id: 'clean', label: 'נקי ומקצועי' },
  { id: 'bold', label: 'נועז ואנרגטי' },
  { id: 'calm', label: 'שקט ויוקרתי' },
];
export const TEMPLATES = [
  { id: 't1', n: 1, name: 'רך ומרפא', forWho: 'טיפול רגשי', style: 'soft', decor: 'blobs', font: 'Varela Round', own: { bg: '#f6efe9', ink: '#3d3a3a', a: '#c98b8b', b: '#9fb8a3' } },
  { id: 't4', n: 4, name: 'חם ואישי', forWho: 'הדרכת הורים', style: 'soft', decor: 'polaroid', font: 'Assistant', own: { bg: '#f4ead8', ink: '#4a3b2c', a: '#b5653c', b: '#e2b26b' } },
  { id: 't6', n: 6, name: 'אופטימי ומזמין', forWho: 'אימון אישי', style: 'soft', decor: 'sun', font: 'Rubik', own: { bg: '#fff6dc', ink: '#2f3a4a', a: '#f2a516', b: '#4aa3c7' } },
  { id: 't2', n: 2, name: 'נקי ומקצועי', forWho: 'ייעוץ עסקי', style: 'clean', decor: 'grid', font: 'Heebo', own: { bg: '#ffffff', ink: '#1d2433', a: '#ffd23f', b: '#1d2433' } },
  { id: 't8', n: 8, name: 'עריכתי וחד', forWho: 'יועצים ומרצים', style: 'clean', decor: 'magazine', font: 'Heebo', own: { bg: '#f7f5f0', ink: '#141414', a: '#d6362f', b: '#141414' } },
  { id: 't9', n: 9, name: 'רענן וקליל', forWho: 'תזונה וכושר', style: 'clean', decor: 'cuts', font: 'Rubik', own: { bg: '#f0faf6', ink: '#16372e', a: '#3cc49a', b: '#ffb347' } },
  { id: 't3', n: 3, name: 'אנרגטי ונועז', forWho: 'אימון מכירות', style: 'bold', decor: 'diagonal', font: 'Secular One', dark: true, own: { bg: '#161616', ink: '#ffffff', a: '#c6f432', b: '#ff7a1a' } },
  { id: 't10', n: 10, name: 'נשי וחזק', forWho: 'מנטורינג לנשים', style: 'bold', decor: 'arches', font: 'Secular One', own: { bg: '#fff0f6', ink: '#3a0f2a', a: '#d6247a', b: '#ffb3d1' } },
  { id: 't5', n: 5, name: 'שקט ויוקרתי', forWho: 'מנטורינג אישי', style: 'calm', decor: 'frame', font: 'Heebo', dark: true, own: { bg: '#2a1d2e', ink: '#f6efe6', a: '#c9a45c', b: '#6d4f75' } },
  { id: 't7', n: 7, name: 'רוחני ומדיטטיבי', forWho: 'מיינדפולנס', style: 'calm', decor: 'moon', font: 'Varela Round', dark: true, own: { bg: '#18233f', ink: '#eef1fb', a: '#f2d48b', b: '#7f8fd6' } },
];
export const RECOMMENDED_TEMPLATE = 't1';

// ---------- The week ----------
export const WEEK = [
  { id: 'sun', label: 'ראשון', short: 'א׳', date: '8.11' },
  { id: 'mon', label: 'שני', short: 'ב׳', date: '9.11' },
  { id: 'tue', label: 'שלישי', short: 'ג׳', date: '10.11' },
  { id: 'wed', label: 'רביעי', short: 'ד׳', date: '11.11' },
  { id: 'thu', label: 'חמישי', short: 'ה׳', date: '12.11' },
  { id: 'fri', label: 'שישי', short: 'ו׳', date: '13.11' },
  { id: 'sat', label: 'שבת', short: 'ש׳', date: '14.11' },
];
export const TYPES = [
  { id: 'value', label: 'ערך', sub: 'טיפ אחד שאפשר ליישם היום', icon: 'lightbulb' },
  { id: 'story', label: 'מהניסיון שלי', sub: 'משהו שלמדת בעבודה, לא סיפור על לקוח', icon: 'notebook-pen' },
  { id: 'offer', label: 'הצעה', sub: 'ההצעה משלב 8, בלי דחיפות ובלי מחיר שלא קבעת', icon: 'gift' },
];
export const FORMATS = [
  { id: 'post', label: 'פוסט', icon: 'square' },
  { id: 'carousel', label: 'קרוסלה', icon: 'gallery-horizontal' },
  { id: 'reel', label: 'רילס', icon: 'clapperboard' },
];

// ---------- The topics. In production the model writes them from the client file ----------
// Every topic has what all three formats need, so changing the format keeps the topic.
// First person follows the user's gender; the audience is always addressed in plural.
export const TOPICS = {
  v1: {
    type: 'value', title: 'למה הראש לא נרגע דווקא בלילה', pain: 'לילות שהראש לא מפסיק לחשוב',
    hooks: ['שוכבים במיטה, והראש רק מתחיל לעבוד?', 'למה המחשבות הכי מפחידות מגיעות דווקא בלילה', 'אם הלילה הוא הזמן הכי קשה שלכם, זה בשבילכם'],
    insight: 'בלילה אין הסחות, ולכן המוח מתפנה לסרוק את כל מה שלא נסגר במהלך היום.',
    reason: 'זה לא סימן שמשהו לא בסדר אתכם. זה מנגנון שנועד לשמור עליכם, והוא פשוט עובד שעות נוספות.',
    example: 'למשל: שיחה לא נעימה מהבוקר חוזרת שוב ושוב, בדיוק כשמכבים את האור.',
    points: ['לכתוב על דף את מה שמטריד, שעה לפני השינה', 'לקבוע "זמן דאגה" של 10 דקות בערב, לא במיטה', 'נשימה איטית: 4 שניות שאיפה, 6 שניות נשיפה'],
    question: 'מה הדבר שהכי מעסיק אתכם כשאתם מנסים להירדם?',
    cta: 'שמרו את הפוסט לערב הבא',
  },
  v2: {
    type: 'value', title: 'הימנעות: מרגיעה עכשיו, מכבידה אחר כך', pain: 'להימנע ממקומות ומאנשים כדי לא להרגיש חרדה',
    hooks: ['ויתרתם על אירוע רק כדי לא להרגיש את זה?', 'ההקלה של "לא ללכת" עולה יותר ממה שנדמה', 'כל פעם שנמנעים, החרדה לומדת משהו'],
    insight: 'הימנעות מורידה את החרדה לרגע, אבל מלמדת את המוח שהמקום באמת מסוכן.',
    reason: 'ככה העולם נהיה קטן יותר בהדרגה, בלי שמרגישים מתי זה קרה.',
    example: 'למשל: מוותרים פעם אחת על נסיעה ברכבת, ואחרי חודש כבר קשה לחשוב עליה.',
    points: ['לבחור צעד אחד קטן מאוד, לא את הכי מפחיד', 'להישאר בו עד שהגוף נרגע, גם אם זה לוקח זמן', 'לחזור עליו כמה פעמים לפני הצעד הבא'],
    question: 'מה הדבר הקטן שהייתם רוצים לחזור לעשות?',
    cta: 'שמרו לפעם הבאה שבא לוותר',
  },
  v3: {
    type: 'value', title: 'התקף חרדה: מה קורה בגוף בדקות הראשונות', pain: 'התקפי חרדה שמגיעים בלי אזהרה',
    hooks: ['הלב דופק, חסר אוויר, ונדמה שזה לא ייגמר', 'מה קורה בגוף בהתקף חרדה, בדקה אחת', 'התקף חרדה מרגיש כמו סכנה. הוא לא'],
    insight: 'התקף חרדה מגיע לשיא בתוך דקות ספורות ואז יורד, גם כשלא עושים כלום.',
    reason: 'כשיודעים את זה, הפחד מהתחושות עצמן קטן, וזה מה שמקצר את ההתקף.',
    example: 'למשל: לב שדופק מהר הוא אותה תגובה שיש לגוף בעלייה במדרגות.',
    points: ['לקרוא לזה בשם: "זה התקף, והוא יעבור"', 'להאט את הנשיפה, לא את השאיפה', 'לשים לב לחמישה דברים שרואים סביב'],
    question: 'מה עוזר לכם כשזה מתחיל?',
    cta: 'שמרו, ושלחו למי שצריך',
  },
  s1: {
    type: 'story', title: 'מה למדתי מ-8 שנים בקליניקה על חרדה', pain: 'לנסות להבין את החרדה ולא להצליח להרגיש טוב יותר',
    hooks: ['8 שנים בקליניקה לימדו אותי דבר אחד על חרדה', g('הטעות שעשיתי בשנה הראשונה שלי כמטפל', 'הטעות שעשיתי בשנה הראשונה שלי כמטפלת'), 'מה שלא לימדו אותי בלימודים על חרדה'],
    insight: 'חרדה כמעט אף פעם לא נעלמת מהסבר. היא קטנה מהתנסות, צעד אחרי צעד.',
    reason: g('בהתחלה הייתי מסביר הרבה. עם השנים הבנתי שההבנה חשובה, אבל השינוי קורה כשעושים.', 'בהתחלה הייתי מסבירה הרבה. עם השנים הבנתי שההבנה חשובה, אבל השינוי קורה כשעושים.'),
    example: 'היום כל מפגש אצלי נגמר בצעד קטן אחד לשבוע הקרוב.',
    points: ['הבנה לבד לא מספיקה, צריך גם לנסות', 'צעדים קטנים עובדים יותר מקפיצות', 'נסיגה בדרך היא חלק מהתהליך, לא כישלון'],
    question: 'מה עזר לכם יותר: להבין, או לנסות?',
    cta: 'שמרו את זה לרגע שבא לוותר',
  },
  s2: {
    type: 'story', title: 'למה בחרתי לעבוד דווקא עם חרדה', pain: 'להרגיש שאף אחד לא מבין מה עובר עליכם',
    hooks: ['למה בחרתי לעבוד דווקא עם חרדה', 'שואלים אותי למה דווקא חרדה. זו התשובה', 'הסיבה שאני עושה את העבודה הזו'],
    insight: 'בחרדה רואים שינוי ברור יחסית מהר, כשעובדים בשיטה ובקצב הנכון.',
    reason: g('זה מה שמחזיק אותי 8 שנים בתחום: לראות אנשים חוזרים לדברים שוויתרו עליהם.', 'זה מה שמחזיק אותי 8 שנים בתחום: לראות אנשים חוזרים לדברים שוויתרו עליהם.'),
    example: 'נסיעה, עבודה, ערב עם חברים. דברים רגילים שפתאום שוב אפשריים.',
    points: ['חרדה היא תגובה, לא תכונה', 'אפשר ללמוד לעבוד איתה', 'לא צריך לחכות שיהיה "ממש גרוע"'],
    question: 'מה הייתם רוצים לחזור לעשות?',
    cta: 'שמרו, או שתפו מישהו שזה בשבילו',
  },
  o1: {
    type: 'offer', title: 'תהליך CBT לחרדה, 12 מפגשים', pain: 'לתכנן את כל היום סביב החרדה',
    hooks: ['12 מפגשים כדי לחזור לישון בשקט', 'רוצים להפסיק לתכנן את היום סביב החרדה?', 'תהליך קצר וממוקד לחרדה, גם בזום'],
    sub: 'תהליך CBT ממוקד, עם צעד מעשי אחד בכל שבוע',
    insight: 'תהליך CBT ממוקד, עם צעד מעשי אחד בכל שבוע.',
    reason: '',
    example: '',
    points: ['להבין מה מפעיל את החרדה אצלכם', 'כלים להתקף, שעובדים גם ברגע עצמו', 'לחזור בהדרגה למקומות שוויתרתם עליהם', 'תוכנית כתובה להמשך, גם אחרי התהליך'],
    who: g(`אני ${PROFILES.m.fullName}, עובד סוציאלי קליני, 8 שנים בטיפול CBT בחרדה.`, `אני ${PROFILES.f.fullName}, עובדת סוציאלית קלינית, 8 שנים בטיפול CBT בחרדה.`),
    forWho: 'למבוגרים ולנוער מגיל 16, בקליניקה ברמת גן או בזום.',
    question: '',
    cta: 'לשיחת היכרות קצרה, בלי עלות',
  },
};
export const TOPIC_CHOICES = { value: ['v1', 'v2', 'v3'], story: ['s1', 's2'], offer: ['o1'] };

// The offer from "בניית הצעה מנצחת" (8), for the flyer.
export const OFFER = {
  title: 'לחזור לישון בשקט',
  sub: 'תהליך CBT לחרדה, 12 מפגשים',
  points: ['כלים להתקף, שעובדים גם ברגע עצמו', 'צעד מעשי אחד בכל שבוע', 'בקליניקה ברמת גן או בזום'],
  price: '4,200 ₪',
  terms: 'אפשר ב-3 תשלומים',
  cta: 'לשיחת היכרות בלי עלות',
};

// The week the step starts with (the shark's plan): one offer at most, and only
// because there is an offer from step 8.
export const START_PLAN = [
  { id: 'i1', day: 'sun', time: '20:30', topic: 'v1', format: 'post' },
  { id: 'i2', day: 'tue', time: '12:30', topic: 's1', format: 'carousel' },
  { id: 'i3', day: 'thu', time: '19:30', topic: 'o1', format: 'reel' },
];

// Message line and bio, three versions each (skills pack: "משפט מסר וביו").
export const MESSAGE_LINES = [
  { id: 'pain', label: 'מהכאב', text: 'חרדה לא צריכה לנהל לכם את היום.' },
  { id: 'aud', label: 'מהקהל', text: 'טיפול CBT לחרדה למבוגרים ולנוער, בקליניקה ברמת גן ובזום.' },
  { id: 'res', label: 'מהתוצאה', text: 'לחזור לישון, לנסוע ולהיפגש, בלי לתכנן הכול סביב הפחד.' },
];
export const BIOS = [
  [`${PROFILES[GENDER].fullName} · ${g('עובד סוציאלי קליני', 'עובדת סוציאלית קלינית')} · CBT לחרדה`, g('עוזר למבוגרים ולנוער לחזור לחיים בלי לתכנן סביב הפחד', 'עוזרת למבוגרים ולנוער לחזור לחיים בלי לתכנן סביב הפחד'), 'לשיחת היכרות בלי עלות ↓'],
  ['מרחב שקט · טיפול בחרדה', 'כלים מעשיים לחרדה, צעד אחד בכל שבוע', 'קליניקה ברמת גן · זום ↓'],
  ['חרדה היא תגובה, לא תכונה', `${g('מטפל', 'מטפלת')} CBT · 8 שנים בקליניקה`, 'טיפים כל שבוע, ושיחת היכרות ↓'],
];

// Grow AI: audience growth on Instagram (follow / unfollow by daily quotas). FlowBiz only
// passes what Grow needs, straight to Grow's API. Nothing is kept on FlowBiz's side.
export const GROW = {
  needs: ['3 עד 5 עמודי אינסטגרם דומים, שהקהל שלך עוקב אחריהם', 'שם המשתמש באינסטגרם', 'הסיסמה לאינסטגרם, שעוברת ישר ל-Grow'],
};
