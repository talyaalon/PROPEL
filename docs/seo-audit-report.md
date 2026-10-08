# SEO indexing audit - what was measured, what changed, what to do next

Branch: `seo/indexing-audit`.

**Update, 2026-10-08, after approval.** The owner approved applying every
recommendation. Three items this report had deferred are now implemented and
are marked `APPLIED` in section F: the `http://www.` redirect, HSTS
`includeSubDomains`, and `nosniff` on the static assets. Two recommendations
were deliberately **not** applied even under a blanket approval, and section F
says why in each case: `preload` on HSTS, and tightening `browserslist`. Both
change behaviour for real visitors in ways that are not mine to decide.

Keyword research was also carried out and lives in
`docs/keyword-research.md`. It replaces the hypotheses in section E with
observed SERP composition for five Hebrew commercial queries. It contains no
volume data, because no keyword tool was available here.

Measured on 2026-10-08 against **production** (`https://propel.co.il`) for the
"before" state, and against a **local production build** served by
`next start` for the "after" state. Where a number could not be measured here,
it says so instead of estimating.

Framework established before changing anything: Next.js 15 App Router, React
19, TypeScript strict, fully static (71 prerendered routes). Locales are
`/he` (default, `dir="rtl"`) and `/en`, resolved by `src/middleware.ts` from
`Accept-Language`. All copy lives in `src/dictionaries/{he,en}.json`. Metadata
is built in one place, `src/lib/pageMetadata.ts`. The sitemap is
`src/app/sitemap.ts`, driven by `src/lib/routes.ts` which the middleware also
reads, so a page cannot be crawlable and 404 at the same time.

---

## A. Executive summary

**The honest headline: the technical SEO on this site was already in good
shape, and most of this audit is now evidence of that rather than repair.**
Across all 42 indexed URLs there were zero missing or duplicate titles, zero
missing or duplicate descriptions, zero pages with the wrong `h1` count, zero
non-reciprocal `hreflang`, zero canonical or `hreflang` pointing at a
non-canonical host, zero `og:locale` errors, zero images without `alt`, zero
JSON-LD parse errors, zero dangling `@id` references, zero `FAQPage` blocks
declaring an answer the page does not show, and zero broken internal links.
Lighthouse scores SEO, accessibility and best practices at 100 on all six
templates tested in both languages.

That is not a claim I inherited. Six of those checks did not exist before this
branch and could not have been true or false; I wrote them, proved they fail on
deliberately broken HTML, and then ran them.

**Four real defects were found and fixed:**

1. **Every `lastmod` in the sitemap carried `+07:00`** - the timezone of the
   machine the commits are made on, not a property of the content. Normalised
   to UTC. This is the one item from the Search Console review that was a
   genuine bug.
2. **The portfolio index declared `CollectionPage` without `hasPart`**, so the
   site's largest collection told Google it was a collection and declined to
   say of what. The blog index and services hub both declared theirs. Found by
   a new site-wide `@type` census, not by reading the page.
3. **`src/app/robots.ts` asserted a header that does not exist.** It said the
   share-card routes carry `X-Robots-Tag: noindex`. Measured: they do not, and
   `next.config.ts` explains at length why the header was deliberately
   removed. A comment that misstates live behaviour is how the next person
   re-breaks it.
4. **`next.config.ts` claimed its headers apply "to every response".**
   Measured per header across four URL shapes: pages and generated
   `opengraph-image` routes carry all five, files in `public/` carry none.

**Expected impact, stated with the uncertainty it deserves.** Low, and I want
to be blunt about why. The site gets about 6 clicks in 3 months. That is not a
technical indexing problem - all 42 content URLs are indexed, which is 100% of
the sitemap. It is a demand and authority problem: the site is technically
excellent and commercially invisible. None of the four fixes above will move
traffic in a way you will be able to detect. The `lastmod` fix slightly
improves the odds that Google trusts the field and recrawls promptly; the
`hasPart` fix gives the portfolio collection a chance at better entity
understanding. Neither is a ranking lever.

**The lever is section E**, and it is content and links, not code.

---

## B. Change log

### Redirects and canonicalization

