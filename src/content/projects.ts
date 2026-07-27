/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  This file replaces the old Sanity CMS. For a handful of case studies with a
 *  single editor it is strictly better: no dependencies, no hosting cost, and
 *  TypeScript refuses to build if a project is missing a field.
 *
 *  ⚠️  EVERY ENTRY BELOW IS MARKED `draft: true`.
 *
 *  Drafts render locally so you can see the layout, but `getProjects()` filters
 *  them out of a production deploy — nothing invented ever reaches a client.
 *  Replace an entry with a real project, fill in every ‹…› placeholder, then
 *  flip `draft` to `false` to publish it.
 *
 *  The one field that matters most is `results`. A case study without a number
 *  is a description; with a number it is evidence. Aim for at least one.
 */

import type { Locale } from '@/lib/i18n'
import { isProductionDeploy } from '@/lib/config'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Bilingual = Record<Locale, string>

export const projectCategories = ['web', 'ecommerce', 'automation', 'seo'] as const
export type ProjectCategory = (typeof projectCategories)[number]

export type ProjectResult = {
  /** The number itself — kept short and glanceable. e.g. '×2.4', '−73%', '4.2s → 0.9s' */
  metric: string
  /** What the number measures. e.g. 'organic traffic' */
  label: Bilingual
}

export type ProjectImage = {
  /** Path under /public — e.g. '/projects/acme/dashboard.webp' */
  src: string
  alt: Bilingual
}

export type Project = {
  slug: string
  /** Brand name — intentionally not translated. */
  title: string
  category: ProjectCategory
  year: number
  /** Client name, or the industry when an NDA prevents naming them. */
  client: Bilingual
  /** One line for the portfolio card. */
  summary: Bilingual
  /** What was broken before we arrived. */
  challenge: Bilingual
  /** What we built. */
  solution: Bilingual
  /** Measurable outcomes. The most persuasive part of the page — never leave empty. */
  results: ProjectResult[]
  techStack: string[]
  thumbnail: ProjectImage
  gallery?: ProjectImage[]
  liveUrl?: string
  /** Featured projects sort first on the homepage grid. */
  featured?: boolean
  /** Hidden from production deploys. Remove or set false to publish. */
  draft?: boolean
}

// ── Content ───────────────────────────────────────────────────────────────────

const TODO: Bilingual = {
  he: '‹ להשלים ›',
  en: '‹ to be written ›',
}

export const projects: Project[] = [
  {
    slug: 'techflow',
    title: 'TechFlow',
    category: 'web',
    year: 2025,
    client: { he: '‹ שם הלקוח ›', en: '‹ client name ›' },
    summary: {
      he: 'פלטפורמת ניהול פרויקטים עם דאשבורד אנליטיקס ואינטגרציות API.',
      en: 'Project-management platform with an analytics dashboard and API integrations.',
    },
    challenge: TODO,
    solution: TODO,
    results: [{ metric: '‹ מספר ›', label: TODO }],
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe'],
    thumbnail: { src: '', alt: { he: 'TechFlow', en: 'TechFlow' } },
    featured: true,
    draft: true,
  },
  {
    slug: 'retailmax',
    title: 'RetailMax',
    category: 'ecommerce',
    year: 2025,
    client: { he: '‹ שם הלקוח ›', en: '‹ client name ›' },
    summary: {
      he: 'חנות אינטרנטית עם ניהול מלאי, תשלומים ולוח בקרה למנהלים.',
      en: 'Online store with inventory management, payments and an admin dashboard.',
    },
    challenge: TODO,
    solution: TODO,
    results: [{ metric: '‹ מספר ›', label: TODO }],
    techStack: ['Next.js', 'Shopify', 'Tailwind', 'Node.js'],
    thumbnail: { src: '', alt: { he: 'RetailMax', en: 'RetailMax' } },
    featured: true,
    draft: true,
  },
  {
    slug: 'autoflow',
    title: 'AutoFlow',
    category: 'automation',
    year: 2024,
    client: { he: '‹ שם הלקוח ›', en: '‹ client name ›' },
    summary: {
      he: 'מערכת אוטומציה שמחברת CRM, חשבוניות ואימייל מרקטינג לזרימה אחת.',
      en: 'Automation system connecting CRM, invoicing and email marketing into one flow.',
    },
    challenge: TODO,
    solution: TODO,
    results: [{ metric: '‹ מספר ›', label: TODO }],
    techStack: ['n8n', 'Zapier', 'HubSpot', 'API'],
    thumbnail: { src: '', alt: { he: 'AutoFlow', en: 'AutoFlow' } },
    featured: true,
    draft: true,
  },
  {
    slug: 'legalpro',
    title: 'LegalPro',
    category: 'web',
    year: 2024,
    client: { he: '‹ שם הלקוח ›', en: '‹ client name ›' },
    summary: {
      he: 'אתר תדמית עם ניהול לקוחות, קביעת פגישות ובסיס ידע משפטי.',
      en: 'Brand site with client management, appointment booking and a legal knowledge base.',
    },
    challenge: TODO,
    solution: TODO,
    results: [{ metric: '‹ מספר ›', label: TODO }],
    techStack: ['Next.js', 'Calendly', 'TypeScript'],
    thumbnail: { src: '', alt: { he: 'LegalPro', en: 'LegalPro' } },
    draft: true,
  },
  {
    slug: 'growthlab',
    title: 'GrowthLab',
    category: 'seo',
    year: 2024,
    client: { he: '‹ שם הלקוח ›', en: '‹ client name ›' },
    summary: {
      he: 'אסטרטגיית SEO מקיפה לצמיחה בתנועה אורגנית.',
      en: 'End-to-end SEO strategy built for organic growth.',
    },
    challenge: TODO,
    solution: TODO,
    results: [{ metric: '‹ מספר ›', label: TODO }],
    techStack: ['SEO', 'Google Analytics', 'Search Console'],
    thumbnail: { src: '', alt: { he: 'GrowthLab', en: 'GrowthLab' } },
    draft: true,
  },
  {
    slug: 'studio3d',
    title: 'Studio3D',
    category: 'web',
    year: 2024,
    client: { he: '‹ שם הלקוח ›', en: '‹ client name ›' },
    summary: {
      he: 'תיק עבודות אינטראקטיבי עם אנימציות ומעברים חלקים.',
      en: 'Interactive portfolio with animation and smooth transitions.',
    },
    challenge: TODO,
    solution: TODO,
    results: [{ metric: '‹ מספר ›', label: TODO }],
    techStack: ['Next.js', 'Three.js', 'GSAP', 'Tailwind'],
    thumbnail: { src: '', alt: { he: 'Studio3D', en: 'Studio3D' } },
    draft: true,
  },
]

// ── Accessors ─────────────────────────────────────────────────────────────────

/** Drafts are visible locally and in previews, never on a production deploy. */
const showDrafts = !isProductionDeploy()

/** Published projects, featured first, then newest. */
export function getProjects(): Project[] {
  return projects
    .filter((project) => showDrafts || !project.draft)
    .sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1
      return b.year - a.year
    })
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug)
}

export function getProjectSlugs(): string[] {
  return getProjects().map((project) => project.slug)
}

/** Categories that actually have a published project — drives the filter chips. */
export function getUsedCategories(): ProjectCategory[] {
  const used = new Set(getProjects().map((project) => project.category))
  return projectCategories.filter((category) => used.has(category))
}
