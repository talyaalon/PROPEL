# Stage 7 — structures, for approval before anything is built

Per the brief: **structure, not content.** Nothing here is implemented. Each
section says what the page is, what it stands on, and what it would cost.

---

## 1. Vertical landing pages

Three pages, one per business type, each backed by a case study that already
exists. The point is a page that ranks for "מערכת לרשת מסעדות" rather than
asking that visitor to recognise themselves inside a generic services page.

**These are not new services.** They are the existing services aimed at one
reader, and each must be backed by real work or it does not get built.

| Page | Query it exists for | Backed by | Has proof today? |
|---|---|---|---|
| `/verticals/restaurants` | מערכת לרשת מסעדות / בתי קפה | J-Cafe | headline, challenge, screens ✓ |
| `/verticals/clinics` | אתר לקליניקה / מכון טיפולי | כנפיים לעוף | headline, challenge, screens, live URL ✓ |
| `/verticals/field-service` | אתר לעסק שירות ותפעול שטח | הגורר 2 | headline, challenge, screens, live URL ✓ |

### Structure per page

```
01  eyebrow: the vertical            H1 = the query, verbatim
    intro: the problem THIS trade has, in its own words
02  what breaks in this kind of business   (3-4 lines, no numbers)
03  what we build for it                   (drawn from the service pages)
04  the case study                         full-width, the real one
05  the other services, as links           automation / systems / websites
    CTA                                    WhatsApp, own analytics label
```

### How it gets built

Exactly like `src/content/services.ts` → `src/app/[lang]/services/[service]/page.tsx`:
one content file, one dynamic route, `dynamicParams = false`, registered in
`src/lib/routes.ts` so the sitemap and the middleware cannot disagree. Schema:
`Service` + `BreadcrumbList`, same as the service pages.

**Cost:** ~1 content file, ~1 route, 6 new URLs (28 → 34 in the sitemap).

**The risk worth naming:** a vertical page and its service page can compete for
the same query. The split has to be real — the service page answers "what is
business automation", the vertical answers "what does a restaurant chain need".
If the copy cannot hold that line, three pages become three thin duplicates and
the site is worse. **This is the one item here I would build last.**

---

## 2. "מתי אנחנו לא הכתובת"

A page that filters by **project type, not budget** — the brief is explicit and
there are no monetary figures anywhere in it.

Route: `/not-a-fit` (he: "מתי אנחנו לא הכתובת").

```
01  why this page exists          one paragraph: it is faster for both of us
02  what we are not the fit for   a list of PROJECT TYPES
03  who is a better fit for those where to go instead - named honestly
04  what we ARE the fit for       links to the service pages
    CTA                           "still think it is a fit? tell us"
```

**Content to be written by the owner.** I can offer the structure and the
category axis; the actual list is a business decision — which projects you
refuse is a positioning statement, not a copywriting task.

**Why it belongs:** the site already claims transparency as a value; a page
that turns work away is the only cheap way to prove it. It also removes the
"do you do X?" enquiries that cost a reply and go nowhere.

**Cost:** one static route, one dictionary block. No schema beyond breadcrumbs.

---

## 3. Cal.com — the performance cost, measured before the decision

**Today the homepage loads zero third-party scripts.** That is unusual and it
is worth something: nothing on the critical path is outside our control.

Cal.com offers two integrations:

| | What it costs | What it gives |
|---|---|---|
| **Inline embed** | Their embed script (~90kB gz) plus an iframe that pulls React and their whole UI. On a page whose LCP already measures 3.0s on throttled 4G, this is the single largest thing we could add. | Booking without leaving the page |
| **Link out** | Zero bytes. An `<a>` to `cal.com/propel`, `rel="noopener"`. | Booking on their domain |

**Recommendation: link out, not embed.** The friction the brief wants removed
is "we will get back to you" — and a link removes that just as completely as an
embed does. The embed buys one avoided click and costs the performance claim we
just had to reword, on the page that is the whole funnel.

**Prerequisite either way:** a Cal.com account and a configured event type. Not
a code task — say the word and give me the URL, and the link is a ten-minute
change to the contact section and the hero CTA row.

**Middle option if you want it inline later:** load the embed only on
`/contact` (a page that does not exist yet), never on the homepage, and behind
a click — the visitor asks for the scheduler, and only then does it download.

---

## Suggested order

1. **"מתי אנחנו לא הכתובת"** — cheapest, no ranking risk, and it proves a value
   the site already claims.
2. **Cal.com as a link** — ten minutes once the account exists.
3. **The verticals** — highest value and highest risk. Build one
   (`restaurants`, the strongest case), measure whether it ranks without
   cannibalising `/services/ecommerce`, and only then build the other two.