| File | Change | Reason |
|---|---|---|
| `netlify.toml` | Added a scheme-and-host scoped 301 for `http://www.propel.co.il/*` | Three of the four non-canonical variants were already single-hop. `http://www.` took two, because Netlify does the HTTPS upgrade and the apex consolidation as separate edge steps. Annotated VERIFY AFTER DEPLOY: nothing local can see a scheme or a host, so whether the rule fires is only knowable on production. Delete it if it does not. |
| `next.config.ts` | `Strict-Transport-Security: max-age=31536000; includeSubDomains` | Netlify emits HSTS without `includeSubDomains`, so a subdomain could be reached over plain HTTP and strip the apex protection. `preload` deliberately omitted, see section F.7. |
| `netlify.toml` | `X-Content-Type-Options = "nosniff"` on all four static header blocks | The framework headers reach pages and generated image routes and never reach files in `public/`, measured header by header. Only `nosniff` is useful on an image. |

### Sitemap

| File | Change | Reason |
|---|---|---|
| `src/lib/contentDates.ts` | Added `toUtc()`; every git date normalised to `...Z`, seconds precision | `git log --format=%cI` emits the *committer's* offset, so all 42 `lastmod` values published Asia/Bangkok time on an Israeli site. `--date=iso-strict-local` would have been worse: it reads the *build machine's* `TZ`, so a local build and a Netlify build would disagree about the same commit. Normalising in JS makes the output depend on nothing but the commit. |

### hreflang and i18n

| File | Change | Reason |
|---|---|---|
| none | No code change | `he`, `en` and `x-default` present and reciprocal on all 42 URLs; `<html lang>`/`dir` correct on all 42; no Hebrew copy in any English title or description. All now covered by automated checks. `x-default` recommendation in section F. |

### Metadata

| File | Change | Reason |
|---|---|---|
| none | No code change | Nothing measurable was wrong. See section C for the counts. |

### Structured data

| File | Change | Reason |
|---|---|---|
| `src/app/[lang]/portfolio/page.tsx` | `collectionPageSchema(... hasPart: projects.map(...))` | The index listed five case studies and declared none of them. Derived from the same `getProjects()` call the grid renders, so a draft project drops out of the schema exactly as it drops out of the page. |

### Performance

| File | Change | Reason |
|---|---|---|
| none | No code change | Nothing was worth changing. `lcp-discovery-insight` scores a perfect 1 on both homepages: `fetchpriority=high` applied, request discoverable in the initial document, not lazy-loaded. Two measured opportunities remain unapplied on purpose, with reasoning in section F.8: inlining the 11 KB stylesheet, and tightening `browserslist`. |

### Tooling and documentation

| File | Change | Reason |
|---|---|---|
| `scripts/seo-audit.mjs` | Second pass: duplicate titles/descriptions, true `hreflang` reciprocity, host inside canonical/`hreflang`/`og:url`, OG and Twitter presence, `og:locale` vs locale, `og:url` vs canonical, page-specific `og:image`, Hebrew in English metadata, `<html lang>`/`dir`, `img` width/height | Six classes of defect are invisible from one page in isolation. Proved the new assertions fire on broken HTML before trusting that they pass on real HTML. |
| `scripts/schema-check.mjs` (new), `package.json` | `npm run audit:schema`: per-`@type` required/recommended fields, site-wide `@id` resolution, `FAQPage` answer visibility, `@type` census | The old check verified JSON-LD *parses*. This answers whether it is *correct*, and it is what found the `hasPart` gap. |
| `src/app/robots.ts` | Replaced the false `X-Robots-Tag` claim with the measurement and the decision | See section A item 3. |
| `next.config.ts` | Replaced "applies to every response" with the per-header, per-URL-shape measurement | See section A item 4. Also corrects an error in my own first draft of that comment, which asserted the opposite. |
| `docs/keyword-research.md` (new) | Five Hebrew commercial SERPs, read by running the queries | Replaces section E's hypotheses with observed competitor composition. No volume data: no keyword tool was available, and the document says so rather than estimating. |

**No visible copy or design changed in this branch.** The only user-facing
difference is 534 bytes of JSON-LD on each portfolio index page.

---

## C. Before and after measurements

### Counts

| Metric | Before | After |
|---|---|---|
| Sitemap URLs | 42 | 42 |
| Sitemap URLs returning 200 | 42 / 42 | 42 / 42 |
| Sitemap URLs whose canonical is self-referential, right host, right path | 42 / 42 | 42 / 42 |
| Pages with a missing title | 0 | 0 |
| Pages with a missing description | 0 | 0 |
| Duplicate title groups | 0 | 0 |
| Duplicate description groups | 0 | 0 |
| Pages without exactly one `h1` | 0 | 0 |
| Pages missing `he`/`en`/`x-default` | 0 | 0 |
| Non-reciprocal `hreflang` annotations | 0 | 0 |
| Canonical / `hreflang` / `og:url` on a non-canonical host | 0 | 0 |
| Wrong `og:locale` | 0 | 0 |
| `img` without `alt` | 0 | 0 |
| `img` without width/height (excluding `fill`) | 0 | 0 |
| Broken internal links | 0 | 0 |
| Broken external links | 0 genuinely broken (3 bot-blocked, see below) | unchanged |
| JSON-LD problems (`npm run audit:schema`) | 1 (`hasPart`) | 0 |
| Dangling `@id` references | 0 | 0 |
| `FAQPage` answers not visible on the page | 0 | 0 |
| `lastmod` values on a non-UTC offset | 42 | 0 |

