import { siteConfig, usesPlaceholderDomain, authorNameFor } from './config'
import type { Locale } from './i18n'
import { projectTitle, type Project } from '@/content/projects'
import { servicePages } from '@/content/services'

/**
 * JSON-LD builders. This is what lets Google understand that PROPEL is a
 * business - name, services, contact, area served - rather than just a page of
 * text, and it is the prerequisite for any rich result.
 */

export type Json = Record<string, unknown>

/**
 * The brand, as people write it.
 *
 * The site did not appear first for its own name, in either script. `name` is
 * the only string Google was given, and on the WebSite node that string was
 * the full SERP line - slogan included - so nothing in the graph said that
 * this business is called PROPEL and that Hebrew speakers write it `פרופל`.
 *
 * These are spellings of one existing name, not claims about anything: no
 * profile, no number, nothing that could be wrong. The domain is appended
 * from `siteConfig` rather than typed, and only when it is the real one -
 * the placeholder is an RFC 2606 `.invalid` host and has no business being
 * published as a name for the business.
 */
const ALTERNATE_NAMES = ['פרופל', 'Propel'] as const

function brandNames(includeDomain: boolean): string[] {
  if (!includeDomain || usesPlaceholderDomain) return [...ALTERNATE_NAMES]
  return [...ALTERNATE_NAMES, new URL(siteConfig.url).hostname]
}

/**
 * The service names in the offer catalog, in the locale of the page carrying
 * it. They were four English strings on both locales, so the Hebrew page's
 * catalogue named its services in a language neither the page nor the queries
 * use - and two of the four had no page at all.
 *
 * Derived, not copied. A hand-written list here started drifting immediately:
 * the migration service is already called three different things across the
 * site, and a fourth name invented in the schema helps nobody.
 */
const MIGRATION_NAME: Record<Locale, string> = {
  he: 'העברת אתר לקוד נקי שבבעלותכם',
  en: 'Migration to clean code you own',
}

function offerCatalog(lang: Locale): string[] {
  // migration predates the service-content file and keeps its own route, so
  // it is the one entry servicePages cannot supply.
  return [...servicePages.map((service) => service.title[lang]), MIGRATION_NAME[lang]]
}

export function professionalServiceSchema(lang: Locale, description: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    /*
     * Per locale. Both used `/#organization` while carrying different `url`,
     * `description`, `inLanguage` and `image` - two nodes claiming to be the
     * same entity and disagreeing about it, which Google resolves
     * arbitrarily.
     */
    // Locale-INDEPENDENT id. `/he#organization` and `/en#organization` were
    // two half-entities in the knowledge graph describing one business.
    '@id': `${siteConfig.url}/#organization`,
    name: 'PROPEL',
    /*
     * The same business, written the way people write it. A query for
     * `פרופל` had nothing in the graph to match: the only name here was
     * the Latin one, on a site whose default locale is Hebrew.
     */
    alternateName: brandNames(false),
    legalName: siteConfig.legalName || undefined,
    /*
     * The site root, not the locale home.
     *
     * One `@id` carrying two different `url` values - `/he` on every Hebrew
     * page and `/en` on every English one - is one node contradicting itself,
     * which is the failure the locale-independent `@id` was introduced to
     * fix and this field was still reproducing. The business has one website
     * and this is its address; the per-locale homes are the two WebSite
     * nodes below, which is where a locale-scoped URL belongs.
     */
    url: `${siteConfig.url}/`,
    logo: `${siteConfig.url}/icon.svg`,
    // The share card doubles as the business image. Without one there is no
    // photograph of the business anywhere in the graph.
    image: `${siteConfig.url}/${lang}/opengraph-image`,
    description,
    inLanguage: lang === 'he' ? 'he-IL' : 'en',
    areaServed: { '@type': 'Country', name: 'Israel' },
    telephone: siteConfig.phoneDial || undefined,
    email: siteConfig.email || undefined,
    /*
     * The same phone in the form Google reads as a channel rather than a
     * string. `areaServed` and `availableLanguage` are what make it useful:
     * they say this number answers in Hebrew and English, for Israel.
     */
    ...(siteConfig.phoneDial
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'sales',
            telephone: siteConfig.phoneDial,
            areaServed: 'IL',
            availableLanguage: ['he', 'en'],
            ...(siteConfig.email ? { email: siteConfig.email } : {}),
          },
        }
      : {}),
    /*
     * TODO(owner): set NEXT_PUBLIC_SAME_AS to the real profile URLs -
     * LinkedIn, GitHub, and the Google Business Profile once one exists -
     * comma-separated. This is the single most useful field the organization
     * node is still missing for a brand query, and it is the one field here
     * that cannot be derived: a `sameAs` pointing at a profile that is not
     * this business is a false statement in the knowledge graph, so it stays
     * absent until the owner supplies the addresses. See lib/config.ts.
     */
    ...(siteConfig.sameAs.length > 0 ? { sameAs: siteConfig.sameAs } : {}),
    /*
     * A band, not a price. The FAQ already tells visitors projects "usually
     * start in the low thousands of shekels", so this says nothing new - it
     * just says it in the form Google reads. Anything more precise would need
     * to come from the owner.
     */
    priceRange: '₪₪',
    knowsAbout: [
      'Web development',
      'Business process automation',
      'Search engine optimization',
      'Legacy system migration',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: lang === 'he' ? 'שירותים' : 'Services',
      // One entry per page under /services/ - the catalogue used to name four
      // services in English on both locales, two of which had no page.
      itemListElement: offerCatalog(lang).map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
  }
}

