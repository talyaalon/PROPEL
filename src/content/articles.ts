/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  BLOG / RESOURCES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Two kinds of entry share one grid:
 *
 *    externalUrl  a recommended resource elsewhere on the web
 *    slug         an article of our own, on this site
 *
 *  An entry needs exactly one of them. The union type below enforces that, so a
 *  card that leads nowhere cannot be published.
 *
 *  ── Worth knowing about the mix ──────────────────────────────────────────────
 *
 *  Outbound links are useful to clients and cost nothing to maintain, but they
 *  rank nothing. Google indexes the page they point at, not this one, and a
 *  visitor who follows one has left. Agencies that win search traffic do it with
 *  their own writing.
 *
 *  So the list starts as a resource shelf and is built to absorb original posts
 *  without a rewrite: give an entry a `slug` instead of an `externalUrl` and it
 *  becomes an internal article in the same grid. Three or four pieces on what
 *  you already know — why WordPress gets slow, what a site actually costs, what
 *  happens when the developer disappears — are worth more than thirty links.
 */

import type { Locale } from '@/lib/i18n'
import { isProductionDeploy } from '@/lib/config'

export type Bilingual = Record<Locale, string>

export const articleTopics = ['web', 'seo', 'automation', 'ecommerce'] as const
export type ArticleTopic = (typeof articleTopics)[number]

type ArticleBase = {
  title: Bilingual
  excerpt: Bilingual
  topic: ArticleTopic
  /** ISO date, used for ordering and for the visible date on the card. */
  date: string
  /** Path under /public. Optional — cards fall back to a typographic tile. */
  image?: string
}

/** A recommended resource elsewhere. Opens in a new tab. */
type ExternalArticle = ArticleBase & {
  externalUrl: string
  /** Publisher shown on the card, so it is obvious the link leaves the site. */
  source: string
  slug?: never
}

/** An article of ours, rendered at /[lang]/blog/[slug]. */
type InternalArticle = ArticleBase & {
  slug: string
  /** The meta description - what the SERP shows under the title. */
  description: Bilingual
  /**
   * The article itself. Paragraphs separated by blank lines; a line starting
   * with `## ` is a section heading and joins the clause numbering. No other
   * markup - an article that needs more than paragraphs and headings should
   * argue for it here first.
   */
  body: Bilingual
  /** Slugs into projects.ts, rendered as proof links under the article. */
  relatedProjects?: string[]
  /** A /services/<slug> page this article feeds. */
  relatedService?: string
  /**
   * Hidden from production deploys, exactly like a draft project. An article
   * publishes when the owner has read and approved it, not before.
   */
  draft?: boolean
  externalUrl?: never
  source?: never
}

export type Article = ExternalArticle | InternalArticle

export const isExternal = (article: Article): article is ExternalArticle =>
  'externalUrl' in article && Boolean(article.externalUrl)

// ── Content ───────────────────────────────────────────────────────────────────