### Structured data census (42 URLs)

```
 42  ProfessionalService      10  Service            6  Article
 42  WebSite                  10  CreativeWork       2  ContactPage
 40  BreadcrumbList            6  CollectionPage
 22  FAQPage
```

`BreadcrumbList` is 40 and not 42 because the two homepages correctly have no
trail. `FAQPage` is 22 = 2 homepages + 2 contact + 2 services hub + 10 service
pages + 6 articles, one per page, every answer rendered as visible text.

### Lighthouse

Run with Lighthouse 13 against `next start` on localhost. **Read the caveats
before the numbers.**

**Baseline, desktop preset:**

| Page | Perf | SEO | A11y | Best practices | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/he` | 99 | 100 | 100 | 100 | 0.8 s | 0.004 | 40 ms |
| `/en` | 100 | 100 | 100 | 100 | 0.7 s | 0.003 | 10 ms |
| `/he/services/websites` | 100 | 100 | 100 | 100 | 0.6 s | 0 | 0 ms |
| `/en/services/websites` | 100 | 100 | 100 | 100 | 0.6 s | 0 | 0 ms |
| `/he/blog/branch-leakage-case-study` | 100 | 100 | 100 | 100 | 0.6 s | 0.015 | 0 ms |
| `/en/blog/branch-leakage-case-study` | 100 | 100 | 100 | 100 | 0.6 s | 0.002 | 0 ms |

**Baseline, mobile preset** (Lighthouse's default throttling):

| Page | Perf | SEO | A11y | Best practices | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/he` | 93 | 100 | 100 | 100 | 2.8 s | 0.004 | 160 ms |
| `/en` | 88 | 100 | 100 | 100 | 3.0 s | 0.002 | 300 ms |
| `/he/services/websites` | 96 | 100 | 100 | 100 | 2.5 s | 0 | 150 ms |
| `/en/services/websites` | 94 | 100 | 100 | 100 | 2.9 s | 0 | 100 ms |
| `/he/blog/branch-leakage-case-study` | 95 | 100 | 100 | 100 | 2.6 s | 0 | 140 ms |
| `/en/blog/branch-leakage-case-study` | 94 | 100 | 100 | 100 | 2.9 s | 0 | 120 ms |

**I am not reporting an "after" Lighthouse table, and that is a deliberate
refusal rather than an omission.** Two measurements say it would be noise
dressed as a result:

1. I diffed the rendered HTML of all six pages between the two builds. On five
   of the six it is **byte-identical apart from the 21-character build-ID
   comment** - 40 differing characters out of 223,867 on `/he`. No performance
   change was physically possible. (The sixth differing page, the portfolio
   index, gained 534 bytes of JSON-LD and was not in the Lighthouse set.)
2. I then ran the mobile preset five times against the same URL on the same
   server: **95, 87, 94, 87, 90**, with TBT ranging 111 ms to 367 ms. An
   8-point spread and a 3.3x TBT spread on identical bytes.

The raw "after" run did produce different numbers - `/en` mobile read 69 on one
pass, and `/he` desktop CLS read 0.122 - and presenting those as a regression
caused by this branch would have been false. They are variance on a laptop that
was simultaneously running builds and three dev servers.

**Further caveats you should carry into any decision:** these are localhost
numbers, so real network latency and Netlify's CDN are both absent; the mobile
preset's throttling is a simulation, not a device; and Search Console has **no
field data at all** for this property, so none of this is what your actual
visitors experience. The mobile LCPs of 2.5 s to 3.0 s sit on the boundary of
Google's "good" threshold under simulated throttling, which is worth knowing
but is not a measurement of your users.

### External links

16 distinct external targets. 13 return 200. Three return 403 to a plain
`fetch`:

- `https://www.gov.il/he/pages/accessibility_regulations`
- `https://www.isoc.org.il/.../all-about-accessibility`
- `https://www.isoc.org.il/.../rules-and-regulations-accessibility-internet`

