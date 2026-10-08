# Keyword research - what the SERPs actually look like

Researched on 2026-10-08 by running the real queries and reading who ranks.
Companion to `docs/seo-audit-report.md`, which covers the technical audit.

## Read this first: what this document is and is not

**It is** a record of who currently occupies each commercial SERP PROPEL
competes in, what they sell, at what price point they advertise, and therefore
where the unclaimed ground is. That is observed, not estimated.

**It is not** volume data. No keyword tool was available in this environment, so
there is **no search volume, no difficulty score and no CPC anywhere in this
document**, and none has been invented. Where a priority is asserted it is
reasoned from SERP composition and from what PROPEL can truthfully claim, and
it is labelled as reasoning.

**Two limitations you must weigh:**

1. The search tool used here is **US-localised**. For Hebrew queries it returns
   the right *set* of Israeli competitors but not the ordering an Israeli user
   on an Israeli IP sees. Treat "who ranks" as "who competes", not as a
   position report.
2. The only real position data in existence for this site is what you read in
   Search Console. Two figures you reported previously - roughly position 37
   for `הקמת חנות אינטרנט עלות` and roughly position 16 for
   `מערכת לניהול קריאות שירות` - are the only measured positions referenced
   here, and they are attributed to you rather than to me.

**A trap worth naming.** Competitor pages are full of quotable statistics
("76% of small businesses see positive ROI within 12 months", specific shekel
ranges). None of it may be reused on PROPEL's site. It is someone else's claim
about someone else's data, and `CLAUDE.md` forbids publishing a figure that has
not been supplied. Everything below is about positioning, not about borrowing
numbers.

---

## 1. `הקמת חנות אינטרנט עלות` and friends - saturated, and we are the only one with no number

**Who competes:** danielzrihen.co.il, wemanage.co.il, e-shop.co.il,
divinesites.co.il, sadandigital.co.il, bolder.co.il, popupstudio.co.il,
ymdigital.co.il, webshuk.com.

**What the SERP is made of:** every single result is a "how much does it cost"
or "מחירון" page, and **every one of them publishes explicit shekel ranges**,
usually as a table by store size, plus line items for branding, product
photography, domain and characterisation.

**The finding that matters.** `/he/services/ecommerce` now carries the H2
`כמה עולה הקמת חנות אינטרנט` and a list of eight cost components, and
deliberately no numbers. Against this SERP that is a structural disadvantage
for this one query: the intent is explicitly "give me a number", and we are
the only result that declines. Our cost-component breakdown is genuinely more
useful than most of their tables, but it does not satisfy the query.

**Recommendation.** This is the highest-value item blocked on you in the whole
report. Publishing even a floor plus a band would turn the page from
"interesting" into "an answer". It already has the honest framing to carry it:
the page argues the difference is in the operational layer rather than the
design, which is a better answer than any competitor gives, and a range would
make it credible rather than evasive.

**What we need from you:** a lower bound for a catalogue store with checkout,
and a lower bound for a store with operational screens and an ERP
integration. Two numbers. Nothing goes on the site until you send them.

---

## 2. `מערכת לניהול קריאות שירות` - the SERP sells products, we sell builds

**Who competes:** magicnet.co.il, 2link.co.il, smbsoft.co.il, conbox.co.il,
eyedo.co.il, wizenet.co.il, linet.org.il.

**What the SERP is made of:** every result is an **off-the-shelf SaaS product**
with a monthly subscription, GPS technician tracking, a field app. Not one
custom-development agency appears.

**The finding that matters.** You reported position ~16 here. That is a custom
build ranking against seven product companies, which explains both why you
appear at all (the page is genuinely relevant) and why you are not higher (the
dominant intent is "buy a product", which you do not sell).

The head term is probably not winnable and probably not worth winning: a
visitor searching it mostly wants a subscription. But the page already contains
the exact counter-argument - "off-the-shelf software forces the business to fit
it; a system built for you fits the business" - and that argument has its own
query space which nobody in that list is targeting.

