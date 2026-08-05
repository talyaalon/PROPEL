/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  This file replaces the old Sanity CMS. For a handful of case studies with a
 *  single editor it is strictly better: no dependencies, no hosting cost, and
 *  TypeScript refuses to build if a project is missing a required field.
 *
 *  Every project below is real and its `liveUrl` was verified to respond.
 *
 *  ⚠️  WHAT IS STILL MISSING — `challenge`, `solution` and outcome numbers.
 *
 *  The `results` entries currently hold verified facts about each build (page
 *  counts, branch counts), not business outcomes. Those facts are true and
 *  useful, but they are not what closes deals. What does is a sentence like
 *  "cut quote preparation from 40 minutes to 4" or "organic traffic ×2.3 in six
 *  months". Ask each client for one number and put it first in `results`.
 *
 *  A case study without a number is a description. With one it is evidence.
 */

import type { Locale } from '@/lib/i18n'
import { isProductionDeploy } from '@/lib/config'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Bilingual = Record<Locale, string>

export const projectCategories = ['web', 'ecommerce', 'automation', 'seo'] as const
export type ProjectCategory = (typeof projectCategories)[number]

export type ProjectResult = {
  /** The number itself — kept short and glanceable. e.g. '×2.4', '−73%', '22' */
  metric: string
  /** What the number measures. */
  label: Bilingual
}

export type ProjectImage = {
  /** Path under /public — e.g. '/projects/jcafe/storefront.webp' */
  src: string
  alt: Bilingual
}

export type Project = {
  slug: string
  /** Brand name — intentionally not translated. */
  title: string
  category: ProjectCategory
  /** One line for the portfolio card. */
  summary: Bilingual
  techStack: string[]
  liveUrl?: string
  year?: number
  /** Client name, or the industry when an NDA prevents naming them. */
  client?: Bilingual
  /** What was broken before we arrived. */
  challenge?: Bilingual
  /** What we built. */
  solution?: Bilingual
  /** Measurable outcomes. The most persuasive part of the page. */
  results?: ProjectResult[]
  /**
   * Full-page screenshots driving the scrolling screen previews. Both are
   * ~5000px tall; see public/projects/README.md for how to capture them.
   */
  screens?: { desktop: string; mobile: string }
  thumbnail?: ProjectImage
  gallery?: ProjectImage[]
  /** Featured projects sort first on the homepage grid. */
  featured?: boolean
  /** Hidden from production deploys. */
  draft?: boolean
}

// ── Content ───────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    slug: 'jcafe-kosher',
    screens: {
      desktop: '/projects/jcafe-kosher/desktop.webp',
      mobile: '/projects/jcafe-kosher/mobile.webp',
    },
    title: 'J-Cafe — The Kosher Place',
    category: 'ecommerce',
    summary: {
      he: 'מסחר אונליין דו-לשוני לשישה סניפים בתאילנד, כולל מסכי מלקט ומסכי מטבח (KDS).',
      en: 'Bilingual online ordering for six branches in Thailand, including picker and kitchen display screens.',
    },
    results: [
      { metric: '6', label: { he: 'סניפים פעילים', en: 'active branches' } },
      { metric: '2', label: { he: 'שפות ממשק', en: 'interface languages' } },
    ],
    techStack: ['Next.js', 'Supabase', 'ODOO', 'Stripe', 'Vercel', 'Playwright'],
    liveUrl: 'https://www.jcafekosher.com/en/s/bangkok',
    featured: true,
  },
  {
    slug: 'hagorer2',
    screens: {
      desktop: '/projects/hagorer2/desktop.webp',
      mobile: '/projects/hagorer2/mobile.webp',
    },
    title: 'הגורר 2',
    category: 'web',
    summary: {
      he: 'אתר גרירה וחילוץ בן 22 עמודים, בנוי לקידום אורגני ונגיש לפי ת"י 5568.',
      en: 'A 22-page towing and roadside recovery site, built for organic search and accessible to the Israeli standard IS 5568.',
    },
    results: [
      { metric: '22', label: { he: 'עמודים', en: 'pages' } },
      { metric: 'PWA', label: { he: 'ניתן להתקנה בנייד', en: 'installable on mobile' } },
    ],
    techStack: ['HTML/CSS', 'SEO', 'PWA', 'Schema.org'],
    liveUrl: 'https://hagorer2.co.il',
    featured: true,
  },
  {
    slug: 'cnafim-lauf',
    screens: {
      desktop: '/projects/cnafim-lauf/desktop.webp',
      mobile: '/projects/cnafim-lauf/mobile.webp',
    },
    title: 'כנפיים לעוף',
    category: 'web',
    summary: {
      he: 'אתר מכון טיפול והכשרה בן 24 עמודים, עם עמוד ייעודי לכל מתודה — CBT, NLP, EMR והוראה מתקנת.',
      en: 'A 24-page site for a therapy and training practice, with a dedicated page for each method — CBT, NLP, EMR and remedial teaching.',
    },
    results: [
      { metric: '24', label: { he: 'עמודים', en: 'pages' } },
      { metric: '4', label: { he: 'עמודי מתודה', en: 'method pages' } },
    ],
    techStack: ['Next.js', 'Tailwind', 'RTL'],
    liveUrl: 'https://cnafim-lauf.co.il',
    featured: true,
  },
  {
    slug: 'bom-recipes',
    screens: {
      desktop: '/projects/bom-recipes/desktop.webp',
      mobile: '/projects/bom-recipes/mobile.webp',
    },
    title: 'BOM & Recipes',
    category: 'automation',
    summary: {
      he: 'ניהול עצי מוצר ומתכונים עם תמחור אוטומטי — מחיר עלות, ריטייל וסיטונאי — וייבוא ישיר מקבצי Excel קיימים.',
      en: 'Bill-of-materials and recipe management with automatic costing — cost, retail and wholesale pricing — importing straight from existing Excel files.',
    },
    techStack: ['React', 'Vercel', 'Neon', 'Supabase', 'openpyxl'],
    liveUrl: 'https://bom-recipes.vercel.app',
  },
  {
    slug: 'air-manage',
    screens: {
      desktop: '/projects/air-manage/desktop.webp',
      mobile: '/projects/air-manage/mobile.webp',
    },
    title: 'Air Manage',
    category: 'automation',
    summary: {
      he: 'אפליקציית ניהול משימות לצוותי תחזוקה, אחזקה ושירותי ניקיון — הקצאה, מעקב וסגירת קריאות. בשימוש יומיומי בארגון.',
      en: 'Task management for maintenance, upkeep and cleaning teams — assignment, tracking and closing work orders. In daily use inside an organisation.',
    },
    techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    liveUrl: 'https://air-manage-app.netlify.app',
  },
]

// ── Accessors ─────────────────────────────────────────────────────────────────

/** Drafts are visible locally and in previews, never on a production deploy. */
const showDrafts = !isProductionDeploy()

/** Published projects, featured first. */
export function getProjects(): Project[] {
  return projects
    .filter((project) => showDrafts || !project.draft)
    .sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1
      return (b.year ?? 0) - (a.year ?? 0)
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