I re-opened all three in a real Chromium via `playwright-core` before calling
them anything. Page titles came back `Attention Required! | Cloudflare` and
`Just a moment...`. These are **bot-protection interstitials, not dead
links** - a human visitor reaches the content. No action, and I note the method
because "403 therefore broken" would have been a false finding in a report.

### Crawl and canonicalization behaviour (production)

| Entry point | Result |
|---|---|
| `http://propel.co.il/` | 301 (1 hop) to `https://propel.co.il/` |
| `https://www.propel.co.il/` | 301 (1 hop) to `https://propel.co.il/` |
| `http://www.propel.co.il/` | **301, 301 (2 hops)** via `https://www.` |
| `http://propel.co.il/he/services` | 301 (1 hop) then 200 |
| `https://www.propel.co.il/he/services` | 301 (1 hop) then 200 |
| `https://propel.co.il/` | 307 to `/he` or `/en` by `Accept-Language` |
| `https://propel.co.il/he/` (trailing slash) | 308 to `/he` |
| `https://propel.co.il/he?utm_source=test` | 200, canonical `https://propel.co.il/he` |
| `https://propel.co.il/he/index.html` | 404 |
| `https://propel.co.il/HE` | 307 then 404 (no case-insensitive duplicate) |
| `https://propel.co.il/he/nonexistent` | **404 with `X-Robots-Tag: noindex`** (a real 404, not a soft 404) |
| `https://propel-agency.netlify.app/he` | 301 (1 hop) to `https://propel.co.il/he`, at root and at depth |

`robots.txt` is `User-Agent: *` / `Allow: /` with the sitemap declared and no
`Disallow` at all, so no CSS, JS or image is blocked from rendering.

HSTS **is** set: `Strict-Transport-Security: max-age=31536000`, on both HTML
and static assets. It comes from Netlify, not from this repository, and it
carries neither `includeSubDomains` nor `preload`. See section F.

### Build and tests

`npm run build` compiles clean, 71 static pages, no warnings. `next lint`
reports no warnings or errors. `tsc --noEmit` clean. There is no unit test
suite; the project's tests are the audit scripts, and all of them pass on the
fixed build:

```
seo-audit        PASS  0 failures, 0 warnings across 42 pages
audit:schema     PASS  0 problems
inlinks          PASS  0 pages under 3 editorial inbound links, 0 broken targets
csp-check        PASS  0 CSP violations, 0 page errors across 10 pages
audit -- reflow  clean, 23 routes x 2 themes, 320px at 200% text
audit -- headings clean, 23 routes, both locales
check-contact    ok, no placeholder markers in the build output
```

`check-portfolio` still reports 4 projects missing a narrative section and 19
metrics outstanding. That is a tracked content debt in
`content/portfolio/_TODO.md`, not a regression, and it needs answers from
clients rather than code.

---

## D. Needs doing by hand in Google Search Console

I cannot touch Search Console from here. In priority order:

1. **Resubmit the sitemap** once this branch is deployed. The URL set is
   unchanged at 42, but every `lastmod` value changes format, and a resubmit
   is what makes Google re-read them.
2. **Request indexing** for the two portfolio index URLs, the only pages whose
   output changed: `https://propel.co.il/he/portfolio` and
   `https://propel.co.il/en/portfolio`. No other page's HTML changed, so
   nothing else needs requesting on account of this branch.
3. **Mark the "Page with redirect" items as fixed? No - do not.** Those four
   URLs are *supposed* to redirect. They are non-canonical host variants and
   "Page with redirect" is the correct, permanent, non-error status for them.
   There is nothing to validate and clicking validate would fail, because the
   redirect is intentional and will still be there. Leave them.
4. **The two `opengraph-image` URLs: also no action.** See section F for the
   reasoning. "Crawled - currently not indexed" is the correct resting state.
5. **Set `NEXT_PUBLIC_SAME_AS`** in Netlify once real profile URLs exist, then
   redeploy. This is the single most valuable field the organization node is
   still missing, and it cannot be filled from the repository (section F).
6. Optional but useful: in Search Console, check **Settings > Crawl stats** for
   whether Google is spending crawl budget on the `opengraph-image` routes. If
   it is significant, that changes the calculus in section F item 3.

---

## E. Organic growth, prioritized

**Superseded in part: see `docs/keyword-research.md`.** That document was
written after this one, by running the actual queries and reading who ranks,
and it replaces the guesswork below with observed SERP composition for the
five Hebrew money terms. The three findings worth jumping to:

- **Migration is genuine white space.** Every result for the Wix and WordPress
  migration queries assumes the destination is WordPress. One competitor
  ranking for the query argues PROPEL's case verbatim.
