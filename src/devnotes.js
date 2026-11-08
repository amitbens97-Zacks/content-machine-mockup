// Developer notes for task 5, a jump list of every screen, and switches for the
// edge cases (Shift+D).
import { html, Icon, cx } from './lib.js';
import { GENDER, setDemoGender } from './data.js';

export const JUMPS = [
  { id: 'opening', label: 'שלב 10: מסך פתיחה' },
  { id: 'channel', label: 'חלק 1: ערוצים' },
  { id: 'look', label: 'חלק 2: עיצוב' },
  { id: 'plan', label: 'חלק 3: תוכנית לשבוע' },
  { id: 'item1', label: 'חלק 4: כתיבת התוכן, פריט 1' },
  { id: 'item2', label: 'חלק 4: כתיבת התוכן, פריט 2' },
  { id: 'item3', label: 'חלק 4: כתיבת התוכן, פריט 3' },
  { id: 'flyer', label: 'חלק 5: פלייר' },
  { id: 'publish', label: 'חלק 6: תזמון' },
  { id: 'done', label: 'סיום השלב' },
  { id: 'home', label: 'דף הבית' },
];

const SWITCHES = [
  ['b2b', 'עסק B2B: ההמלצה היא לינקדאין ופייסבוק'],
  ['noOffer', 'אין עדיין הצעה (שלב 8 לא הושלם)'],
  ['noLogo', 'אין לוגו (שלב 6 לא הושלם)'],
  ['noPhoto', 'אין תמונה בדף הנחיתה'],
  ['personalIg', 'אינסטגרם הוא חשבון אישי'],
  ['noPage', 'אין עמוד עסקי בפייסבוק'],
  ['failPublish', 'התזמון באינסטגרם נכשל'],
  ['growSub', 'Grow כלול במנוי'],
];

