import { siteConfig } from './config'
import type { Locale } from './i18n'
import type { Project } from '@/content/projects'

/**
 * JSON-LD builders. This is what lets Google understand that PROPEL is a
 * business — name, services, contact, area served — rather than just a page of
 * text, and it is the prerequisite for any rich result.
 */

export type Json = Record<string, unknown>

export function professionalServiceSchema(lang: Locale, description: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.url}/#organization`,
    name: 'PROPEL',
    legalName: siteConfig.legalName || undefined,
    url: `${siteConfig.url}/${lang}`,
    logo: `${siteConfig.url}/icon.svg`,
    description,
    inLanguage: lang === 'he' ? 'he-IL' : 'en',
    areaServed: { '@type': 'Country', name: 'Israel' },
    telephone: siteConfig.phoneDisplay || undefined,
    email: siteConfig.email || undefined,
    knowsAbout: [
      'Web development',
      'Business process automation',
      'Search engine optimization',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: [
        'Web development',
        'Business automation',
        'SEO and organic growth',
      ].map((name) => ({
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

export function breadcrumbSchema(
  items: { name: string; url: string }[]
): Json {
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
    dateCreated: String(project.year),
    url: `${siteConfig.url}/${lang}/portfolio/${project.slug}`,
    creator: { '@id': `${siteConfig.url}/#organization` },
    keywords: project.techStack.join(', '),
  }
}
