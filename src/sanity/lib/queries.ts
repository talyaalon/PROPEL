import { client, isSanityConfigured } from './client'

// ─── TypeScript types mirroring the Sanity schemas ──────────────────────────

export type BilingualText = {
  he: string
  en: string
}

export type SanityImage = {
  _key?: string
  asset: { _ref: string; _type: 'reference' }
  alt?: string
  hotspot?: { x: number; y: number }
}

export type SanityProject = {
  _id: string
  title: string
  slug: { current: string }
  thumbnail?: SanityImage
  techStack?: string[]
  problem?: BilingualText
  solution?: BilingualText
  result?: BilingualText
  gallery?: SanityImage[]
  videoUrl?: string
  liveUrl?: string
}

export type SanityProjectCard = Pick<
  SanityProject,
  '_id' | 'title' | 'slug' | 'thumbnail' | 'techStack'
>

export type SiteSettings = {
  whatsappPhone?: string
  projectsCompleted?: number
  activeClients?: number
  yearsOfExperience?: number
}

// ─── GROQ queries ────────────────────────────────────────────────────────────

const ALL_PROJECTS_QUERY = `
  *[_type == "project"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    thumbnail,
    techStack
  }
`

const PROJECT_BY_SLUG_QUERY = `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    thumbnail,
    techStack,
    problem,
    solution,
    result,
    gallery,
    videoUrl,
    liveUrl
  }
`

const ALL_PROJECT_SLUGS_QUERY = `
  *[_type == "project"].slug.current
`

const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0] {
    whatsappPhone,
    projectsCompleted,
    activeClients,
    yearsOfExperience
  }
`

// ─── Fetch helpers ───────────────────────────────────────────────────────────

/** Fetches all projects for the homepage portfolio grid. Returns [] if Sanity is not configured. */
export async function getAllProjects(): Promise<SanityProjectCard[]> {
  if (!isSanityConfigured()) return []
  try {
    return await client.fetch<SanityProjectCard[]>(ALL_PROJECTS_QUERY)
  } catch (err) {
    console.warn('[Sanity] getAllProjects failed — using dict fallback.', err)
    return []
  }
}

/** Fetches a single project by slug. Returns null if not found or Sanity not configured. */
export async function getProjectBySlug(slug: string): Promise<SanityProject | null> {
  if (!isSanityConfigured()) return null
  try {
    return await client.fetch<SanityProject | null>(PROJECT_BY_SLUG_QUERY, { slug })
  } catch (err) {
    console.warn('[Sanity] getProjectBySlug failed.', err)
    return null
  }
}

/** Fetches all slugs for generateStaticParams. Returns [] if Sanity not configured. */
export async function getAllProjectSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) return []
  try {
    return await client.fetch<string[]>(ALL_PROJECT_SLUGS_QUERY)
  } catch {
    return []
  }
}

/** Fetches global site settings. Returns null if Sanity not configured. */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSanityConfigured()) return null
  try {
    return await client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY)
  } catch {
    return null
  }
}