export function faqSchema(items: { question: string; answer: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/**
 * A service with its own page. The provider reference resolves to the
 * organization entity the homepage defines - one graph, not fragments.
 */
export function serviceSchema(input: {
  lang: Locale
  path: string
  name: string
  description: string
  /** The page's own outcome lines - what this service actually includes. */
  offers?: string[]
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: `${siteConfig.url}/${input.lang}/${input.path}`,
    /*
     * The service's own name, which is also the query the page exists for.
     * `name` carries the full SERP line ("בניית אתר תדמית לעסק | PROPEL" on
     * some pages); `serviceType` is the bare category, which is the field
     * Google reads to classify the offering.
     */
    serviceType: input.name,
    provider: { '@id': `${siteConfig.url}/#organization` },
    areaServed: { '@type': 'Country', name: 'Israel' },
    availableLanguage: ['he', 'en'],
    /*
     * What the service includes, taken from the page's own visible outcome
     * list. Structured data that describes content the page does not show is
     * a violation; these are the exact lines a reader sees under "what it
     * gives you".
     */
    ...(input.offers && input.offers.length > 0
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: input.name,
            itemListElement: input.offers.map((offer) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: offer },
            })),
          },
        }
      : {}),
  }
}

/**
 * The site itself, per locale.
 *
 * `inLanguage` is the point: two locales are two WebSite nodes, each declaring
 * what it is written in, both published by the one organization entity. The
 * `@id` is locale-scoped for that reason - unlike the organization, which is
 * one business and therefore one node.
 *
 * **`name` is the brand and nothing else.** It used to be `dict.meta.title`,
 * so the site's name was given to Google as
 * "מערכות ואוטומציה לעסקים | PROPEL" - a slogan with the name
 * buried at the end, on both locales. A name field holding a sentence is a
 * name field Google cannot match a brand query against, and the site was not
 * ranking first for its own name in either script. The slogan has not been
 * lost; it is `description`, below, which is the field for it.
 *
 * **`url` stays locale-scoped, deliberately.** The site root was considered
 * and rejected: there are two of these nodes, so both would then claim
 * `https://propel.co.il/` while carrying different `@id` and different
 * `inLanguage` - two entities asserting the same address, which is the exact
 * split the locale-independent organization `@id` exists to prevent. The root
 * is the ORGANIZATION's url (see above), which is one node and can hold it
 * without contradiction.
 */
export function webSiteSchema(lang: Locale, description: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/${lang}#website`,
    url: `${siteConfig.url}/${lang}`,
    name: 'PROPEL',
    // The domain is included here and not on the organization: a hostname is
    // a name for a WEBSITE, and it is how a fair number of people type a
    // brand into the search bar.
    alternateName: brandNames(true),
    description,
    inLanguage: lang === 'he' ? 'he-IL' : 'en',
    publisher: { '@id': `${siteConfig.url}/#organization` },
  }
}

