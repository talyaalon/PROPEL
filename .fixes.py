# -*- coding: utf-8 -*-
"""Every confirmed finding from the four reviews, in one pass."""
import io, sys, re

def edit(path, pairs):
    raw = io.open(path, encoding='utf-8', newline='').read()
    crlf = '\r\n' in raw
    s = raw.replace('\r\n', '\n')
    for old, new in pairs:
        if old not in s:
            print('  !! MISS in %s: %r' % (path, old[:80])); sys.exit(1)
        s = s.replace(old, new, 1)
    io.open(path, 'w', encoding='utf-8', newline='').write(s.replace('\n', '\r\n') if crlf else s)
    print('  ok  %s' % path)

P = 'src/app/[lang]/blog/[slug]/page.tsx'

# ── BROKEN: /contact does not exist; the anchor does ─────────────────────────
edit(P, [(
    """      out.push(
        g.href.startsWith('/') ? (
          <Link key={key} href={g.href} className="article-link">""",
    """      /*
       * The MDX files link their closing CTA to /he/contact and /en/contact.
       * No such route exists - the site's contact target is the homepage
       * anchor, the same one the footer uses - so the one conversion link in
       * every article body landed on the localised 404. The files are
       * read-only source of record, and where a link points is a routing
       * concern, so the mapping lives here with the rest of the routing
       * decisions. If a real /contact page is ever built, delete this and the
       * links start meaning what they say.
       */
      const href =
        g.href !== undefined && /^\\/(he|en)\\/contact$/.test(g.href)
          ? g.href.replace('/contact', '#contact')
          : g.href
      out.push(
        g.href.startsWith('/') ? (
          <Link key={key} href={href as string} className="article-link">""",
)])

# ── HIGH: the literal --- paragraph; MEDIUM: the double-numbered headings ────
edit(P, [(
    """        const key = `s${si}b${bi}`
        if (block.startsWith('## ')) {
          clause += 1
          nodes.push(
            <h2 key={key} className="mt-12 text-brand-ink">
              <span className="clause" aria-hidden="true">
                {String(clause).padStart(2, '0')}
              </span>
              {renderInline(block.slice(3), key)}
            </h2>,
          )
          return
        }""",
    """        const key = `s${si}b${bi}`
        // A thematic break, not a paragraph that says "---". Every article
        // closes with one before its CTA; rendering it literally shipped a
        // junk paragraph at the most conversion-critical spot on the page.
        if (/^-{3,}$/.test(block)) {
          nodes.push(<hr key={key} aria-hidden="true" className="mt-10 border-t border-brand-line" />)
          return
        }
        if (block.startsWith('## ')) {
          clause += 1
          nodes.push(
            <h2 key={key} className="mt-12 text-brand-ink">
              <span className="clause" aria-hidden="true">
                {String(clause).padStart(2, '0')}
              </span>
              {/* The WordPress article numbers its own headings "1." to "5.".
                  Next to the injected clause number that read "02 · 1." - two
                  sequences, off by one, on five consecutive headings. The
                  clause system owns numbering site-wide, so an authored
                  leading ordinal yields to it. */}
              {renderInline(block.slice(3).replace(/^\\d+\\.\\s*/, ''), key)}
            </h2>,
          )
          return
        }""",
)])

# ── MEDIUM (a11y): the pre needs real keyboard access, with a name ───────────
edit(P, [
    (
        """function renderBody(body: string) {
  let clause = 1""",
        """function renderBody(body: string, codeLabel: string) {
  let clause = 1""",
    ),
    (
        """    if (si % 2 === 1) {
      // Odd segments are fence contents, verbatim.
      nodes.push(
        <pre key={`f${si}`}>
          <code>{segment.replace(/\\n$/, '')}</code>
        </pre>,
      )
      return
    }""",
        """    if (si % 2 === 1) {
      /*
       * Odd segments are fence contents, verbatim. tabIndex, not a browser
       * intervention: the block scrolls horizontally on phones, and Chrome
       * and Firefox make overflow containers focusable on their own - Safari
       * does not, which left a keyboard-only Safari reader unable to reach
       * the clipped end of the line the article is about. The role and the
       * localised label are what stop the focus stop from announcing itself
       * as a wall of raw code.
       */
      nodes.push(
        <pre key={`f${si}`} tabIndex={0} role="region" aria-label={codeLabel}>
          <code>{segment.replace(/\\n$/, '')}</code>
        </pre>,
      )
      return
    }""",
    ),
    (
        """        <div className="article-body mt-4">{renderBody(article.body[lang])}</div>""",
        """        <div className="article-body mt-4">
          {renderBody(article.body[lang], dict.blog.code_sample)}
        </div>""",
    ),
])