- **The ecommerce cost page is the only result on its SERP with no numbers.**
  Every competitor publishes shekel ranges. Two numbers from you fixes it.
- **Accessibility and service-call systems are both the wrong fights.** The
  first SERP is overlay vendors at 450 to 850 shekels; the second is seven
  off-the-shelf SaaS products. Neither head term is winnable or worth winning.

**Every keyword below is a hypothesis to validate with a keyword tool. I have
no search-volume data and have invented none.** Where a real signal exists it
is attributed; everything else is reasoning from the services you sell and the
work already in the portfolio.

### The honest framing first

42 of 42 pages indexed, about 6 clicks in 3 months. Indexing is solved. The
constraint is that almost nobody is searching for these pages, and the ones
who are have not been given a reason to prefer them. Two separate problems:

- **Demand capture.** The service pages now carry 691 to 876 Hebrew words
  each, which is enough to compete, but each targets a broad head term where
  established agencies have years of links. Long-tail is where a site with 6
  clicks starts winning.
- **Authority.** No `sameAs`, no Google Business Profile, and no backlinks I
  can see. This caps everything else.

### Keyword hypotheses, mapped to existing pages

The two signals you reported from Search Console previously are the only real
data here, and both say the same thing: **you rank around positions 16 to 37
for commercial long-tail you had not yet written a heading for.** That pattern
is the whole strategy.

| Hypothesis (Hebrew) | Where it belongs | Why this page |
|---|---|---|
| `הקמת חנות אינטרנט עלות`, `כמה עולה חנות אונליין` | `/he/services/ecommerce` | Already has the H2 and the cost breakdown. You reported position ~37 before it existed. Re-check now. |
| `מערכת לניהול קריאות שירות`, `תוכנה לניהול קריאות שירות` | `/he/services/management-systems` | Already has the H2 and Air Manage as proof. You reported position ~16. |
| `מעבר מוורדפרס לקוד`, `האתר שלי איטי בוורדפרס`, `יצוא אתר מוויקס` | `/he/services/migration` | The only service whose query set does not collide with the homepage. Strongest page you have. |
| `אתר תדמית נגיש תקן 5568`, `בניית אתר נגיש לעסק` | `/he/services/websites` | Accessibility built into code, with an article and two live sites as proof. Genuinely differentiating and low competition. |
| `אוטומציה לעסק קטן`, `להפסיק לעבוד עם אקסל`, `אוטומציה להזמנות` | `/he/services/automation` | Needs the "twice a day" framing it already has, surfaced as headings. |
| `PWA לעסק`, `אתר שאפשר להתקין בנייד` | `/he/portfolio/hagorer2` | You have a shipped PWA. Almost nobody in the Israeli market has a case study for this. |
| `multi tenant branch isolation`, `order routed to wrong branch` | `/en/blog/branch-leakage-case-study` | English engineering long-tail. The only page on the site with a genuinely rare, linkable technical story. |

A note on the English side specifically: `/en` is competing globally with
everyone, which it will lose on head terms. Its realistic wins are the
engineering long-tail above and the Thailand connection, which is a real
differentiator nobody else has.

### Content gaps, as proposed pages

Titles are drafts. Each one is chosen because **the work already exists** and
the page would therefore need no invented claims.

| Proposed page | Target hypothesis | Fed by |
|---|---|---|
| `מה באמת עולה מערכת ניהול לעסק, ולמה אף אחד לא נותן מספר בטלפון` | `עלות מערכת ניהול`, `מחיר מערכת לעסק` | The pricing sections already written across five service pages. |
| `איך מעבירים אתר מוורדפרס בלי לאבד את הדירוג בגוגל` | `מעבר מוורדפרס בלי לאבד seo`, `301 הפניות מעבר אתר` | The migration FAQ answer already drafted, plus two 22/24-page rebuilds. |
| `תקן 5568 - מה באמת צריך לתקן בקוד` (deeper than the existing widget post) | `ת"י 5568 דרישות`, `בדיקת נגישות אתר` | The accessibility work in this repo and in both client sites. |
| `A kosher restaurant chain in Thailand, six branches, one kitchen screen` (EN) | `multi branch restaurant ordering system`, `kitchen display system integration` | The J-Cafe case study, expanded. |
| Case study: a **failed or abandoned** scoping call and why | `מתי לא כדאי לבנות מערכת` | `/not-a-fit` already takes this position and nobody else publishes it. |

The automation and ecommerce service pages currently have **no linked
article**, because the only candidate is the anonymised branch-leakage post and
`README-PUBLISHING` forbids placing it next to the J-Cafe case study, which both
pages cite as proof. Writing one automation-specific article closes the last
structural gap in the internal linking.

