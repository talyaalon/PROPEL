/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  This file replaces the old Sanity CMS. For a handful of case studies with a
 *  single editor it is strictly better: no dependencies, no hosting cost, and
 *  TypeScript refuses to build if a project is missing a required field.
 *
 *  Every project below is real and its `liveUrl` was verified to respond.
 *
 *  ⚠️  WHAT IS STILL MISSING - the outcome numbers.
 *
 *  Three projects now carry the full narrative: `headline`, `challenge`,
 *  `solution` and `changed`. What they do not carry is business outcomes, and
 *  every one of those is marked `PENDING` rather than guessed.
 *
 *  Search this file for `PENDING` to get the exact list of questions to ask
 *  each client. Nothing marked that way leaves this module - `getProjects`
 *  strips it, see `withoutPending` - so the pages are honest while the answers
 *  are outstanding, and each number appears the moment it is real.
 *
 *  Page counts and branch counts are verified facts about the build, and true,
 *  but they are not what closes a deal. What does is "cut quote preparation
 *  from 40 minutes to 4". Ask each client for one number.
 *
 *  A case study without a number is a description. With one it is evidence.
 *
 *  ⚠️  ENGLISH IS UNREVIEWED. Every `en` string added with the narrative is a
 *  literal rendering of approved Hebrew marked `TODO(i18n)`, not copy anyone
 *  has signed off. The Hebrew is the source of truth.
 */

import type { Locale } from '@/lib/i18n'
import { isProductionDeploy } from '@/lib/config'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Bilingual = Record<Locale, string>

export const projectCategories = ['web', 'ecommerce', 'automation', 'seo'] as const
export type ProjectCategory = (typeof projectCategories)[number]

/**
 * A number we intend to publish and do not have yet.
 *
 * Recorded rather than omitted, because the list of numbers still to ask each
 * client for is itself worth keeping - and keeping it here, next to the ones we
 * do have, is the only place it will not be forgotten.
 *
 * Nothing carrying this ever leaves the module: `getProjects` strips it, so an
 * unanswered metric cannot reach a page as an empty block, a dash, or the
 * literal string - and cannot be serialised into a client bundle either, which
 * is where it actually escaped the first time.
 */
const PENDING = 'TODO(metric)'

/** True for any value still waiting on a real number from the client. */
function isPending(value: string): boolean {
  return value.includes(PENDING)
}

export type ProjectResult = {
  /**
   * The number itself - kept short and glanceable. e.g. '×2.4', '−73%', '22'.
   * `PENDING` marks one we have not been given; it is never rendered.
   */
  metric: string
  /** What the number measures. */
  label: Bilingual
}

export type ProjectImage = {
  /** Path under /public - e.g. '/projects/jcafe/storefront.webp' */
  src: string
  alt: Bilingual
}

export type Project = {
  slug: string
  /**
   * Brand name.
   *
   * Latin brands are the same in both locales and stay a plain string. A
   * Hebrew brand is not readable to an English reader, and two of the five
   * were rendering as Hebrew script on `/en` - including in the `<title>` of
   * their own case study, so two of five English case studies had no English
   * text in the SERP at all. `titleEn` transliterates those, with the trade in
   * parentheses so the name still says what the business does.
   */
  title: string
  titleEn?: string
  category: ProjectCategory
  /**
   * The problem this project solved, in the client's language, used as the `h1`
   * of the case study in place of the brand name.
   *
   * The page used to open with the brand name over a row of technology chips -
   * `Next.js, Supabase, ODOO, Stripe`. That reads to a developer. The buyer we
   * want is a business owner who does not know what Supabase is and has no
   * reason to care; what they recognise is their own problem described back to
   * them. The brand name has not gone anywhere, it is in the breadcrumb, the
   * `<title>`, the card that linked here and the live-site button.
   */
  headline?: Bilingual
  /**
   * The work descriptor appended to the <title>: "הגורר 2 - אתר תדמית
   * לשירותי גרירה | PROPEL". A brand-name-only title spends the strongest
   * SERP line on a name nobody searches; this is the two-word answer to
   * "what is this". An empty string for one locale skips the suffix there -
   * the transliterated English names already carry the trade in parentheses.
   */
  titleTag?: Bilingual
  /** One line for the portfolio card. */
  summary: Bilingual
  /**
   * The case study's meta description, when the card line is too short for one.
   *
   * `summary` is written to fit a card, which makes it 69-110 characters - a
   * good card line and a thin search result. Rewriting it for the SERP would
   * change the card on the homepage, the portfolio index and the blog, so the
   * SERP gets its own sentence instead. Absent means the summary serves both.
   */
  metaDescription?: Bilingual
  techStack: string[]
  liveUrl?: string
  year?: number
  /** Client name, or the industry when an NDA prevents naming them. */
  client?: Bilingual
  /** What was broken before we arrived. Rendered as "what was stuck". */
  challenge?: Bilingual
  /** What we built. */
  solution?: Bilingual
  /**
   * The process we built, step by step, for the flow diagram on the case
   * study. Every step is taken from the approved narrative - it names a
   * screen or an action that exists. No step is invented for the drawing.
   */
  flow?: { label: Bilingual; meta?: Bilingual }[]
  /**
   * What changed afterwards - one line per outcome.
   *
   * Separate from `results` on purpose. `results` is a number in a block you
   * take in at a glance; this is the sentence that says what the number means.
   * Any line still carrying `PENDING` is removed by `getProjects`.
   */
  changed?: Bilingual[]
  /** Measurable outcomes. The most persuasive part of the page. */
  results?: ProjectResult[]
  /**
   * What was actually built, item by item.
   *
   * Deliberately NOT `changed`, and the distinction is the one that keeps this
   * file honest. `changed` is an outcome - what the work did for the business -
   * and every line of it needs a number from the client, which is why most of
   * them are `PENDING`. `delivered` is an inventory of the artefact: the page
   * count, the schema, the standard met, the platform absent. Those are facts
   * about the build, checkable by opening the site, and they do not need
   * anyone's permission to publish.
   *
   * Two of the five case studies ran to ~110 words because everything true
   * about them that did not need a client's number had nowhere to go.
   *
   * Stripped of `PENDING` like every other list here - see `withoutPending`.
   * Nothing in this field should ever carry one, since the whole point is
   * that these are already known; the filter is there because the invariant
   * is "no PENDING value leaves this module", not "none of the fields we
   * remembered to filter".
   */
  delivered?: Bilingual[]
  /**
   * Full-page screenshots driving the scrolling screen previews.
   *
   * Captured by `npm run shots`. Only publicly browsable sites have them -
   * a login screen says nothing about the work, so projects behind one keep
   * the empty frame instead.
   */
  screens?: { desktop: string; mobile: string }
  /**
   * Recordings and stills of a system that sits behind a login.
   *
   * Two of the strongest projects here are internal tools: a visitor sees a
   * lock icon and a sentence, which proves nothing. This is where their
   * evidence goes once the owner supplies it - screen recordings with dummy
   * data. Until then `PrivateProjectShowcase` renders its placeholder, and
   * NOTHING here is invented: no mock screenshots, no generated images.
   */
  media?: {
    /** Path under /public. `.mp4`/`.webm` render as video, images as <img>. */
    src: string
    /** Poster frame for a video. Optional. */
    poster?: string
    /** Describes what the recording shows - required, it is the alt text. */
    caption: Bilingual
  }[]
  thumbnail?: ProjectImage
  gallery?: ProjectImage[]
  /** Featured projects sort first on the homepage grid. */
  featured?: boolean
  /** Hidden from production deploys. */
  draft?: boolean
}