# ── MEDIUM: FAQ joins the clause sequence and the 68ch measure ───────────────
edit(P, [(
    """        {mdx && mdx.faq[lang].length > 0 && (
          <section aria-labelledby="article-faq" className="mt-14 border-t border-brand-line pt-10">
            <h2 id="article-faq" className="text-brand-ink">
              {dict.blog.faq_title}
            </h2>
            {mdx.faq[lang].map(({ q, a }, index) => (
              <div key={index} className="mt-8">
                <h3 className="text-[1.125rem] font-bold leading-snug text-brand-ink">{q}</h3>
                <p className="mt-3 text-[1.0625rem] leading-[1.8] text-brand-ink">{a}</p>
              </div>
            ))}
          </section>
        )}""",
    """        {mdx && mdx.faq[lang].length > 0 && (
          <section aria-labelledby="article-faq" className="mt-14 border-t border-brand-line pt-10">
            <h2 id="article-faq" className="text-brand-ink">
              {/* The next clause after the body's last heading - a same-scale
                  h2 that dropped out of the numbering read as an omission, not
                  a distinction. +2: the count is headings, clauses start at
                  the eyebrow's 01. */}
              <span className="clause" aria-hidden="true">
                {String((article.body[lang].match(/^## /gm) ?? []).length + 2).padStart(2, '0')}
              </span>
              {dict.blog.faq_title}
            </h2>
            {/* The answers keep the article's 68ch measure - these are the
                paragraphs a snippet-seeking reader lands on, and they were
                the only prose on the page running the container's full 768px. */}
            <div className="article-measure">
              {mdx.faq[lang].map(({ q, a }, index) => (
                <div key={index} className="mt-8">
                  <h3 className="text-[1.125rem] font-bold leading-snug text-brand-ink">{q}</h3>
                  <p className="mt-3 text-[1.0625rem] leading-[1.8] text-brand-ink">{a}</p>
                </div>
              ))}
            </div>
          </section>
        )}""",
)])

# ── MEDIUM: back-link must own its row ───────────────────────────────────────
edit(P, [(
    """          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-slate transition-colors hover:text-brand-ink"
        >""",
    """          /*
           * flex + w-fit, not inline-flex: the eyebrow after it is also
           * inline-level, so the two shared one line box - at 390px the topic
           * label wrapped around the back link, and the mb-10 on the first of
           * two elements sharing a line did nothing.
           */
          className="mb-10 flex w-fit items-center gap-2 text-sm font-medium text-brand-slate transition-colors hover:text-brand-ink"
        >""",
)])

# ── MEDIUM: UTC-pinned dates, both formatters here ───────────────────────────
raw = io.open(P, encoding='utf-8', newline='').read()
crlf = '\r\n' in raw
s = raw.replace('\r\n', '\n')
old_fmt = """new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })"""
new_fmt = """new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC',
            })"""
n = s.count(old_fmt)
if n != 2:
    print('  !! expected 2 formatters in page.tsx, found %d' % n); sys.exit(1)
s = s.replace(old_fmt, new_fmt)
io.open(P, 'w', encoding='utf-8', newline='').write(s.replace('\n', '\r\n') if crlf else s)
print('  ok  %s (2 formatters -> UTC)' % P)

# BlogGrid + LegalPage: same pin, with the reason written once
edit('src/components/sections/BlogGrid.tsx', [(
    """    new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))""",
    """    /*
     * timeZone pinned. `new Date('2026-08-19')` is UTC midnight, and this
     * component formats on the visitor's machine: west of UTC that midnight
     * is still the 18th, so the card showed one date and the article page -
     * formatted at build time - showed another, plus a hydration text
     * mismatch on every /blog visit from those timezones. A date-only string
     * formatted in UTC is the same everywhere.
     */
    new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(iso))""",
)])
edit('src/components/LegalPage.tsx', [(
    """  const formattedDate = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {""",
    """  // timeZone pinned for the same reason as BlogGrid: a date-only string is
  // UTC midnight, and unpinned it renders as yesterday west of UTC.
  const formattedDate = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {""",
), (
    """    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })""",
    """    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })""",
)])

# ── MEDIUM: slug collision must fail the build ───────────────────────────────
edit('src/content/articles.ts', [(
    """// ── Accessors ─────────────────────────────────────────────────────────────────""",
    """/*
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

// ── Accessors ─────────────────────────────────────────────────────────────────""",
)])