### Internal linking

The mechanical work is done: `inlinks` reports every page at or above 3
editorial inbound links, with none broken. What remains is editorial:

1. **Blog to service anchor text.** Each post links its service, but through a
   card component whose anchor text is the service name. In-body prose links
   with varied anchor text would be worth more.
2. **Case study to case study by theme**, not by ring position. The current
   previous/next walks a five-item ring. "Another multi-branch system" is a
   better link than "the next project".
3. **The homepage blog block shows the 3 newest posts.** With only 3 posts that
   is the whole blog. Once there are more, select by relevance rather than date.
4. **`/not-a-fit` has 3 inbound links and earns more.** It is the most
   trust-building page on the site and is buried.

### Local SEO (Israeli clients)

This is the **highest-impact, lowest-effort** item in this entire report and it
is not a code change.

1. **Create a Google Business Profile.** The organization JSON-LD is complete
   and waiting: `ProfessionalService`, `areaServed: Israel`, `telephone`,
   `priceRange`, `knowsAbout`, an `OfferCatalog` of all five services. The one
   field it lacks is `sameAs`, which is exactly what a GBP would supply. For a
   service business targeting Israel with 6 clicks, a verified profile is
   likely worth more than every on-page change in this branch combined.
2. **`NEXT_PUBLIC_SAME_AS`** then gets the GBP URL plus LinkedIn and GitHub.
3. **Israeli directories**: dapey-zahav, B144, and the sector-specific ones.
   Low quality individually, useful as corroborating entity signals.
4. **Hebrew local terms are currently absent on purpose.** No city or region
   name appears in any service page, because you have not said which areas you
   serve. If you work mainly with businesses in a region, saying so is a real
   ranking signal for `בניית אתרים <city>` style queries. This needs your
   answer, not a guess.
5. **The Thailand connection is unexploited.** You have six live branches in
   Thailand. "Israeli developer who ships for businesses abroad" is a genuine
   positioning nobody local can copy.

### Backlinks and brand mentions

Ranked by fit to what you actually have:

1. **The branch-leakage story is your best asset.** Three competing sources of
   truth, 38 silent fallbacks, a server-authority fix. That is a real
   engineering post-mortem. It belongs on Hacker News, `r/webdev`, and Israeli
   developer communities. Post-mortems earn links; service pages do not.
2. **Accessibility is a credential, not just a feature.** The widget article
   plus IS 5568 compliance in code is citable by Israeli accessibility
   consultants and small-business associations.
3. **Client co-marketing.** Five shipped projects, two with public sites. A
   "built by" credit or a reciprocal mention is the cheapest legitimate link
   available and you have already earned it.
4. **Partner directories**: Netlify, Vercel and Supabase all run agency or
   showcase listings. Relevant, durable, free.
5. **Guest posts** on Israeli small-business and restaurant-tech publications,
   pitched on the operational story rather than on web development.

### Quick wins versus longer projects

| Item | Impact | Effort | Type |
|---|---|---|---|
| Google Business Profile | High | Low | Quick win |
| Set `NEXT_PUBLIC_SAME_AS` after GBP/LinkedIn exist | Medium | Low | Quick win |
| Resubmit sitemap, request indexing on the 2 changed URLs | Low | Low | Quick win |
| Decide and publish the service areas you cover | Medium | Low | Quick win |
| Submit branch-leakage post to dev communities | Medium | Low | Quick win |
| Ask the 5 clients for one real metric each | High | Low | Quick win (blocked on them) |
| One automation-specific article | Medium | Medium | Project |
| Migration-SEO article | Medium | Medium | Project |
| Client co-marketing links | High | Medium | Project |
| Partner directory listings | Medium | Medium | Project |
| Expand J-Cafe case study for the EN market | Medium | Medium | Project |
| Build topical authority on one service, not five | High | High | Long |
| Field CWV data (needs traffic first) | Low now | n/a | Blocked on traffic |

---

## F. Open questions and decisions I made for you

### 1. `x-default` - keep it on `/he`. Recommended, not changed.

It currently points at `/he{path}` on every page, and I recommend leaving it.

Reasoning: `x-default` means "the page for users whose language we do not
match". For a business whose `areaServed` is Israel, whose phone is Israeli and
whose default locale is Hebrew, that page is the Hebrew one. The alternative,
a language-selector page at `/`, costs a click for 100% of visitors to serve
the minority who want English, and thin interstitials are a page type Google
frequently treats as a soft 404. A selector earns its keep when no sensible
default exists; here one does.