const NOTES = [
  {
    title: 'מה יש כאן',
    items: [
      'שלב 10 בנוי מחדש בשישה חלקים, לכל חלק תפקיד אחד: ערוצים, עיצוב, תוכנית לשבוע, כתיבת התוכן (מסך לכל פריט: פוסט, קרוסלה, רילס), פלייר, ותזמון. מחליף את 5 השלבים של marketing-agent.', 'הניווט: פס חלקים ממוספר מתחת לכותרת, תמיד גלוי. בחלק 4 הוא מראה גם "פריט X מתוך 3". הכפתור הראשי אומר לאן הוא מוביל, ובכתיבת התוכן הוא גם מאשר את הפריט.',
      'מחולל הפליירים עובר לכאן (החלטה מ-29.10). הפלייר נשמר בקבצים, ושלב 11 (פנייה חמה) משתמש בו בלי לשאול שוב צבעים וסגנון.',
      'סיום השלב: הפלייר נשמר, ושלושת הפריטים בלוח (מתוזמנים או עם תזכורת לפרסום ידני). רילס עם סרטון ו-Grow לא חובה.',
      'תג בסיום: "המכפיל", 1,200 ₪.',
    ],
  },
  {
    title: 'מאיפה הנתונים',
    items: [
      'שם, לוגו וצבעים: שלב 6. תחום, קהל, B2B או B2C, היתרון: שלב 2. כאבים, טריגר, איפה הקהל: תיק הלקוח, שלב 4. טון וסיפור: דף המסרים, שלב 7. ההצעה, מחיר ותנאים: שלב 8 והסל. הקישור והתמונה: דף הנחיתה, שלב 9.',
      'שום דבר מאלה לא נשאל שוב. מה שמולא מסומן "מילאנו לפי". מה שחסר: ההודעה אומרת איזה שלב משלים אותו, והשלב ממשיך בלי (ראו המתגים).',
    ],
  },
  {
    title: 'כללי התוכן (חבילת הסקילים, עמ׳ 12-13, 19-20)',
    items: [
      'תמיד: ערך כללי לקהל, פנייה ברבים, שמות עצם מפורשים, "למה", קריאה אחת לפעולה, הקול של המשתמש (מהטקסטים שהדביק, אם הדביק).',
      'אף פעם: סיפור על לקוח מסוים, גם בשם בדוי. המלצות. תוצאות, מספרים או דחיפות שלא בפרופיל. מחיר או הצעה שלא בפרופיל. פרטי מטופלים.',
      'פוסט ערך: כאב במילים של הקהל, הוק, תובנה אחת עם הסיבה, דוגמה קצרה, שאלה קטנה. 3 גרסאות (ארוכה, בינונית, קצרה) עם הוק שונה ושורת "מה שונה כאן".',
      'פוסט הצעה: הוק, כותרת משנה, 3-4 נקודות תוצאה, מי אני, למי זה, קריאה אחת. בין 19:00 ל-20:00.',
      'תוכנית שבועית: ברירת מחדל 3 פריטים. הצעה אחת לכל 3-4 של ערך, אז ב-3 פריטים הצעה אחת לכל היותר, ורק כשיש הצעה.',
      'שפה: בלי קו מפריד ארוך, בלי "מגוון / ייחודי / מקיף / משמעותי / חדשני". קהל ברבים, ברבות כשרובו נשים. תאריכים במילים. 2,800 ₪.',
      'כל שינוי שהכריש מציע מוצג "לפני / אחרי", ונכנס רק אחרי "כן". שום דבר לא מתפרסם בלי "לתזמן" מפורש.',
    ],
  },
  {
    title: 'מגבלות מילים (נאכפות בקוד)',
    items: [
      'שער: כותרת 12, משנה 14, שורת פתיחה 6, רמז החלקה 6. שקופית: כותרת 9, גוף 40. סיכום: כותרת 6, 2-4 נקודות עד 9 מילים. CTA: כותרת 10, שורת שמירה 11. ציטוט בתמונת פוסט: 26.',
      'הוק לרילס: עד 8 מילים ו-40 תווים. כתובית: עד 3 מילים ו-15 תווים.',
      'טקסט מעל המגבלה חוזר למודל לקיצור, עד פעמיים. רק אם עדיין ארוך, המשתמש רואה אותו באדום עם "כריש המילים יקצר".',
    ],
  },
  {
    title: 'בדיקות על כל טקסט',
    items: [
      'שמות מול טבלת הלידים, אחרי נרמול גרש (ג\'ני = ג׳ני), גם עם אות שימוש (לנועה). גם בתמלול של רילס.',
      'מילים אסורות, קו מפריד ארוך, אחוזים ו"מובטח" / "רק היום". ההערה מוצגת מתחת לשדה (src/content.js, checkText).',
    ],
  },
  {
    title: 'התבניות (עמ׳ 18)',
    items: [
      '10 תבניות, בחירה בשני צעדים: סגנון (רך וחם, נקי ומקצועי, נועז ואנרגטי, שקט ויוקרתי), ואז תבנית עם תצוגה בשם של המשתמש.',
      'הצבעים מהלוגו כברירת מחדל, עם בדיקת ניגודיות 4.5:1. נכשל: הטקסט עובר לכמעט-שחור או לבן.',
      'בדיקה אוטומטית לכל פריים: גלישת טקסט, שוליים, הפינה של מונה האינסטגרם, גודל מינימלי. אין סימן של FlowBiz על תוכן של המשתמש.',
      'גדלים: 1080×1350 לפוסט ולקרוסלה, 1080×1920 לרילס, A4 לפלייר להדפסה. התצוגה במוקאפ מצוירת בגודל האמיתי ומוקטנת (src/art.js).',
    ],
  },
  {
    title: 'רילס (עמ׳ 17)',
    items: [
      'רץ על שרת. קלט עד 3 דקות. תמלול בעברית: ivrit-ai turbo. בדיקת טקסט עם כפתור השמעה לכל שורה.',
      'שתיקה מעל 0.7 שניות מתקצרת ל-0.3. סף: 32- dB, או רצפת הרעש + 10 dB. מעבר 10ms. ניקוי רעשים רק כשהרצפה מעל 50- dB.',
      'כתוביות: עד 3 מילים / 15 תווים, שבירה בסוף משפט או בהפסקה של 0.45 שניות, יורדת 0.4 שניות אחרי המילה האחרונה. סימן RTL בכל שורה.',
      'פריסה: 1080×1920, 30fps. הוק ברצועה 230-420 לאורך כל הסרטון, כתוביות בגובה 1250 בערך.',
    ],
  },
  {
    title: 'אינסטגרם ופייסבוק',
    items: [
      'חיבור אחד דרך Meta (Facebook Login for Business): עמוד בפייסבוק וחשבון אינסטגרם מקצועי שמחובר אליו. הרשאות: instagram_content_publish, pages_manage_posts, pages_read_engagement, instagram_manage_insights.',
      'אינסטגרם: פוסט, קרוסלה (עד 10 פריטים) ורילס. אין תזמון באינסטגרם עצמו, אז FlowBiz מחזיקה תור ומפרסמת בזמן. מגבלה יומית: לבדוק content_publishing_limit לפני כל פרסום.',
      'פייסבוק: רק לעמוד, עם scheduled_publish_time (בין 10 דקות ל-30 יום). לא לפרופיל אישי ולא לקבוצות. לקבוצות: טקסט להעתקה ותזכורת.',
      'כישלון: 3 ניסיונות חוזרים, ואז התראה למשתמש. טוקן שפג: התראה "להתחבר מחדש".',
      'צריך App Review ו-Business Verification של FlowBiz מול Meta לפני העלייה לאוויר.',
      'לינקדאין: להעתקה והורדה בלבד. טיקטוק ווואטסאפ יוצאים מרשימת הערוצים של השלב.',
    ],
  },
  {
    title: 'אחרי הפרסום',
    items: [
      'כל פריט נכנס גם ליומן של FlowBiz. הקישור בפוסט מסומן ?src=post-<id>, וליד שמגיע ממנו מופיע בטבלה עם המקור.',
      'לכל פריט שפורסם: חשיפה, לייקים, תגובות ושמירות מה-API, בכרטיס "התוכן של השבוע" בדף הבית.',
    ],
  },
  {
    title: 'Grow',
    items: [
      'מנוי פעיל: 3-5 עמודים דומים, שם משתמש וסיסמה לאינסטגרם, שעוברים ישר ל-API של Grow. לא נשמרים ב-FlowBiz ולא נרשמים בלוג.',
      'בלי מנוי: הסבר והרשמה להתעניינות. המחיר והחבילה פתוחים.',
    ],
  },
  {
    title: 'נתונים',
    items: [
      'business_plans.data: weekly_content_plan בצורה החדשה (פריט: יום, שעה, סוג, נושא, פורמט, טקסטים, גרסה, שקופיות, סרטון, כתוביות, אושר). generated_social_images נשאר לקבצים.',
      'טבלה חדשה לתור הפרסום: פריט, פלטפורמה, זמן, מצב, מזהה חיצוני, שגיאה.',
    ],
  },
];