export const articles: Article[] = [
  {
    slug: 'wordpress-slow',
    topic: 'web',
    date: '2026-08-18',
    // DRAFT - visible locally and in previews, hidden from production until
    // the owner reads and approves it. The English is a literal rendering of
    // the Hebrew, unreviewed as marketing copy.
    draft: true,
    title: {
      he: 'למה אתר הוורדפרס שלכם איטי - ומה זה עולה לכם',
      en: 'Why your WordPress site is slow - and what it costs you',
    },
    excerpt: {
      he: 'האטיות היא לא תקלה - היא המחיר המצטבר של הדרך שבה האתר בנוי. איפה הזמן הולך, מה זה עולה, ומה האלטרנטיבה.',
      en: 'The slowness is not a malfunction - it is the accumulated price of how the site is built. Where the time goes, what it costs, and the alternative.',
    },
    description: {
      he: 'למה וורדפרס נהיה איטי, מה זה עולה לעסק בפועל, ואיך נראית האלטרנטיבה - אתר סטטי בקוד נקי שנרשם עליכם.',
      en: 'Why WordPress becomes slow, what it really costs a business, and what the alternative looks like - a static site in clean code, registered to you.',
    },
    relatedService: 'migration',
    relatedProjects: ['hagorer2', 'cnafim-lauf'],
    body: {
      he: `וורדפרס לא נולד איטי. הוא נהיה איטי - תוסף אחרי תוסף, תבנית שמביאה איתה ספריות שלמות בשביל כפתור אחד, ועדכונים שכל אחד מהם מוסיף עוד שכבה. האטיות היא לא תקלה; היא המחיר המצטבר של הדרך שבה האתר נבנה.

## איפה הזמן הולך

כשדף וורדפרס נטען, השרת מריץ PHP, שואל בסיס נתונים, מרכיב את הדף מחדש - ורק אז מתחיל לשלוח אותו. אחר כך הדפדפן מוריד את מה שהתבנית והתוספים גררו איתם: ספריות JavaScript שהאתר לא באמת משתמש בהן, גיליונות עיצוב של פיצ'רים שכובו, גופנים כפולים. כל אחד מאלה קטן; ביחד הם ההבדל בין אתר שנפתח מיד לאתר שהמבקר נוטש.

## מה זה עולה בפועל

מבקר שמחכה סוגר את הטאב - ובנייד, על רשת סלולרית, זה קורה מהר עוד יותר. גוגל מודד את מהירות הטעינה כחלק מדירוג התוצאות, כך שאתר איטי גם מקבל פחות מבקרים מלכתחילה. ויש עלות שקטה יותר: תחזוקה. תוספים שדורשים עדכון, עדכון ששובר תוסף אחר, ומנוי שנתי על כלים שמנסים לתקן את מה שהמבנה עצמו יצר.

## מה האלטרנטיבה

אתר סטטי - כזה שנבנה מראש ומוגש כקבצים מוכנים - פשוט לא עושה את רוב העבודה הזאת. אין שרת שמרכיב את הדף בכל בקשה, אין תוספים שנטענים בשביל כלום, ואין מה לפרוץ. את האתרים שאנחנו בונים מחדש אנחנו מגישים כך, והקוד כולו נרשם על בעל העסק - בלי מנוי חודשי על עצם הקיום של האתר.

## איך יודעים אם זה המצב שלכם

פתחו את האתר שלכם בנייד, ברשת סלולרית, בלי wifi. ספרו שניות עד שהוא שמיש. אחר כך בדקו כמה תוספים פעילים אצלכם - ואם אתם לא בטוחים מה חצי מהם עושה, זו כבר חצי תשובה. ההעברה לקוד נקי היא לא שכתוב של העסק; העיצוב יכול להישאר, התוכן נשאר, הכתובות נשארות. מה שמשתנה הוא מה שמתחת.`,
      en: `WordPress is not born slow. It becomes slow - plugin after plugin, a theme that ships whole libraries for one button, and updates that each add another layer. The slowness is not a malfunction; it is the accumulated price of how the site is built.

## Where the time goes

When a WordPress page loads, the server runs PHP, queries a database, assembles the page again - and only then starts sending it. Then the browser downloads what the theme and plugins dragged along: JavaScript libraries the site never really uses, stylesheets for features that were turned off, duplicate fonts. Each is small; together they are the difference between a site that opens instantly and one the visitor abandons.

## What it actually costs

A visitor who waits closes the tab - and on mobile, on a cellular network, that happens even faster. Google measures loading speed as part of ranking, so a slow site also gets fewer visitors to begin with. And there is a quieter cost: maintenance. Plugins that demand updates, an update that breaks another plugin, and an annual subscription to tools that try to fix what the structure itself created.

## The alternative

A static site - built ahead of time and served as finished files - simply does not do most of that work. No server assembles the page per request, no plugins load for nothing, and there is nothing to break into. The sites we rebuild are served this way, and all the code is registered to the business owner - with no monthly fee for the site merely existing.

## How to know if this is you

Open your site on a phone, on cellular, no wifi. Count until it is usable. Then check how many active plugins you have - and if you are not sure what half of them do, that is already half an answer. Migrating to clean code is not a rewrite of the business; the design can stay, the content stays, the URLs stay. What changes is what is underneath.`,
    },
  },
  {
    slug: 'paper-pen-excel',
    topic: 'automation',
    date: '2026-08-18',
    // DRAFT - visible locally and in previews, hidden from production until
    // the owner reads and approves it. The English is a literal rendering of
    // the Hebrew, unreviewed as marketing copy.
    draft: true,
    title: {
      he: 'דף, עט ואקסל: מתי הם מפסיקים להספיק',
      en: 'Paper, pen and Excel: when they stop being enough',
    },
    excerpt: {
      he: 'יש שלב שבו הכלים הפשוטים הם הנכונים - והשלב שאחריו, שבו כל יום איתם עולה כסף. איך מזהים אותו, וממה מתחילים.',
      en: 'There is a stage where the simple tools are the right ones - and the stage after, where every day with them costs money. How to recognise it, and where to start.',
    },
    description: {
      he: 'הסימנים שהעסק גדל מהכלים שלו, למה זו לא בעיה של משמעת, ומה מערכת ניהול באמת מחליפה - מתוך מערכות שבנינו ונמצאות בשימוש יומיומי.',
      en: 'The signs a business has outgrown its tools, why it is not a discipline problem, and what a management system actually replaces - from systems we built that are in daily use.',
    },
    relatedService: 'management-systems',
    relatedProjects: ['air-manage', 'bom-recipes'],
    body: {
      he: `יש שלב שבו דף, עט ואקסל הם בדיוק הכלים הנכונים. עסק קטן עם תהליך אחד פשוט לא צריך מערכת - הוא צריך למכור. הבעיה מתחילה כשגדלים, והכלים לא.

## הסימנים

הם מוכרים: אותו נתון מוקלד פעמיים בשני מקומות. מישהו שואל \"מה קורה עם ההזמנה של...\" והתשובה דורשת שלוש שיחות טלפון. ויכוח על עבודה שאולי בוצעה ואולי לא, בלי שום דרך לבדוק. עדכון מחיר שמחייב לפתוח את הקובץ, לחשב מחדש, ולקוות שלא פוספס כלום. כל אחד מהרגעים האלה הוא קטן. הבעיה היא שהם קורים כל יום, כמה פעמים ביום.

## למה זה לא בעיה של משמעת

הטעות הנפוצה היא לחשוב שאם רק כולם יקפידו לרשום - זה יסתדר. אבל תהליך שנשען על זיכרון ועל משמעת של אנשים עסוקים הוא תהליך שמתוכנן להישבר. כשהעבודה לא רשומה, היא לא נמדדת; וכשהיא לא נמדדת, אי אפשר לדעת מה לשפר. זה לא כישלון של אנשים - זה כלי שלא מתאים כבר לגודל של העסק.

## מה מערכת באמת מחליפה

מערכת טובה לא מוסיפה עבודה - היא מוחקת עבודה. הנתון נכנס פעם אחת, במקום שבו הוא נוצר, ומגיע לבד לכל מי שצריך אותו. קריאת שירות נפתחת, מוקצית, מבוצעת ונסגרת - והכל נשאר רשום בלי שאף אחד \"מילא דוח\". מחיר של חומר גלם משתנה, וכל מוצר שמכיל אותו מתעדכן לבד. בנינו את המערכות האלה בדיוק, והמבחן שלהן אחד: שאנשים בוחרים להשתמש בהן כשאף אחד לא מסתכל.

## ממה מתחילים

לא מרשימת פיצ'רים. מתחילים מהשאלה איפה הזמן הולך לאיבוד היום - איזו פעולה חוזרת על עצמה, איפה נוצרות טעויות, מה אף פעם לא ברור. תהליך אחד, הכי כואב, קודם. מערכת שפותרת בעיה אחת אמיתית ונכנסת לשימוש שווה יותר מפלטפורמה ענקית שאף אחד לא פותח.`,
      en: `There is a stage at which paper, pen and a spreadsheet are exactly the right tools. A small business with one simple process does not need a system - it needs to sell. The problem starts when you grow and the tools do not.

## The signs

They are familiar: the same figure typed twice in two places. Someone asks what is happening with an order, and the answer takes three phone calls. An argument about work that may or may not have been done, with no way to check. A price update that means opening the file, recalculating, and hoping nothing was missed. Each of these moments is small. The problem is that they happen every day, several times a day.

## Why it is not a discipline problem

The common mistake is thinking that if everyone would just write things down, it would work out. But a process that leans on the memory and discipline of busy people is a process designed to break. Work that is not recorded is not measured; and what is not measured cannot be improved. It is not a failure of people - it is a tool that no longer fits the size of the business.

## What a system actually replaces

A good system does not add work - it deletes work. The figure goes in once, where it is created, and reaches everyone who needs it on its own. A work order is opened, assigned, executed and closed - and everything stays recorded without anyone filling in a report. A raw material's price changes, and every product containing it updates itself. We have built exactly these systems, and their test is single: that people choose to use them when nobody is watching.

## Where to start

Not from a feature list. Start from where the time is lost today - which action repeats itself, where the mistakes are born, what is never clear. One process, the most painful one, first. A system that solves one real problem and gets used is worth more than a giant platform nobody opens.`,
    },
  },
  {
    slug: 'website-cost',
    topic: 'web',
    date: '2026-08-18',
    // DRAFT - visible locally and in previews, hidden from production until
    // the owner reads and approves it. The English is a literal rendering of
    // the Hebrew, unreviewed as marketing copy.
    draft: true,
    title: {
      he: 'כמה עולה אתר תדמית - תשובה בלי מספר קסם',
      en: 'What a business website costs - an answer without a magic number',
    },
    excerpt: {
      he: 'מספר אחד לכולם הוא בהגדרה לא נכון. במקום זה: ממה המחיר מורכב, מה באמת מזיז אותו, ואילו שאלות שוות יותר מהמספר.',
      en: 'One number for everyone is by definition wrong. Instead: what the price is made of, what actually moves it, and which questions are worth more than the number.',
    },
    description: {
      he: 'ממה מורכב מחיר של אתר תדמית, מה משפיע עליו באמת, והשאלות שכדאי לשאול כל מציע - כולל מי מחזיק בקוד בסוף.',
      en: 'What goes into the price of a business website, what really moves it, and the questions to ask every bidder - including who owns the code at the end.',
    },
    relatedProjects: ['hagorer2', 'cnafim-lauf'],
    body: {
      he: `זו השאלה הראשונה שכל בעל עסק שואל, ולרוב הוא מקבל עליה תשובה מתחמקת. ננסה לענות עליה כמו שצריך - בלי מספר קסם, כי מספר אחד לכולם הוא בהגדרה לא נכון, אבל עם המבנה שיעזור לכם להבין כל הצעת מחיר שתקבלו.

## ממה מורכב המחיר

אתר תדמית הוא שלוש עבודות שונות שנמכרות יחד. הראשונה - אפיון ועיצוב: להבין מה העסק צריך שהאתר יעשה, ולתת לזה צורה. השנייה - הבנייה עצמה: קוד, תוכן, התאמה לנייד, נגישות. השלישית, שנשכחת תמיד - מה שאחרי: דומיין, אחסון, תחזוקה, עדכונים. כשמשווים הצעות מחיר, חובה להשוות את שלושתן - הצעה זולה בבנייה יכולה להיות יקרה מאוד בתחזוקה.

## מה באמת משפיע על המחיר

מספר העמודים משפיע פחות ממה שנדמה; מה שמשפיע באמת הוא מה כל עמוד צריך לעשות. טופס שפשוט שולח מייל הוא לא אותו דבר כמו טופס שמתחבר למערכת ניהול. אתר בשפה אחת הוא לא אתר בשתיים. עיצוב מתבנית קיימת הוא לא עיצוב שנבנה סביב העסק. וההבדל הגדול מכולם - מי מחזיק בקוד בסוף: אתר על פלטפורמה בתשלום חודשי נשאר של הפלטפורמה; אתר בקוד נקי נרשם עליכם.

## השאלות ששוות יותר מהמחיר

לפני שמשווים מספרים, כדאי לשאול כל מציע: מי הבעלים של הקוד ושל התוכן בסוף התהליך? מה קורה אם נרצה לעזוב? כמה עולה שנה של תחזוקה, ומה היא כוללת? האם האתר עומד בתקן הנגישות הישראלי - שהוא חובה חוקית, לא תוספת? מציע שעונה על אלה בבהירות שווה יותר ממציע שנתן מחיר נמוך והתחמק מהשאלות.

## ולמה אין כאן מספר

כי אין לנו אחד. מה שיש לנו הוא שיחת אפיון של עשרים דקות, בחינם ובלי התחייבות, שבסופה תקבלו מחיר אחד ברור למקרה שלכם - והסבר מה בדיוק הוא כולל. זה הוגן יותר מטבלת מחירים שמתחילה ב\"החל מ\" ונגמרת במקום אחר.`,
      en: `It is the first question every business owner asks, and the answer is usually evasive. Let us answer it properly - without a magic number, because one number for everyone is by definition wrong, but with the structure that will help you understand every quote you receive.

## What the price is made of

A business website is three different jobs sold together. First - discovery and design: understanding what the business needs the site to do, and giving that a shape. Second - the build itself: code, content, mobile, accessibility. Third, always forgotten - what comes after: domain, hosting, maintenance, updates. When you compare quotes, compare all three - a quote that is cheap to build can be very expensive to keep.

## What actually moves the price

Page count matters less than it seems; what matters is what each page must do. A form that just sends an email is not a form that feeds a management system. A site in one language is not a site in two. A template design is not a design built around the business. And the biggest difference of all - who owns the code at the end: a site on a monthly-fee platform stays the platform's; a site in clean code is registered to you.

## The questions worth more than the price

Before comparing numbers, ask every bidder: who owns the code and the content when we are done? What happens if we want to leave? What does a year of maintenance cost, and what does it include? Does the site meet the Israeli accessibility standard - a legal obligation, not an extra? A bidder who answers these clearly is worth more than one who quoted low and dodged the questions.

## Why there is no number here

Because we do not have one. What we have is a twenty-minute scoping call, free and without commitment, at the end of which you get one clear price for your case - and an explanation of exactly what it includes. That is fairer than a price table that starts at "from" and ends somewhere else.`,
    },
  },

  {
    externalUrl: 'https://web.dev/articles/vitals',
    source: 'web.dev',
    topic: 'web',
    date: '2026-07-01',
    title: {
      he: 'Core Web Vitals - המדדים שגוגל באמת מודד',
      en: 'Core Web Vitals - the metrics Google actually measures',
    },
    excerpt: {
      he: 'המדריך הרשמי של צוות Chrome לשלושת המדדים שקובעים אם אתר נחשב מהיר: זמן טעינת התוכן המרכזי, תגובתיות לאינטראקציה ויציבות הפריסה.',
      en: "Chrome's own guide to the three metrics that decide whether a site counts as fast: largest contentful paint, interaction responsiveness and layout stability.",
    },
  },
  {
    externalUrl: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
    source: 'Google Search Central',
    topic: 'seo',
    date: '2026-06-15',
    title: {
      he: 'מדריך ה-SEO הרשמי של גוגל',
      en: "Google's official SEO starter guide",
    },
    excerpt: {
      he: 'המקור הראשון שכדאי לקרוא לפני שמשלמים למישהו על קידום. גוגל מסבירים בעצמם מה עובד, ובעיקר מה לא.',
      en: 'The first thing to read before paying anyone for SEO. Google explaining what works, and more usefully what does not.',
    },
  },
  {
    externalUrl: 'https://www.nngroup.com/articles/usability-heuristics-applied-video-games/',
    source: 'Nielsen Norman Group',
    topic: 'web',
    date: '2026-05-20',
    title: {
      he: 'עשרת כללי השימושיות של נילסן',
      en: "Nielsen's ten usability heuristics",
    },
    excerpt: {
      he: 'הכללים שמסבירים למה ממשק מסוים מרגיש ברור ואחר מבלבל. נכתבו ב-1994 ועדיין מסבירים את רוב הבעיות שנתקלים בהן היום.',
      en: 'The rules that explain why one interface feels obvious and another confusing. Written in 1994 and still explaining most of what goes wrong today.',
    },
  },
  {
    externalUrl: 'https://www.gov.il/he/pages/accessibility_regulations',
    source: 'gov.il',
    topic: 'web',
    date: '2026-04-10',
    title: {
      he: 'תקנות הנגישות לאתרי אינטרנט בישראל',
      en: 'Israeli website accessibility regulations',
    },
    excerpt: {
      he: 'מה החוק דורש מאתר עסקי בישראל, כולל ת"י 5568 והצהרת הנגישות. רלוונטי לכל עסק עם אתר, לא רק לגופים ציבוריים.',
      en: 'What Israeli law requires of a business website, including standard IS 5568 and the accessibility statement. It applies to any business with a site, not only public bodies.',
    },
  },
  {
    externalUrl: 'https://nextjs.org/docs/app/building-your-application/optimizing',
    source: 'Next.js',
    topic: 'web',
    date: '2026-03-05',
    title: {
      he: 'אופטימיזציה ב-Next.js',
      en: 'Optimizing in Next.js',
    },
    excerpt: {
      he: 'תמונות, פונטים, סקריפטים וטעינה עצלה - התיעוד הרשמי של המנגנונים שהופכים אתר לקוד סטטי שנטען מיד.',
      en: 'Images, fonts, scripts and lazy loading - the official documentation for the machinery that turns a site into static code that loads instantly.',
    },
  },
  {
    externalUrl: 'https://schema.org/LocalBusiness',
    source: 'Schema.org',
    topic: 'seo',
    date: '2026-02-18',
    title: {
      he: 'נתונים מובנים לעסק מקומי',
      en: 'Structured data for a local business',
    },
    excerpt: {
      he: 'ה-Schema שמאפשרת לגוגל להבין שאתר הוא עסק - שם, טלפון, שעות ואזור שירות. זה מה שמייצר תוצאות מועשרות.',
      en: 'The schema that lets Google understand a site is a business - name, phone, hours and service area. This is what produces rich results.',
    },
  },
]