# ── LOW: the topic map's outputs validated; dead fields dropped ──────────────
edit('scripts/blog/generate.mjs', [
    (
        """const CATEGORY_TO_TOPIC = {
  'Engineering & Performance': 'engineering',
  'בנייה וביצועים': 'engineering',
}
""",
        """const CATEGORY_TO_TOPIC = {
  'Engineering & Performance': 'engineering',
  'בנייה וביצועים': 'engineering',
}

/*
 * The map's OUTPUTS are validated too. A typo'd topic value here would pass
 * the generator (it only rejects unknown categories), pass tsc (articles.ts
 * casts), and then render an empty chip while getUsedTopics silently drops
 * the post from every filter - the exact vanishing this map's comment claims
 * to prevent. Must match articleTopics in src/content/articles.ts.
 */
const KNOWN_TOPICS = new Set(['web', 'seo', 'automation', 'ecommerce', 'engineering'])
for (const [category, topic] of Object.entries(CATEGORY_TO_TOPIC)) {
  if (!KNOWN_TOPICS.has(topic)) {
    errors.push(
      `CATEGORY_TO_TOPIC maps ${JSON.stringify(category)} to unknown topic ` +
        `${JSON.stringify(topic)} - not in articleTopics`
    )
  }
}
""",
    ),
    (
        """  for (const field of ['date', 'updated', 'draft', 'readingTime']) {""",
        """  // NOT readingTime: the page derives reading time from the body it renders
  // (the two languages legitimately differ), so a pair-agreement rule here
  // guarded a number nothing displays. The per-file schema still validates it.
  for (const field of ['date', 'updated', 'draft']) {""",
    ),
    (
        """  return {
    slug,
    topic: CATEGORY_TO_TOPIC[he.fm.category],
    // Pair-agreed scalars, validated identical above.
    date: he.fm.date,
    updated: he.fm.updated ?? null,
    draft: he.fm.draft,
    readingTime: he.fm.readingTime,
    author: he.fm.author,
    related: he.fm.related,""",
        """  // readingTime, author and category are validated per file but not emitted:
  // reading time is derived from the body at render, the JSON-LD author is
  // the /#organization entity, and category's only job was the topic above.
  // Dead data in the emitted record reads as a promise someone will try to keep.
  return {
    slug,
    topic: CATEGORY_TO_TOPIC[he.fm.category],
    // Pair-agreed scalars, validated identical above.
    date: he.fm.date,
    updated: he.fm.updated ?? null,
    draft: he.fm.draft,
    related: he.fm.related,""",
    ),
    (
        """export type MdxPost = {
  slug: string
  /** The filter bucket. The chip label is the category string itself. */
  topic: string
  date: string
  updated: string | null
  draft: boolean
  readingTime: number
  author: string
  related: string[]
  title: PerLocale<string>
  description: PerLocale<string>
  category: PerLocale<string>
  keywords: PerLocale<string[]>""",
        """export type MdxPost = {
  slug: string
  /** The filter bucket. The chip label is the category string itself. */
  topic: string
  date: string
  updated: string | null
  draft: boolean
  related: string[]
  title: PerLocale<string>
  description: PerLocale<string>
  keywords: PerLocale<string[]>""",
    ),
    (
        """    title: { he: he.fm.title, en: en.fm.title },
    description: { he: he.fm.description, en: en.fm.description },
    category: { he: he.fm.category, en: en.fm.category },
    keywords: { he: he.fm.keywords, en: en.fm.keywords },""",
        """    title: { he: he.fm.title, en: en.fm.title },
    description: { he: he.fm.description, en: en.fm.description },
    keywords: { he: he.fm.keywords, en: en.fm.keywords },""",
    ),
])

# ── CSS: the 375px pre clip, and the FAQ measure ─────────────────────────────
edit('src/app/globals.css', [
    (
        """  .article-body {
    max-width: 68ch;
  }""",
        """  .article-body,
  .article-measure {
    max-width: 68ch;
  }""",
    ),
    (
        """  .article-body pre code {""",
        """  /* At 375px the fence's one meaningful line ran 14px past the box - the
     reader saw `|| 1` where the article's whole argument is `|| 14`. Half the
     inline padding buys 16px, which covers it without touching the layout
     anywhere else. */
  @media (max-width: 400px) {
    .article-body pre {
      padding-inline: 0.75rem;
    }
  }

  .article-body pre code {""",
    ),
])

print('code fixes done')