**Decide if you disagree:** if the English side is meant to lead (for example
if you are targeting international clients over Israeli ones), `x-default`
should move to `/en` and this argument inverts.

### 2. `/not-a-fit`, `/accessibility`, `/privacy` - keep all three indexed.

`/not-a-fit` is **not** a utility page and should not be `noindex`. It is about
400 words of original editorial content stating what you refuse to do and who
to go to instead; it has 3 editorial inbound links; and it is arguably the
strongest trust signal on the site. It also sits at a real decision moment, so
it can capture intent like `מתי לא כדאי לבנות מערכת`.

`/accessibility` is legally required in Israel and is itself searched
(`הצהרת נגישות`). Keep.

`/privacy` is the weakest of the three - boilerplate, no search intent - but
`noindex` on it gains nothing measurable and it is conventional to index. Keep,
and note that `inlinks` already exempts all three from the editorial-link
minimum as chrome-linked by design.

### 3. The two `opengraph-image` routes - leave exactly as they are.

Measured facts: both return 200 `image/png`; neither carries `X-Robots-Tag`;
neither is in the sitemap; **no `<a>` anchor anywhere on the site points at
them** (I checked every anchor on all 42 pages). They are reachable only
through `og:image`, `twitter:image` and JSON-LD.

That last part is the decision. The site declares these exact URLs as
`Article.image` on all 6 article pages and as the organization's `image` on all
42. Google requires an image referenced from structured data to be both
crawlable and indexable. Adding `noindex` would disable every article image in
search results in order to tidy a status line that is not an error - and this
repository already tried it and reverted it for that reason, which I only
discovered because the comment in `robots.ts` still claimed the header was
there.

"Crawled - currently not indexed" is the correct resting state for a URL whose
job is to be fetched by WhatsApp when someone pastes a link. **No action in
GSC, no code change.** If you ever do want them excluded, remove `image` from
`articleSchema` and repoint the organization's `image` *first*.

**Open question:** if Crawl stats show Google spending real budget on the 10
share-card routes, a `Disallow` in `robots.txt` becomes worth discussing - but
that trades every share preview on WhatsApp for crawl efficiency, which on this
site is probably the wrong trade.

### 4. `http://www.propel.co.il/` took 2 hops. APPLIED, and needs verifying live.

Chain: `http://www` → `https://www` (301) → `https://` (301) → locale. Both
hops are Netlify's own, the forced-HTTPS upgrade and the primary-domain
redirect, and neither is configurable from `netlify.toml`.

I chose not to add a rule because I cannot verify it from here. The candidate is
a host-scoped rule like the one already in `netlify.toml` for the netlify.app
domain, and whether Netlify's redirect engine runs before its own HTTPS upgrade
is not something a local build can answer. This repository has an explicit scar
on exactly this: a `[[redirects]]` block with `status = 404` was written,
deployed, measured, and never fired, and the file now warns that "a rule that
looks like a safeguard and is not one is worse than no rule."

My original judgement was **not worth it** - SEO impact is approximately zero,
Google follows chains of this length without losing signal, and the canonical
on every page settles the host question independently. Under the blanket
approval it is now in `netlify.toml` anyway, because the approval also removed
the blocker: with a deploy available the rule becomes testable, and an
unverifiable rule was the only real objection.

```toml
[[redirects]]
  from = "http://www.propel.co.il/*"
  to = "https://propel.co.il/:splat"
  status = 301
  force = true
```

**It is annotated in `netlify.toml` as VERIFY AFTER DEPLOY and it means it.**
`next start` never sees a scheme or a host, so nothing local can tell whether
Netlify's redirect engine runs before its own forced-HTTPS step. The
netlify.app rule above it proves host-scoped matching works; it does not prove
scheme-scoped matching does.

```bash
curl -sI http://www.propel.co.il/ | grep -iE '^HTTP|^location'
# want: one 301, location: https://propel.co.il/
```

If it still shows two hops, **delete the rule** rather than leave it. This file
already carries a scar from a `[[redirects]]` block that was written, deployed,
measured and never fired, and its own comment says a rule that looks like a
safeguard and is not one is worse than no rule.

### 5. The root `/` is a 307, not a 301. Deliberate, and I recommend keeping it.

Search Console counts `https://propel.co.il/` among the "Page with redirect"
URLs. It redirects to `/he` or `/en` depending on `Accept-Language`.

A 301 here would be a bug, not an improvement: permanent redirects are cached,
so the first visitor's language would stick for later visitors behind the same
cache. Content-negotiated redirects are supposed to be temporary. The signal
consolidation you want is already delivered by the self-referential canonical
on every page plus reciprocal `hreflang` and `x-default`.

