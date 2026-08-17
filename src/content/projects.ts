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
 *  ⚠️  WHAT IS STILL MISSING — the outcome numbers.
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
   * The number itself — kept short and glanceable. e.g. '×2.4', '−73%', '22'.
   * `PENDING` marks one we have not been given; it is never rendered.
   */
  metric: string
  /** What the number measures. */
  label: Bilingual
}

export type ProjectImage = {
  /** Path under /public — e.g. '/projects/jcafe/storefront.webp' */
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
  /** One line for the portfolio card. */
  summary: Bilingual
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
   * What changed afterwards — one line per outcome.
   *
   * Separate from `results` on purpose. `results` is a number in a block you
   * take in at a glance; this is the sentence that says what the number means.
   * Any line still carrying `PENDING` is removed by `getProjects`.
   */
  changed?: Bilingual[]
  /** Measurable outcomes. The most persuasive part of the page. */
  results?: ProjectResult[]
  /**
   * Full-page screenshots driving the scrolling screen previews.
   *
   * Captured by `npm run shots`. Only publicly browsable sites have them —
   * a login screen says nothing about the work, so projects behind one keep
   * the empty frame instead.
   */
  screens?: { desktop: string; mobile: string }
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
    challenge: {
      he: 'רשת כשרה עם שישה סניפים בתאילנד, וקהל שמדבר שתי שפות. ההזמנות הגיעו בערוצים מפוזרים, המטבח קיבל אותן בהעברה ידנית, ולא היה מקום אחד שבו אפשר לראות מה קורה בכל הסניפים באותו רגע. המלאי והתמחור ניהלו חיים נפרדים במערכת ה-ODOO, בלי קשר למה שהלקוח רואה באתר.',
      // TODO(i18n)
      en: 'A kosher chain with six branches in Thailand and an audience speaking two languages. Orders arrived through scattered channels, the kitchen received them by hand, and there was no single place to see what was happening across every branch at once. Stock and pricing led a separate life inside ODOO, disconnected from what the customer saw on the site.',
    },
    solution: {
      he: 'חנות אונליין דו-לשונית עם תשלום מאובטח, ומעליה שכבת תפעול: מסך מלקט בכל סניף שמראה מה צריך להרכיב עכשיו, ומסך מטבח (KDS) שמקבל את ההזמנה ישר — בלי שאף אחד יצטרך להקריא אותה בקול. הכל מסונכרן דו-כיוונית עם ODOO, כך שמלאי ומחירים נשארים מקור אמת אחד.\n\nמעל זה בנינו סדרת בדיקות אוטומטיות שרצה על מסלול ההזמנה בכל עדכון — כדי שאף שינוי בקוד לא ישבור את היכולת של לקוח להזמין ולשלם. במסחר, זה ההבדל בין באג לבין יום מכירות אבוד.',
      // TODO(i18n)
      en: 'A bilingual storefront with secure checkout, and an operations layer above it: a picker screen in each branch showing what to assemble right now, and a kitchen display that receives the order directly — with nobody reading it out loud. Everything syncs both ways with ODOO, so stock and prices stay a single source of truth.\n\nOn top of that, an automated test suite runs the ordering path on every update, so no code change can break a customer’s ability to order and pay. In commerce, that is the difference between a bug and a lost day of sales.',
    },
    changed: [
      {
        he: `זמן מרגע הזמנה עד שהיא על מסך המטבח: ${PENDING}`,
        en: `Time from order placed to order on the kitchen screen: ${PENDING}`,
      },
      { he: `טעויות הזמנה: ${PENDING}`, en: `Order errors: ${PENDING}` },
    ],
    results: [
      { metric: '6', label: { he: 'סניפים פעילים', en: 'active branches' } },
      { metric: '2', label: { he: 'שפות ממשק', en: 'interface languages' } },
      { metric: PENDING, label: { he: 'הזמנות בחודש', en: 'orders per month' } },
      { metric: PENDING, label: { he: 'דקות מהזמנה למטבח', en: 'minutes from order to kitchen' } },
    ],
    techStack: ['Next.js', 'Supabase', 'ODOO', 'Stripe', 'Vercel', 'Playwright'],
    liveUrl: 'https://www.jcafekosher.com/en/s/bangkok',
    featured: true,
  },
  {
    slug: 'hagorer2',
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
    results: [
      { metric: '22', label: { he: 'עמודים', en: 'pages' } },
      { metric: 'PWA', label: { he: 'ניתן להתקנה בנייד', en: 'installable on mobile' } },
    ],
    techStack: ['HTML/CSS', 'SEO', 'PWA', 'Schema.org'],
    liveUrl: 'https://hagorer2.co.il',
    featured: true,
  },
  {
    slug: 'cnafim-lauf',
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
    results: [
      { metric: '24', label: { he: 'עמודים', en: 'pages' } },
      { metric: '4', label: { he: 'עמודי מתודה', en: 'method pages' } },
    ],
    techStack: ['Next.js', 'Tailwind', 'RTL'],
    liveUrl: 'https://cnafim-lauf.co.il',
    featured: true,
  },
  {
    slug: 'bom-recipes',
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
    challenge: {
      he: 'ניהול עץ מוצר ומתכונים באקסל. כל שינוי במחיר של חומר גלם אחד מחייב חישוב מחדש ידני של כל מוצר שמכיל אותו — ואם מוצר מורכב ממוצרים אחרים, החישוב מתפצל לכל הכיוונים. בפועל זה אומר שהתמחור מתעדכן לעיתים רחוקות, שהמרווחים נשחקים בלי שאף אחד שם לב, ושכל עדכון הוא הזדמנות לטעות שנכנסת למחיר ללקוח.',
      // TODO(i18n)
      en: 'Bills of materials and recipes managed in Excel. Every change to a single raw material’s price forces a manual recalculation of every product containing it — and when a product is made of other products, the calculation branches in all directions. In practice that means pricing is updated rarely, margins erode unnoticed, and every update is an opportunity for an error that reaches the customer’s price.',
    },
    solution: {
      he: 'מערכת עץ מוצר עם מתכונים מקוננים, שבה שינוי מחיר של חומר גלם אחד מתגלגל אוטומטית לכל מוצר שמכיל אותו — כולל מוצרים שמורכבים ממוצרים אחרים. שלוש רמות תמחור נגזרות בו-זמנית: עלות, קמעונאי וסיטונאי, לפי אחוזי מרווח שנקבעים על ידי הלקוח.\n\nובמקום להקליד הכל מחדש — ייבוא ישיר מקבצי האקסל הקיימים. זה היה תנאי, לא פיצ’ר: מערכת שדורשת הזנה מאפס מתחילה מהתנגדות, מערכת שקוראת את מה שכבר יש מתחילה מיום הראשון.',
      // TODO(i18n)
      en: 'A bill-of-materials system with nested recipes, where a price change to one raw material cascades automatically to every product containing it — including products built from other products. Three pricing tiers are derived at once: cost, retail and wholesale, from margins the client sets.\n\nAnd instead of retyping everything, direct import from the existing Excel files. That was a condition, not a feature: a system demanding data entry from scratch starts against resistance, while one that reads what already exists starts on day one.',
    },
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
    challenge: {
      he: 'צוותי תחזוקה, אחזקה וניקיון עובדים בשטח, והתיאום נעשה בטלפון ובהודעות. המשמעות: מנהל שלא יודע מה מצב הקריאות בלי להתקשר ולשאול, אין תיעוד של מה בוצע ומתי, וויכוחים על עבודות שלא ברור אם נסגרו. כשהעבודה לא רשומה — היא גם לא נמדדת, ולא ניתן לשפר אותה.',
      // TODO(i18n)
      en: 'Maintenance, upkeep and cleaning crews work in the field, and coordination happens by phone and messages. Which means: a manager who cannot know the state of a work order without calling to ask, no record of what was done and when, and arguments over jobs nobody can confirm were closed. Work that is not recorded is not measured — and cannot be improved.',
    },
    solution: {
      he: 'אפליקציה שמנהלת את מחזור החיים המלא של קריאת שירות: הקצאה לאיש הצוות הנכון, מעקב במצב אמת מול מה שקורה בשטח, וסגירה מתועדת שנשארת בהיסטוריה. המנהל רואה תמונה אחת של כל הקריאות הפתוחות במקום לרדוף אחרי עדכונים.\n\nהיא בשימוש יומיומי בארגון — לא פיילוט ולא הדגמה. זה המבחן האמיתי של מערכת פנימית: שאנשים בוחרים להשתמש בה כשאף אחד לא מסתכל.',
      // TODO(i18n)
      en: 'An application managing the full life cycle of a work order: assignment to the right crew member, real-time tracking against what is happening in the field, and a documented close that stays in the history. The manager sees one picture of every open call instead of chasing updates.\n\nIt is in daily use inside the organisation — not a pilot and not a demo. That is the real test of an internal system: that people choose to use it when nobody is watching.',
    },
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
    liveUrl: 'https://air-manage-app.netlify.app',
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

  return {
    ...project,
    // Dropped entirely when empty, so `results?.length` stays a meaningful
    // test and no consumer has to distinguish "none" from "all pending".
    ...(results.length > 0 ? { results } : { results: undefined }),
    ...(changed.length > 0 ? { changed } : { changed: undefined }),
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

/** Categories that actually have a published project — drives the filter chips. */
export function getUsedCategories(): ProjectCategory[] {
  const used = new Set(getProjects().map((project) => project.category))
  return projectCategories.filter((category) => used.has(category))
}
