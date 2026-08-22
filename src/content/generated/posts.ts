/**
 * GENERATED - do not edit. `node scripts/blog/generate.mjs` rebuilds it from
 * content/blog/{he,en}/*.mdx, which are the read-only source of record.
 *
 * Why generated: src/middleware.ts needs every slug via sitePaths() and runs
 * on the edge runtime, which has no filesystem. This module is plain data,
 * importable everywhere. prebuild runs the generator, so it cannot go stale
 * in CI; a locally stale copy changes nothing on a deploy.
 */
import type { Locale } from '@/lib/i18n'

type PerLocale<T> = Record<Locale, T>

export type MdxFaqEntry = { q: string; a: string }

export type MdxPost = {
  slug: string
  /** The filter bucket. The chip label is the category string itself. */
  topic: string
  date: string
  updated: string | null
  draft: boolean
  related: string[]
  title: PerLocale<string>
  description: PerLocale<string>
  keywords: PerLocale<string[]>
  ogTitle: PerLocale<string>
  ogDescription: PerLocale<string>
  faq: PerLocale<MdxFaqEntry[]>
  body: PerLocale<string>
}

export const mdxPosts: MdxPost[] = [
  {
    "slug": "accessibility-plugin-is-not-enough",
    "topic": "engineering",
    "date": "2026-08-05",
    "updated": "2026-08-20",
    "draft": false,
    "related": [
      "wordpress-vs-custom-code-true-cost"
    ],
    "title": {
      "he": "תוסף הנגישות באתר שלכם כנראה לא עושה את מה שאתם חושבים",
      "en": "Your Accessibility Widget Probably Isn't Doing What You Think"
    },
    "description": {
      "he": "הווידג'ט בפינה הוא לא הנגשה, והוא לא מגן עליכם. מה תקן 5568 באמת דורש, מה בדיקה אוטומטית מפספסת, ומאיפה מתחילים.",
      "en": "The little circle in the corner isn't accessibility, and it isn't protection either. What WCAG actually asks for, what automated scans miss, and where to start."
    },
    "keywords": {
      "he": [
        "תקן 5568",
        "הנגשת אתרים",
        "תוסף נגישות",
        "הצהרת נגישות",
        "תקנה 35 נגישות",
        "WCAG AA"
      ],
      "en": [
        "accessibility overlay",
        "WCAG 2.2 AA",
        "accessibility widget",
        "ADA website compliance",
        "European Accessibility Act",
        "screen reader testing"
      ]
    },
    "ogTitle": {
      "he": "תוסף נגישות הוא לא הנגשת אתר",
      "en": "An Accessibility Widget Is Not an Accessible Website"
    },
    "ogDescription": {
      "he": "מה תקן 5568 באמת דורש, למה סריקה אוטומטית מרגיעה יותר מדי, ושלושה דברים שאפשר לבדוק היום.",
      "en": "What WCAG actually requires, why automated scans are too reassuring, and three things you can check today."
    },
    "faq": {
      "he": [
        {
          "q": "האם תוסף נגישות מספיק כדי לעמוד בתקן 5568?",
          "a": "לא. תוסף הוא שכבת ממשק שמאפשרת שינוי תצוגה, אך אינו מתקן את מבנה הקוד, את תגיות התמונות, את היררכיית הכותרות או את הניווט במקלדת — ואלה עיקר מה שהתקן דורש. הוא יכול להיות תוספת נחמדה מעל אתר שכבר נגיש."
        },
        {
          "q": "מה בדיקה אוטומטית של נגישות לא מזהה?",
          "a": "כלים אוטומטיים מזהים בעיקר ליקויים מבניים בינאריים — למשל האם קיים טקסט חלופי לתמונה. הם אינם מעריכים אם הטקסט מתאר את התמונה בהקשר, אם היררכיית הכותרות הגיונית, או אם ניתן להשלים משימה מלאה במקלדת בלבד. את אלה מזהים רק בבדיקה ידנית."
        },
        {
          "q": "האם חובה לפרסם הצהרת נגישות באתר?",
          "a": "הצהרת נגישות היא המסמך המרכזי שבו העסק מפרט אילו התאמות בוצעו בפועל ואת פרטי איש הקשר לנושאי נגישות. גם עסקים הסבורים שהם זכאים לפטור נדרשים לציין זאת בהצהרה. את המצב המדויק שלכם כדאי לבדוק מול מורשה נגישות."
        }
      ],
      "en": [
        {
          "q": "Is an accessibility overlay enough for WCAG compliance?",
          "a": "No. An overlay is an interface layer that lets users change how a page looks. It doesn't fix code structure, image alternatives, heading hierarchy or keyboard navigation — which is most of what the guidelines actually require. At best it's a pleasant addition on top of a site that is already accessible."
        },
        {
          "q": "What do automated accessibility scans miss?",
          "a": "Automated tools are good at binary structural checks. They can't judge whether alt text describes the image in context, whether the heading hierarchy is logical, or whether a full task can be completed with a keyboard alone. Those require manual review and real use."
        },
        {
          "q": "Where should a business start with accessibility?",
          "a": "Try navigating your own site with the keyboard only, listen to your homepage with a screen reader you already own, and run an automated scan treating the results as an opening list rather than a final verdict."
        }
      ]
    },
    "body": {
      "he": "\n\nכמעט לכל אתר עסקי בישראל יש היום את אותו ווידג'ט. עיגול בפינה, בדרך כלל כתום או כחול, עם אייקון של אדם. לוחצים עליו ונפתחת מגירה: הגדל טקסט, ניגודיות גבוהה, גופן קריא, עצור אנימציות.\n\nבעל העסק שילם עליו, התקין אותו, וסימן וי. ובאמת — משהו קרה. פשוט לא הדבר שהוא חושב שקרה.\n\n> הבהרה: המאמר הזה הוא הסבר טכני, לא ייעוץ משפטי. את המצב המדויק של האתר שלכם ואת שאלת הזכאות לפטור כדאי לבדוק מול מורשה נגישות מוסמך.\n\n## מה התקן בעצם דורש\n\nהבסיס החוקי בישראל הוא תקנות שוויון זכויות לאנשים עם מוגבלות בעניין התאמות נגישות לשירות. תקנה 35א קובעת שהחייב יספק התאמות נגישות בשירות אינטרנט לפי תקן נגישות האינטרנט, ברמה AA. התקן שאליו התקנות מפנות הוא ת\"י 5568 — קווים מנחים לנגישות תכנים באינטרנט — והוא אימוץ ישראלי של הנחיות WCAG הבינלאומיות של ארגון W3C, ברמת AA.\n\nעכשיו קראו שוב את מה שהתקן דורש, ושימו לב למה שהוא **לא** אומר.\n\nהוא לא אומר \"התקינו כלי שמאפשר למשתמש להגדיל טקסט\". הוא אומר שהאתר עצמו — המבנה שלו, הקוד שלו, התוכן שלו — צריך להיות נגיש. זו דרישה על האתר, לא על שכבה שמונחת מעליו.\n\n## מה הווידג'ט באמת עושה\n\nתוסף נגישות הוא שכבת ממשק. הוא יושב מעל האתר ומאפשר למשתמש לשנות איך הוא נראה — גודל, צבע, ריווח.\n\nזה לא חסר ערך. יש משתמשים שזה עוזר להם באמת, במיוחד אנשים עם ליקויי ראייה קלים עד בינוניים שמעדיפים לשלוט בתצוגה. אבל תוסף הוא פתרון חלקי מעצם טבעו: הוא מוסיף שכבת ממשק, ואינו מתקן בעיות עומק בקוד, במבנה האתר או בתוכן.\n\nהנה למה זה חשוב מעשית. משתמש עיוור לא רואה את הווידג'ט. הוא לא צריך טקסט גדול יותר — הוא בכלל לא רואה את המסך. הוא גולש עם קורא מסך שמקריא לו את האתר לפי סדר הקוד, ומנווט במקלדת בלבד.\n\nולקורא מסך לא אכפת מה הווידג'ט מציע. אכפת לו:\n\n- האם לתמונות יש טקסט חלופי שאומר משהו, או `img-4471.jpg`\n- האם הכותרות בנויות בהיררכיה הגיונית, או שכולן עוצבו גדול ובולט בלי מבנה\n- האם לשדות בטופס יש `label` מקושר, או רק טקסט אפור בתוך השדה שנעלם ברגע שמתחילים להקליד\n- האם כפתור הוא באמת `button`, או `div` עם `onClick` שהמקלדת בכלל לא מגיעה אליו\n- האם אפשר לעבור על כל האתר ב-Tab, לראות תמיד איפה הפוקוס נמצא, ולהגיע לכל דבר לחיץ\n\nאף אחת מהנקודות האלה לא נפתרת על ידי כלי חיצוני. כולן נמצאות בקוד.\n\n## למה סריקה אוטומטית מרגיעה יותר מדי\n\nהצעד הבא שרוב האנשים עושים הוא להריץ בדיקה אוטומטית. מקבלים ציון, לפעמים ירוק, ומרגישים טוב.\n\nהבעיה היא שכלים אוטומטיים תופסים חלק מוגבל מהתמונה. הם מצוינים בזיהוי ליקויים בינאריים, אבל ליקויים קריטיים — ניווט הגיוני במקלדת, תיאור תמונות בהקשר הנכון, היררכיית כותרות תקינה — מזוהים רק בבדיקה ידנית של הקוד ובשימוש בפועל.\n\nזה הגיוני כשחושבים על זה. תוכנה יכולה לבדוק **אם** לתמונה יש טקסט חלופי. היא לא יכולה לבדוק אם הטקסט הזה מתאר את התמונה. `alt=\"תמונה\"` עובר את הסריקה בהצלחה מלאה ולא מוסר שום מידע לאף אחד.\n\nבאותו אופן, סריקה תזהה שיש `h1` בעמוד. היא לא תזהה שאחריו בא `h4`, ושמי שמנווט בין כותרות בקורא מסך מקבל מבנה שלא מסתדר.\n\n## החלק שבאמת מטריד עסקים\n\nבואו נדבר על הצד המשפטי, כי זו הסיבה שרוב האנשים מגיעים לנושא מלכתחילה. שוב — לא ייעוץ משפטי, ובכל מקרה כדאי לבדוק את המצב שלכם מול מורשה נגישות.\n\nשלושה דברים שכדאי להכיר:\n\n**הצהרת נגישות היא המסמך המרכזי.** היא צריכה לפרט מה הונגש בפועל ולכלול פרטי איש קשר לנושאי נגישות. הצהרה גנרית שהועתקה מאתר אחר ומתארת התאמות שלא ביצעתם היא בעייתית יותר מהיעדר הצהרה, כי היא מצהירה על משהו לא נכון.\n\n**מועד הקמת האתר משנה.** הכללים החלים על אתר שהוקם לפני אוקטובר 2017 שונים מאלה שחלים על אתר שהוקם אחריו. זה פרט שכמעט אף מאמר בעברית לא מזכיר, והוא בדיוק הפרט שמשנה את התשובה עבור חלק גדול מהעסקים.\n\n**יש פטור כלכלי, ויש לו תנאים.** הפטור מתייחס בעיקר לעסקים שמחזור העסקאות השנתי שלהם נמוך מהסף שנקבע בתקנות, כשהבדיקה נעשית לפי ממוצע שלוש השנים האחרונות. שימו לב לשתי נקודות: הפטור לא חל אוטומטית על כל אתר, ומי שסבור שהוא זכאי לו נדרש לציין זאת בהצהרת הנגישות — כלומר גם פטור מחייב פעולה, לא שתיקה. את הסף המעודכן ואת תנאי הזכאות אל תאמתו מול מאמר, גם לא מול זה. אמתו מול מורשה נגישות.\n\n## הבשורה הטובה: זה לא פרויקט ענק\n\nעד כאן זה נשמע מאיים. בפועל, אתר שנבנה נכון מלכתחילה עומד ברוב הדרישות בלי מאמץ מיוחד, כי רוב מה שהתקן מבקש הוא פשוט בנייה תקינה.\n\n`button` לכפתור. `nav` לניווט. `label` לכל שדה. היררכיית כותרות שמשקפת את מבנה התוכן. ניגודיות צבעים סבירה. פוקוס נראה לעין. אלה לא התאמות נגישות — אלה HTML נכון. מי שכתב אותם נכון קיבל נגישות בדרך.\n\nהכאב מתחיל כשמנסים להוסיף נגישות לאתר שנבנה בלי לחשוב עליה. אז זה באמת פרויקט.\n\n## מאיפה להתחיל, מעשית\n\nאם יש לכם אתר עכשיו ואתם רוצים לדעת איפה אתם עומדים, שלושה דברים שאפשר לעשות היום בלי לשלם לאף אחד:\n\n**נסו לגלוש באתר עם מקלדת בלבד.** קחו את היד מהעכבר. `Tab` להתקדם, `Shift+Tab` אחורה, `Enter` להפעיל. הגיעו מהעמוד הראשי עד לשליחת טופס יצירת קשר. אם נתקעתם, או שאיבדתם את מיקום הפוקוס — גם קורא מסך ייתקע שם.\n\n**הפעילו את קורא המסך שכבר קיים אצלכם.** VoiceOver במק וב-iPhone, Narrator בווינדוס. סגרו עיניים לדקה והקשיבו לדף הבית. זו הדקה שהכי משנה את התפיסה של אנשים בנושא הזה.\n\n**הריצו סריקה — והתייחסו אליה כרשימת פתיחה.** כלים כמו axe או Lighthouse ייתנו לכם את הליקויים הברורים. תקנו אותם, ואל תניחו שסיימתם.\n\n---\n\nהשורה התחתונה: הווידג'ט בפינה הוא לא הנגשה, והוא גם לא מגן עליכם. הוא לכל היותר תוספת נחמדה מעל אתר שכבר נגיש. אם הוא הדבר היחיד שיש לכם — יש לכם ווידג'ט, לא אתר נגיש.\n\nרוצים לדעת איפה האתר שלכם עומד באמת? [כתבו לנו](/he/contact) ונעבור עליו.\n\n## מקורות\n\n- [תקנות נגישות השירות, תקנה 35 — נגישות ישראל](https://aisrael.org/)\n- [כל מה שרצית לדעת על תקנות הנגישות — איגוד האינטרנט הישראלי](https://www.isoc.org.il/freedom-of-internet/accessibility/all-about-accessibility)\n- [חוקים ותקנות בנושא נגישות לאינטרנט — איגוד האינטרנט הישראלי](https://www.isoc.org.il/freedom-of-internet/accessibility/rules-and-regulations-accessibility-internet)\n- [Web Content Accessibility Guidelines (WCAG) — W3C](https://www.w3.org/WAI/standards-guidelines/wcag/)\n",
      "en": "\n\nAlmost every business website now carries the same widget. A circle in the corner, usually blue or orange, with a little person icon. Click it and a drawer opens: enlarge text, high contrast, readable font, stop animations.\n\nThe business owner paid for it, installed it, ticked the box. And something genuinely did happen. Just not the thing they think happened.\n\n> A note on scope: this is a technical explainer, not legal advice. Your specific obligations depend on where you operate and who your users are, and are worth checking with a qualified accessibility specialist.\n\n## What the guidelines actually ask for\n\nNearly every accessibility regime in use today points at the same technical document: the W3C's Web Content Accessibility Guidelines, at level AA. In the United States, ADA Title III case law consistently treats WCAG as the practical benchmark for public-facing sites. In the European Union, the European Accessibility Act pulls a wide range of consumer-facing digital services into scope, again resting on the same underlying criteria. Israel's standard SI 5568 is a direct adoption of WCAG. Different laws, same technical target.\n\nNow read what the guidelines ask for, and notice what they **don't** say.\n\nThey don't say \"install a tool that lets users enlarge text.\" They say the site itself — its structure, its code, its content — must be accessible. That's a requirement about the site, not about a layer placed on top of it.\n\n## What the widget actually does\n\nAn accessibility overlay is an interface layer. It sits above the site and lets a user change how it looks: size, colour, spacing.\n\nThat isn't worthless. Some users are genuinely helped by it, particularly people with mild to moderate low vision who prefer to control the display. But an overlay is a partial solution by nature: it adds an interface layer, and it does not repair problems in the code, the structure or the content underneath.\n\nHere's why that matters in practice. A blind user doesn't see the widget. They don't need larger text — they aren't looking at the screen at all. They browse with a screen reader that announces the page in code order, and they navigate by keyboard alone.\n\nAnd a screen reader doesn't care what the widget offers. It cares whether:\n\n- Images have alternative text that says something, or `img-4471.jpg`\n- Headings form a logical hierarchy, or were all just styled large and bold with no structure\n- Form fields have an associated `label`, or only grey placeholder text that vanishes the moment you start typing\n- A button is really a `button`, or a `div` with an `onClick` the keyboard never reaches\n- You can move through the whole site with Tab, always see where focus is, and reach everything clickable\n\nNot one of those is solved by an external tool. All of them live in the code.\n\n## Why automated scans are too reassuring\n\nThe next step most people take is to run an automated audit. You get a score, sometimes green, and you feel better.\n\nThe problem is that automated tools capture a limited slice of the picture. They're excellent at binary structural checks, but the critical failures — logical keyboard navigation, image descriptions that make sense in context, a coherent heading hierarchy — only surface through manual review and actual use.\n\nWhich makes sense when you think about it. Software can check **whether** an image has alt text. It can't check whether that text describes the image. `alt=\"image\"` passes the scan perfectly and conveys nothing to anybody.\n\nLikewise, a scan will confirm the page has an `h1`. It won't notice that the next heading is an `h4`, and that anyone navigating by heading in a screen reader gets a structure that doesn't hold together.\n\n## The part businesses actually worry about\n\nLet's talk about the legal side, because that's why most people arrive at this topic in the first place. Again — not legal advice, and your specific position is worth checking with a specialist.\n\nTwo things are worth knowing.\n\n**An accessibility statement is the central document.** It should describe what has actually been made accessible and include contact details for accessibility matters. A generic statement copied from another site, describing adaptations you never made, is worse than having none — because it asserts something untrue.\n\n**Overlay vendors' legal guarantees deserve scrutiny.** A widget that promises protection is making a claim about outcomes it doesn't control. Litigation in the United States has repeatedly involved sites that had an overlay installed at the time of the complaint. If a vendor offers a warranty, read carefully what it actually covers and what triggers it.\n\n## The good news: this isn't a huge project\n\nSo far this sounds intimidating. In practice, a site built properly from the start meets most of the requirements without special effort, because most of what the guidelines ask for is simply correct construction.\n\n`button` for a button. `nav` for navigation. A `label` on every field. A heading hierarchy that reflects the content structure. Reasonable colour contrast. A visible focus ring. These aren't accessibility adaptations — they're correct HTML. Anyone who wrote them properly got accessibility on the way.\n\nThe pain starts when you try to add accessibility to a site built without thinking about it. Then it really is a project.\n\n## Where to start, practically\n\nIf you have a site now and want to know where you stand, three things you can do today without paying anyone:\n\n**Try browsing your site with the keyboard only.** Take your hand off the mouse. `Tab` forward, `Shift+Tab` back, `Enter` to activate. Get from the homepage to a submitted contact form. If you got stuck, or lost track of where focus was, a screen reader will get stuck in the same place.\n\n**Turn on the screen reader you already own.** VoiceOver on Mac and iPhone, Narrator on Windows. Close your eyes for a minute and listen to your homepage. It's the single minute that changes people's understanding of this topic the most.\n\n**Run a scan — and treat it as an opening list.** Tools like axe or Lighthouse will hand you the obvious failures. Fix them, and don't assume you're finished.\n\n---\n\nThe bottom line: the widget in the corner isn't accessibility, and it isn't protection. At best it's a pleasant addition on top of a site that's already accessible. If it's the only thing you have, you have a widget, not an accessible site.\n\nWant to know where your site actually stands? [Get in touch](/en/contact) and we'll go through it.\n\n## Sources\n\n- [Web Content Accessibility Guidelines (WCAG) — W3C](https://www.w3.org/WAI/standards-guidelines/wcag/)\n- [WAI-ARIA and accessibility fundamentals — W3C Web Accessibility Initiative](https://www.w3.org/WAI/)\n"
    }
  },
  {
    "slug": "branch-leakage-case-study",
    "topic": "engineering",
    "date": "2026-08-19",
    "updated": "2026-08-20",
    "draft": false,
    "related": [
      "wordpress-vs-custom-code-true-cost"
    ],
    "title": {
      "he": "איך הזמנה נחתה במטבח של הסניף הלא נכון",
      "en": "The Order That Landed in the Wrong Kitchen"
    },
    "description": {
      "he": "באג אחד ברשת רב-סניפית, שלושה מקורות אמת שסתרו זה את זה, ומה שלמדנו על מי באמת אמור להחליט איפה הזמנה נופלת.",
      "en": "One bug in a multi-branch platform, three sources of truth that quietly disagreed, and what we learned about who gets to decide where an order belongs."
    },
    "keywords": {
      "he": [
        "מערכת רב-סניפית",
        "multi-tenant",
        "מקור אמת יחיד",
        "באג בייצור",
        "ארכיטקטורת מערכות הזמנות"
      ],
      "en": [
        "multi-tenant architecture",
        "single source of truth",
        "silent production bug",
        "tenant leakage",
        "order routing system"
      ]
    },
    "ogTitle": {
      "he": "הזמנה שנחתה בסניף הלא נכון — קייס הנדסי",
      "en": "The Order That Landed in the Wrong Kitchen"
    },
    "ogDescription": {
      "he": "שלושה מקורות אמת, 38 fallbacks שקטים, ומה שקורה כשמערכת מנחשת בביטחון מלא.",
      "en": "Three sources of truth, 38 silent fallbacks, and what happens when a system guesses with full confidence."
    },
    "faq": {
      "he": [
        {
          "q": "מה זו דליפת סניפים במערכת רב-סניפית?",
          "a": "מצב שבו פעולה שבוצעה בהקשר של סניף אחד נרשמת במערכת על שם סניף אחר. המערכת לא מחזירה שגיאה, ולכן הבעיה מתגלה בדרך כלל רק בספירת מלאי או בסגירת דוח חודשי."
        },
        {
          "q": "למה ערך ברירת מחדל בקוד הוא בעיה?",
          "a": "מפני שהוא הופך חוסר ידיעה להחלטה שקטה. במקום שהמערכת תעצור ותודיע שהיא לא יודעת לאיזו ישות הפעולה שייכת, היא בוחרת ישות אחת וממשיכה — בלי שאף אחד אישר את הבחירה הזו כמדיניות עסקית."
        },
        {
          "q": "איך מוודאים שהבעיה לא תחזור?",
          "a": "על ידי מקור אמת יחיד בצד השרת, ערך זהות שלא ניתן לשינוי מצד הלקוח, והסרה מוחלטת של ערכי ברירת מחדל — כך שכל תרחיש שבו הזהות אובדת נכשל בבירור ונתפס בבדיקות אוטומטיות לפני עלייה לאוויר."
        }
      ],
      "en": [
        {
          "q": "What is tenant leakage in a multi-branch system?",
          "a": "It's when an action performed in the context of one branch gets recorded against a different one. The system returns no error, so the problem usually surfaces during an inventory count or a month-end reconciliation rather than in the logs."
        },
        {
          "q": "Why is a default value in code a problem?",
          "a": "Because it converts not knowing into a silent decision. Instead of stopping and reporting that it can't determine which entity an action belongs to, the system picks one and continues — enacting a business policy nobody ever approved."
        },
        {
          "q": "How do you make sure it doesn't come back?",
          "a": "A single server-side source of truth, an identity value the client cannot modify, and total removal of default fallbacks — so every case where identity is lost fails loudly and gets caught in CI before it ships."
        }
      ]
    },
    "body": {
      "he": "\n\nיש באגים שמתפוצצים. השרת נופל, המסך מלבין, כולם יודעים תוך שלוש דקות.\n\nואז יש את הסוג השני. הכול עובד. אף שגיאה בלוגים, אף התראה, אף 500. פשוט מדי פעם מגיעה למטבח של סניף אחד הזמנה שמישהו ביצע בסניף אחר לגמרי. הצוות מכין אותה, כי למה שלא יכינו — היא הופיעה על המסך שלהם. הלקוח האמיתי ממתין במקום אחר. אף אחד לא יודע מאיפה להתחיל לחפש.\n\nזה הבאג שנקרא אצלנו פנימית \"דליפת סניפים\", והוא לימד אותנו יותר על ארכיטקטורה מכל באג אחר שנתקלנו בו.\n\n## הרקע\n\nהמערכת מנהלת רשת מסעדות עם כמה סניפים. כל סניף הוא ישות עסקית נפרדת: תפריט משלו, מלאי משלו, צוות משלו, קופה משלו. מבחינת הלקוח זו חוויה אחת. מבחינת המערכת אלה כמה עסקים שרק במקרה חולקים אותו קוד.\n\nהשאלה הבסיסית ביותר שהמערכת צריכה לענות עליה היא: **באיזה סניף המשתמש הזה נמצא עכשיו?**\n\nמסתבר שזו לא שאלה בסיסית בכלל.\n\n## שלושה מקורות אמת שלא הסכימו\n\nכשפתחנו את הקוד, גילינו שלזהות הסניף היו שלושה מקורות נפרדים, וכל אחד מהם היה נכון חלק מהזמן:\n\n**הראשון** היה ה-URL. הלקוח נכנס לכתובת שמכילה את מזהה הסניף, וזה נראה כמו מקור אמת סביר. הוא גם היה — עד שמישהו שיתף לינק בוואטסאפ, או חזר לאתר מהיסטוריית הדפדפן, או לחץ על תוצאה ישנה בגוגל.\n\n**השני** היה ה-state בצד הלקוח. הסניף שנבחר נשמר בזיכרון האפליקציה ובאחסון המקומי של הדפדפן. מהיר, נוח, ומסונכרן עם ה-URL בערך שמונים אחוז מהזמן. השאר היה מרחב הבאגים.\n\n**השלישי** היה מה שהשרת חשב בזמן יצירת ההזמנה. וכאן הגיע החלק הכואב.\n\nבכל מקום שבו השרת לא הצליח לקבוע בוודאות מהו הסניף, היה בקוד ביטוי שנראה תמים לחלוטין:\n\n```js\nconst companyId = resolveCompany(req) || 14;\n```\n\nארבע-עשרה. סניף ברירת המחדל. מישהו כתב את זה פעם אחת, כנראה בשלב שבו היה סניף אחד וזה היה נכון, ואז זה התפשט. מצאנו את הביטוי הזה בכ-38 מקומות שונים בקוד.\n\nחשוב להבין מה `|| 14` באמת אומר. הוא לא אומר \"אני לא יודע\". הוא אומר **\"אני לא יודע, אז אני אנחש, ואני אנחש בביטחון מלא ובלי להגיד לאף אחד\"**. זו הסיבה שלא הייתה אף שגיאה בלוגים. המערכת מעולם לא נכשלה. היא הצליחה — בסניף הלא נכון.\n\n## למה זה נשמע כמו באג קטן, ולא היה\n\nהפיתוי כאן הוא לתקן את התסמין. למצוא את המקרה שבו הסניף אבד, לסגור אותו, ולהמשיך הלאה.\n\nאבל חשבו רגע מה `|| 14` אומר בשפה עסקית. הוא אומר שהמערכת מוכנה **לזקוף הכנסה לסניף אחד על עבודה שסניף אחר עשה**. בבעלות אחת אולי זו טעות סטטיסטית. ברשת שבה לכל סניף יש דוח רווח והפסד משלו, זו בעיה שנוגעת בכסף של אנשים.\n\nואז יש את הצד השני — מלאי. סניף שקיבל הזמנה שאינה שלו הוריד מהמלאי שלו. הספירה בסוף היום לא הסתדרה. מישהו במחסן חיפש בקבוקים שנעלמו.\n\nברגע שהבנו את זה, זו הפסיקה להיות שאלה של תיקון באג והפכה לשאלה של ארכיטקטורה.\n\n## ההחלטה: מקור אמת אחד, והוא לא אצל הלקוח\n\nהכלל שקבענו היה קצר: **הדפדפן מציע, השרת מחליט.**\n\nהלקוח יכול לבקש סניף. דרך ה-URL, דרך כפתור, דרך מה שירצה. אבל שום דבר שמגיע מהדפדפן לא נכנס להזמנה לפני שהשרת אישר אותו מול המקור שלו. פונקציה אחת הפכה לשער היחיד שדרכו נקבעת זהות הסניף בהזמנה. אין דרך אחרת להיכנס.\n\nמתחת לזה הנחנו cookie מסוג `httpOnly` שמחזיק את הסניף הפעיל. הבחירה ב-`httpOnly` הייתה מכוונת: קוד JavaScript בצד הלקוח **לא יכול** לקרוא אותו או לשנות אותו. לא בגלל שחשדנו במשתמשים, אלא בגלל שערך שאפשר לשנות מהקונסולה הוא ערך שיום אחד ישתנה בטעות — על ידי הקוד שלנו, לא של אף אחד אחר.\n\nהעגלה עברה למפתחות נפרדים לכל סניף. עד אז הייתה עגלה אחת, ומעבר בין סניפים גרר מוצרים איתו — מוצרים שלפעמים בכלל לא היו קיימים בתפריט של הסניף השני.\n\nואז בא החלק הכי לא נעים, ובעצם הכי חשוב: **הסרנו את כל 38 ה-fallbacks**. לא החלפנו אותם בסניף ברירת מחדל חכם יותר. הסרנו אותם. אם המערכת לא יודעת באיזה סניף היא נמצאת, היא נעצרת ואומרת את זה בקול.\n\nזה נשמע כמו רגרסיה. בפועל זה ההפך. **כישלון רועש שקורה פעם ביום עדיף על הצלחה שקטה ושגויה שקורה פעם בשבוע** — את הראשון מתקנים ביום שהוא מופיע, ואת השני מגלים בסוף החודש, כשמישהו מנסה לסגור דוח.\n\n## איך יודעים שזה באמת נגמר\n\nבשלב הזה סוויטת הבדיקות מנתה שבע בדיקות. שבע בדיקות למערכת שמנהלת רשת שלמה היא בעצם אמירה שאנחנו סומכים על מזל.\n\nסיימנו את התהליך עם 38.\n\nהמספר עצמו לא מרשים במיוחד. מה שחשוב הוא מה הבדיקות האלה מכסות: כל תרחיש שבו זהות סניף עלולה ללכת לאיבוד. כניסה מלינק ישן. מעבר בין סניפים עם עגלה מלאה. שתי לשוניות פתוחות על שני סניפים שונים במקביל. חזרה אחורה בדפדפן באמצע תהליך תשלום. רענון עמוד בין הוספת מוצר לבין סליקה.\n\nכל אחד מהתרחישים האלה היה פעם באג פוטנציאלי שהיינו מגלים ממטבח מבולבל. עכשיו הם נכשלים ב-CI, לפני שהקוד בכלל עולה.\n\nמאז — אפס דליפות.\n\n## מה שלקחנו מזה\n\n**כל `||` בקוד הוא החלטה עסקית שהתחפשה להחלטה טכנית.** הביטוי `|| 14` נראה כמו הגנה מפני קריסה. בפועל הוא היה מדיניות — \"כשאנחנו לא בטוחים, נזקוף לסניף הזה\" — שאף אחד מעולם לא אישר.\n\n**מקור אמת אחד הוא לא קפדנות אקדמית.** שלושה מקורות שמסכימים ברוב המקרים גרועים יותר ממקור אחד שלפעמים מודה שאינו יודע, כי במקרה הראשון אין לך דרך לדעת מתי אתה טועה.\n\n**הבדיקה הטובה ביותר לארכיטקטורה היא לשאול איפה המערכת שקרנית.** לא איפה היא נופלת — איפה היא ממשיכה בביטחון בלי שיש לה בסיס לכך. שם יושבים הבאגים היקרים.\n\n---\n\nאם אתם מפעילים מערכת שמשרתת יותר מסניף אחד, יותר מלקוח אחד או יותר מארגון אחד — שווה לחפש בקוד את הביטוי `||` ליד מזהה ישות. יש סיכוי סביר שתמצאו שם החלטה עסקית שאף אחד לא קיבל במודע.\n\nאם מצאתם משהו כזה ואתם לא בטוחים כמה עמוק זה הולך — [דברו איתנו](/he/contact). שיחת אפיון קצרה בדרך כלל מספיקה כדי לדעת אם זה תיקון נקודתי או שאלה ארכיטקטונית.\n",
      "en": "\n\nSome bugs explode. The server goes down, the screen goes white, everyone knows within three minutes.\n\nThen there's the other kind. Everything works. No errors in the logs, no alerts, no 500s. It's just that every so often, an order placed at one branch shows up on the kitchen screen at another one. The staff prepare it — why wouldn't they? It appeared on their screen. Meanwhile the actual customer is waiting somewhere else entirely. And nobody knows where to start looking.\n\nWe called it \"branch leakage,\" and it taught us more about architecture than any other bug we've run into.\n\n## The setup\n\nThe system runs a restaurant chain with several branches. Each branch is a separate business entity: its own menu, its own inventory, its own staff, its own register. To the customer it's one experience. To the system it's several businesses that happen to share a codebase.\n\nThe most basic question the system has to answer is: **which branch is this user in right now?**\n\nThat turned out not to be a basic question at all.\n\n## Three sources of truth that disagreed\n\nWhen we opened the code, branch identity had three separate sources, and each of them was right some of the time.\n\n**The first** was the URL. The customer landed on an address containing the branch identifier, which looks like a reasonable source of truth. It was — until someone shared a link over WhatsApp, or returned from browser history, or clicked a stale Google result.\n\n**The second** was client-side state. The selected branch lived in application memory and in browser local storage. Fast, convenient, and in sync with the URL roughly eighty percent of the time. The remainder was the bug surface.\n\n**The third** was whatever the server believed at the moment the order was created. And this is where it got painful.\n\nEverywhere the server couldn't determine the branch with certainty, the code contained an expression that looked entirely harmless:\n\n```js\nconst companyId = resolveCompany(req) || 14;\n```\n\nFourteen. The default branch. Somebody wrote it once, probably back when there was a single branch and it was correct, and then it spread. We found that expression in roughly 38 different places in the codebase.\n\nIt's worth being precise about what `|| 14` actually says. It doesn't say \"I don't know.\" It says **\"I don't know, so I'll guess, and I'll guess with total confidence and tell nobody.\"** That's why there were no errors in the logs. The system never failed. It succeeded — at the wrong branch.\n\n## Why this sounded like a small bug and wasn't\n\nThe temptation is to fix the symptom: find the one path where the branch got lost, patch it, move on.\n\nBut consider what `|| 14` means in business terms. It means the system is willing to **credit revenue to one branch for work another branch did**. Under single ownership that might be a rounding error. In a chain where each branch has its own P&L, it's a problem that touches people's money.\n\nThen there's the other side — inventory. A branch that received an order that wasn't its own deducted from its own stock. The end-of-day count didn't reconcile. Somebody went looking in the storeroom for bottles that had never left it.\n\nThe moment we understood that, this stopped being a bug fix and became an architecture question.\n\n## The decision: one source of truth, and it isn't the client\n\nThe rule we settled on was short: **the browser proposes, the server decides.**\n\nThe client can request a branch. Through the URL, through a button, through whatever it likes. But nothing arriving from the browser enters an order until the server has validated it against its own source. One function became the sole gate through which branch identity is assigned to an order. There is no other way in.\n\nUnderneath it, we placed an `httpOnly` cookie holding the active branch. The `httpOnly` choice was deliberate: client-side JavaScript **cannot** read it or change it. Not because we distrusted users, but because a value that can be changed from the console is a value that will eventually be changed by accident — by our own code, not anyone else's.\n\nThe cart moved to per-branch keys. Until then there was a single cart, and switching branches dragged products along with it — sometimes products that didn't exist on the other branch's menu at all.\n\nThen came the least pleasant and most important part: **we removed all 38 fallbacks.** We didn't replace them with a smarter default. We removed them. If the system doesn't know which branch it's in, it stops and says so out loud.\n\nThat sounds like a regression. In practice it's the opposite. **A loud failure once a day beats a quiet, wrong success once a week** — the first gets fixed the day it appears; the second gets discovered at month end, when somebody tries to close a report.\n\n## Knowing it's actually done\n\nAt that point the test suite contained seven tests. Seven tests for a system running an entire chain is essentially a statement that we were relying on luck.\n\nWe finished the process with 38.\n\nThe number itself isn't impressive. What matters is what those tests cover: every scenario in which branch identity could be lost. Arriving from a stale link. Switching branches with a full cart. Two tabs open on two different branches at once. Hitting back mid-checkout. Refreshing between adding an item and paying.\n\nEach of those was once a potential bug we'd have discovered via a confused kitchen. Now they fail in CI, before the code ships at all.\n\nZero leaks since.\n\n## What we took from it\n\n**Every `||` in a codebase is a business decision disguised as a technical one.** `|| 14` looked like crash protection. It was actually policy — \"when we're unsure, credit this branch\" — that nobody ever approved.\n\n**A single source of truth isn't academic rigour.** Three sources that agree most of the time are worse than one source that occasionally admits it doesn't know, because in the first case you have no way of knowing when you're wrong.\n\n**The best architectural test is asking where the system lies.** Not where it falls over — where it proceeds confidently without grounds. That's where the expensive bugs live.\n\n---\n\nIf you run a system serving more than one branch, more than one client or more than one organisation, it's worth searching your codebase for `||` next to an entity identifier. There's a fair chance you'll find a business decision nobody consciously made.\n\nFound something and unsure how deep it goes? [Talk to us](/en/contact). A short scoping call is usually enough to tell whether it's a local fix or an architectural question.\n"
    }
  },
  {
    "slug": "wordpress-vs-custom-code-true-cost",
    "topic": "engineering",
    "date": "2026-08-12",
    "updated": "2026-08-20",
    "draft": false,
    "related": [
      "accessibility-plugin-is-not-enough",
      "branch-leakage-case-study"
    ],
    "title": {
      "he": "וורדפרס או קוד ייעודי: מה באמת משלמים עליו בשלוש השנים הבאות",
      "en": "WordPress or Custom Code: What You Actually Pay Over Three Years"
    },
    "description": {
      "he": "העלות של אתר לא נגמרת ביום שהוא עולה לאוויר. פירוק של חמש עלויות שלא מופיעות בהצעת המחיר, ומתי כל אחת מהאפשרויות היא באמת הבחירה הנכונה.",
      "en": "A website's cost doesn't end the day it goes live. Five costs that never appear on the quote, and when each option is genuinely the right call."
    },
    "keywords": {
      "he": [
        "וורדפרס או קוד",
        "עלות בניית אתר",
        "עלות תחזוקת אתר",
        "הגירה מוורדפרס",
        "Next.js לעסקים"
      ],
      "en": [
        "WordPress vs custom code",
        "total cost of ownership website",
        "website maintenance cost",
        "WordPress migration",
        "Next.js for business"
      ]
    },
    "ogTitle": {
      "he": "וורדפרס או קוד ייעודי — העלות שלא מופיעה בהצעה",
      "en": "WordPress or Custom Code — The Cost That Isn't on the Quote"
    },
    "ogDescription": {
      "he": "חמש עלויות שמתגלות רק בשנה השנייה, ומתי וורדפרס דווקא הבחירה הנכונה.",
      "en": "Five costs that surface in year two, and when WordPress is genuinely the right call."
    },
    "faq": {
      "he": [
        {
          "q": "האם וורדפרס תמיד יקר יותר לאורך זמן?",
          "a": "לא. וורדפרס משתלם כשהאתר הוא ברושור שמתעדכן לעיתים רחוקות, כשהתקציב מוגבל, או כשעדיין לא ברור שהמודל העסקי יחזיק. הפער נפתח כשהאתר הופך לחלק מהתפעול — הזמנות, חיבור למערכות אחרות, או תלות בין מהירות להכנסה."
        },
        {
          "q": "מה העלויות שלא מופיעות בהצעת המחיר לאתר?",
          "a": "רישיונות שנתיים של תוספים, שעות תחזוקה ועדכונים, חשיפת אבטחה דרך קוד צד שלישי, נטישה שנובעת מזמן טעינה איטי, והעלות של מעבר לספק אחר כשהתוכן שמור בפורמט סגור."
        },
        {
          "q": "מה לשאול ספק לפני חתימה?",
          "a": "אם ניפרד מחר בבוקר, מה בדיוק אני לוקח איתי? התשובה הנכונה היא הקוד, הדומיין, התוכן והגישה להוסטינג — הכול רשום על שמכם."
        }
      ],
      "en": [
        {
          "q": "Is WordPress always more expensive over time?",
          "a": "No. WordPress makes sense when the site is a brochure that changes rarely, when budget is tight, or when the business model is still unproven. The gap opens once the site becomes part of operations — orders, integrations, or a direct link between load speed and revenue."
        },
        {
          "q": "Which website costs don't appear on the quote?",
          "a": "Annual plugin licences, maintenance and update hours, security exposure through third-party code, abandonment caused by slow loading, and the cost of leaving when your content is locked in a proprietary format."
        },
        {
          "q": "What should I ask a vendor before signing?",
          "a": "If we part ways tomorrow morning, what exactly do I take with me? The right answer is the code, the domain, the content and hosting access — all registered in your name."
        }
      ]
    },
    "body": {
      "he": "\n\nכשעסק מבקש הצעת מחיר לאתר, הוא בעצם שואל שאלה אחת: כמה זה עולה.\n\nזו שאלה הגיונית לגמרי, והיא גם השאלה הלא נכונה. לא בגלל שהמחיר לא משנה — הוא משנה מאוד — אלא בגלל שהמספר שמופיע בהצעה הוא רק החלק שקל לספור. את החלק השני משלמים בטפטוף: בהוראות קבע קטנות, בשעות שאף אחד לא רשם, ובהחלטות שמתגלות כיקרות רק בשנה השלישית.\n\nאנחנו בונים בשני העולמות ואין לנו אג'נדה נגד וורדפרס. הוא מפעיל חלק עצום מהאינטרנט מסיבה טובה. אבל השיחה על \"מה עולה יותר\" כמעט תמיד מתנהלת סביב הפרמטר הלא נכון, אז בואו נפרק אותה לחמש עלויות אמיתיות.\n\n## 1. העלות שחוזרת כל שנה\n\nאתר וורדפרס טיפוסי הוא לא מוצר אחד. הוא מוצר אחד ועליו בין עשרה לשלושים תוספים, שחלקם בתשלום שנתי.\n\nתוסף לטפסים. תוסף לקאש. תוסף ל-SEO. תוסף לגלריה. תוסף לגיבויים. תוסף לאבטחה. תוסף לתרגום. בונה עמודים. כל אחד מהם הוא מוצר עצמאי של חברה עצמאית עם מודל תמחור עצמאי, ולכל אחד מהם יש יום בשנה שבו הוא מבקש חידוש.\n\nאף אחד מהם לא יקר בפני עצמו. זו בדיוק הנקודה — כל אחד בנפרד קטן מכדי שיהיה שווה להתווכח עליו, וביחד הם הופכים למספר קבוע שיוצא מהעסק כל שנה, בלי שאף אחד ישב וסיכם אותו פעם אחת.\n\nבקוד ייעודי המספר הזה הוא בדרך כלל אפס. יש הוסטינג, ויש דומיין. זהו.\n\n## 2. עלות התחזוקה שאף אחד לא מתמחר\n\nוורדפרס דורש עדכונים. הליבה מתעדכנת, התוספים מתעדכנים, התבנית מתעדכנת, וגרסת PHP שמתחתיהם מתעדכנת גם היא.\n\nרוב הזמן זה עובר חלק. ואז מגיע היום שבו עדכון של תוסף אחד שובר משהו בתוסף אחר, האתר נראה מוזר בנייד, ואף אחד לא יודע איזה משני העדכונים אשם. אתם מגלים את זה כי לקוח התקשר, לא כי מערכת התריעה.\n\nהשאלה האמיתית היא לא כמה זה עולה לתקן. השאלה היא **מי אחראי**. אם התשובה היא \"בעל העסק, בערבים\" — זו עלות שלא מופיעה בשום מקום, והיא היקרה מכולן, כי היא נגבית מהזמן של האדם היקר ביותר בעסק.\n\nלקוד ייעודי יש תחזוקה משלו, ואנחנו לא מתיימרים אחרת. אבל יש הבדל מהותי: בקוד ייעודי אתם מעדכנים כשאתם מחליטים, ורק את מה שאתם צריכים. בוורדפרס אתם מעדכנים כשספק חיצוני החליט, ואת התזמון אתם לא בוחרים.\n\n## 3. עלות האבטחה\n\nוורדפרס הוא היעד הפופולרי ביותר לתקיפות אתרים בעולם, פשוט מפני שהוא הנפוץ ביותר. אבל הליבה של וורדפרס עצמה מתוחזקת היטב. רוב הפריצות שאנחנו רואים לא מגיעות משם — הן מגיעות מתוסף.\n\nתוסף הוא קוד של צד שלישי שרץ בהרשאות מלאות בתוך האתר שלכם. כשהמפתח שלו מפסיק לתחזק אותו — וזה קורה כל הזמן, במיוחד בתוספים חינמיים — פרצה שהתגלתה נשארת פתוחה. אתם לא תדעו על כך. התוסף ימשיך לעבוד מצוין.\n\nיש כאן גם צד שהוא לא רק כסף. אם באתר יש טופס יצירת קשר, יש בו נתונים אישיים של אנשים. דליפה של רשימת לידים היא לא רק מבוכה — היא יכולה להיות חשיפה רגולטורית.\n\nבאתר בקוד ייעודי, מרבית הקוד שרץ הוא קוד שנכתב עבורכם. משטח התקיפה קטן בסדר גודל, פשוט כי יש הרבה פחות דלתות.\n\n## 4. עלות הביצועים — זו שמשלמים בהמרות\n\nאתר וורדפרס טיפוסי מייצר את העמוד בזמן אמת: PHP רץ, מסד הנתונים נשאל, עשרים תוספים מוסיפים כל אחד את קובץ ה-CSS וה-JavaScript שלו, ורק אז הדף מתחיל להיטען אצל המשתמש.\n\nאפשר לשפר את זה. יש קאש, יש CDN, יש אופטימיזציה. אבל שימו לב לתנועה — אתם משלמים על שכבות שתפקידן לבטל את העלות של שכבות אחרות ששילמתם עליהן.\n\nאתר בקוד ייעודי מודרני נבנה מראש כקבצים סטטיים ומוגש מהקצה. אין PHP שרץ, אין שאילתה, אין עשרים תוספים. העמוד פשוט כבר קיים.\n\nוכאן זה מפסיק להיות דיון טכני. הפרש של שנייה בטעינה במובייל מתורגם לאחוזי נטישה, ואחוזי נטישה מתורגמים לפניות שלא הגיעו. **זו העלות שהכי קשה לראות, כי היא לא יוצאת מהחשבון — היא פשוט לא נכנסת אליו.**\n\n## 5. עלות הנעילה\n\nזו העלות שמתגלה מאוחר, ובדרך כלל ברגע הכי גרוע.\n\nאתר שנבנה סביב בונה עמודים מסוים או פלטפורמה סגורה קשור אליהם. לא בגלל שמישהו רצה לכלוא אתכם, אלא כי התוכן שמור בפורמט של אותו כלי. ביום שתרצו לעבור — כי המחיר עלה, כי הפלטפורמה השתנתה, כי אתם רוצים משהו שהיא לא תומכת בו — אתם מגלים שאין \"ייצוא\" אמיתי. יש התחלה מחדש.\n\nהשאלה הפשוטה לשאול כל ספק, ולפני החתימה: **אם ניפרד מחר בבוקר, מה בדיוק אני לוקח איתי?**\n\nהתשובה הנכונה היא: את הקוד, את הדומיין, את התוכן ואת הגישה להוסטינג — הכול רשום על שמכם. אם התשובה מתחילה ב\"תלוי\", זה כבר החלק היקר.\n\n## אז מתי וורדפרס דווקא כן הבחירה הנכונה\n\nאנחנו לא חושבים שהתשובה היא תמיד קוד ייעודי, ומי שאומר את זה מוכר לכם משהו.\n\nוורדפרס הוא בחירה טובה כשאתם צריכים אתר באוויר מהר ובתקציב מינימלי, וזו החלטה מודעת לטווח קצר. הוא טוב כשהתוכן משתנה כל יום בידי מישהו לא טכני שכבר מכיר את הממשק. הוא מצוין למגזין או לבלוג עם היקף פרסום גבוה. והוא הגיוני מאוד כשעדיין לא ברור אם הרעיון העסקי בכלל יעבוד — אין טעם לבנות תשתית לחמש שנים למשהו שלא בטוח שיחזיק חצי שנה.\n\nקוד ייעודי מתחיל להשתלם כשהאתר מפסיק להיות ברושור ומתחיל להיות **חלק מהתפעול** — כשיש עליו הזמנות, כשהוא מדבר עם מערכת אחרת, כשהמהירות שלו משפיעה על הכנסה, או כשאתם יודעים שאתם הולכים להחזיק אותו שנים ולא חודשים.\n\n## תרגיל של עשר דקות לסיום\n\nלפני שמשווים שתי הצעות מחיר, שווה לעצור ולחשב דבר אחד: מה סך העלות שלכם על פני שלוש שנים, כולל רישיונות שנתיים, שעות תחזוקה — גם שלכם — והסיכון שתרצו לעבור באמצע.\n\nזה תרגיל של עשר דקות בגיליון אחד. במקרים לא מעטים הוא הופך את התשובה, ולפעמים הוא דווקא מאשר את ההצעה הזולה. שתי התוצאות בסדר גמור. מה שלא בסדר הוא להשוות רק את המספר שבשורה התחתונה של ההצעה, כי הוא פשוט לא המספר.\n\n---\n\nעשיתם את התרגיל ויצא לכם מספר שלא ציפיתם לו? [שלחו לנו אותו](/he/contact). נגיד לכם בכנות אם כדאי לכם לעבור — או להישאר.\n",
      "en": "\n\nWhen a business asks for a website quote, it's really asking one question: what does this cost?\n\nThat's a perfectly reasonable question, and it's also the wrong one. Not because price doesn't matter — it matters a great deal — but because the number on the quote is only the part that's easy to count. The rest gets paid in a drip: small recurring charges, hours nobody logged, and decisions that only reveal their price in year three.\n\nWe build in both worlds and we hold no grudge against WordPress. It runs an enormous share of the web for good reason. But the conversation about which one \"costs more\" is almost always held around the wrong variable, so let's break it into five real costs.\n\n## 1. The cost that comes back every year\n\nA typical WordPress site isn't one product. It's one product carrying between ten and thirty plugins, some of which bill annually.\n\nA forms plugin. A caching plugin. An SEO plugin. A gallery plugin. Backups. Security. Translation. A page builder. Each one is an independent product from an independent company with an independent pricing model, and each has a day in the year when it asks to be renewed.\n\nNone of them is expensive on its own. That's exactly the point — individually each is too small to argue about, and collectively they become a fixed number leaving the business every year, without anyone ever having sat down and totalled it once.\n\nWith custom code that number is usually zero. There's hosting, and there's a domain. That's it.\n\n## 2. The maintenance cost nobody prices\n\nWordPress requires updates. Core updates, plugins update, the theme updates, and the PHP version underneath updates too.\n\nMost of the time this passes smoothly. Then comes the day when one plugin's update breaks something in another, the site looks strange on mobile, and nobody knows which of the two updates is at fault. You find out because a customer called, not because a system alerted you.\n\nThe real question isn't what the fix costs. It's **who owns it**. If the answer is \"the business owner, in the evenings,\" that's a cost that appears nowhere and is the most expensive of the lot, because it's billed against the time of the most expensive person in the business.\n\nCustom code has its own maintenance, and we won't pretend otherwise. But there's a structural difference: with custom code you update when you decide to, and only what you need. With WordPress you update when an external vendor decided, and the timing isn't yours to choose.\n\n## 3. The security cost\n\nWordPress is the most popular target for website attacks in the world, simply because it's the most widespread. But WordPress core itself is well maintained. Most of the compromises we see don't come from there — they come from a plugin.\n\nA plugin is third-party code running with full privileges inside your site. When its developer stops maintaining it — which happens constantly, especially with free plugins — a disclosed vulnerability stays open. You won't know. The plugin will keep working fine.\n\nThere's a dimension here that isn't only money. If your site has a contact form, it holds people's personal data. A leaked lead list isn't just embarrassing — it can be a regulatory exposure.\n\nOn a custom-built site, most of the code running is code written for you. The attack surface is an order of magnitude smaller, simply because there are far fewer doors.\n\n## 4. The performance cost — the one you pay in conversions\n\nA typical WordPress page is assembled in real time: PHP runs, the database is queried, twenty plugins each add their own CSS and JavaScript, and only then does the page begin loading for the user.\n\nYou can improve this. There's caching, there's a CDN, there's optimisation. But notice the shape of that move — you're paying for layers whose job is to cancel out the cost of other layers you already paid for.\n\nA modern custom-built site is compiled ahead of time into static files and served from the edge. No PHP running, no query, no twenty plugins. The page simply already exists.\n\nAnd this is where it stops being a technical discussion. A one-second difference in mobile load time translates into abandonment, and abandonment translates into enquiries that never arrived. **That's the cost that's hardest to see, because it never leaves the account — it just never enters it.**\n\n## 5. The lock-in cost\n\nThis one surfaces late, and usually at the worst possible moment.\n\nA site built around a particular page builder or closed platform is tied to it. Not because anyone set out to trap you, but because the content is stored in that tool's format. The day you want to move — because pricing changed, because the platform changed, because you want something it doesn't support — you discover there's no real export. There's a fresh start.\n\nThe simple question to ask any vendor, before signing: **if we part ways tomorrow morning, what exactly do I take with me?**\n\nThe right answer is: the code, the domain, the content and hosting access — all registered in your name. If the answer begins with \"it depends,\" that's already the expensive part.\n\n## So when is WordPress genuinely the right choice?\n\nWe don't think the answer is always custom code, and anyone who tells you it is, is selling you something.\n\nWordPress is a good choice when you need a site live quickly on a minimal budget, and that's a conscious short-term decision. It's good when content changes daily at the hands of a non-technical person who already knows the interface. It's excellent for a magazine or a high-volume publishing blog. And it makes a lot of sense when it isn't yet clear the business idea will work at all — there's no point building five-year infrastructure for something that may not last six months.\n\nCustom code starts paying off when the site stops being a brochure and becomes **part of operations** — when orders run through it, when it talks to another system, when its speed affects revenue, or when you know you'll be holding onto it for years rather than months.\n\n## A ten-minute exercise\n\nBefore comparing two quotes, it's worth stopping to calculate one thing: your total cost across three years, including annual licences, maintenance hours — yours included — and the risk that you'll want to move partway through.\n\nIt's a ten-minute exercise in a single spreadsheet. More often than you'd think it flips the answer, and sometimes it confirms the cheaper quote. Both outcomes are fine. What isn't fine is comparing only the number on the bottom line, because that simply isn't the number.\n\n---\n\nRan the exercise and got a figure you weren't expecting? [Send it to us](/en/contact). We'll tell you honestly whether it's worth moving — or staying.\n"
    }
  }
]
