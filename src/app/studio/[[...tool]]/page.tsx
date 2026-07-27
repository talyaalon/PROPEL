'use client'

/**
 * Sanity Studio embedded at /studio
 *
 * This route is intentionally outside the [lang] segment so it renders
 * without the site Navigation / Footer wrappers.
 *
 * The middleware matcher excludes /studio so locale-redirect logic never runs here.
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