**Decide if you disagree:** a hard 301 to `/he` is possible, and the cost is
dropping language negotiation so an English visitor lands on Hebrew and must
switch manually.

### 6. `sameAs` cannot be filled from this repository. I need URLs from you.

The organization node is missing only this field, and it is the most valuable
one left for a brand query. The repository contains no public business profile:
the two git remotes are source repositories, not business profiles, and a
`sameAs` pointing at something that is not this business is a false statement
in the knowledge graph.

Send LinkedIn, GitHub and (once it exists) the Google Business Profile URL, and
`NEXT_PUBLIC_SAME_AS` takes them comma-separated with no code change.

### 7. HSTS hardening. `includeSubDomains` APPLIED, `preload` still your call.

`Strict-Transport-Security: max-age=31536000` is present on every response,
added by Netlify rather than declared in this repository. It has no
`includeSubDomains` and no `preload`.

`includeSubDomains` is now declared in `next.config.ts`:
`max-age=31536000; includeSubDomains`. Without it a subdomain of propel.co.il
could be reached over plain HTTP and strip the protection the apex has, and
since no subdomain serves anything today this is the cheapest moment to close
it.

**Verify after deploy**, because Netlify's own HSTS and this one may both land
and a browser honours whichever arrives first:

```bash
curl -sI https://propel.co.il/he | grep -ci strict-transport-security
```

If that prints `2`, check which value wins and keep only the layer that is
doing the work. If it prints `1` and the value carries `includeSubDomains`,
this one replaced Netlify's and the job is done.

**`preload` is deliberately NOT applied, even under a blanket approval.** It
requires submitting the domain to a list compiled into browser binaries, and
removal takes months to reach users. That is an irreversible commitment about
the domain rather than a header preference, and it is not a decision a code
audit should make on your behalf. It has no SEO effect either way. Say the word
and it is one more token on one line.

### 8. Two measured performance opportunities I did not take.

Both are real, both are small, and both are product decisions rather than bug
fixes:

- **One render-blocking stylesheet**, 11 KB, `wastedMs` 154 on the mobile
  preset. Eliminating it means inlining critical CSS, which risks FOUC,
  interacts with the CSP, and loses the shared cache across pages. Not worth
  150 ms of simulated mobile.
- **12 KiB of legacy JavaScript polyfills** (`Array.prototype.at` and friends)
  in a Next chunk, driven by the `browserslist` in `package.json`
  (`last 2 versions, not dead, > 0.5%, not op_mini all`). Tightening it drops
  the polyfills and also drops support for older browsers.

  **Still not applied, deliberately, despite the blanket approval.** The
  polyfills that would go are for methods that need roughly Chrome 92 and
  Safari 15.4, so tightening the list means some real visitors on older phones
  get a broken page instead of a slightly slower one. Saving 12 KiB is not
  worth finding that out from a customer, it has no SEO effect, and I have no
  data on what your visitors actually use - Search Console has no field data
  for this property at all. If you know your audience is current, say so and
  it is a one-line change.

### 9. `lastmod` timestamps are still identical across most pages. On purpose.

After the UTC fix, 15 of 21 Hebrew paths share `2026-10-07T07:53:21Z`. That is
**accurate, not a bug**: they genuinely all changed in one commit, because a
page family is produced by one content file and the sitemap dates each page
from its content source.

Per-entity granularity is possible via `git log -L` on a computed line range,
which would date each case study and each service from the last commit that
touched its own block. I rejected it: it needs a TypeScript block parser in the
build to locate each entity's line range, and a plausible-looking wrong date is
worse for `lastmod` credibility than an honestly coarse one. Say the word if
you want it anyway.

### 10. `nosniff` on `public/` files. APPLIED.

Measured: pages and generated image routes carry all five security headers;
`/paper.webp` and the five project captures carry none, because Netlify's CDN
serves them without consulting a Next `headers()` rule. The fix is a one-line
addition to the existing `netlify.toml` header blocks.

Applied: `X-Content-Type-Options = "nosniff"` is now on all four existing
`[[headers]]` blocks in `netlify.toml` - `/_next/static/*`, `/*.webp`,
`/projects/*` and `/*.svg`.

Only `nosniff`. The other four headers say nothing useful about a PNG: there is
no document to frame, no referrer policy to express and no CSP to enforce, and
HSTS is already on every response. Verify with:

```bash
curl -sI https://propel.co.il/paper.webp | grep -i x-content-type-options
```
