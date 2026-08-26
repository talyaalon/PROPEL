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
import { mdxPosts } from '@/content/generated/posts'

export type Bilingual = Record<Locale, string>

export const articleTopics = ['web', 'seo', 'automation', 'ecommerce', 'engineering'] as const
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
  /**
   * A real content revision, not a tweak - drives the sitemap's lastModified
   * and the Article schema's dateModified. Only the MDX pipeline sets it.
   */
  updated?: string
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
      he: 'ה-Schema שמאפשרת לגוגל להבין שאתר הוא עסק - שם, טלפון, שעות ואזור שירות. זה מה שמייצר תוצאות מועשרות.',
      en: 'The schema that lets Google understand a site is a business - name, phone, hours and service area. This is what produces rich results.',
    },
  },
]

// ── MDX posts ─────────────────────────────────────────────────────────────────

/*
 * The three articles under content/blog/ arrive through code generation
 * (scripts/blog/generate.mjs, run by prebuild) rather than by being typed
 * here, because their source of record is the read-only MDX files. They join
 * the same array so every consumer - the grid, the routes, the sitemap, the
 * middleware - sees one list and cannot disagree about what exists.
 *
 * `excerpt` doubles as `description`: the MDX schema has one description
 * field serving both the card and the meta tag, which is also how the SERP
 * uses it.
 */
/*
 * The inbound half of README-PUBLISHING section 6.
 *
 * The MDX frontmatter carries `related` (article -> article) but no service
 * or project fields, so the three articles rendered with the contact CTA as
 * their only in-body internal link: everything a shared article earned
 * stopped at the article instead of reaching a money page. The article
 * template already renders both card types when the fields are present, so
 * this mapping is all that was missing.
 *
 * Kept here rather than in the MDX because the MDX files are the read-only
 * source of record for the WRITING; which service a piece feeds is a site
 * structure decision, and it belongs with the other site structure.
 */
const ARTICLE_LINKS: Record<string, { service?: string; projects?: string[] }> = {
  'accessibility-plugin-is-not-enough': {
    service: 'websites',
    projects: ['hagorer2', 'cnafim-lauf'],
  },
  // The anonymised multi-branch restaurant story. NOT linked to jcafe-kosher:
  // README-PUBLISHING forbids placing the two next to each other, because a
  // reader who sees both makes the connection the anonymisation exists to
  // prevent. Air Manage and BOM make the same argument without that risk.
  'branch-leakage-case-study': {
    service: 'management-systems',
    projects: ['air-manage', 'bom-recipes'],
  },
  'wordpress-vs-custom-code-true-cost': {
    service: 'migration',
    projects: ['hagorer2'],
  },
}

const mdxArticles: Article[] = mdxPosts.map((post) => ({
  slug: post.slug,
  topic: post.topic as ArticleTopic,
  date: post.date,
  updated: post.updated ?? undefined,
  draft: post.draft,
  title: post.title,
  excerpt: post.description,
  description: post.description,
  body: post.body,
  relatedService: ARTICLE_LINKS[post.slug]?.service,
  relatedProjects: ARTICLE_LINKS[post.slug]?.projects,
}))

/*
 * A mapping entry for a slug that no longer exists is silent - the article is
 * renamed or deleted and the link simply never renders again. Module scope,
 * like the collision guard below, so the build says so instead.
 */
{
  const slugs = new Set(mdxPosts.map((post) => post.slug))
  for (const slug of Object.keys(ARTICLE_LINKS)) {
    if (!slugs.has(slug)) {
      throw new Error(
        `ARTICLE_LINKS has an entry for "${slug}", which is not a post under content/blog/. ` +
          'Remove the entry or restore the article.',
      )
    }
  }
}

/*
 * A slug collision between a typed article and an MDX post is silent
 * otherwise: two cards, one URL, and getArticleBySlug serves whichever sorts
 * newer while the other body becomes unreachable. Every other authoring
 * mistake in this pipeline fails the build loudly; this one must too. Module
 * scope, so the prerender throws before anything ships.
 */
{
  const seen = new Set<string>()
  for (const article of [...articles, ...mdxArticles]) {
    if (isExternal(article) || !article.slug) continue
    if (seen.has(article.slug)) {
      throw new Error(
        `duplicate article slug "${article.slug}" - one is typed in articles.ts, ` +
          'one comes from content/blog/. Rename or remove one of them.'
      )
    }
    seen.add(article.slug)
  }
}

// ── Accessors ─────────────────────────────────────────────────────────────────

/** Newest first. */
/** Drafts are visible locally and in previews, never on a production deploy. */
/**
 * Drafts are visible locally and in previews, never on a production deploy.
 *
 * Exported because two page templates resolve MDX posts straight out of
 * `mdxPosts`, bypassing the accessors below - and a third copy of this
 * expression is exactly how the sitemap and the middleware drifted apart once
 * before.
 */
export const showDrafts = !isProductionDeploy()

export function getArticles(): Article[] {
  return [...articles, ...mdxArticles]
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