// ── Accessors ─────────────────────────────────────────────────────────────────

/** Newest first. */
/** Drafts are visible locally and in previews, never on a production deploy. */
const showDrafts = !isProductionDeploy()

export function getArticles(): Article[] {
  return articles
    .filter((article) => showDrafts || isExternal(article) || !article.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/** Internal articles only - the ones with a page of their own. */
export function getInternalArticles(): (Article & { slug: string })[] {
  return getArticles().filter((article): article is Article & { slug: string } =>
    Boolean(!isExternal(article) && article.slug),
  )
}

/**
 * Reading time in minutes, computed from the body.
 *
 * Derived, not a field: a typed number drifts the moment anyone edits a
 * paragraph, and a wrong one is worse than none - it is the first small
 * promise the page breaks. 200 words per minute is the common figure for
 * Hebrew and English prose alike; headings are counted, since they are read.
 * Rounds UP: `round` gave the same article 1 minute in Hebrew and 2 in English,
 * because the two bodies differ by a few words either side of the halfway mark.
 */
export function readingMinutes(article: Article, lang: Locale): number {
  if (isExternal(article) || !article.body) return 0
  const words = article.body[lang].trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function getArticleBySlug(slug: string) {
  return getInternalArticles().find((article) => article.slug === slug)
}

/** Topics that actually have an article — drives the filter chips. */
export function getUsedTopics(): ArticleTopic[] {
  const used = new Set(getArticles().map((article) => article.topic))
  return articleTopics.filter((topic) => used.has(topic))
}