// ── Content ───────────────────────────────────────────────────────────────────

/*
 * Not exported. `getProjects()` is the only way to read this, which is what
 * makes "no `PENDING` value ever leaves this module" an invariant rather than a
 * convention - see `withoutPending`.
 */
const projects: Project[] = [
  {
    slug: 'jcafe-kosher',
    titleTag: { he: 'חנות אונליין', en: 'online store' },
    screens: {
      desktop: '/projects/jcafe-kosher/desktop.webp',
      mobile: '/projects/jcafe-kosher/mobile.webp',
    },
    title: 'J-Cafe - The Kosher Place',
    category: 'ecommerce',
    headline: {
      he: 'שישה סניפים, שתי שפות, מטבח אחד שצריך לדעת מה להכין',
      // TODO(i18n): approved Hebrew above; English is a literal rendering and
      // has not been reviewed as marketing copy.
      en: 'Six branches, two languages, one kitchen that needs to know what to make',
    },
    summary: {
      he: 'מסחר אונליין דו-לשוני לשישה סניפים בתאילנד, כולל מסכי מלקט ומסכי מטבח (KDS).',
      en: 'Bilingual online ordering for six branches in Thailand, including picker and kitchen display screens.',
    },
    metaDescription: {
      he: 'מסחר אונליין דו-לשוני לרשת כשרה עם שישה סניפים בתאילנד: תשלום מאובטח, מסך מלקט בכל סניף ומסך מטבח (KDS), בסנכרון דו-כיווני מול ODOO.',
      en: 'Bilingual online ordering for a kosher chain with six branches in Thailand: secure checkout, picker screens, a kitchen display, and two-way ODOO sync.',
    },
    challenge: {
      he: 'רשת כשרה עם שישה סניפים בתאילנד, וקהל שמדבר שתי שפות. ההזמנות הגיעו בערוצים מפוזרים, המטבח קיבל אותן בהעברה ידנית, ולא היה מקום אחד שבו אפשר לראות מה קורה בכל הסניפים באותו רגע.\n\nמתחת לזה ישבה תקלה חמורה יותר: שלושה מקורות אמת מתחרים לזהות הסניף, והזמנות דלפו בין סניפים. בקוד היה fallback קשיח לסניף ברירת מחדל בכ-38 מקומות. במערכת הזמנות, הזמנה שמגיעה לסניף הלא נכון היא לא באג בתצוגה - היא ארוחה שיצאה מהמטבח הלא נכון.',
      // TODO(i18n)
      en: 'A kosher chain with six branches in Thailand and an audience speaking two languages. Orders arrived through scattered channels, the kitchen received them by hand, and there was no single place to see what was happening across every branch at once.\n\nUnderneath that sat a worse fault: three competing sources of truth for branch identity, and orders leaking between branches. The code carried a hard fallback to a default branch in about 38 places. In an ordering system, an order that reaches the wrong branch is not a display bug - it is a meal that left the wrong kitchen.',
    },
    solution: {
      he: 'ההחלטה ההנדסית: השרת הופך לסמכות הבלעדית לזהות הסניף. הוספנו את resolveOrderCompany, עברנו למקור אמת יחיד מבוסס cookie מסוג httpOnly, נתנו לכל סניף מפתח עגלה נפרד, והסרנו את כל ה-fallbacks הקשיחים - כולם, לא רובם. סמכות אחת במקום שלוש.\n\nמעל זה נבנתה שכבת התפעול: חנות דו-לשונית עם תשלום מאובטח, מסך מלקט בכל סניף שמראה מה צריך להרכיב עכשיו, ומסך מטבח (KDS) שמקבל את ההזמנה ישר - בלי שאף אחד יצטרך להקריא אותה בקול. הכל מסונכרן דו-כיוונית עם ODOO, כך שמלאי ומחירים נשארים מקור אמת אחד.',
      // TODO(i18n)
      en: 'The engineering decision: the server becomes the sole authority for branch identity. We added resolveOrderCompany, moved to a single source of truth held in an httpOnly cookie, gave every branch its own cart key, and removed every hard fallback - all of them, not most. One authority in place of three.\n\nThe operations layer was built on top of that: a bilingual storefront with secure checkout, a picker screen in each branch showing what to assemble right now, and a kitchen display (KDS) that receives the order directly - with nobody reading it out loud. Everything syncs both ways with ODOO, so stock and prices stay a single source of truth.',
    },
    flow: [
      {
        label: { he: 'הזמנה באתר', en: 'Order placed on the site' },
        meta: {
          he: 'חנות דו-לשונית, תשלום מאובטח',
          en: 'Bilingual storefront, secure checkout',
        },
      },
      {
        label: { he: 'סנכרון מלאי ותמחור', en: 'Stock and pricing sync' },
        meta: {
          he: 'דו-כיווני מול ODOO - מקור אמת אחד',
          en: 'Two-way with ODOO - one source of truth',
        },
      },
      {
        label: { he: 'מסך מלקט בסניף', en: 'Picker screen at the branch' },
        meta: { he: 'מה להרכיב עכשיו, לפי סניף', en: 'What to assemble now, per branch' },
      },
      {
        label: { he: 'מסך מטבח (KDS)', en: 'Kitchen display (KDS)' },
        meta: {
          he: 'ההזמנה מגיעה ישר - אף אחד לא מקריא אותה בקול',
          en: 'The order arrives directly - nobody reads it out loud',
        },
      },
      {
        label: { he: 'בדיקות אוטומטיות על כל עדכון', en: 'Automated tests on every update' },
        meta: {
          he: 'מסלול ההזמנה נבדק לפני שכל שינוי קוד עולה',
          en: 'The ordering path is verified before any code change ships',
        },
      },
    ],
    changed: [
      {
        he: 'סוויטת הבדיקות גדלה מ-7 בדיקות ל-38',
        en: 'The test suite grew from 7 tests to 38',
      },
      {
        he: 'אפס דליפות הזמנות בין סניפים מאז',
        en: 'Zero order leaks between branches since',
      },
      {
        he: `זמן מרגע הזמנה עד שהיא על מסך המטבח: ${PENDING}`,
        en: `Time from order placed to order on the kitchen screen: ${PENDING}`,
      },
    ],
    results: [
      { metric: '6', label: { he: 'סניפים פעילים', en: 'active branches' } },
      { metric: '38', label: { he: 'בדיקות אוטומטיות', en: 'automated tests' } },
      { metric: '0', label: { he: 'דליפות הזמנות מאז', en: 'order leaks since' } },
      { metric: '2', label: { he: 'שפות ממשק', en: 'interface languages' } },
      { metric: PENDING, label: { he: 'הזמנות בחודש', en: 'orders per month' } },
    ],
    techStack: ['Next.js', 'Supabase', 'ODOO', 'Stripe', 'Vercel', 'Playwright'],
    liveUrl: 'https://www.jcafekosher.com/en/s/bangkok',
    featured: true,
  },
  {
    slug: 'hagorer2',
    titleTag: { he: 'אתר תדמית לשירותי גרירה', en: '' },
    screens: {
      desktop: '/projects/hagorer2/desktop.webp',
      mobile: '/projects/hagorer2/mobile.webp',
    },
    title: 'הגורר 2',
    titleEn: 'HaGorer 2 (Towing & Recovery)',
    category: 'web',
    summary: {
      he: 'אתר גרירה וחילוץ בן 22 עמודים, בנוי לקידום אורגני ונגיש לפי ת"י 5568.',
      en: 'A 22-page towing and roadside recovery site, built for organic search and accessible to the Israeli standard IS 5568.',
    },
    metaDescription: {
      he: 'אתר תדמית לשירותי גרירה וחילוץ בן 22 עמודים, בנוי לקידום אורגני ונגיש לפי ת"י 5568. האתר ניתן להתקנה בנייד כ-PWA ונבנה ב-HTML/CSS עם Schema.org.',
      en: 'A 22-page towing and roadside recovery site built for organic search, installable on mobile as a PWA, and accessible to the Israeli standard IS 5568.',
    },
    results: [
      { metric: '22', label: { he: 'עמודים', en: 'pages' } },
      { metric: 'PWA', label: { he: 'ניתן להתקנה בנייד', en: 'installable on mobile' } },
    ],
    challenge: {
      he: 'גרירה וחילוץ הוא שירות שמחפשים ברגע הגרוע ביום: ברכב שלא מניע, בשול של כביש, ביד אחת. החיפוש כמעט תמיד מקומי ומצבי - שם של שירות ועוד שם של אזור - ולכל צמד כזה יש כוונה אחרת וצריכה להיות לו תשובה אחרת.\n\nאתר של עמוד אחד יכול לענות על צמד אחד. על עשרים הוא לא יכול, כי אין בו עשרים כותרות, עשרים כתובות או עשרים עמודים שגוגל יכול לדרג בנפרד. זה היה האתגר כאן: מבנה שבו לכל שירות ולכל אזור שירות יש עמוד משלו ותוכן משלו, בלי שהאתר יהפוך לעשרים ושתיים גרסאות של אותו טקסט - ושייטען מהר על רשת סלולרית חלשה, כי זה התנאי שבו הוא נקרא בפועל.',
      // TODO(i18n): approved Hebrew above; English is a literal rendering and
      // has not been reviewed as marketing copy.
      en: 'Towing and roadside recovery is a service people look for at the worst moment of their day: in a car that will not start, on the hard shoulder, one-handed. The search is almost always local and situational - the name of a service plus the name of an area - and every one of those pairs carries a different intent and needs a different answer.\n\nA single-page site can answer one such pair. It cannot answer twenty, because it does not contain twenty headings, twenty addresses or twenty pages Google can rank separately. That was the problem here: a structure in which every service and every service area has a page and a body of its own, without the site becoming twenty-two variants of one piece of text - and one that loads fast on a weak mobile connection, because that is the condition it will actually be read in.',
    },
    solution: {
      he: 'האתר נבנה ב-HTML ו-CSS בלבד, בלי מערכת ניהול תוכן ובלי תוספים: 22 עמודים סטטיים שמוגשים כקבצים. זה מה שמייצר את זמן הטעינה בשטח, וזה גם מה שמוריד את משטח התקיפה: אין פאנל ניהול להיכנס אליו ואין תוסף שצריך לעדכן כל חודש.\n\nהמבנה הוא העבודה האמיתית. לכל שירות ולכל אזור שירות יש עמוד משלו עם כותרת H1 משלו, ועל כל עמוד יושבות סכמות Schema.org שמסבירות לגוגל שמדובר בעסק מקומי עם שירות, אזור שירות וטלפון - ולא בעמוד טקסט.\n\nהנגישות נבנתה פנימה ולא הודבקה מעל: היררכיית כותרות, טקסט חלופי לתמונות, ניווט מלא במקלדת וניגודיות לפי ת"י 5568, בלי ווידג\'ט נגישות חיצוני. והאתר ניתן להתקנה בנייד כ-PWA, כך שמי שקרא לגרר פעם אחת יכול להשאיר אותו על מסך הבית ולהגיע אליו בפעם הבאה בלי לחפש שוב.',
      // TODO(i18n)
      en: 'The site is built in HTML and CSS alone, with no content management system and no plugins: 22 static pages served as files. That is what produces the load time in the field, and it is also what reduces the attack surface - there is no admin panel to get into and no plugin that needs updating every month.\n\nThe structure is the real work. Every service and every service area has its own page with its own H1, and each page carries Schema.org markup telling Google this is a local business with a service, a service area and a telephone number rather than a page of text.\n\nAccessibility was built in rather than bolted on: heading hierarchy, alternative text, full keyboard navigation and contrast to the Israeli standard IS 5568, with no third-party accessibility widget. And the site is installable on a phone as a PWA, so someone who calls a tow truck once can leave it on their home screen and reach it next time without searching again.',
    },
    delivered: [
      {
        he: '22 עמודים סטטיים - עמוד נפרד לכל שירות ולכל אזור שירות',
        en: '22 static pages - a separate page for every service and every service area',
      },
      {
        he: 'סכמות Schema.org לעסק מקומי על כל עמוד: שירות, אזור שירות וטלפון',
        en: 'Local-business Schema.org on every page: service, service area and telephone',
      },
      {
        he: 'נגישות לפי ת"י 5568 - כותרות, טקסט חלופי, מקלדת וניגודיות, בלי תוסף',
        en: 'Accessibility to IS 5568 - headings, alt text, keyboard and contrast, with no overlay',
      },
      {
        he: 'התקנה בנייד כ-PWA, בלי לעבור דרך חנות אפליקציות',
        en: 'Installable on a phone as a PWA, with no app store in the way',
      },
      {
        he: 'בלי מערכת ניהול תוכן ובלי תוספים - אין פאנל לפרוץ ואין רישיונות שנתיים',
        en: 'No CMS and no plugins - nothing to break into and no annual licences',
      },
    ],
    /*
     * The outcome lines, unanswered.
     *
     * Every one of these is a question for the client and not a sentence we
     * can write: `getProjects` strips a `PENDING` line before it can render,
     * so the page is honest while the answers are outstanding and each line
     * appears the moment one arrives. Kept here rather than in a document,
     * because next to the facts above is the only place it will not be lost.
     */
    changed: [
      {
        he: 'TODO(metric): כמה פניות בחודש מגיעות מהאתר - שיחות טלפון מהעמודים',
        en: 'TODO(metric): enquiries per month from the site - calls placed from its pages',
      },
      {
        he: 'TODO(metric): על אילו צמדי שירות-ואזור האתר מופיע בעמוד הראשון',
        en: 'TODO(metric): which service-plus-area queries the site reaches the first page for',
      },
    ],
    techStack: ['HTML/CSS', 'SEO', 'PWA', 'Schema.org'],
    liveUrl: 'https://hagorer2.co.il',
    featured: true,
  },
  {
    slug: 'cnafim-lauf',
    titleTag: { he: 'אתר תדמית למכון טיפול', en: '' },
    screens: {
      desktop: '/projects/cnafim-lauf/desktop.webp',
      mobile: '/projects/cnafim-lauf/mobile.webp',
    },
    title: 'כנפיים לעוף',
    titleEn: 'Knafayim LaOuf (Therapy Practice)',
    category: 'web',
    summary: {
      he: 'אתר מכון טיפול והכשרה בן 24 עמודים, עם עמוד ייעודי לכל מתודה - CBT, NLP, EMR והוראה מתקנת.',
      en: 'A 24-page site for a therapy and training practice, with a dedicated page for each method - CBT, NLP, EMR and remedial teaching.',
    },
    metaDescription: {
      he: 'אתר תדמית למכון טיפול והכשרה בן 24 עמודים, עם עמוד ייעודי לכל מתודה - CBT, NLP, EMR והוראה מתקנת. בנוי ב-Next.js ו-Tailwind בתצוגת RTL.',
      en: 'A 24-page site for a therapy and training practice, with a dedicated page for each method - CBT, NLP, EMR and remedial teaching.',
    },
    results: [
      { metric: '24', label: { he: 'עמודים', en: 'pages' } },
      { metric: '4', label: { he: 'עמודי מתודה', en: 'method pages' } },
    ],
    challenge: {
      he: 'מכון טיפול והכשרה נמכר לפי מתודות, וכמעט איש לא מחפש "מכון טיפולי". מחפשים CBT, מחפשים NLP, מחפשים הוראה מתקנת - ומי שמחפש אחד מאלה רוצה לדעת מה המתודה עושה, למי היא מתאימה ואיך נראה טיפול בפועל - לא לקרוא עמוד שמונה את כולן בשורה.\n\nאתר שמאחד את כל המתודות בעמוד אחד מתחרה בעצמו על ארבע שאילתות שונות ולא עונה על אף אחת מהן במלואה. ההחלטה המבנית כאן הייתה לתת לכל מתודה עמוד משלה - כתובת, כותרת ותוכן שלה בלבד - וזה גם מה שהופך את הפנייה הראשונה לפנייה של מי שכבר יודע מה הוא מחפש.',
      // TODO(i18n): approved Hebrew above; English is a literal rendering and
      // has not been reviewed as marketing copy.
      en: 'A therapy and training practice sells itself by method, and almost nobody searches for "therapy practice". They search for CBT, for NLP, for remedial teaching - and someone searching for one of those wants to know what that method does, who it suits and what a session actually looks like, not to read a page that lists all of them in a row.\n\nA site that gathers every method onto one page competes with itself across four different queries and answers none of them in full. The structural decision here was to give each method a page of its own - its own address, its own heading and only its own content - which is also what turns the first enquiry into one from somebody who already knows what they are looking for.',
    },
    solution: {
      he: 'האתר נבנה ב-Next.js ו-Tailwind בתצוגת RTL מלאה: 24 עמודים, מהם ארבעה עמודי מתודה - CBT, NLP, EMR והוראה מתקנת. כל עמוד מתודה הוא כתובת נפרדת עם כותרת H1 משלו ועם הטקסט שמסביר את המתודה הזאת בלבד, כך שאין ארבע גרסאות של אותו עמוד שמתחרות ביניהן.\n\nRTL הוא לא הגדרה אחת בראש הקובץ. בעברית מתהפך הריווח, מתהפך כיוון החצים, וכל מקום שבו מופיע מונח לטיני - CBT, NLP, EMR - הוא קטע דו-כיווני בתוך משפט עברי שחייב לשמור את הפיסוק בצד הנכון. זה נבנה כך מההתחלה ולא תוקן אחר כך.\n\nמעל זה: היררכיית כותרות שמתארת את המכון כפי שהוא בנוי באמת, ונגישות שנכתבה לתוך הקוד - ניווט מקלדת, ניגודיות וטקסט חלופי - בלי ווידג\'ט חיצוני שמבטיח נגישות ולא מספק אותה.\n\nומעל כל אלה עיקרון אחד: כל עמוד עומד בפני עצמו. מי שנכנס מגוגל ישר לעמוד מתודה פנימי מקבל שם תשובה שלמה - מה המתודה עושה, למי היא מתאימה ואיך ממשיכים מכאן - ולא הפניה חזרה לעמוד הבית כדי להבין מה הוא קורא.',
      // TODO(i18n)
      en: 'The site is built in Next.js and Tailwind with full RTL layout: 24 pages, four of them method pages - CBT, NLP, EMR and remedial teaching. Each method page is a separate address with its own H1 and with the text that explains that method and nothing else, so there are not four variants of one page competing with each other.\n\nRTL is not one setting at the top of a file. In Hebrew the spacing flips, the arrows flip, and every place a Latin term appears - CBT, NLP, EMR - is a bidirectional run inside a Hebrew sentence that has to keep its punctuation on the correct side. It was built that way from the start rather than corrected afterwards.\n\nOn top of that: a heading hierarchy that describes the practice as it is actually organised, and accessibility written into the code - keyboard navigation, contrast and alternative text - with no third-party widget promising accessibility without supplying it.\n\nAnd above all of it one principle: every page stands on its own. Somebody arriving from Google straight onto an inner method page gets a complete answer there - what the method does, who it suits and how to go further - rather than a trip back to the homepage to work out what they are reading.',
    },
    delivered: [
      {
        he: '24 עמודים, מהם ארבעה עמודי מתודה: CBT, NLP, EMR והוראה מתקנת',
        en: '24 pages, four of them method pages: CBT, NLP, EMR and remedial teaching',
      },
      {
        he: 'כתובת, כותרת H1 ותוכן נפרדים לכל מתודה - בלי ארבע גרסאות של אותו עמוד',
        en: 'A separate address, H1 and body per method - not four variants of one page',
      },
      {
        he: 'RTL מלא: ריווח, כיווניות ומונחים לטיניים בתוך משפט עברי',
        en: 'Full RTL: spacing, direction, and Latin terms inside a Hebrew sentence',
      },
      {
        he: 'נבנה ב-Next.js ומוגש סטטי - בלי מערכת ניהול תוכן ובלי תוספים',
        en: 'Built in Next.js and served statically - no CMS and no plugins',
      },
      {
        he: 'נגישות בקוד: היררכיית כותרות, ניווט מקלדת, ניגודיות וטקסט חלופי',
        en: 'Accessibility in the code: headings, keyboard navigation, contrast and alt text',
      },
      {
        he: 'כל עמוד עומד בפני עצמו - כניסה מגוגל לעמוד פנימי מקבלת תשובה שלמה במקום',
        en: 'Every page stands alone - an arrival from Google onto an inner page is answered there',
      },
    ],
    // See the note on hagorer2's `changed`: questions for the client, stripped
    // before they can render.
    changed: [
      {
        he: 'TODO(metric): כמה פניות בחודש מגיעות מהאתר, ואיזה עמוד מתודה מביא את רובן',
        en: 'TODO(metric): enquiries per month from the site, and which method page brings most of them',
      },
      {
        he: 'TODO(metric): אילו שמות מתודה האתר מדורג עליהם בעמוד הראשון',
        en: 'TODO(metric): which method names the site reaches the first page for',
      },
    ],
    techStack: ['Next.js', 'Tailwind', 'RTL'],
    liveUrl: 'https://cnafim-lauf.co.il',
    featured: true,
  },
  {
    slug: 'bom-recipes',
    titleTag: { he: 'מערכת תמחור ועץ מוצר', en: 'costing & pricing system' },
    title: 'BOM & Recipes',
    category: 'automation',
    headline: {
      he: 'כשמחיר חומר גלם עולה, כמה שעות לוקח לתמחר מחדש את כל הקטלוג?',
      // TODO(i18n)
      en: 'When one raw material goes up in price, how many hours does repricing the whole catalogue take?',
    },
    summary: {
      he: 'ניהול עצי מוצר ומתכונים עם תמחור אוטומטי - מחיר עלות, ריטייל וסיטונאי - וייבוא ישיר מקבצי Excel קיימים.',
      en: 'Bill-of-materials and recipe management with automatic costing - cost, retail and wholesale pricing - importing straight from existing Excel files.',
    },
    metaDescription: {
      he: 'מערכת עץ מוצר ומתכונים מקוננים: עדכון מחיר של חומר גלם מתגלגל אוטומטית לכל מוצר שמכיל אותו, ושלוש רמות מחיר נגזרות יחד - עלות, קמעונאי וסיטונאי. ייבוא מאקסל.',
      en: 'Bill-of-materials and recipe management with automatic costing - cost, retail and wholesale pricing - importing straight from existing Excel files.',
    },
    challenge: {
      he: 'ניהול עץ מוצר ומתכונים באקסל. כל שינוי במחיר של חומר גלם אחד מחייב חישוב מחדש ידני של כל מוצר שמכיל אותו - ואם מוצר מורכב ממוצרים אחרים, החישוב מתפצל לכל הכיוונים. בפועל זה אומר שהתמחור מתעדכן לעיתים רחוקות, שהמרווחים נשחקים בלי שאף אחד שם לב, ושכל עדכון הוא הזדמנות לטעות שנכנסת למחיר ללקוח.',
      // TODO(i18n)
      en: 'Bills of materials and recipes managed in Excel. Every change to a single raw material’s price forces a manual recalculation of every product containing it - and when a product is made of other products, the calculation branches in all directions. In practice that means pricing is updated rarely, margins erode unnoticed, and every update is an opportunity for an error that reaches the customer’s price.',
    },
    solution: {
      he: 'מערכת עץ מוצר עם מתכונים מקוננים, שבה שינוי מחיר של חומר גלם אחד מתגלגל אוטומטית לכל מוצר שמכיל אותו - כולל מוצרים שמורכבים ממוצרים אחרים. שלוש רמות תמחור נגזרות בו-זמנית: עלות, קמעונאי וסיטונאי, לפי אחוזי מרווח שנקבעים על ידי הלקוח.\n\nובמקום להקליד הכל מחדש - ייבוא ישיר מקבצי האקסל הקיימים. זה היה תנאי, לא פיצ’ר: מערכת שדורשת הזנה מאפס מתחילה מהתנגדות, מערכת שקוראת את מה שכבר יש מתחילה מיום הראשון.',
      // TODO(i18n)
      en: 'A bill-of-materials system with nested recipes, where a price change to one raw material cascades automatically to every product containing it - including products built from other products. Three pricing tiers are derived at once: cost, retail and wholesale, from margins the client sets.\n\nAnd instead of retyping everything, direct import from the existing Excel files. That was a condition, not a feature: a system demanding data entry from scratch starts against resistance, while one that reads what already exists starts on day one.',
    },
    flow: [
      {
        label: { he: 'ייבוא מקבצי האקסל הקיימים', en: 'Import from the existing Excel files' },
        meta: {
          he: 'תנאי, לא פיצ׳ר - המערכת מתחילה ממה שכבר יש',
          en: 'A condition, not a feature - the system starts from what exists',
        },
      },
      {
        label: { he: 'עדכון מחיר של חומר גלם', en: 'A raw material price changes' },
      },
      {
        label: { he: 'גלגול אוטומטי בעץ המוצר', en: 'Automatic cascade through the BOM' },
        meta: {
          he: 'כולל מוצרים שמורכבים ממוצרים אחרים',
          en: 'Including products built from other products',
        },
      },
      {
        label: { he: 'שלוש רמות מחיר נגזרות יחד', en: 'Three price tiers derived at once' },
        meta: {
          he: 'עלות, קמעונאי וסיטונאי - לפי מרווחים שהלקוח קובע',
          en: 'Cost, retail and wholesale - from margins the client sets',
        },
      },
    ],
    changed: [
      { he: `זמן לעדכון מחירים מלא: ${PENDING}`, en: `Time for a full repricing: ${PENDING}` },
      {
        he: `תדירות עדכון התמחור: ${PENDING}`,
        en: `How often pricing is updated: ${PENDING}`,
      },
    ],
    results: [
      {
        metric: PENDING,
        label: { he: 'מוצרים בעץ המוצר', en: 'products in the bill of materials' },
      },
      { metric: '3', label: { he: 'רמות תמחור אוטומטיות', en: 'automatic pricing tiers' } },
      {
        metric: PENDING,
        label: { he: 'שעות שנחסכו בכל עדכון מחירים', en: 'hours saved per repricing' },
      },
    ],
    techStack: ['React', 'Vercel', 'Neon', 'Supabase', 'openpyxl'],
    liveUrl: 'https://bom-recipes.vercel.app',
  },
  {
    slug: 'air-manage',
    titleTag: { he: 'מערכת ניהול קריאות שירות', en: 'work-order management system' },
    title: 'Air Manage',
    category: 'automation',
    headline: {
      he: 'כשקריאת שירות עוברת בוואטסאפ, אף אחד לא יודע אם היא נסגרה',
      // TODO(i18n)
      en: 'When a work order lives in WhatsApp, nobody knows whether it was closed',
    },
    summary: {
      he: 'אפליקציית ניהול משימות לצוותי תחזוקה, אחזקה ושירותי ניקיון - הקצאה, מעקב וסגירת קריאות. בשימוש יומיומי בארגון.',
      en: 'Task management for maintenance, upkeep and cleaning teams - assignment, tracking and closing work orders. In daily use inside an organisation.',
    },
    metaDescription: {
      he: 'אפליקציה לניהול קריאות שירות של צוותי תחזוקה, אחזקה וניקיון: הקצאה, מעקב במצב אמת וסגירה מתועדת שנשארת בהיסטוריה. בשימוש יומיומי בארגון.',
      en: 'Task management for maintenance, upkeep and cleaning teams - assignment, tracking and closing work orders. In daily use inside an organisation.',
    },
    challenge: {
      he: 'צוותי תחזוקה, אחזקה וניקיון עובדים בשטח, והתיאום נעשה בטלפון ובהודעות. המשמעות: מנהל שלא יודע מה מצב הקריאות בלי להתקשר ולשאול, אין תיעוד של מה בוצע ומתי, וויכוחים על עבודות שלא ברור אם נסגרו. כשהעבודה לא רשומה - היא גם לא נמדדת, ולא ניתן לשפר אותה.',
      // TODO(i18n)
      en: 'Maintenance, upkeep and cleaning crews work in the field, and coordination happens by phone and messages. Which means: a manager who cannot know the state of a work order without calling to ask, no record of what was done and when, and arguments over jobs nobody can confirm were closed. Work that is not recorded is not measured - and cannot be improved.',
    },
    solution: {
      he: 'אפליקציה שמנהלת את מחזור החיים המלא של קריאת שירות: הקצאה לאיש הצוות הנכון, מעקב במצב אמת מול מה שקורה בשטח, וסגירה מתועדת שנשארת בהיסטוריה. המנהל רואה תמונה אחת של כל הקריאות הפתוחות במקום לרדוף אחרי עדכונים.\n\nהיא בשימוש יומיומי בארגון - לא פיילוט ולא הדגמה. זה המבחן האמיתי של מערכת פנימית: שאנשים בוחרים להשתמש בה כשאף אחד לא מסתכל.',
      // TODO(i18n)
      en: 'An application managing the full life cycle of a work order: assignment to the right crew member, real-time tracking against what is happening in the field, and a documented close that stays in the history. The manager sees one picture of every open call instead of chasing updates.\n\nIt is in daily use inside the organisation - not a pilot and not a demo. That is the real test of an internal system: that people choose to use it when nobody is watching.',
    },
    flow: [
      { label: { he: 'קריאת שירות נפתחת', en: 'A work order is opened' } },
      {
        label: { he: 'הקצאה לאיש הצוות הנכון', en: 'Assigned to the right crew member' },
      },
      {
        label: { he: 'מעקב במצב אמת', en: 'Tracked in real time' },
        meta: {
          he: 'המנהל רואה תמונה אחת של כל הקריאות הפתוחות',
          en: 'The manager sees one picture of every open call',
        },
      },
      {
        label: { he: 'סגירה מתועדת', en: 'A documented close' },
        meta: {
          he: 'נשארת בהיסטוריה',
          en: 'Stays in the history',
        },
      },
    ],
    changed: [
      {
        he: `זמן ממוצע לסגירת קריאה: ${PENDING}`,
        en: `Average time to close a work order: ${PENDING}`,
      },
      { he: `קריאות שנסגרות בזמן: ${PENDING}`, en: `Work orders closed on time: ${PENDING}` },
      {
        he: `שעות ניהול שנחסכו לשבוע: ${PENDING}`,
        en: `Management hours saved per week: ${PENDING}`,
      },
    ],
    results: [
      { metric: PENDING, label: { he: 'צוותים בשימוש יומי', en: 'crews using it daily' } },
      { metric: PENDING, label: { he: 'קריאות שירות בחודש', en: 'work orders per month' } },
      {
        metric: PENDING,
        label: { he: 'זמן ממוצע לסגירת קריאה', en: 'average time to close a call' },
      },
    ],
    techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    /*
     * No `liveUrl` until a working one arrives.
     *
     * It was `https://air-manage-app.netlify.app`, which has returned 404 on
     * every check since 2026-09-07 and again on 2026-09-13. The case study is
     * the one place a prospect goes to see the work, and the button labelled
     * "live site" took them to Not Found. The owner says the system is running
     * and will send the real address; the button reappears the moment this line
     * comes back, because the page already renders it only when the field
     * exists.
     */
  },
]

