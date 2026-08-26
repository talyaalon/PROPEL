# Article template

Copy the block below into the `articles` array in `src/content/articles.ts`,
above the existing entries. Leave `draft: true` until you want it live -
drafts render locally and in Netlify previews, and are absent from production
and from the sitemap.

There is no MDX pipeline and deliberately so: the article model already
carries every field MDX frontmatter would (`title`, `description`, `date`,
`topic`, `slug`, `draft`), reading time is computed rather than typed, and
adding a second content format would mean two places to look for an article.

## The body format

Paragraphs separated by a blank line. A line beginning `## ` is a section
heading and joins the page's clause numbering automatically. Nothing else -
no bold, no lists, no images. An article that needs more should change this
file first, so the need is a decision rather than an accident.

## Rules that are not style

- **No invented numbers.** No prices, no percentages, no "×3 faster". If a
  figure is not something you can point at, it does not go in.
- **Hebrew is the source.** Write `he` first; `en` is a rendering of it.
- **Both locales, same commit.** An article that exists in one language is a
  page with no counterpart, and the site has none of those.
- **Link inward.** `relatedService` and `relatedProjects` are the reason an
  article earns its place: they carry a reader to the work, with anchor text
  we choose.

## The block

```ts
{
  slug: 'kebab-case-and-in-the-url',
  topic: 'web',              // 'web' | 'seo' | 'automation' | 'ecommerce'
  date: '2026-01-01',        // ISO. Real publication date - it drives sitemap lastmod.
  draft: true,               // false publishes it
  relatedService: 'automation',            // optional: a /services/<slug>, or 'migration'
  relatedProjects: ['jcafe-kosher'],       // optional: slugs from projects.ts
  title: {
    he: '',
    en: '',
  },
  excerpt: {                 // one or two lines, shown on the blog card
    he: '',
    en: '',
  },
  description: {             // the meta description - what Google prints
    he: '',
    en: '',
  },
  body: {
    he: `פסקת פתיחה.

## כותרת משנה

פסקה.

## כותרת משנה

פסקה אחרונה.`,
    en: `Opening paragraph.

## A section heading

A paragraph.

## A section heading

A closing paragraph.`,
  },
},
```

## Before publishing

```bash
npm run build          # the postbuild guard fails on a leaked placeholder
npm run start -- -p 4455
npm run audit -- headings          # the article's outline, both locales
```

Then check the page at 320px with the accessibility menu's text set to 200% -
that combination is where this project's layout defects live.