**Recommendation.** Keep the H2 for relevance, and go after the decision-stage
long-tail where the comparison is the question. Hypotheses to validate:
`מערכת קריאות שירות בהתאמה אישית`, `תוכנת מדף או מערכת מותאמת`,
`למה תוכנת קריאות שירות לא מתאימה לנו`, `מערכת קריאות שירות בלי מנוי חודשי`.
That last one is a real axis: all seven competitors are subscriptions and you
hand over code the client owns.

---

## 3. `העברת אתר מוויקס` / `מעבר מוורדפרס` - genuine white space

**Who competes:** danielzrihen.co.il, wemanage.co.il, hostcenter.co.il,
netolink.co.il, mws.co.il, easycloud.co.il, smartfish.co.il, myhost.co.il,
dweb.co.il.

**What the SERP is made of:** this is the strongest finding in the research.
**Every result assumes the destination is WordPress.** The queries are "Wix to
WordPress", "WordPress to another server", "the complete guide to WordPress
migration". Several are hosting companies whose interest is where the site
lands. The angle "migrate off the platform into clean code you own" is
occupied by nobody.

Better still, one competitor states the case for us outright: *"אין פתרונות
קסם - צריך לקחת מתכנת אתרים שישב ויבנה לך את האתר מחדש"* ("there is no magic
solution, you need a developer to sit down and rebuild the site"). That is
literally the service `/he/services/migration` sells, written by someone
ranking for the query who does not sell it.

**Recommendation. Make migration the spearhead service.** Reasoning, not
measurement: the SERP has an unclaimed angle, the page is already the strongest
commercial page on the site, its query set does not collide with the homepage,
and the portfolio holds two completed rebuilds at 22 and 24 pages. Of the five
services this is the one where PROPEL is differentiated rather than merely
competent.

Hypotheses to validate: `העברת אתר מוויקס לקוד`, `מעבר מוורדפרס בלי לאבד דירוג`,
`לצאת מוויקס`, `האתר שלי בוויקס ואני רוצה אותו שלי`,
`המפתח שבנה לי את האתר נעלם`. The last one is a real situation the page's
intro already names and no competitor page addresses.

---

## 4. `הנגשת אתרים` / `תקן 5568` - do not compete on the commercial term

**Who competes:** tabnav.com, accessible.org.il, vee.co.il,
s2uaccess.site2u.co.il, digitale.co.il, livedns.co.il, sgo.co.il.

**What the SERP is made of:** overlay-widget vendors, advertising
**450 to 850 shekels one-off, or 60 shekels a month**. Several promise "full
legal compliance" from a widget. One sells compliance via the ANDI plugin.

**The finding that matters.** PROPEL cannot and must not compete here. Building
accessibility into code costs more than 850 shekels and the SERP has trained
this query to expect a widget subscription. Worse, PROPEL's own published
article argues these products do not deliver what they promise, so competing
on their term would mean competing on a premise we reject.

The opportunity is the **sceptical** query, not the buying query, and the asset
already exists: `/he/blog/accessibility-plugin-is-not-enough` is written
exactly for the reader who suspects the widget is not enough, and its FAQ
already opens with "האם תוסף נגישות מספיק כדי לעמוד בתקן 5568?".

**Recommendation.** Leave the service page's accessibility claim where it is as
a differentiator, and point the article at the doubt rather than the purchase.
Hypotheses: `האם תוסף נגישות מספיק`, `תוסף נגישות לא עומד בתקן`,
`הנגשה בקוד או תוסף`, `קיבלתי מכתב התראה נגישות אתר`. That last one is a
high-intent moment with a real budget behind it and no widget vendor wants to
answer it honestly.

---

## 5. `אוטומציה לעסקים` - three crowds, and a gap between them