// ── Accessors ─────────────────────────────────────────────────────────────────

/** Drafts are visible locally and in previews, never on a production deploy. */
const showDrafts = !isProductionDeploy()

/** Published projects, featured first. */
/** The brand name for a locale - `titleEn` where one exists, otherwise the name. */
export function projectTitle(project: Project, lang: Locale): string {
  return lang === 'en' && project.titleEn ? project.titleEn : project.title
}

/**
 * A project with every `PENDING` value removed.
 *
 * Applied in `getProjects`, so the marker never leaves this module.
 *
 * Filtering at render time was not enough, and the build proved it: the
 * portfolio grid is a client component, so the projects it receives are
 * serialised into the RSC payload and the client bundle whole. `TODO(metric)`
 * appeared in nine build artefacts - the homepage, both portfolio pages and a
 * JS chunk - as data that was correctly never displayed but was still shipped
 * to every visitor and visible in view-source.
 *
 * The list of numbers still to ask each client for belongs in this file, which
 * is where it is. It does not belong in the browser.
 */
function withoutPending(project: Project): Project {
  const results = (project.results ?? []).filter((result) => !isPending(result.metric))
  const changed = (project.changed ?? []).filter(
    (line) => !isPending(line.he) && !isPending(line.en),
  )
  const delivered = (project.delivered ?? []).filter(
    (line) => !isPending(line.he) && !isPending(line.en),
  )
  // Flow too - no node is pending today, but the invariant is "no PENDING
  // value leaves this module", not "none of the fields we remembered".
  const flow = (project.flow ?? []).filter(
    (step) =>
      !isPending(step.label.he) &&
      !isPending(step.label.en) &&
      !isPending(step.meta?.he ?? '') &&
      !isPending(step.meta?.en ?? ''),
  )

  return {
    ...project,
    // Dropped entirely when empty, so `results?.length` stays a meaningful
    // test and no consumer has to distinguish "none" from "all pending".
    ...(results.length > 0 ? { results } : { results: undefined }),
    ...(changed.length > 0 ? { changed } : { changed: undefined }),
    ...(delivered.length > 0 ? { delivered } : { delivered: undefined }),
    ...(flow.length > 0 ? { flow } : { flow: undefined }),
  }
}

export function getProjects(): Project[] {
  return projects
    .filter((project) => showDrafts || !project.draft)
    .map(withoutPending)
    .sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1
      return (b.year ?? 0) - (a.year ?? 0)
    })
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug)
}

/**
 * A project's outcome lines in one locale.
 *
 * No filtering here: `getProjects` has already removed every `PENDING` line.
 * There is deliberately only one place that strips them - a second filter at
 * render time reads as the safety net and is not one, because it cannot cover
 * serialisation, which is where the marker actually escaped.
 */
export function changedLines(project: Project, lang: Locale): string[] {
  return (project.changed ?? []).map((line) => line[lang])
}

export function getProjectSlugs(): string[] {
  return getProjects().map((project) => project.slug)
}

/** Categories that actually have a published project - drives the filter chips. */
export function getUsedCategories(): ProjectCategory[] {
  const used = new Set(getProjects().map((project) => project.category))
  return projectCategories.filter((category) => used.has(category))
}