/** An original article on the blog. */
export function articleSchema(input: {
  lang: Locale
  slug: string
  headline: string
  description: string
  datePublished: string
  /** Only when the content genuinely changed - Google shows dateModified. */
  dateModified?: string
  keywords?: string[]
}): Json {
  const url = `${siteConfig.url}/${input.lang}/blog/${input.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: input.lang,
    url,
    mainEntityOfPage: url,
    /*
     * @id references, not the README's inline Organization objects: the site
     * declares one Organization entity and everything points at it. Two
     * inline copies with the same name would be a second entity for Google to
     * reconcile - the exact split the /#organization consolidation fixed.
     */
    /*
     * A Person once the owner names one, the organization until then.
     *
     * `author` pointed at `/#organization` on all six article URLs, which is
     * valid and weak: the guidance on experience and expertise is about
     * people, and the author line is the one place an article can carry a
     * human. `worksFor` keeps the business in the graph, so naming a person
     * adds an entity rather than replacing one.
     *
     * The branch is the honest part. `authorNameFor` returns '' until
     * NEXT_PUBLIC_AUTHOR_NAME is set, so the old behaviour is what ships while
     * the name is unknown - see the TODO(owner) in lib/config.ts. A `Person`
     * node with an invented name, or a `sameAs` pointing at a stranger's
     * LinkedIn, is a false claim about a real individual.
     *
     * The `url` is the homepage's about section, which is the only page on the
     * site that describes who is behind it. It becomes a real /about page's
     * URL the day there is one.
     */
    author: authorNameFor(input.lang)
      ? {
          '@type': 'Person',
          name: authorNameFor(input.lang),
          url: `${siteConfig.url}/${input.lang}#about`,
          worksFor: { '@id': `${siteConfig.url}/#organization` },
          ...(siteConfig.authorSameAs.length > 0 ? { sameAs: siteConfig.authorSameAs } : {}),
        }
      : { '@id': `${siteConfig.url}/#organization` },
    publisher: { '@id': `${siteConfig.url}/#organization` },
    /*
     * The per-article share card, which already exists and answers 200 at
     * this exact path. Article rich results and Discover both want an image,
     * and the site was paying to generate one per article without declaring
     * it anywhere Google reads.
     */
    image: [`${url}/opengraph-image`],
    ...(input.keywords && input.keywords.length ? { keywords: input.keywords.join(', ') } : {}),
  }
}

/** An index page - the portfolio grid, the blog. */
export function collectionPageSchema(input: {
  lang: Locale
  path: string
  name: string
  description: string
  /** Absolute URLs of the pages this collection actually contains. */
  hasPart?: string[]
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: `${siteConfig.url}/${input.lang}/${input.path}`,
    ...(input.hasPart && input.hasPart.length ? { hasPart: input.hasPart } : {}),
    // The page is part of the WEBSITE, not of the company. schema.org gives
    // isPartOf a CreativeWork domain; an Organization is not one.
    isPartOf: { '@id': `${siteConfig.url}/${input.lang}#website` },
    inLanguage: input.lang,
  }
}

/**
 * The contact page. `mainEntity` points at the organization rather than
 * restating its phone and email, so there is one node describing the business
 * and this page references it.
 */
export function contactPageSchema(input: {
  lang: Locale
  name: string
  description: string
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: input.name,
    description: input.description,
    url: `${siteConfig.url}/${input.lang}/contact`,
    inLanguage: input.lang === 'he' ? 'he-IL' : 'en',
    isPartOf: { '@id': `${siteConfig.url}/${input.lang}#website` },
    mainEntity: { '@id': `${siteConfig.url}/#organization` },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function caseStudySchema(project: Project, lang: Locale): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    /*
     * `projectTitle`, not `project.title`.
     *
     * `title` is the brand name as written, and two of the five projects are
     * branded in Hebrew. So the structured data on /en/portfolio/hagorer2 said
     * `"name": "הגורר 2"` - a Hebrew name inside a block that declares
     * `inLanguage: 'en'`, on a page whose visible heading is English. Verified
     * on production before this was changed.
     *
     * `titleEn` exists for exactly this, and the visible heading, the <title>
     * and the breadcrumb all already go through `projectTitle`. This was the
     * one consumer still reading the raw field.
     */
    name: projectTitle(project, lang),
    description: project.summary[lang],
    inLanguage: lang === 'he' ? 'he-IL' : 'en',
    /*
     * Every other optional field in this file uses `|| undefined`, which strips
     * the key. This one did not: no project defines `year`, and
     * `String(undefined)` is the literal string "undefined", which shipped on
     * all ten case-study URLs. A validator rejects it as an invalid Date, and a
     * visual scan of the JSON passes it.
     */
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    url: `${siteConfig.url}/${lang}/portfolio/${project.slug}`,
    creator: { '@id': `${siteConfig.url}/#organization` },
    /*
     * The desktop capture, for projects that have one. These files are
     * already served from /public and are the only crawlable image of any
     * project on the site - the frames themselves are CSS backgrounds, so
     * without this the portfolio has no presence in image search at all.
     * Projects behind a login have no capture and correctly get no key.
     */
    ...(project.screens
      ? {
          image: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}${project.screens.desktop}`,
            contentUrl: `${siteConfig.url}${project.screens.desktop}`,
            caption: project.summary[lang],
          },
        }
      : {}),
    keywords: project.techStack.join(', '),
  }
}