**Who competes:** koogler.co.il, galilsoftware.com, auto-flow.co.il,
bresleveloper.co.il, upscale.global, excelwiz.co.il, eyedo.co.il,
stsiconic.com, sogomatic.com.

**What the SERP is made of:** three distinct groups. AI-automation marketing
pages; Zapier and Make integrators; and Excel/VBA shops. PROPEL is none of
these: it builds the system that replaces the manual step and connects it to
what already exists.

**The finding that matters.** The gap is real but the query is vague. "Business
automation" attracts readers who want a Zapier recipe and readers who want a
system, and the page cannot serve both. This is the weakest of the five
services for head-term SEO, which matches it being the only service page with
no linked article.

**Recommendation.** Compete on the symptom, not the category. The page's own
best line is already the right hook - a process you do by hand twice a day -
and the hypotheses follow from it: `להפסיק להקליד פעמיים`,
`אוטומציה להזמנות במסעדה`, `לחבר בין שתי מערכות שלא מדברות`,
`אוטומציה בלי Zapier`. Also note `excelwiz.co.il` ranking here: "we will
replace your Excel" is a query space with real pain and low sophistication.

---

## 6. The English side

Honest assessment: `/en` competes globally on every head term and will lose
them all. It has two realistic assets, and neither is a service page.

1. **`/en/blog/branch-leakage-case-study`.** Three competing sources of truth
   for branch identity, 38 silent fallbacks, a server-authority fix. Engineering
   post-mortems of this specificity are rare and linkable. Hypotheses:
   `multi tenant branch isolation bug`, `order routed to wrong branch`,
   `httpOnly cookie tenant identity`, `default fallback considered harmful`.
2. **The Thailand work.** Six branches, two languages, kitchen and picker
   screens, two-way ODOO sync. "An Israeli developer shipping production systems
   for a chain abroad" is positioning no local competitor can copy, and the
   J-Cafe case study currently under-sells it at 262 words of narrative.

---

## 7. Priorities, reasoned

Ordered by expected return against effort. Every "why" is SERP observation or
an asset PROPEL already holds, never a volume estimate.

| # | Action | Why now |
|---|---|---|
| 1 | Google Business Profile | Nothing in this document outranks it. The organization JSON-LD is complete and waiting for `sameAs`, and a service business targeting Israel with 6 clicks needs an entity before it needs keywords. |
| 2 | Send the two ecommerce price bounds | The only SERP where we are structurally disqualified by a missing field, and the fix is two numbers. |
| 3 | Make migration the spearhead | The only genuine white space found. Page already strongest, proof already shipped, competitors literally arguing our case. |
| 4 | Decide and publish the service areas | No city or region name appears anywhere on the site, deliberately, because you have not said. Local terms cannot be targeted until you do. |
| 5 | Repoint the accessibility article at doubt, not purchase | Asset exists, intent is mismatched, competitors cannot follow us there. |
| 6 | Post the branch-leakage piece to dev communities | Links, not rankings. The one page on the site worth linking to on its merits. |
| 7 | One automation article, symptom-framed | Closes the last structural gap in internal linking and the weakest service page at once. |
| 8 | Expand the J-Cafe case study for `/en` | 262 words of narrative under-selling the most impressive work in the portfolio. |
| 9 | Service-call comparison long-tail | Head term not worth winning; the comparison query is. |

---

## 8. What to validate before acting

Everything in sections 1 to 6 is a hypothesis about **which queries exist and
who competes for them**. Before committing writing time, put the phrases
through a tool that reports Israeli volume - Keyword Planner at minimum, or
Ahrefs/Semrush with a `he-IL` location - and drop any phrase with no measurable
demand. SERP composition tells you whether a query is winnable. It does not
tell you whether anyone is asking.

The cheapest validation available is already in your hands: the Search Console
**Performance > Queries** report, filtered to the last 3 months. With 6 clicks
there will be little click data, but **impressions** will show which of these
phrases Google already associates with the site. That is real data about this
site specifically, which no third-party tool can give you.
