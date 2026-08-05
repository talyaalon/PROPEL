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
  externalUrl?: never
  source?: never
}

export type Article = ExternalArticle | InternalArticle

export const isExternal = (article: Article): article is ExternalArticle =>
  'externalUrl' in article && Boolean(article.externalUrl)

// ── Content ───────────────────────────────────────────────────────────────────

export const articles: Article[] = [
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
      he: 'הסכמה שמאפשרת לגוגל להבין שאתר הוא עסק - שם, טלפון, שעות ואזור שירות. זה מה שמייצר תוצאות מועשרות.',
      en: 'The schema that lets Google understand a site is a business - name, phone, hours and service area. This is what produces rich results.',
    },
  },
]

// ── Accessors ─────────────────────────────────────────────────────────────────

/** Newest first. */
export function getArticles(): Article[] {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date))
}

/** Topics that actually have an article — drives the filter chips. */
export function getUsedTopics(): ArticleTopic[] {
  const used = new Set(getArticles().map((article) => article.topic))
  return articleTopics.filter((topic) => used.has(topic))
}
