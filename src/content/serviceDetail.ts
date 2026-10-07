import type { Bilingual } from '@/content/projects'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SERVICE PAGE DETAIL
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  The second half of every service page: who it is for, how the work runs,
 *  what moves the price, and the questions people actually ask.
 *
 *  ── Why this is its own module ───────────────────────────────────────────────
 *
 *  `content/services.ts` holds what a service IS - the query it exists for, the
 *  title, the outcomes, the case studies that back it. That file is read by the
 *  hub, by the homepage cards, by the offer catalogue in the JSON-LD and by the
 *  sitemap's lastmod mapping, and it is the file a reviewer opens to check that
 *  a service has not drifted from the work.
 *
 *  This is page BODY. Folding ~600 words per service into the same objects
 *  would have quadrupled that file and buried the four fields anyone actually
 *  reviews. Keeping it separate also lets `/services/migration` - which
 *  predates `content/services.ts`, keeps its own route and reads its headline
 *  copy from the dictionary - take exactly the same treatment, which it could
 *  not have done from inside an array it is not a member of.
 *
 *  ── The content rule, applied ────────────────────────────────────────────────
 *
 *  Everything here is a restatement of something the site already commits to,
 *  or a fact about how the work is done. Specifically:
 *
 *    - "2-3 weeks" / "4-6 weeks" and "the first month of fixes is included"
 *      are the homepage FAQ's own answers.
 *    - "projects usually start in the low thousands of shekels" is the
 *      homepage FAQ's own answer, and it is the ONLY figure about money
 *      anywhere in this file.
 *    - the twenty-minute scoping call is the hero's `cta_note`.
 *    - the ownership answer is the homepage FAQ's, which the migration page
 *      already renders in full.
 *    - the technical specifics - picker and kitchen screens, two-way ODOO
 *      sync, the E2E suite, the work-order life cycle, the 22 and 24 page
 *      rebuilds - are each in an approved case-study narrative.
 *
 *  **No price range appears here, in any currency, for any service.** The
 *  ecommerce page's cost section lists what the money is spent on and what
 *  moves the total, and stops there. See TODO(owner) on that entry: ranges go
 *  in when the owner sends them, and not before.
 *
 *  ⚠️  ENGLISH IS UNREVIEWED, on the same terms as `content/projects.ts`: the
 *  Hebrew is the source of truth and every `en` string is marked TODO(i18n) at
 *  the top of its entry rather than per line.
 */

export type ServiceProcessStep = {
  /** The stage's name - short enough to read as a label. */
  label: Bilingual
  /** What happens in it. */
  detail: Bilingual
}

export type ServiceFaq = {
  question: Bilingual
  answer: Bilingual
}

/** An H2 a single service needs and the others do not. */
export type ServiceSection = {
  heading: Bilingual
  /** Paragraphs separated by a blank line, rendered with whitespace-pre-line. */
  body: Bilingual
  items?: Bilingual[]
}

export type ServiceDetail = {
  /** Who the service suits - the "is this me" test, as a list. */
  audience: Bilingual[]
  /** The work, in stages. */
  process: ServiceProcessStep[]
  /** The paragraph above the price factors. */
  pricingBody: Bilingual
  /** What moves the number, as a list. */
  pricingFactors: Bilingual[]
  /**
   * Overrides the shared "what moves the price" heading.
   *
   * One service uses it: the ecommerce page, whose H2 has to be the query
   * itself. Search Console shows the site already receiving impressions for
   * `הקמת חנות אינטרנט עלות` at around position 37 with no heading
   * anywhere on the site that answers it.
   */
  pricingTitle?: Bilingual
  /** Extra H2 sections, for a query this service should answer by name. */
  sections?: ServiceSection[]
  /** 4-6 questions. Feeds the visible FAQ and the page's FAQPage schema. */
  faq: ServiceFaq[]
}

/*
 * Keyed by the slug under /services/. `migration` is a member here even
 * though it is not a member of `servicePages` - see the note at the top.
 */
