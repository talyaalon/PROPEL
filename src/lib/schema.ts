import { siteConfig } from './config'
import type { Locale } from './i18n'
import type { Project } from '@/content/projects'
import { servicePages } from '@/content/services'

/**
 * JSON-LD builders. This is what lets Google understand that PROPEL is a
 * business - name, services, contact, area served - rather than just a page of
 * text, and it is the prerequisite for any rich result.
 */

export type Json = Record<string, unknown>

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
    legalName: siteConfig.legalName || undefined,
    url: `${siteConfig.url}/${lang}`,
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
     * Set NEXT_PUBLIC_SAME_AS once a Google Business Profile exists. Absent
     * rather than guessed - see the note on the field in lib/config.ts.
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
 */
export function webSiteSchema(lang: Locale, name: string, description: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/${lang}#website`,
    url: `${siteConfig.url}/${lang}`,
    name,
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
    author: { '@id': `${siteConfig.url}/#organization` },
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
    name: project.title,
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