export function DevPanel({ open, onClose, onJump, onReset, flags, setFlag }) {
  return html`<aside
    class=${cx(
      'fixed inset-y-0 end-0 z-[70] flex w-full max-w-sm flex-col border-s border-slate-200 bg-white shadow-2xl transition-transform duration-200',
      open ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible',
    )}
    aria-hidden=${!open}
  >
    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 class="flex items-center gap-2 text-[16px] font-bold text-slate-900"><${Icon} name="code-xml" size=${17} /> הערות למפתחים</h2>
      <button type="button" onClick=${onClose} aria-label="סגירה" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"><${Icon} name="x" size=${18} /></button>
    </div>
    <div class="thin-scroll flex-1 overflow-y-auto p-4 text-[14px] leading-relaxed text-slate-700">
      <section class="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">המשתמש לדוגמה</h3>
        <div class="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="המשתמש לדוגמה">
          ${[
            ['m', 'דניאל', 'פנייה בלשון זכר'],
            ['f', 'דניאלה', 'פנייה בלשון נקבה'],
          ].map(
            ([id, name, sub]) => html`<button
              key=${id}
              type="button"
              role="radio"
              aria-checked=${GENDER === id}
              onClick=${() => GENDER !== id && setDemoGender(id)}
              class=${cx('rounded-lg border px-3 py-1.5 text-start cursor-pointer', GENDER === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-brand-200 bg-white text-brand-900')}
            ><b class="block text-[14px]">${name}</b><small class="text-[12px]">${sub}</small></button>`,
          )}
        </div>
        <div class="mt-3 flex flex-col gap-1">
          ${SWITCHES.map(([k, label]) => html`<label key=${k} class="flex cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" class="h-4 w-4 accent-brand-600" checked=${flags[k]} onChange=${(e) => setFlag(k, e.target.checked)} />${label}</label>`)}
        </div>
        <button type="button" class="mt-2 text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${onReset}>לאפס את כל הנתונים</button>
      </section>
      <section class="mb-5 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">מעבר מהיר בין המסכים</h3>
        <div class="flex flex-col gap-1.5">
          ${JUMPS.map((j) => html`<button key=${j.id} type="button" onClick=${() => onJump(j.id)} class="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-start text-[13px] font-semibold hover:bg-brand-50 cursor-pointer">${j.label}</button>`)}
        </div>
      </section>
      ${NOTES.map(
        (n) => html`<section key=${n.title} class="mb-4 p-1">
          <h3 class="mb-1.5 font-bold text-slate-900">${n.title}</h3>
          <ul class="list-disc space-y-1 ps-4">${n.items.map((t) => html`<li>${t}</li>`)}</ul>
        </section>`,
      )}
    </div>
  </aside>`;
}