export const serviceDetail: Record<string, ServiceDetail> = {
  // ── בניית אתר תדמית ─────────────────────────────────────────────────────
  // TODO(i18n): the Hebrew in this entry is approved; the English is a
  // literal rendering and has not been reviewed as marketing copy.
  websites: {
    audience: [
      {
        he: 'עסק שהלקוחות שלו מחפשים אותו בגוגל לפני שהם מתקשרים - בעל מקצוע, מרפאה, מכון, ספק שירות מקומי.',
        en: 'A business whose clients search for it in Google before they call - a tradesperson, a clinic, a practice, a local service provider.',
      },
      {
        he: 'עסק שיש לו אתר, והוא נטען לאט, לא עובד כמו שצריך בנייד, או לא מביא אף פנייה.',
        en: 'A business that has a site which loads slowly, does not work properly on a phone, or brings in no enquiries at all.',
      },
      {
        he: 'עסק שרוצה שהאתר יהיה שלו - הקוד והדומיין על שמו, בלי מנוי לפלטפורמה ובלי תלות במי שבנה.',
        en: 'A business that wants the site to be its own - code and domain in its name, with no platform subscription and no dependence on whoever built it.',
      },
      {
        he: 'עסק שהנגישות אצלו היא דרישה ולא המלצה: גוף שמקבל קהל, מוסד חינוכי, או מי שחשוף לתלונה.',
        en: 'A business for which accessibility is a requirement rather than a recommendation: anywhere that receives the public, an educational body, or anyone exposed to a complaint.',
      },
    ],
    process: [
      {
        label: { he: 'שיחת אפיון', en: 'Scoping call' },
        detail: {
          he: 'עשרים דקות. מה העסק עושה, מי הלקוח, מה צריך לקרות באתר כדי שהוא ייחשב מוצלח. בלי מצגת ובלי התחייבות.',
          en: 'Twenty minutes. What the business does, who the client is, and what has to happen on the site for it to count as a success. No deck and no commitment.',
        },
      },
      {
        label: { he: 'מבנה ותוכן', en: 'Structure and content' },
        detail: {
          he: 'אילו עמודים קיימים, מה הכותרת של כל אחד ואיזו שאלה הוא עונה. זה השלב שקובע אם האתר יימצא בגוגל, והוא נעשה לפני שמישהו פותח קובץ עיצוב.',
          en: 'Which pages exist, what each one is headed and which question it answers. This is the stage that decides whether the site gets found, and it happens before anyone opens a design file.',
        },
      },
      {
        label: { he: 'עיצוב ובנייה', en: 'Design and build' },
        detail: {
          he: 'עמוד אחד מאושר קודם, ואחריו השאר. האתר נבנה סטטי במלואו - בלי שרת שמרכיב אותו בכל בקשה ובלי תוספים שרצים ברקע.',
          en: 'One page approved first, then the rest. The site is built fully static - no server assembling it per request and no plugins running in the background.',
        },
      },
      {
        label: { he: 'נגישות וביצועים', en: 'Accessibility and performance' },
        detail: {
          he: 'היררכיית כותרות, ניווט מקלדת, ניגודיות וטקסט חלופי לפי ת"י 5568 - בקוד, לא בווידג\'ט. הביצועים נמדדים על רשת סלולרית מואטת ולא על המחשב שבנה את האתר.',
          en: 'Heading hierarchy, keyboard navigation, contrast and alternative text to the Israeli standard IS 5568 - in the code, not in a widget. Performance is measured on a throttled mobile connection rather than on the machine that built the site.',
        },
      },
      {
        label: { he: 'עלייה לאוויר והעברה לבעלותכם', en: 'Launch and handover' },
        detail: {
          he: 'הדומיין נרשם על שמכם, הקוד עובר אליכם, והגישה לאחסון היא שלכם. חודש ראשון של תיקונים והתאמות כלול.',
          en: 'The domain is registered in your name, the code is transferred to you, and the hosting access is yours. The first month of fixes and adjustments is included.',
        },
      },
    ],
    pricingBody: {
      he: 'אנחנו לא נותנים מספר לפני שהבנו מה צריך לבנות, כי כל מספר כזה הוא ניחוש. אתר תדמית מתחיל בדרך כלל בכמה אלפי שקלים, והטווח המדויק מגיע בהצעה בכתב אחרי שיחת האפיון. אלה הדברים שמזיזים אותו:',
      en: 'We do not give a number before we understand what needs building, because any such number is a guess. A business site usually starts in the low thousands of shekels, and the exact range arrives in a written proposal after the scoping call. These are the things that move it:',
    },
    pricingFactors: [
      {
        he: 'מספר העמודים, ובעיקר כמה מהם עמודי תוכן נפרדים ולא וריאציות של אותו עמוד.',
        en: 'The number of pages, and above all how many of them are separate bodies of content rather than variants of one page.',
      },
      {
        he: 'אם התוכן והתמונות קיימים, או שצריך לכתוב ולצלם.',
        en: 'Whether the text and the photography exist, or have to be written and shot.',
      },
      {
        he: 'טפסים, יומן, תשלום: כל חיבור למערכת חיצונית הוא עבודה בפני עצמה.',
        en: 'Forms, a calendar, a payment: every connection to an outside system is a piece of work in itself.',
      },
      {
        he: 'שתי שפות. זה לא תרגום - זה מבנה כפול, כולל RTL, בכל עמוד.',
        en: 'Two languages. That is not translation - it is a doubled structure, RTL included, on every page.',
      },
      {
        he: 'רמת ההתאמה בעיצוב, בין מבנה מסודר לבין עיצוב ייחודי מאפס.',
        en: 'How bespoke the design is, between a disciplined layout and a unique design from scratch.',
      },
      {
        he: 'לוח הזמנים: אתר תדמית לוקח 2-3 שבועות מרגע שהתוכן בידיים.',
        en: 'The timeline: a business site takes 2-3 weeks from the point the content is in hand.',
      },
    ],
    faq: [
      {
        question: { he: 'כמה זמן לוקח לבנות אתר תדמית?', en: 'How long does a business website take?' },
        answer: {
          he: 'שבועיים עד שלושה, מרגע שהתוכן והתמונות בידיים. התאריך נקבע בהצעה ואנחנו מחויבים אליו; אם משהו מתעכב מצידנו אתם שומעים על זה מיד ולא בסוף.',
          en: 'Two to three weeks from the point the text and images are in hand. The date is set in the proposal and we are committed to it; if something slips on our side you hear about it immediately rather than at the end.',
        },
      },
      {
        question: { he: 'האתר יהיה שלי או שלכם?', en: 'Will the site be mine or yours?' },
        answer: {
          he: 'שלכם. הדומיין נרשם על שמכם, הקוד עובר אליכם והגישה לאחסון היא שלכם. אם תרצו להמשיך עם מפתח אחר - תוכלו, בלי שנצטרך לשחרר לכם משהו.',
          en: 'Yours. The domain is registered in your name, the code is transferred to you and the hosting access is yours. If you want to continue with another developer you can, with nothing for us to release to you first.',
        },
      },
      {
        question: { he: 'למה אתר סטטי ולא וורדפרס?', en: 'Why a static site rather than WordPress?' },
        answer: {
          he: 'אתר סטטי מוגש כקבצים מוכנים, ולכן הוא נטען מהר גם ברשת סלולרית חלשה ואין בו פאנל ניהול או תוסף שאפשר לפרוץ דרכו. הוא גם לא דורש רישיונות שנתיים ולא שעות עדכונים. וורדפרס משתלם כשהאתר הוא ברושור שמתעדכן לעיתים רחוקות; הפער נפתח כשהוא הופך לחלק מהתפעול.',
          en: 'A static site is served as finished files, so it loads fast even on a weak mobile connection and there is no admin panel or plugin to break in through. It also needs no annual licences and no update hours. WordPress pays off when the site is a brochure that changes rarely; the gap opens once it becomes part of how the business runs.',
        },
      },
      {
        question: { he: 'האתר יהיה נגיש לפי התקן?', en: 'Will the site be accessible to the standard?' },
        answer: {
          he: 'הנגישות נבנית לתוך הקוד מההתחלה - היררכיית כותרות, ניווט מקלדת, ניגודיות וטקסט חלופי לפי ת"י 5568 - ולא מודבקת בסוף בווידג\'ט. ווידג\'ט נגישות מאפשר שינוי תצוגה ואינו מתקן את מבנה הקוד, שהוא עיקר מה שהתקן דורש. את המצב המדויק שלכם כדאי לבדוק מול מורשה נגישות.',
          en: 'Accessibility is built into the code from the start - heading hierarchy, keyboard navigation, contrast and alternative text to IS 5568 - rather than bolted on at the end with a widget. An accessibility widget allows display changes and does not fix the structure of the code, which is most of what the standard asks for. Your own exact obligations are worth checking with an accessibility consultant.',
        },
      },
      {
        question: { he: 'מה קורה אחרי שהאתר עולה לאוויר?', en: 'What happens after the site goes live?' },
        answer: {
          he: 'חודש ראשון של תיקונים והתאמות כלול. אחרי זה אפשר לעבוד מול חבילת תחזוקה חודשית או לפי צורך, בלי התחייבות. אתר סטטי לא דורש עדכוני אבטחה שוטפים, כך שהתחזוקה היא תוכן ושינויים ולא תוספים.',
          en: 'The first month of fixes and adjustments is included. After that you can work against a monthly maintenance package or on demand, with no commitment. A static site needs no routine security updates, so maintenance is content and changes rather than plugins.',
        },
      },
      {
        question: {
          he: 'יש לי אתר קיים - לבנות מחדש או לשפר אותו?',
          en: 'I already have a site - rebuild it or improve it?',
        },
        answer: {
          he: 'תלוי על מה הוא בנוי. אם הוא יושב על פלטפורמה סגורה או על עשרים תוספים, שיפור הוא בדרך כלל כסף שנזרק על בסיס שלא ישתפר. יש לנו שירות נפרד להעברת אתר לקוד נקי בבעלותכם, והוא העמוד שכדאי לקרוא במצב הזה.',
          en: 'It depends what it is built on. If it sits on a closed platform or on twenty plugins, improving it is usually money spent on a foundation that will not get better. We have a separate service for migrating a site to clean code you own, and that is the page to read in this situation.',
        },
      },
    ],
  },

  // ── אוטומציה לעסקים ────────────────────────────────────────────────────
  // TODO(i18n): as above.
  automation: {
    audience: [
      {
        he: 'תהליך שחוזר על עצמו כמה פעמים ביום ועובר דרך בן אדם שרק מעביר נתון ממקום למקום.',
        en: 'A process that repeats several times a day and passes through a person whose only job in it is moving a figure from one place to another.',
      },
      {
        he: 'אותו נתון שמוקלד פעמיים - פעם באקסל, פעם במערכת - ושתי הגרסאות כבר לא זהות.',
        en: 'The same figure typed in twice - once into a spreadsheet, once into a system - with the two copies no longer matching.',
      },
      {
        he: 'אין תמונה אחת של מה פתוח עכשיו, ומי שרוצה לדעת מתקשר ושואל.',
        en: 'There is no single picture of what is open right now, so anyone who wants to know has to call and ask.',
      },
      {
        he: 'מערכות שכבר קיימות ועובדות, ואין ביניהן שום חיבור.',
        en: 'Systems that already exist and work, with no connection whatsoever between them.',
      },
    ],
    process: [
      {
        label: { he: 'מיפוי התהליך כפי שהוא', en: 'Mapping the process as it is' },
        detail: {
          he: 'לא כפי שהוא אמור להיות. מי מקליד מה, לאן זה עובר, מי מחכה למי, ואיפה מישהו כבר בנה פתרון עקיפה באקסל.',
          en: 'Not as it is supposed to be. Who types what, where it goes next, who waits on whom, and where someone has already built a workaround in a spreadsheet.',
        },
      },
      {
        label: { he: 'בחירת החלק הראשון', en: 'Choosing the first piece' },
        detail: {
          he: 'אחד, לא הכול. בוחרים את הקטע שמחזיר את מספר השעות הגדול ביותר ביחס לעבודה שהוא דורש, גם אם הוא לא זה שבגללו התקשרתם.',
          en: 'One, not everything. We pick the stretch that returns the most hours relative to the work it takes, even when it is not the one you called about.',
        },
      },
      {
        label: { he: 'בנייה בשלבים', en: 'Building in stages' },
        detail: {
          he: 'בסוף כל שלב יש משהו שאפשר להשתמש בו. כך רואים את המערכת מול התהליך האמיתי לפני שהיא גמורה, ולא מגלים בסוף שהלכנו לכיוון הלא נכון.',
          en: 'At the end of every stage there is something usable. That way the system meets the real process before it is finished, instead of the direction turning out to be wrong at the end.',
        },
      },
      {
        label: { he: 'חיבור למה שכבר יש', en: 'Connecting to what exists' },
        detail: {
          he: 'המערכות הקיימות נשארות. אנחנו מחברים אליהן, כך שהנתון נכנס פעם אחת ומגיע לכל מקום שצריך - כמו הסנכרון הדו-כיווני מול ה-ERP שבנינו בחנות של J-Cafe.',
          en: 'The existing systems stay. We connect to them, so a figure goes in once and reaches everywhere it needs to - as with the two-way ERP sync we built for the J-Cafe store.',
        },
      },
      {
        label: { he: 'הרצה מקבילה ומעבר', en: 'Parallel run and switchover' },
        detail: {
          he: 'התהליך הידני ממשיך לרוץ עד שהמערכת הוכיחה את עצמה על עבודה אמיתית. מעבר שמתבצע ביום אחד בלי גיבוי הוא איך שמערכות פנימיות מתות.',
          en: 'The manual process keeps running until the system has proved itself on real work. A switchover done in one day with no fallback is how internal systems die.',
        },
      },
    ],
    pricingBody: {
      he: 'אוטומציה מתומחרת לפי התהליך, לא לפי מספר המסכים. פרויקט מתחיל בדרך כלל בכמה אלפי שקלים, ומערכת עם אינטגרציות עולה יותר; הטווח מגיע בהצעה בכתב אחרי שמיפינו את התהליך. אלה הדברים שמזיזים אותו:',
      en: 'Automation is priced by the process rather than by the number of screens. A project usually starts in the low thousands of shekels, and a system with integrations costs more; the range arrives in a written proposal once the process is mapped. These are the things that move it:',
    },
    pricingFactors: [
      {
        he: 'כמה שלבים יש בתהליך וכמה אנשים שונים נוגעים בו.',
        en: 'How many stages the process has and how many different people touch it.',
      },
      {
        he: 'אם יש אינטגרציה, והאם למערכת שמולה יש API מתועד. קיים ומתועד הוא עבודה של ימים; לא קיים הוא עבודה של שבועות.',
        en: 'Whether there is an integration, and whether the system on the other side has a documented API. Documented is days of work; absent is weeks.',
      },
      {
        he: 'אם הנתונים הקיימים צריכים ייבוא וניקוי לפני שהמערכת יכולה להתחיל מהם.',
        en: 'Whether the existing data needs importing and cleaning before the system can start from it.',
      },
      {
        he: 'הרשאות ותפקידים: מי רואה מה, ומי מורשה לאשר.',
        en: 'Permissions and roles: who sees what, and who is allowed to approve.',
      },
      {
        he: 'אם זה תהליך פנימי או שלקוחות רואים אותו. ממשק שלקוח רואה דורש עבודה שאין בכלי פנימי.',
        en: 'Whether it is internal or customer-facing. An interface a customer sees needs work an internal tool does not.',
      },
      {
        he: 'לוח הזמנים: מערכת עם אוטומציות לוקחת 4-6 שבועות.',
        en: 'The timeline: a system with automations takes 4-6 weeks.',
      },
    ],
    faq: [
      {
        question: {
          he: 'יש לי כמה תהליכים תקועים - מאיפה מתחילים?',
          en: 'I have several processes stuck - where do we start?',
        },
        answer: {
          he: 'מאחד. בשיחת האפיון מסתכלים על כולם ובוחרים את זה שמחזיר את הכי הרבה זמן ביחס לעבודה שהוא דורש. מערכת אחת שרצה בשבוע הראשון שווה יותר משלוש שנמצאות באמצע הבנייה.',
          en: 'With one. On the scoping call we look at all of them and pick the one that returns the most hours relative to the work it takes. One system running in the first week is worth more than three halfway built.',
        },
      },
      {
        question: {
          he: 'האוטומציה תתחבר למערכות שיש לי כבר?',
          en: 'Will the automation connect to the systems I already have?',
        },
        answer: {
          he: 'זו ברירת המחדל. חיבור למערכת קיימת כמעט תמיד עדיף על החלפה שלה - החלפה היא פרויקט בפני עצמו שמוסיף סיכון ולא מוסיף זמן חזרה. אם למערכת יש API מתועד, זו עבודה של ימים.',
          en: 'That is the default. Connecting to an existing system is almost always better than replacing it - a replacement is a project of its own that adds risk without adding returned hours. If the system has a documented API, it is days of work.',
        },
      },
      {
        question: { he: 'כמה זמן זה לוקח?', en: 'How long does it take?' },
        answer: {
          he: 'מערכת עם אוטומציות: 4-6 שבועות. העבודה בנויה בשלבים, כך שבסוף השלב הראשון יש כבר משהו שאפשר להשתמש בו - לא שישה שבועות של המתנה ואז שחרור אחד.',
          en: 'A system with automations: 4-6 weeks. The work is staged, so there is something usable at the end of the first stage rather than six weeks of waiting and then one release.',
        },
      },
      {
        question: {
          he: 'מה אם התהליך ישתנה בעוד חצי שנה?',
          en: 'What if the process changes in six months?',
        },
        answer: {
          he: 'הוא ישתנה, וזה בסדר. בגלל זה הקוד שלכם והוא לא נעול בכלי של ספק: שינוי הוא עבודה על מערכת שיש לכם, ולא בקשה למי שמחזיק אותה. חלק מהשינויים הם הגדרה ולא קוד, ועל אלה ננסה להחליט מראש בשלב המיפוי.',
          en: 'It will change, and that is fine. This is why the code is yours and not locked into a vendor tool: a change is work on a system you own rather than a request to whoever holds it. Some changes are configuration rather than code, and the mapping stage tries to decide which up front.',
        },
      },
      {
        question: {
          he: 'צריך להחליף את המערכת הקיימת כדי להתחיל?',
          en: 'Do I have to replace my current system to start?',
        },
        answer: {
          he: 'לא, וברוב המקרים לא כדאי. המערכת הקיימת היא בדרך כלל לא הבעיה - הבעיה היא החלק שבין המערכות, שבו מישהו מקליד ידנית. שם מתחילים.',
          en: 'No, and in most cases you should not. The existing system is usually not the problem - the problem is the gap between systems, where somebody types by hand. That is where we start.',
        },
      },
    ],
  },

  // ── מערכות ניהול לעסק ──────────────────────────────────────────────────
  // TODO(i18n): as above.
  'management-systems': {
    audience: [
      {
        he: 'ארגון שהעבודה בו לא רשומה במקום אחד, ולכן אי אפשר לדעת מה פתוח עכשיו בלי להתקשר ולשאול.',
        en: 'An organisation where the work is not recorded in one place, so there is no way to know what is open right now without calling to ask.',
      },
      {
        he: 'עסק שמנהל תהליך שלם באקסל, והקובץ הגיע לגודל שבו נוסחה שבורה היא כבר לא דבר חריג.',
        en: 'A business running an entire process in a spreadsheet that has reached the size where a broken formula is no longer unusual.',
      },
      {
        he: 'עסק שבדק תוכנת מדף וגילה שהוא צריך לשנות את התהליך שלו כדי להיכנס לתוכה.',
        en: 'A business that looked at off-the-shelf software and found it would have to change its own process to fit inside it.',
      },
      {
        he: 'צוות עם תפקידים שונים שצריכים לראות דברים שונים - טכנאי בשטח, מנהל, הנהלת חשבונות.',
        en: 'A team with different roles that need to see different things - a technician in the field, a manager, bookkeeping.',
      },
    ],
    process: [
      {
        label: { he: 'מיפוי התהליך והתפקידים', en: 'Mapping the process and the roles' },
        detail: {
          he: 'מי פותח, מי מבצע, מי מאשר, ומה בדיוק נחשב "סגור". זה נראה כמו שאלה מנהלית והיא ההחלטה שקובעת את מבנה המערכת.',
          en: 'Who opens, who executes, who approves, and what exactly counts as "closed". It looks like an administrative question and it is the decision that determines the structure of the system.',
        },
      },
      {
        label: { he: 'ייבוא מהקיים', en: 'Import from what exists' },
        detail: {
          he: 'המערכת מתחילה ממה שכבר יש ולא מאפס. האקסל הקיים מיובא, ומה שבתוכו הוא הנתונים של היום הראשון - אחרת אף אחד לא יעבור.',
          en: 'The system starts from what already exists rather than from zero. The current spreadsheet is imported, and what is in it is day-one data - otherwise nobody moves over.',
        },
      },
      {
        label: { he: 'בנייה של מחזור החיים', en: 'Building the life cycle' },
        detail: {
          he: 'פתיחה, הקצאה, ביצוע, סגירה מתועדת. כל שלב שאין לו מסך הוא שלב שיחזור לוואטסאפ.',
          en: 'Opened, assigned, executed, closed with a record. Any stage with no screen is a stage that will go back to WhatsApp.',
        },
      },
      {
        label: { he: 'מסכים לפי תפקיד', en: 'Screens per role' },
        detail: {
          he: 'מנהל רואה את כל הפתוח במסך אחד; מי שבשטח רואה את מה שעליו ושום דבר אחר. מערכת שמראה לכולם את אותו דבר היא מערכת שאף אחד לא מעדכן.',
          en: 'A manager sees everything open on one screen; whoever is in the field sees what is theirs and nothing else. A system that shows everyone the same thing is a system nobody updates.',
        },
      },
      {
        label: { he: 'הרצה והטמעה', en: 'Running it in' },
        detail: {
          he: 'המבחן היחיד שחשוב הוא שיהיה קל יותר לעבוד עם המערכת מאשר בלעדיה. בשבועות הראשונים מתקנים לפי מה שקורה בפועל, וזה כלול.',
          en: 'The only test that matters is that it is easier to work with the system than without it. In the first weeks we fix according to what actually happens, and that is included.',
        },
      },
    ],
    pricingBody: {
      he: 'מערכת ניהול מתומחרת לפי מספר התהליכים שהיא מחזיקה ולפי מה שהיא צריכה להתחבר אליו. פרויקט מתחיל בדרך כלל בכמה אלפי שקלים, ומערכת עם כמה תפקידים ואינטגרציות עולה יותר; הטווח מגיע בהצעה בכתב. אלה הדברים שמזיזים אותו:',
      en: 'A management system is priced by the number of processes it holds and by what it has to connect to. A project usually starts in the low thousands of shekels, and a system with several roles and integrations costs more; the range arrives in a written proposal. These are the things that move it:',
    },
    pricingFactors: [
      {
        he: 'כמה תהליכים המערכת מחזיקה - קריאות שירות בלבד, או גם תמחור, מלאי ודוחות.',
        en: 'How many processes the system holds - work orders alone, or pricing, stock and reporting as well.',
      },
      {
        he: 'כמה תפקידים יש, וכמה מסכים שונים הם דורשים.',
        en: 'How many roles there are, and how many different screens they need.',
      },
      {
        he: 'מורכבות החישובים. גלגול מחיר של חומר גלם דרך עץ מוצר הוא לא שדה מחושב אחד.',
        en: 'How complex the calculations are. Cascading a raw-material price through a product tree is not one computed field.',
      },
      {
        he: 'מצב הנתונים הקיימים: ייבוא מאקסל מסודר הוא עבודה אחרת מייבוא מחמישה קבצים שלא מסכימים ביניהם.',
        en: 'The state of the existing data: importing one tidy spreadsheet is different work from importing five files that disagree with each other.',
      },
      {
        he: 'אינטגרציות למערכות שכבר רצות אצלכם.',
        en: 'Integrations with systems already running in the business.',
      },
      {
        he: 'לוח הזמנים: מערכת לוקחת 4-6 שבועות.',
        en: 'The timeline: a system takes 4-6 weeks.',
      },
    ],
    sections: [
      {
        /*
         * The query, as an H2.
         *
         * Search Console shows impressions for `מערכת לניהול קריאות
         * שירות` at around position 16, against a page that never says the
         * phrase: `קריאות שירות` appeared once, inside a sentence about
         * something else. Air Manage is exactly this system and its case
         * study is already written, so this section is a heading, the work
         * described in the language of the query, and a link to the proof.
         */
        heading: {
          he: 'מערכת לניהול קריאות שירות',
          en: 'A work-order management system',
        },
        body: {
          he: 'קריאת שירות היא התהליך שבו הכי קל לאבד עבודה. היא נפתחת בטלפון, עוברת בוואטסאפ, מבוצעת בשטח ונסגרת בלי שאף אחד רשם מה בדיוק נעשה. כשזה המצב, אי אפשר לדעת כמה קריאות פתוחות עכשיו, מי מטפל במה, או כמה זמן לוקח לסגור קריאה - ולכן גם אין מה לשפר.\n\nמערכת לניהול קריאות שירות הופכת את המחזור הזה למפורש: כל קריאה נפתחת עם הפרטים שצריך כדי לטפל בה, מוקצית למי שיבצע, מתעדכנת מהשטח ונסגרת עם תיעוד. מעל זה מסך מנהל אחד שמראה את כל הפתוח.\n\nאת זה בנינו ואנחנו לא מתארים אותו מהתיאוריה: Air Manage היא מערכת קריאות שירות בשימוש יומיומי בארגון, עם מחזור חיים מלא לכל קריאה. העמוד שלה מפרט מה נבנה שם.',
          en: 'A work order is the process in which it is easiest to lose work. It opens on the phone, moves through WhatsApp, gets done in the field and closes without anyone recording what was actually done. In that state there is no way to know how many calls are open now, who is handling what, or how long a call takes to close - and therefore nothing to improve.\n\nA work-order management system makes that cycle explicit: every call opens with the details needed to handle it, is assigned to whoever will do it, is updated from the field and closes with a record. Above that sits a single manager screen showing everything open.\n\nWe have built this and are not describing it from theory: Air Manage is a work-order system in daily organisational use, with a full life cycle per call. Its case study sets out what was built there.',
        },
        items: [
          {
            he: 'פתיחת קריאה עם הפרטים שצריך כדי לטפל בה, ולא אחר כך בטלפון.',
            en: 'A call opened with the details needed to handle it, rather than chased by phone afterwards.',
          },
          {
            he: 'הקצאה לטכנאי או לצוות, כך שהאחראי מופיע על הקריאה עצמה.',
            en: 'Assignment to a technician or a team, so the person responsible is on the call itself.',
          },
          {
            he: 'עדכון מהשטח, כך שהסטטוס נכון בלי שיחת בירור.',
            en: 'Updates from the field, so the status is correct without a chasing call.',
          },
          {
            he: 'סגירה מתועדת: מה נעשה, מתי, ועל ידי מי.',
            en: 'A documented close: what was done, when, and by whom.',
          },
          {
            he: 'מסך מנהל אחד עם כל הקריאות הפתוחות, ממוין לפי מה שדחוף.',
            en: 'One manager screen with every open call, ordered by what is urgent.',
          },
        ],
      },
    ],
    faq: [
      {
        question: {
          he: 'למה לא תוכנת מדף שעולה פחות?',
          en: 'Why not off-the-shelf software that costs less?',
        },
        answer: {
          he: 'לפעמים כן, ונגיד את זה. תוכנת מדף משתלמת כשהתהליך שלכם דומה למה שהיא מניחה. הפער נפתח כשצריך לשנות את התהליך כדי להיכנס לתוכה - אז הרישיון זול והעבודה סביבו יקרה, והעבודה הזאת חוזרת כל חודש.',
          en: 'Sometimes it is, and we will say so. Off-the-shelf pays off when your process resembles the one it assumes. The gap opens when the process has to change to fit inside it - then the licence is cheap and the work around it is expensive, and that work comes back every month.',
        },
      },
      {
        question: {
          he: 'אפשר לייבא את האקסל שאנחנו עובדים איתו היום?',
          en: 'Can we import the spreadsheet we work with today?',
        },
        answer: {
          he: 'כן, וזה חלק מהתהליך ולא תוספת. מערכת שמתחילה ריקה לא מוטמעת - אף אחד לא מקליד שלוש שנים של נתונים מחדש. הייבוא הוא השלב שאחרי המיפוי.',
          en: 'Yes, and it is part of the process rather than an extra. A system that starts empty does not get adopted - nobody retypes three years of data. The import is the stage after the mapping.',
        },
      },
      {
        question: {
          he: 'מה מבטיח שהצוות באמת ישתמש בה?',
          en: 'What makes sure the team actually uses it?',
        },
        answer: {
          he: 'שום דבר מלבד זה שיהיה קל יותר לעבוד איתה מאשר בלעדיה. זה המבחן שאנחנו בודקים מולו כל מסך. מסכים לפי תפקיד הם חלק מזה: מי שבשטח רואה את מה שעליו ולא טופס שנבנה למנהל.',
          en: 'Nothing except it being easier to work with than without. That is the test we hold every screen to. Screens per role are part of it: whoever is in the field sees what is theirs rather than a form designed for a manager.',
        },
      },
      {
        question: {
          he: 'המערכת יכולה לדבר עם ההנהלת חשבונות או ה-ERP שלנו?',
          en: 'Can it talk to our bookkeeping or ERP?',
        },
        answer: {
          he: 'כן, כשיש ממה. אם למערכת שמולה יש API מתועד זו עבודה של ימים; אם אין, בודקים מה כן אפשר - ייצוא מתוזמן הוא לעיתים התשובה הנכונה. בנינו סנכרון דו-כיווני מול ODOO בפרויקט אחר, והעמוד שלו מפרט איך.',
          en: 'Yes, where there is something to talk to. If the system on the other side has a documented API it is days of work; if not, we look at what is possible - a scheduled export is sometimes the right answer. We built a two-way ODOO sync on another project, and its case study sets out how.',
        },
      },
      {
        question: {
          he: 'מי הבעלים של המערכת ושל הנתונים?',
          en: 'Who owns the system and the data?',
        },
        answer: {
          he: 'אתם. הקוד עובר אליכם והנתונים הם שלכם בכל רגע, כולל ייצוא. מערכת פנימית שאתם לא יכולים לקחת איתכם היא תלות, ואנחנו מוכרים את ההפך מזה.',
          en: 'You do. The code is transferred to you and the data is yours at any moment, export included. An internal system you cannot take with you is a dependency, and we sell the opposite of that.',
        },
      },
    ],
  },

  // ── בניית חנות אונליין ─────────────────────────────────────────────────
  // TODO(i18n): as above.
  ecommerce: {
    audience: [
      {
        he: 'עסק שההזמנות אצלו מגיעות בטלפון ובוואטסאפ, ומישהו מקריא אותן למטבח או למחסן.',
        en: 'A business whose orders arrive by phone and WhatsApp, with somebody reading them out to the kitchen or the warehouse.',
      },
      {
        he: 'עסק שמוכר אונליין וההזמנה נוחתת בתיבת מייל שצריך לזכור לבדוק.',
        en: 'A business selling online where the order lands in an inbox somebody has to remember to check.',
      },
      {
        he: 'עסק עם כמה סניפים או נקודות איסוף, שבו ההזמנה חייבת להגיע לנקודה הנכונה.',
        en: 'A business with several branches or collection points, where an order has to reach the right one.',
      },
      {
        he: 'עסק שהמלאי והמחירים שלו מנוהלים במערכת אחרת, והחנות צריכה להסכים איתה.',
        en: 'A business whose stock and prices live in another system that the store has to agree with.',
      },
    ],
    process: [
      {
        label: { he: 'אפיון מסלול ההזמנה', en: 'Scoping the order path' },
        detail: {
          he: 'לא עמוד המוצר - מה קורה אחרי התשלום. מי מקבל את ההזמנה, על איזה מסך, ומה הוא עושה איתה. זה מה שקובע אם החנות עובדת.',
          en: 'Not the product page - what happens after payment. Who receives the order, on which screen, and what they do with it. That is what decides whether the store works.',
        },
      },
      {
        label: { he: 'קטלוג, מלאי ומחירים', en: 'Catalogue, stock and prices' },
        detail: {
          he: 'מבנה הקטלוג והוריאציות, ומי מקור האמת למלאי ולמחיר. מה שהלקוח רואה צריך להיות מה שנכון, וזה החלטה ארכיטקטונית ולא הגדרה.',
          en: 'The catalogue structure and the variants, and which system is the source of truth for stock and price. What the customer sees has to be what is true, and that is an architectural decision rather than a setting.',
        },
      },
      {
        label: { he: 'תשלום ובדיקות', en: 'Checkout and tests' },
        detail: {
          he: 'חיבור לסליקה, וטיפול בכשלים ובהחזרים. מסלול ההזמנה מכוסה בבדיקות אוטומטיות שרצות על כל עדכון, כי במסחר באג בתשלום הוא יום מכירות אבוד.',
          en: 'The payment connection, and the handling of failures and refunds. The ordering path is covered by automated tests that run on every update, because in commerce a checkout bug is a lost day of sales.',
        },
      },
      {
        label: { he: 'מסכי תפעול', en: 'Operational screens' },
        detail: {
          he: 'מסך מלקט במחסן או בסניף, מסך מטבח (KDS) שמקבל את ההזמנה ישר. בנינו את שניהם לרשת עם שישה סניפים, ובלעדיהם ההזמנה חוזרת להיות דף מודפס.',
          en: 'A picker screen in the warehouse or the branch, a kitchen display that receives the order directly. We built both for a six-branch chain, and without them the order goes back to being a printed sheet.',
        },
      },
      {
        label: { he: 'סנכרון ועלייה לאוויר', en: 'Sync and launch' },
        detail: {
          he: 'חיבור דו-כיווני למערכת שמנהלת מלאי ומחירים, כך שעדכון במקום אחד מגיע לשני. ואחרי העלייה - חודש ראשון של תיקונים כלול.',
          en: 'A two-way connection to whatever manages stock and prices, so an update in one place reaches the other. And after launch, the first month of fixes is included.',
        },
      },
    ],
    /*
     * The heading IS the query. See `pricingTitle` on the type.
     *
     * TODO(owner): no range appears here, in any currency. The site's one
     * figure about money is the homepage FAQ's "projects usually start in the
     * low thousands of shekels", which is about a project and not about a
     * store, so it is not repeated here. Send the ranges you are willing to
     * publish - lower bound for a catalogue store, and for one with
     * operational screens and an integration - and they go in this block
     * under the factors. Until then the section answers what the money buys
     * and what moves the total, which is the part a reader can act on anyway.
     */
    pricingTitle: {
      he: 'כמה עולה הקמת חנות אינטרנט',
      en: 'What setting up an online store costs',
    },
    pricingBody: {
      he: 'אין מספר אחד, ומי שנותן אותו בטלפון לפני שראה את העסק נותן ניחוש. העלות של חנות אינטרנט מורכבת משכבות, וההפרש בין חנות זולה לחנות יקרה הוא כמעט תמיד בשכבת התפעול - מה קורה אחרי שההזמנה נכנסה - ולא בעיצוב של עמוד המוצר.\n\nאלה המרכיבים שכל חנות משלמת עליהם, בכל הצעה שתקבלו ומכל ספק:',
      en: 'There is no single number, and anyone who gives one over the phone before seeing the business is guessing. The cost of an online store is built out of layers, and the difference between a cheap store and an expensive one is almost always in the operational layer - what happens after the order comes in - rather than in the design of the product page.\n\nThese are the components every store pays for, in any quote you receive and from any supplier:',
    },
    pricingFactors: [
      {
        he: 'הקטלוג: כמה מוצרים, כמה וריאציות לכל מוצר, ומי מזין אותם בפעם הראשונה.',
        en: 'The catalogue: how many products, how many variants each, and who enters them the first time.',
      },
      {
        he: 'התשלום: חיבור לסליקה, והטיפול בכשלים, בהחזרים ובהזמנה שנתקעה באמצע.',
        en: 'Checkout: the payment connection, and the handling of failures, refunds and an order that stalls halfway.',
      },
      {
        he: 'מלאי ומחירים: מקור אמת אחד, ומי מעדכן אותו. זה המרכיב שמתגלה מאוחר כשלא טיפלו בו מראש.',
        en: 'Stock and prices: one source of truth, and who updates it. This is the component that surfaces late when it is not handled up front.',
      },
      {
        he: 'שילוח או איסוף: אזורים, מחירים, ואם יש - חיבור לחברת שליחויות.',
        en: 'Delivery or collection: areas, prices, and a courier connection where there is one.',
      },
      {
        he: 'תפעול ההזמנה: לאן היא מגיעה אחרי התשלום. מסך מלקט, מסך מטבח או סנכרון ל-ERP הם העבודה האמיתית, והם מה שמבדיל בין חנות שעובדת לחנות שנראית טוב.',
          en: 'Order operations: where it goes after payment. A picker screen, a kitchen display or an ERP sync are the real work, and they are what separates a store that works from one that looks good.',
      },
      {
        he: 'אינטגרציה למערכת קיימת: API מתועד הוא עבודה של ימים, היעדרו הוא עבודה של שבועות.',
        en: 'Integration with an existing system: a documented API is days of work, its absence is weeks.',
      },
      {
        he: 'שתי שפות, אם הקהל צריך אותן. זה מבנה כפול ולא תרגום.',
        en: 'Two languages, where the audience needs them. That is a doubled structure rather than a translation.',
      },
      {
        he: 'בדיקות אוטומטיות על מסלול ההזמנה. זו עלות מראש שמחליפה יום מכירות אבוד אחרי.',
        en: 'Automated tests on the ordering path. That is a cost up front in place of a lost day of sales later.',
      },
    ],
    faq: [
      {
        question: {
          he: 'כמה עולה להקים חנות אינטרנט?',
          en: 'How much does it cost to set up an online store?',
        },
        answer: {
          he: 'תלוי כמעט לגמרי בשכבת התפעול ולא בעיצוב: קטלוג פשוט עם סליקה הוא פרויקט אחד, וחנות שמחוברת למלאי, למסך מטבח ולמערכת ERP היא פרויקט אחר לגמרי. את הטווח תקבלו בהצעה בכתב אחרי שיחת אפיון שבה מיפינו מה קורה אחרי שההזמנה נכנסת. הסעיף למעלה מפרט את כל מרכיבי העלות, כך שתוכלו להשוות הצעות על אותם קריטריונים.',
          en: 'It depends almost entirely on the operational layer rather than the design: a simple catalogue with a payment connection is one project, and a store wired to stock, a kitchen display and an ERP is a different one. The range comes in a written proposal after a scoping call that maps what happens once an order arrives. The section above lists every cost component, so you can compare quotes on the same criteria.',
        },
      },
      {
        question: {
          he: 'מה המרכיב שהכי מפתיע בעלות של חנות?',
          en: 'Which cost component surprises people most?',
        },
        answer: {
          he: 'מקור האמת למלאי ולמחיר. כל עוד יש מקום אחד שבו הם מנוהלים, זו הגדרה. כשיש שניים - החנות והמערכת שהעסק עובד איתה - צריך להחליט מי מנצח ולבנות סנכרון, וזה עבודה שלא מופיעה בשום מחירון.',
          en: 'The source of truth for stock and price. As long as there is one place they are managed, it is configuration. Once there are two - the store and the system the business runs on - somebody has to decide which one wins and build the sync, and that is work no price list mentions.',
        },
      },
      {
        question: {
          he: 'אפשר לחבר את החנות למערכת שאנחנו עובדים איתה?',
          en: 'Can the store be connected to the system we already use?',
        },
        answer: {
          he: 'כן. בנינו סנכרון דו-כיווני מול ODOO לרשת עם שישה סניפים, כך שמלאי ומחירים נשארו מקור אמת אחד. אם למערכת שלכם יש API מתועד זו עבודה של ימים; אם לא, בודקים מה כן אפשר.',
          en: 'Yes. We built a two-way ODOO sync for a six-branch chain, so stock and prices stayed one source of truth. If your system has a documented API it is days of work; if not, we look at what is possible.',
        },
      },
      {
        question: {
          he: 'למה לא Shopify או וורדפרס עם WooCommerce?',
          en: 'Why not Shopify or WordPress with WooCommerce?',
        },
        answer: {
          he: 'לחנות קטלוגית פשוטה הם לרוב הבחירה הנכונה ונגיד את זה. הפער נפתח כשההזמנה צריכה להגיע לתפעול - מסך מלקט, מסך מטבח, סניף נכון, סנכרון דו-כיווני - ואז מצטברים תוספים, כל אחד עם רישיון שנתי ועם נקודת כשל, והחנות הופכת לדבר שקשה לשנות בבטחה.',
          en: 'For a simple catalogue store they are usually the right choice, and we will say so. The gap opens once an order has to reach operations - a picker screen, a kitchen display, the correct branch, a two-way sync - at which point plugins accumulate, each with an annual licence and a failure point, and the store becomes something it is hard to change safely.',
        },
      },
      {
        question: {
          he: 'מה אם ההזמנות נוחתות אצל הסניף הלא נכון?',
          en: 'What if orders land at the wrong branch?',
        },
        answer: {
          he: 'זה קורה, וזה לא באג בתצוגה - זו ארוחה שיצאה מהמטבח הלא נכון. הפתרון הוא שהשרת הוא הסמכות הבלעדית לזהות הסניף, בלי ערכי ברירת מחדל בקוד שמנחשים כשהזהות אובדת. פתרנו את זה בחנות של J-Cafe והעמוד שלה מפרט איך.',
          en: 'It happens, and it is not a display bug - it is a meal that left the wrong kitchen. The answer is for the server to be the sole authority on branch identity, with no default values in the code guessing when that identity is lost. We solved this on the J-Cafe store and its case study sets out how.',
        },
      },
    ],
  },

  // ── העברת אתר לקוד נקי ──────────────────────────────────────────────────
  // TODO(i18n): as above.
  migration: {
    audience: [
      {
        he: 'אתר שנטען לאט, ובכל פעם שבודקים למה - התשובה היא תוסף אחר.',
        en: 'A site that loads slowly, and every time you look into why, the answer is a different plugin.',
      },
      {
        he: 'אתר שהמפתח שבנה אותו נעלם, ואף אחד לא יודע איפה הקוד או מי מחזיק את הדומיין.',
        en: 'A site whose developer has disappeared, with nobody sure where the code is or who holds the domain.',
      },
      {
        he: 'אתר על פלטפורמה סגורה - Wix, Base44, בונה אתרים של חברת אחסון - שאי אפשר להוציא ממנה.',
        en: 'A site on a closed platform - Wix, Base44, the site builder a hosting company threw in - that cannot be taken out of it.',
      },
      {
        he: 'אתר שעובד, אבל התחזוקה והרישיונות שלו עולים יותר מהערך שהוא מחזיר.',
        en: 'A site that works, but whose maintenance and licences cost more than the value it returns.',
      },
    ],
    process: [
      {
        label: { he: 'מה יש היום', en: 'What is there today' },
        detail: {
          he: 'מפרטים את כל הכתובות הקיימות, את התוכן ואת מה שמביא תנועה. בלי הרשימה הזאת, העברה היא איך מאבדים את מה שהאתר הישן כבר השיג בגוגל.',
          en: 'We list every existing URL, the content, and what brings traffic. Without that list, a migration is how you lose what the old site already earned in Google.',
        },
      },
      {
        label: { he: 'החלטה על מה עובר', en: 'Deciding what moves' },
        detail: {
          he: 'לא הכול שווה להעביר. עמוד שלא נכנס אליו אף אחד בשנתיים האחרונות הוא עבודה שאפשר לא לעשות, ועמוד שמביא פניות הוא עמוד שחייב לשמור על הכתובת שלו.',
          en: 'Not everything is worth moving. A page nobody has visited in two years is work you can skip, and a page that brings enquiries is one that has to keep its address.',
        },
      },
      {
        label: { he: 'בנייה מחדש בקוד נקי', en: 'Rebuilding in clean code' },
        detail: {
          he: 'אותו עיצוב או טוב יותר, בלי תוספים. 22 ו-24 עמודים הם הגדלים ששני האתרים בתיק שלנו נבנו בהם מחדש, והם הוכחה שזה לא תיאוריה.',
          en: 'The same design or better, with no plugins. 22 and 24 pages are the sizes the two sites in our portfolio were rebuilt at, which is the evidence this is not theory.',
        },
      },
      {
        label: { he: 'שמירת ה-SEO', en: 'Keeping the SEO' },
        detail: {
          he: 'הפניות 301 מכל כתובת ישנה לחדשה, מפת אתר, ובדיקה שמה שהיה מדורג נשאר מדורג. זה השלב שבו העברות נכשלות, ולכן הוא לא "אחרי".',
          en: '301 redirects from every old address to its new one, a sitemap, and a check that what ranked still ranks. This is the stage migrations fail at, which is why it is not an afterthought.',
        },
      },
      {
        label: { he: 'העברה לבעלותכם', en: 'Handover' },
        detail: {
          he: 'הריפו, הדומיין והגישה לאחסון רשומים על שמכם. בסוף התהליך אתם לא תלויים בנו יותר ממה שתרצו להיות.',
          en: 'The repository, the domain and the hosting access are registered in your name. At the end of the process you depend on us no more than you want to.',
        },
      },
    ],
    pricingBody: {
      he: 'העברה מתומחרת לפי כמה עמודים עוברים ומה מתוך התוכן צריך לגעת בו. פרויקט מתחיל בדרך כלל בכמה אלפי שקלים, והטווח מגיע בהצעה בכתב אחרי שראינו את האתר הקיים. אלה הדברים שמזיזים אותו:',
      en: 'A migration is priced by how many pages move and how much of the content has to be touched. A project usually starts in the low thousands of shekels, and the range arrives in a written proposal once we have seen the existing site. These are the things that move it:',
    },
    pricingFactors: [
      {
        he: 'מספר העמודים שעוברים - לא מספר העמודים שקיימים.',
        en: 'The number of pages that move - not the number that exist.',
      },
      {
        he: 'אם התוכן נשאר כפי שהוא או נכתב מחדש בדרך.',
        en: 'Whether the content stays as it is or gets rewritten on the way.',
      },
      {
        he: 'כמה פונקציות חיות באתר הישן: טפסים, חנות, אזור אישי, יומן.',
        en: 'How much function lives in the old site: forms, a store, a member area, a calendar.',
      },
      {
        he: 'אם צריך לשמר עיצוב קיים בדיוק, או שיש חופש לשפר.',
        en: 'Whether an existing design has to be preserved exactly, or there is freedom to improve it.',
      },
      {
        he: 'מצב הכתובות הקיימות: מבנה נקי הוא מפת הפניות קצרה, מבנה שהצטבר שנים הוא ארוכה.',
        en: 'The state of the existing URLs: a clean structure is a short redirect map, one that accumulated over years is a long one.',
      },
      {
        he: 'אם הגישה לדומיין ולאחסון בידיים שלכם או שצריך לאתר אותה קודם.',
        en: 'Whether the domain and hosting access are in your hands or have to be tracked down first.',
      },
    ],
    faq: [
      {
        question: {
          he: 'אני אאבד את הדירוג שלי בגוגל?',
          en: 'Will I lose my Google rankings?',
        },
        answer: {
          he: 'לא, אם ההעברה נעשית נכון. כל כתובת ישנה מקבלת הפניה 301 לכתובת החדשה שלה, מפת האתר מוגשת מחדש, ואנחנו בודקים אחרי העלייה שמה שהיה מדורג נשאר מדורג. ההפסד קורה כשמעלים אתר חדש ומשאירים את הכתובות הישנות להחזיר 404.',
          en: 'Not if the migration is done properly. Every old address gets a 301 redirect to its new one, the sitemap is resubmitted, and after launch we check that what ranked still ranks. The loss happens when a new site goes up and the old addresses are left answering 404.',
        },
      },
      {
        question: {
          he: 'האתר ייראה אותו דבר?',
          en: 'Will the site look the same?',
        },
        answer: {
          he: 'אותו דבר או טוב יותר, לבחירתכם. אנחנו לא דורשים עיצוב חדש כתנאי להעברה - לפעמים העיצוב הקיים בסדר גמור והבעיה היא רק מה שמתחתיו.',
          en: 'The same or better, as you prefer. We do not require a new design as a condition of the migration - sometimes the existing design is perfectly fine and the problem is only what sits underneath it.',
        },
      },
      {
        question: {
          he: 'מה קורה לדומיין ולמיילים שלי?',
          en: 'What happens to my domain and my email?',
        },
        answer: {
          he: 'הדומיין נשאר שלכם ונרשם על שמכם אם הוא לא כבר. רשומות המייל לא נוגעים בהן בלי לתכנן את זה מראש - מייל שנופל ליום הוא הנזק הנפוץ ביותר בהעברות, והוא נמנע לגמרי.',
          en: 'The domain stays yours and is registered in your name if it is not already. Mail records are not touched without planning it first - email going down for a day is the most common damage in a migration, and it is entirely avoidable.',
        },
      },
      {
        question: {
          he: 'אני אוכל לערוך את התוכן בעצמי אחר כך?',
          en: 'Will I be able to edit the content myself afterwards?',
        },
        answer: {
          he: 'תלוי מה אתם צריכים לערוך ובאיזו תכיפות. לאתר שמתעדכן לעיתים רחוקות, שינוי נקודתי מצידנו זול יותר מתחזוקת מערכת ניהול שלמה בשבילו. לאתר שמתעדכן שבועית נבנה ממשק עריכה למה שבאמת משתנה. את זה מחליטים בשיחת האפיון ולא אחרי.',
          en: 'It depends what you need to edit and how often. For a site that changes rarely, a targeted change from us is cheaper than maintaining a whole content system for it. For a site that changes weekly we build an editing interface for the parts that actually change. That gets decided on the scoping call, not afterwards.',
        },
      },
      {
        question: {
          he: 'כמה זמן האתר יהיה למטה?',
          en: 'How long will the site be down?',
        },
        answer: {
          he: 'הוא לא. האתר החדש נבנה במקביל ונבדק על כתובת זמנית, וההחלפה היא שינוי הפניה אחד. האתר הישן ממשיך לרוץ עד הרגע שהחדש מוכן.',
          en: 'It will not be. The new site is built alongside and checked on a temporary address, and the switch is one pointer change. The old site keeps running right up to the moment the new one is ready.',
        },
      },
    ],
  },
}

/** The detail for a service slug, or undefined while one has not been written. */
export function getServiceDetail(slug: string): ServiceDetail | undefined {
  return serviceDetail[slug]
}
